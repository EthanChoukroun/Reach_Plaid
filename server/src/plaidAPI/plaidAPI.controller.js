require("dotenv").config();
const accessTokenController = require("../tokenStorage/accessToken.controller");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const getLastThirtyDaysDates = require("../utils/getThirtyDays");
const { v4: uuidv4 } = require("uuid");
const AccessToken = require("../mongoDB/accessTokenSchema");
const path = require("path");
const { spawn } = require("child_process");
const {
  PORT,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_REDIRECT_URI,
} = process.env;

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { sendBudgetMessage } = require("../twilio");

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

async function generateLinkToken(request, response, next) {
  const { timezoneOffset } = request.body;
  process.env.TIMEZONE_OFFSET = timezoneOffset;
  Promise.resolve()
    .then(async function () {
      let sessionId = request.cookies.sessionid;
      if (!sessionId) {
        sessionId = uuidv4();
        response.cookie("sessionid", sessionId, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }

      const configs = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: sessionId,
        },
        client_name: "Plaid Quickstart",
        products: PLAID_PRODUCTS.split(","),
        country_codes: PLAID_COUNTRY_CODES.split(","),
        language: "en",
      };
      const createTokenResponse = await plaidClient.linkTokenCreate(configs);
      // prettyPrintResponse(createTokenResponse);
      response.json(createTokenResponse.data);
    })
    .catch(next);
}

// app.post('/api/set_access_token', function (request, response, next) {
async function exchangeForAccessToken(request, response, next) {
  // unsure where this comes from
  const { public_token, phoneNumber } = request.body;
  Promise.resolve()
    .then(async function () {
      try {
        const tokenResponse = await plaidClient.itemPublicTokenExchange({
          public_token,
        });
        const ACCESS_TOKEN = tokenResponse.data.access_token;
        const ITEM_ID = tokenResponse.data.item_id;

        let transactions = await fetchTransations(ACCESS_TOKEN);
        let { smartBudget } = await getBudget(transactions);

        const token = await new AccessToken({
          access_token: ACCESS_TOKEN,
          item_id: ITEM_ID,
          session_id: request.cookies.sessionid,
          phone: phoneNumber,
          smart_budget: String(smartBudget),
        });

        const newToken = await token.save();
        await sendBudgetMessage(smartBudget, phoneNumber);

        response.json({
          access_token: ACCESS_TOKEN,
          item_id: ITEM_ID,
          phoneNumber: phoneNumber,
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
        // const paginatedRequest: TransactionsGetRequest = {
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
    const accessTokenObj = await AccessToken.findOne({
      session_id,
    });
    let transactions = await fetchTransations(accessTokenObj.access_token);
    res.json(transactions);
    // const formattedTransaction = formatTransactions(transactions);
    // console.log(formattedTransaction);
  } catch (err) {
    console.error(err);
  }

  // const requestBalance = {
  //   access_token: accessToken,
  // };
  // try {
  //   const responseBalance = await plaidClient.accountsBalanceGet(
  //     requestBalance
  //   );
  //   const accounts = responseBalance.data.accounts;
  //   const formattedBalance = parseAccountData(accounts);
  //   // console.log(formattedBalance);
  // } catch (err) {
  //   console.log(err);
  // }

  // const requestUserIncome = {
  //   client_user_id: process.env.PLAID_CLIENT_ID
  // };
  // try {
  //   const responseUser = await plaidClient.userCreate(requestUserIncome);
  //   console.log(responseUser)
  // } catch(err) {
  //   console.log(err);
  // };

  // const requestIncome = {
  //   user_token: responseUser['user_token'],
  //   options: {
  //     count: 1,
  //   },
  // };
  // try {
  //   const responseIncome = await client.creditBankIncomeGet(request)
  //   console.log(responseIncome)
  // } catch(err) {
  //   console.log(err)
  // }
}

async function getBudget(transactions) {
  return new Promise((resolve, reject) => {
    const budgetScriptPath = path.join(__dirname, "../../smart_budgets.py");
    const pythonProcess = spawn("python3", [budgetScriptPath]);

    let result = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      reject({ Error: "error" });
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject({ Error: "error" });
      } else {
        try {
          const parsedResult = JSON.parse(result);
          console.log(parsedResult);
          resolve(parsedResult);
        } catch (err) {
          reject({ Error: "error" });
        }
      }
    });

    pythonProcess.stdin.write(JSON.stringify(transactions));
    pythonProcess.stdin.end();
  });
}

async function checkIfSessionExists(req, res, next) {
  let session_id = req.cookies.sessionid;

  if (session_id) {
    const accessTokenObj = await AccessToken.findOne({
      session_id: session_id,
    });
    if (accessTokenObj) {
      res.status(200).json({
        // phone: accessTokenObj.phone,
        sessionid: accessTokenObj.session_id,
      });
    } else {
      res.status(401).send("Un");
    }
  } else {
    res.status(401).send("Un");
  }
}

module.exports = {
  generateLinkToken: asyncErrorBoundary(generateLinkToken),
  exchangeForAccessToken: asyncErrorBoundary(exchangeForAccessToken),
  getTransactions: asyncErrorBoundary(getTransactions),
  checkIfSessionExists: asyncErrorBoundary(checkIfSessionExists),
};
