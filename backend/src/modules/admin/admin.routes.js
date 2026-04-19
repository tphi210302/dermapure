'use strict';

const router = require('express').Router();
const ctrl = require('./admin.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

router.use(protect, authorize('admin', 'staff', 'sales'));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     responses:
 *       200:
 *         description: Dashboard data including revenue, orders, products, users counts and charts
 */
router.get('/dashboard', ctrl.getDashboard);

module.exports = router;
