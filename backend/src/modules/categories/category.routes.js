'use strict';

const router = require('express').Router();
const ctrl = require('./category.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const schema = require('./category.validation');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product categories
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all active categories
 *     security: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get('/:id', ctrl.getById);

// ── Admin only ────────────────────────────────────────────
/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:        { type: string }
 *               description: { type: string }
 *               image:       { type: string }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', protect, authorize('admin'), validate(schema.create), ctrl.create);
router.patch('/:id', protect, authorize('admin'), validate(schema.update), ctrl.update);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);

module.exports = router;
