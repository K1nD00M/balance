class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode < 500 ? 'fail' : 'error';
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class InsufficientFundsError extends AppError {
  constructor() {
    super('Insufficient funds for this operation', 400);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, 400, errors);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  InsufficientFundsError,
  ValidationError
}; 