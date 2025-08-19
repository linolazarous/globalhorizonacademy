class CustomError extends Error {
  constructor(message, statusCode = 500, publicMessage = message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(message, details = {}) {
    super(message, 400, 'Validation failed', details);
  }
}

class PaymentError extends CustomError {
  constructor(message, details = {}) {
    super(message, 402, 'Payment processing error', details);
  }
}

module.exports = {
  CustomError,
  ValidationError,
  PaymentError
};
