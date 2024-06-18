const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV } = process.env;

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

module.exports = { plaidClient };
