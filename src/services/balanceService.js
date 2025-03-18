const User = require('../models/user');
const { QueryTypes } = require('sequelize');
const sequelize = require('../configs/sequelize');
const { NotFoundError, InsufficientFundsError, AppError } = require('../utils/errors');

class BalanceService {
  async updateBalance(userId, amount) {
    try {
      const isWithdraw = amount < 0;
      const absAmount = Math.abs(amount);
      const operationType = isWithdraw ? 'withdraw' : 'deposit';
      
      if (isWithdraw) {
        const [[result]] = await sequelize.query(
          `UPDATE users 
           SET balance = balance + :amount 
           WHERE id = :userId AND balance >= :absAmount
           RETURNING balance`,
          {
            replacements: { amount, userId, absAmount },
            type: QueryTypes.UPDATE
          }
        );

        if (!result) {
          throw new InsufficientFundsError();
        }

        return {
          userId,
          balance: result.balance,
          operation: {
            type: operationType,
            amount: absAmount
          }
        };
      } else {
        const [[result]] = await sequelize.query(
          `UPDATE users 
           SET balance = balance + :amount 
           WHERE id = :userId
           RETURNING balance`,
          {
            replacements: { amount, userId },
            type: QueryTypes.UPDATE
          }
        );

        if (!result) {
          throw new NotFoundError('User');
        }

        return {
          userId,
          balance: result.balance,
          operation: {
            type: operationType,
            amount: absAmount
          }
        };
      }
    } catch (error) {
      if (error instanceof InsufficientFundsError || error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError('Database operation failed', 500);
    }
  }

  async getBalance(userId) {
    const user = await this._findUserOrFail(userId);
    return {
      userId,
      balance: user.balance
    };
  }

  async _findUserOrFail(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }
}

module.exports = new BalanceService(); 