const Joi = require('joi');

const OPERATION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw'
};

const errorMessages = {
  userId: {
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required'
  },
  amount: {
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  },
  type: {
    'string.base': 'Operation type must be a string',
    'any.only': 'Operation type must be either deposit or withdraw',
    'any.required': 'Operation type is required'
  }
};

const balanceOperationSchema = Joi.object({
  userId: Joi.number().integer().positive().required()
    .messages(errorMessages.userId),
  amount: Joi.number().integer().positive().required()
    .messages(errorMessages.amount),
  type: Joi.string().valid(OPERATION_TYPES.DEPOSIT, OPERATION_TYPES.WITHDRAW).required()
    .messages(errorMessages.type)
});

module.exports = {
  balanceOperationSchema,
  OPERATION_TYPES
}; 