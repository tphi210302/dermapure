'use strict';

const router = require('express').Router();
const ctrl = require('./cart.controller');
const { protect } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const schema = require('./cart.validation');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

router.use(protect);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the current user's cart
 *     responses:
 *       200: { description: Cart object }
 */
router.get('/', ctrl.getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               quantity:  { type: integer, minimum: 1 }
 *     responses:
 *       200: { description: Updated cart }
 */
router.post('/items', validate(schema.addItem), ctrl.addItem);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update item quantity
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Updated cart }
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Updated cart }
 */
router.patch('/items/:productId', validate(schema.updateItem), ctrl.updateItem);
router.delete('/items/:productId', ctrl.removeItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Clear entire cart
 *     responses:
 *       200: { description: Cart cleared }
 */
router.delete('/', ctrl.clearCart);

module.exports = router;
