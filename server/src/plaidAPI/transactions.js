const {
  getItemInfo,
  addNewTransaction,
  modifyExistingTransaction,
  markTransactionAsRemoved,
  getTransactionsForUser,
  saveCursorAndBudgetForItem,
  getUserRecord,
} = require("../mongoDB/accessTokenSchema");
const { plaidClient } = require("../plaid");
const { sendBudgetMessage } = require("../twilio");
const { SimpleTransaction } = require("../utils/SimpleTransactionObject");
const path = require("path");
const { spawn } = require("child_process");

async function fetchNewSyncData(accessToken, initialCursor, retriesLeft = 3) {
  const allData = {
    added: [],
    removed: [],
    modified: [],
    nextCursor: initialCursor,
  };

  if (retriesLeft <= 0) {
    console.error("Too many retries!");
    return allData;
  }
  try {
    let keepGoing = false;
    do {
      const results = await plaidClient.transactionsSync({
        access_token: accessToken,
        options: {
          include_personal_finance_category: true,
        },
        cursor: allData.nextCursor,
      });
      const newData = results.data;
      allData.added = allData.added.concat(newData.added);
      allData.modified = allData.modified.concat(newData.modified);
      allData.removed = allData.removed.concat(newData.removed);
      allData.nextCursor = newData.next_cursor;
      keepGoing = newData.has_more;
      console.log(
        `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length} `
      );
    } while (keepGoing === true);
    return allData;
  } catch (error) {
    console.log(`Fetch new sync data Error! ${JSON.stringify(error)} `);
    return fetchNewSyncData(accessToken, initialCursor, retriesLeft - 1);
  }
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

async function syncTransactions(itemId) {
  const {
    access_token: accessToken,
    transaction_cursor: transactionCursor,
    user_id: userId,
  } = await getItemInfo(itemId);

  const summary = { added: 0, removed: 0, modified: 0 };
  const allData = await fetchNewSyncData(accessToken, transactionCursor);
  await Promise.all(
    allData.added.map(async (txnObj) => {
      const result = await addNewTransaction(
        SimpleTransaction.fromPlaidTransaction(txnObj, userId)
      );
      if (result) {
        summary.added += result.changes;
      }
    })
  );

  await Promise.all(
    allData.modified.map(async (txnObj) => {
      const result = await modifyExistingTransaction(
        SimpleTransaction.fromPlaidTransaction(txnObj, userId)
      );
      if (result) {
        summary.modified += result.changes;
      }
    })
  );

  await Promise.all(
    allData.removed.map(async (txnObj) => {
      const result = await markTransactionAsRemoved(txnObj.transaction_id);
      if (result) {
        summary.removed += result.changes;
      }
    })
  );

  const transactions = await getTransactionsForUser(userId);
  const { smartBudget } = await getBudget(transactions);
  await saveCursorAndBudgetForItem(allData.nextCursor, smartBudget, itemId);
  const { user } = await getUserRecord(userId);
  await sendBudgetMessage(smartBudget, user.phone);

  return summary;
}

module.exports = { syncTransactions };
