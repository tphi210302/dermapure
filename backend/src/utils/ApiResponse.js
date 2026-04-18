'use strict';

/**
 * Standardised API response wrapper.
 * Ensures every response follows the same shape.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*}      data       - Response payload
   * @param {string} message    - Human-readable message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  /**
   * Send the response via Express `res` object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }

  // ── Static factory helpers ─────────────────────────────
  static ok(res, data, message = 'Success') {
    return new ApiResponse(200, data, message).send(res);
  }

  static created(res, data, message = 'Created successfully') {
    return new ApiResponse(201, data, message).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Paginated list response.
   * @param {import('express').Response} res
   * @param {object} opts
   * @param {Array}  opts.items
   * @param {number} opts.total
   * @param {number} opts.page
   * @param {number} opts.limit
   * @param {string} [opts.message]
   */
  static paginated(res, { items, total, page, limit, message = 'Success' }) {
    return res.status(200).json({
      success: true,
      message,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  }
}

module.exports = ApiResponse;
