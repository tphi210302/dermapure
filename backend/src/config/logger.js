'use strict';

const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, errors, json, colorize, printf } = format;

const isDev = process.env.NODE_ENV !== 'production';

// ── Console format (human-readable in dev) ────────────────
const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return stack
    ? `[${ts}] ${level}: ${message}\n${stack}`
    : `[${ts}] ${level}: ${message}`;
});

// ── Daily rotate file transport (structured JSON) ─────────
const fileTransport = new DailyRotateFile({
  filename: path.join('logs', '%DATE%-combined.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp(), errors({ stack: true }), json()),
});

const errorFileTransport = new DailyRotateFile({
  filename: path.join('logs', '%DATE%-error.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: combine(timestamp(), errors({ stack: true }), json()),
});

// ── Logger instance ────────────────────────────────────────
const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    fileTransport,
    errorFileTransport,
    new transports.Console({
      format: isDev
        ? combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat)
        : combine(timestamp(), json()),
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
