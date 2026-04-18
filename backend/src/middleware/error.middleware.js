'use strict';

const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Normalises various error types into a consistent ApiError shape,
 * logs the error, and returns a structured JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // ── Mongoose CastError (invalid ObjectId) ──────────────
  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid value for field: ${err.path}`);
  }

  // ── Mongoose ValidationError ───────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // ── MongoDB duplicate key error ────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value for ${field}`);
  }

  // ── JWT errors ─────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token has expired');
  }

  // ── Unknown / programmer errors ────────────────────────
  if (!(error instanceof ApiError)) {
    const statusCode = err.statusCode || 500;
    const message =
      process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // ── Log error ──────────────────────────────────────────
  const logMeta = {
    method: req.method,
    url: req.originalUrl,
    statusCode: error.statusCode,
    ip: req.ip,
  };

  if (error.statusCode >= 500) {
    logger.error(error.message, { ...logMeta, stack: error.stack });
  } else {
    logger.warn(error.message, logMeta);
  }

  // ── Send response ──────────────────────────────────────
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * Handles requests to routes that do not exist.
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFoundHandler };
