'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware factory.
 * Validates req.body against the provided schema.
 *
 * @param {import('joi').Schema} schema - Joi schema to validate against
 */
const validate = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // collect all errors, not just the first
    stripUnknown: true,  // remove fields not in the schema
  });

  if (error) {
    const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
    return next(ApiError.badRequest('Validation failed', messages));
  }

  req.body = value; // use sanitised/coerced value
  next();
};

module.exports = { validate };
