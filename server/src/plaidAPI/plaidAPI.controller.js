require("dotenv").config();
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const getLastThirtyDaysDates = require("../utils/getThirtyDays");
const { v4: uuidv4 } = require("uuid");
const {
  AccessToken,
  getItemIdsForUser,
  getUserRecordFromPhone,
  addUser,
  getUserRecord,
  getItemInfoForUser,
  getTransactionsForUser,
  getItemsAndAccessTokensForUser,
  getItemInfo,
} = require("../mongoDB/accessTokenSchema");
const path = require("path");
const { spawn } = require("child_process");
const { sendBudgetMessage } = require("../twilio");
const { getLoggedInUserId } = require("../utils/getLoggedInUser");
const { syncTransactions } = require("./transactions");
const { plaidClient } = require("../plaid");
const { generateLinkToken, exchangePublicToken } = require("./tokens");
const { SandboxItemFireWebhookRequestWebhookCodeEnum } = require("plaid");

async function generateLinkTokenController(request, response, next) {
  const { timezoneOffset } = request.body;
  process.env.TIMEZONE_OFFSET = timezoneOffset;
  Promise.resolve()
    .then(async function () {
      let sessionId = getLoggedInUserId(request);
      const responsedata = await generateLinkToken(sessionId);
      response.json(responsedata);
    })
    .catch(next);
}

async function exchangeForAccessToken(request, response, next) {
  const { public_token, phoneNumber } = request.body;
  Promise.resolve()
    .then(async function () {
      try {
        await exchangePublicToken(request);
        // const tokenResponse = await plaidClient.itemPublicTokenExchange({
        //   public_token,
        // });
        // const ACCESS_TOKEN = tokenResponse.data.access_token;
        // const ITEM_ID = tokenResponse.data.item_id;

        // let transactions = await fetchTransations(ACCESS_TOKEN);
        // let { smartBudget } = await getBudget(transactions);

        // const token = await new AccessToken({
        //   access_token: ACCESS_TOKEN,
        //   item_id: ITEM_ID,
        //   session_id: request.cookies.sessionid,
        //   phone: phoneNumber,
        //   smart_budget: String(smartBudget),
        // });

        // const newToken = await token.save();
        // await sendBudgetMessage(smartBudget, phoneNumber);

        response.json({
          // access_token: ACCESS_TOKEN,
          // item_id: ITEM_ID,
          phoneNumber: "",
          error: null,
        });
      } catch (err) {
        console.log(err);
      }
    })
    .catch(next);
}

function formatTransactions(transactions) {
  const formattedData = transactions.map((transaction) => {
    // Check if transaction.category is not null and has at least one element
    const primaryCategory =
      transaction.category && transaction.category.length > 0
        ? transaction.category[0]
        : "Uncategorized";

    return {
      date: transaction.date,
      category: primaryCategory,
      amount: transaction.amount,
    };
  });

  // Preparing data to be sent to a Python script
  const dataForPython = JSON.stringify(formattedData);

  // You could write this string to a file or directly send it through an inter-process communication
  // console.log(dataForPython);
}

function parseAccountData(accounts) {
  const output = {
    accounts: [],
    total_current_balance: 0,
  };

  accounts.forEach((account) => {
    // Extracting the account ID and the current balance from each account
    const {
      account_id,
      balances: { current },
    } = account;

    // Adding the account details to the accounts array in the output
    output.accounts.push({ account_id, current_balance: current });

    // Summing up the current balances to calculate the total current balance
    output.total_current_balance += current;
  });

  return output;
}

async function fetchTransations(access_token) {
  const { currentDate, thirtyDaysAgoDate } = getLastThirtyDaysDates(
    process.env.TIMEZONE_OFFSET
  );

  const request = {
    access_token: access_token,
    start_date: thirtyDaysAgoDate,
    end_date: currentDate,
  };

  try {
    const response = await plaidClient.transactionsGet(request);

    let transactions = response.data.transactions;
    const total_transactions = response.data.total_transactions;
    // Manipulate the offset parameter to paginate
    // transactions and retrieve all available data
    while (transactions.length < total_transactions) {
      const paginatedRequest = {
        access_token: access_token,
        start_date: thirtyDaysAgoDate,
        end_date: currentDate,
        options: {
          offset: transactions.length,
        },
      };
      const paginatedResponse = await plaidClient.transactionsGet(
        paginatedRequest
      );
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }
    return transactions;
  } catch (err) {
    console.error(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    let session_id = req.cookies.sessionid;
    const transactions = await getTransactionsForUser(session_id);
    res.json(transactions);
  } catch (err) {
    console.error(err);
  }
}

async function checkIfItemExists(userId) {
  const result = await getItemInfoForUser(userId);
  if (result) {
    return true;
  } else {
    return false;
  }
}

async function checkIfSessionExists(req, res, next) {
  let session_id = req.cookies.sessionid;
  const { phone } = req.body;

  if (phone) {
    const { user, error } = await getUserRecordFromPhone(phone);
    if (user) {
      res.cookie("sessionid", user.id, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      const itemExists = await checkIfItemExists(user.id);
      if (itemExists) {
        res.status(200).json({ message: "Item exists" });
      } else {
        res.status(401).json({ message: "Item doesn't exist" });
      }
    } else {
      const userId = uuidv4();
      const result = await addUser(userId, phone);
      res.cookie("sessionid", userId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      res.status(401).json({ message: "Item doesn't exist" });
    }
  } else {
    if (session_id) {
      const { user } = await getUserRecord(session_id);
      if (user) {
        const itemExists = await checkIfItemExists(user.id);
        if (itemExists) {
          res.status(200).json({ message: "Item exists" });
        } else {
          res.status(401).json({ message: "Item doesn't exist" });
        }
      } else {
        res.status(400).json({ error: "Invalid request" });
      }
    } else {
      res.status(400).json({ error: "Invalid request" });
    }
  }
}

async function syncTransactionsController(req, res, next) {
  try {
    const userId = getLoggedInUserId(req);
    const items = await getItemIdsForUser(userId);
    const fullResults = await Promise.all(
      items.map(async (item) => await syncTransactions(item.id))
    );
    res.json({ completeResults: fullResults });
  } catch (error) {
    console.log(`Running into an error!`);
    next(error);
  }
}

async function ko(req, res, next) {
  try {
    const result = await plaidClient.sandboxItemFireWebhook({
      webhook_code: "SYNC_UPDATES_AVAILABLE",
      access_token: "",
    });
    // console.log(result.data);
    res.json(result.data);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = {
  generateLinkToken: asyncErrorBoundary(generateLinkTokenController),
  exchangeForAccessToken: asyncErrorBoundary(exchangeForAccessToken),
  getTransactions: asyncErrorBoundary(getTransactions),
  checkIfSessionExists: asyncErrorBoundary(checkIfSessionExists),
  syncTransactions: asyncErrorBoundary(syncTransactionsController),
  ko: asyncErrorBoundary(ko),
};
