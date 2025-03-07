const User = require('../models/user');
const { QueryTypes } = require('sequelize');
const sequelize = require('../configs/sequelize');
const { NotFoundError, InsufficientFundsError, AppError } = require('../utils/errors');
const { OPERATION_TYPES } = require('../validators/balanceValidator');

class BalanceService {
  async updateBalance(userId, amount, type) {
    try {
      if (type === OPERATION_TYPES.WITHDRAW) {
        const [[result]] = await sequelize.query(
          `UPDATE users 
           SET balance = balance - :amount 
           WHERE id = :userId AND balance >= :amount
           RETURNING balance`,
          {
            replacements: { amount, userId },
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
            type,
            amount
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

        return {
          userId,
          balance: result.balance,
          operation: {
            type,
            amount
          }
        };
      }
    } catch (error) {
      if (error instanceof InsufficientFundsError) {
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