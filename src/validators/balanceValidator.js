const Joi = require('joi');

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
    'any.required': 'Amount is required',
    'number.invalid': 'Amount cannot be zero'
  }
};

const balanceOperationSchema = Joi.object({
  userId: Joi.number().integer().positive().required()
    .messages(errorMessages.userId),
  amount: Joi.number().integer().invalid(0).required()
    .messages(errorMessages.amount)
});

module.exports = {
  balanceOperationSchema
}; 