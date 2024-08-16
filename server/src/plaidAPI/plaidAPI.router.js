const router = require("express").Router();
const controller = require("./plaidAPI.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/link/token/create")
  .post(controller.generateLinkToken)
  .all(methodNotAllowed);
router
  .route("/item/public_token/exchange")
  .post(controller.exchangeForAccessToken)
  .all(methodNotAllowed);
router
  .route("/transactions/get")
  .get(controller.getTransactions)
  .all(methodNotAllowed);
router
  .route("/session")
  .post(controller.checkIfSessionExists)
  .all(methodNotAllowed);

router.route("/sync").post(controller.syncTransactions).all(methodNotAllowed);
router.route("/test").post(controller.ko).all(methodNotAllowed);
router
  .route("/deletesession")
  .post(controller.deletePlaidSession)
  .all(methodNotAllowed);
// router.route('/balance/get').get(controller.getBalance).all(methodNotAllowed);

module.exports = router;
