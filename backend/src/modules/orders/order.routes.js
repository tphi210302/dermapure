'use strict';

const router = require('express').Router();
const ctrl = require('./order.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const schema = require('./order.validation');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

router.use(protect);

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Place an order from current cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:  { type: string }
 *                   city:    { type: string }
 *                   country: { type: string }
 *               note: { type: string }
 *     responses:
 *       201: { description: Order created }
 */
router.post('/checkout', authorize('customer', 'admin'), validate(schema.checkout), ctrl.checkout);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get the current customer's orders
 *     responses:
 *       200: { description: Paginated order list }
 */
router.get('/my', ctrl.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Order object }
 */
router.get('/:id', ctrl.getOrderById);

// ── Admin ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders (admin)
 *     parameters:
 *       - { in: query, name: page,   schema: { type: integer } }
 *       - { in: query, name: limit,  schema: { type: integer } }
 *       - { in: query, name: status, schema: { type: string }  }
 *     responses:
 *       200: { description: Paginated orders }
 */
router.get('/', authorize('admin'), ctrl.getAllOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, processing, shipped, delivered, cancelled] }
 *     responses:
 *       200: { description: Updated order }
 */
router.patch('/:id/cancel', ctrl.cancelOrder);
router.patch('/:id/status', authorize('admin'), validate(schema.updateStatus), ctrl.updateStatus);
router.delete('/:id', authorize('admin'), ctrl.deleteOrder);

module.exports = router;
