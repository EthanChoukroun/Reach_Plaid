const {
  addItem,
  addBankNameForItem,
  addAccount,
} = require("../mongoDB/accessTokenSchema");
const { plaidClient } = require("../plaid");
const { getLoggedInUserId } = require("../utils/getLoggedInUser");
const { syncTransactions } = require("./transactions");
const { PLAID_PRODUCTS, PLAID_COUNTRY_CODES, WEBHOOK_URL } = process.env;

async function generateLinkToken(sessionId, phoneNumber) {
  const configs = {
    user: {
      client_user_id: sessionId,
      phone_number: phoneNumber
    },
    client_name: "Plaid Quickstart",
    products: PLAID_PRODUCTS.split(","),
    country_codes: PLAID_COUNTRY_CODES.split(","),
    language: "en",
    webhook: WEBHOOK_URL,
  };
  const createTokenResponse = await plaidClient.linkTokenCreate(configs);
  return createTokenResponse.data;
}

const populateBankName = async (itemId, accessToken) => {
  try {
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });
    const institutionId = itemResponse.data.item.institution_id;
    if (institutionId == null) {
      return;
    }
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"],
    });
    const institutionName = institutionResponse.data.institution.name;
    await addBankNameForItem(itemId, institutionName);
  } catch (error) {
    console.log(`Ran into an error! ${error}`);
  }
};

const populateAccountNames = async (accessToken) => {
  try {
    const acctsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    const acctsData = acctsResponse.data;
    const itemId = acctsData.item.item_id;
    await Promise.all(
      acctsData.accounts.map(async (acct) => {
        await addAccount(acct.account_id, itemId, acct.name);
      })
    );
  } catch (error) {
    console.log(`Ran into an error! ${error}`);
  }
};

async function exchangePublicToken(req) {
  try {
    const userId = getLoggedInUserId(req);
    const { public_token } = req.body;

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const tokenData = tokenResponse.data;
    await addItem(tokenData.item_id, userId, tokenData.access_token);
    await populateBankName(tokenData.item_id, tokenData.access_token);
    // await populateAccountNames(tokenData.access_token);

    await syncTransactions(tokenData.item_id);
    return { success: "success" };
  } catch (error) {
    console.log(error);
    return { error: error };
  }

  //   const ACCESS_TOKEN = tokenResponse.data.access_token;
  //   const ITEM_ID = tokenResponse.data.item_id;

  //   let transactions = await fetchTransations(ACCESS_TOKEN);
  //   let { smartBudget } = await getBudget(transactions);

  //   const token = await new AccessToken({
  //     access_token: ACCESS_TOKEN,
  //     item_id: ITEM_ID,
  //     session_id: request.cookies.sessionid,
  //     phone: phoneNumber,
  //     smart_budget: String(smartBudget),
  //   });

  //   const newToken = await token.save();
  //   await sendBudgetMessage(smartBudget, phoneNumber);
}

module.exports = { generateLinkToken, exchangePublicToken };
