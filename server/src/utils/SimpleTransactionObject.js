/**
 * A simple object to pass to our database functions that represents the data
 *  our application cares about from the Plaid transaction endpoint
 */
class SimpleTransaction {
  constructor(
    id,
    userId,
    accountId,
    category,
    date,
    authorizedDate,
    merchantName,
    amount,
    currencyCode,
    pendingTransactionId,
    name,
    accountName
  ) {
    this.id = id;
    this.userId = userId;
    this.accountId = accountId;
    this.category = category;
    this.date = date;
    this.authorizedDate = authorizedDate;
    this.merchantName = merchantName;
    this.amount = amount;
    this.currencyCode = currencyCode;
    this.pendingTransactionId = pendingTransactionId;
    this.name = name;
    this.accountName = accountName;
  }

  static fromPlaidTransaction(txnObj, userId, accounts) {
    return new SimpleTransaction(
      txnObj.transaction_id,
      userId,
      txnObj.account_id,
      txnObj.personal_finance_category.primary,
      txnObj.date,
      txnObj.authorized_date,
      txnObj.merchant_name || "N/A",
      txnObj.amount,
      txnObj.iso_currency_code,
      txnObj.pending_transaction_id,
      txnObj.name || "N/A",
      accounts[txnObj.account_id] || "N/A"
    );
  }
}

module.exports = { SimpleTransaction };
