const balanceService = require('../services/balanceService');

class BalanceController {
  async updateBalance(req, res, next) {
    try {
      const result = await balanceService.updateBalance(
        req.validatedData.userId,
        req.validatedData.amount,
        req.validatedData.type
      );
      
      res.json({ success: true, data: result });
    } catch (error) {
      if (error.name === 'InsufficientFundsError') {
        res.status(400).json({
          success: false,
          status: 'fail',
          message: error.message
        });
      } else {
        next(error);
      }
    }
  }

  async getBalance(req, res, next) {
    try {
      const result = await balanceService.getBalance(parseInt(req.params.userId));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BalanceController(); 