'use strict';

/**
 * Wraps an async Express route handler and forwards any rejected promise
 * to the next() error middleware, removing the need for try/catch in
 * every controller.
 *
 * @param {Function} fn - Async (req, res, next) route handler
 * @returns {Function}  - Express-compatible middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
