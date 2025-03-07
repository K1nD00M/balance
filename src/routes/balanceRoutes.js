const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { balanceOperationSchema } = require('../validators/balanceValidator');

router.post('/update', validateRequest(balanceOperationSchema), balanceController.updateBalance);

router.get('/:userId', balanceController.getBalance);

module.exports = router; 