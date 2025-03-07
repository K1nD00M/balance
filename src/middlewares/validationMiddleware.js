const { ValidationError } = require('../utils/errors');

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(({ path, message }) => ({
          field: path.join('.'),
          message
        }));

        throw new ValidationError('Validation failed', errors);
      }

      req.validatedData = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateRequest
}; 