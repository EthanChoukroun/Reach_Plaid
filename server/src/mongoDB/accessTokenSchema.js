require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database!"));

const accessTokenSchema = new mongoose.Schema({
  access_token: {
    type: String,
    required: true,
  },
  item_id: {
    type: String,
    required: true,
  },
  session_id: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  created_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  smart_budget: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, required: true },
});

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  user_id: { type: String, required: true, ref: "User" },
  access_token: { type: String, required: true },
  smart_budget: { type: String },
  transaction_cursor: { type: String },
  bank_name: { type: String },
  is_active: { type: Boolean, default: true },
});

const accountSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  item_id: { type: String, required: true, ref: "Item" },
  name: { type: String },
});

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, ref: "User" },
  account_id: { type: String, required: true, ref: "Account" },
  account_name: { type: String },
  merchant_name: { type: String },
  category: { type: String },
  date: { type: String },
  authorized_date: { type: String },
  name: { type: String },
  amount: { type: Number },
  currency_code: { type: String },
  is_removed: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
const Item = mongoose.model("Item", itemSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const AccessToken = mongoose.model("accessToken", accessTokenSchema);
const Account = mongoose.model("Account", accountSchema);

const getItemIdsForUser = async function (userId) {
  const items = await Item.find({ user_id: userId, is_active: true }, "id");
  return items.map((item) => item.id);
};

const getItemsAndAccessTokensForUser = async function (userId) {
  const items = await Item.find(
    { user_id: userId, is_active: true },
    "id access_token"
  );
  return items;
};

const confirmItemBelongsToUser = async function (possibleItemId, userId) {
  try {
    const result = await Item.findOne(
      { id: possibleItemId, user_id: userId },
      "id"
    );
    if (result && result.id === possibleItemId) {
      return true;
    } else {
      console.warn(
        `User ${userId} claims to own item they don't: ${possibleItemId}`
      );
      return false;
    }
  } catch (error) {
    console.error("Error confirming item ownership:", error);
    throw error;
  }
};

const addUser = async function (userId, phone) {
  try {
    const user = new User({ id: userId, phone: phone });
    const result = await user.save();
    return result;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const getUserList = async function () {
  try {
    const result = await User.find({}, "id username");
    return result;
  } catch (error) {
    console.error("Error fetching user list:", error);
    throw error;
  }
};

const getUserRecord = async function (userId) {
  try {
    const result = await User.findOne({ id: userId });
    return { user: result };
  } catch (error) {
    return { error: error };
  }
};

const getUserRecordFromPhone = async function (phone) {
  try {
    const result = await User.findOne({ phone: phone });
    if (result) {
      return { user: result };
    } else {
      return { error: "Not found" };
    }
  } catch (error) {
    return { error: error };
  }
};

const addItem = async function (itemId, userId, accessToken, phone) {
  try {
    const item = new Item({
      id: itemId,
      user_id: userId,
      access_token: accessToken,
      phone: phone,
    });
    const result = await item.save();
    return result;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

const deleteItem = async function (itemId) {
  try {
    const result = await Item.deleteOne({ id: itemId });
    return result;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

const getItemInfo = async function (itemId) {
  try {
    const result = await Item.findOne(
      { id: itemId },
      "user_id access_token transaction_cursor"
    );
    return result;
  } catch (error) {
    console.error("Error fetching item info:", error);
    throw error;
  }
};

const getItemInfoForUser = async function (userId) {
  try {
    const result = await Item.findOne(
      { user_id: userId },
      "user_id access_token transaction_cursor"
    );
    return result;
  } catch (error) {
    console.error("Error fetching item info for user:", error);
    throw error;
  }
};

const addNewTransaction = async function (transactionObj) {
  try {
    const transaction = new Transaction({
      id: transactionObj.id,
      user_id: transactionObj.userId,
      account_id: transactionObj.accountId,
      account_name: transactionObj.accountName,
      merchant_name: transactionObj.merchantName,
      category: transactionObj.category,
      date: transactionObj.date,
      authorized_date: transactionObj.authorizedDate,
      name: transactionObj.name,
      amount: transactionObj.amount,
      currency_code: transactionObj.currencyCode,
    });

    const result = await transaction.save();

    return result;
  } catch (error) {
    console.log(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const modifyExistingTransaction = async function (transactionObj) {
  try {
    const result = await Transaction.updateOne(
      { id: transactionObj.id },
      {
        account_id: transactionObj.accountId,
        category: transactionObj.category,
        date: transactionObj.date,
        authorized_date: transactionObj.authorizedDate,
        name: transactionObj.name,
        amount: transactionObj.amount,
        currency_code: transactionObj.currencyCode,
      }
    );
    return result;
  } catch (error) {
    console.error(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const markTransactionAsRemoved = async function (transactionId) {
  try {
    const updatedId = transactionId + "-REMOVED-";
    const result = await Transaction.updateOne(
      { id: transactionId },
      { id: updatedId, is_removed: true }
    );
    return result;
  } catch (error) {
    console.error(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const deleteExistingTransaction = async function (transactionId) {
  try {
    const result = await Transaction.deleteOne({ id: transactionId });
    return result;
  } catch (error) {
    console.error(
      `Looks like I'm encountering an error. ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const deleteAllUserTransactions = async function (userId) {
  try {
    const result = await Transaction.deleteMany({ user_id: userId });
    return result;
  } catch (error) {
    throw error;
  }
};

const getTransactionsForUser = async function (userId) {
  try {
    const results = await Transaction.find({
      user_id: userId,
      is_removed: false,
    })
      .select("-_id -__v")
      .sort({ date: -1 })
      .exec();

    return results;
  } catch (error) {
    console.error(
      `Error fetching transactions for user: ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const saveCursorAndBudgetForItem = async function (
  transactionCursor,
  budget,
  itemId
) {
  try {
    await Item.updateOne(
      { id: itemId },
      { transaction_cursor: transactionCursor, smart_budget: budget }
    );
  } catch (error) {
    console.error(
      `It's a big problem that I can't save my cursor. ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const updateItemBudget = async function (itemId, budget) {
  try {
    await Item.updateOne({ id: itemId }, { smart_budget: budget });
  } catch (error) {
    console.error(`Budget update failed. ${JSON.stringify(error)}`);
    throw error;
  }
};

const addAccount = async function (accountId, itemId, acctName) {
  try {
    await Account.updateOne(
      { id: accountId },
      { id: accountId, item_id: itemId, name: acctName },
      { upsert: true }
    );
  } catch (error) {
    console.error(`Error adding account: ${JSON.stringify(error)}`);
    throw error;
  }
};

const getAccountIdsForItem = async function (itemId) {
  try {
    const accounts = await Account.find({ item_id: itemId }, "id");
    return accounts.map((account) => account.id);
  } catch (error) {
    console.error(
      `Error fetching account IDs for item: ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const deactivateItem = async function (itemId) {
  try {
    const updateResult = await Item.updateOne(
      { id: itemId },
      { access_token: "REVOKED", is_active: false }
    );
    return updateResult;
  } catch (error) {
    console.error(`Error deactivating item: ${JSON.stringify(error)}`);
    throw error;
  }
};

const getBankNamesForUser = async function (userId) {
  try {
    const result = await Item.find(
      { user_id: userId, is_active: true },
      "id bank_name"
    );
    return result;
  } catch (error) {
    console.error(
      `Error fetching bank names for user: ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const addBankNameForItem = async function (itemId, institutionName) {
  try {
    const result = await Item.updateOne(
      { id: itemId },
      { bank_name: institutionName }
    );
    return result;
  } catch (error) {
    console.error(`Error adding bank name for item: ${JSON.stringify(error)}`);
    throw error;
  }
};

const modifyUserBudget = async function (userId, budget) {
  try {
    const result = await User.updateOne(
      {
        id: userId,
      },
      { smart_budget: String(budget) }
    );
    return result;
  } catch (error) {
    console.error(`Error adding user budget: ${JSON.stringify(error)}`);
    throw error;
  }
};

module.exports = {
  User,
  Item,
  Transaction,
  AccessToken,
  addAccount,
  getItemInfo,
  getItemInfoForUser,
  addNewTransaction,
  modifyExistingTransaction,
  deleteExistingTransaction,
  markTransactionAsRemoved,
  getTransactionsForUser,
  saveCursorAndBudgetForItem,
  addItem,
  addUser,
  getUserList,
  getUserRecord,
  getItemIdsForUser,
  getItemsAndAccessTokensForUser,
  getAccountIdsForItem,
  confirmItemBelongsToUser,
  deactivateItem,
  getBankNamesForUser,
  addBankNameForItem,
  modifyUserBudget,
  getUserRecordFromPhone,
  updateItemBudget,
  deleteItem,
  deleteAllUserTransactions,
};
