'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const { swaggerSpec } = require('./config/swagger');
const { requestLogger } = require('./middleware/logger.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// ── Security headers ───────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate limiting ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limit on auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,                  // 15 attempts / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: { success: false, message: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Compression ────────────────────────────────────────────
app.use(compression());

// ── Request logger ─────────────────────────────────────────
app.use(requestLogger);

// ── Swagger docs ───────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',       require('./modules/auth/auth.routes'));
app.use('/api/users',      require('./modules/users/user.routes'));
app.use('/api/categories', require('./modules/categories/category.routes'));
app.use('/api/products',   require('./modules/products/product.routes'));
app.use('/api/cart',       require('./modules/cart/cart.routes'));
app.use('/api/orders',     require('./modules/orders/order.routes'));
app.use('/api/bundles',    require('./modules/bundles/bundle.routes'));
app.use('/api/vouchers',   require('./modules/vouchers/voucher.routes'));
app.use('/api/banners',    require('./modules/banners/banner.routes'));
app.use('/api/settings',   require('./modules/settings/setting.routes'));
app.use('/api/admin',      require('./modules/admin/admin.routes'));

// ── 404 handler ────────────────────────────────────────────
app.use(notFoundHandler);

// ── Centralized error handler ──────────────────────────────
app.use(errorHandler);

module.exports = app;
