const router = require('express').Router();
const controller = require('./accessToken.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');

router.route('/').get(controller.list).post(controller.create).all(methodNotAllowed);
router.route('/:id').get(controller.read).patch(controller.update).delete(controller.destroy).all(methodNotAllowed);

module.exports = router;