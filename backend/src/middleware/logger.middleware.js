'use strict';

const logger = require('../config/logger');

/**
 * HTTP request/response logger middleware.
 * Logs method, URL, status code, response time, and IP for every request.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket?.remoteAddress,
      userAgent: req.get('user-agent') || '-',
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP request', logData);
    } else {
      logger.info('HTTP request', logData);
    }
  });

  next();
};

module.exports = { requestLogger };
