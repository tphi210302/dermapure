'use strict';

const router = require('express').Router();
const ctrl = require('./product.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const schema = require('./product.validation');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalogue
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products with search, filter, and pagination
 *     security: []
 *     parameters:
 *       - { in: query, name: page,    schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit,   schema: { type: integer, default: 12 } }
 *       - { in: query, name: search,  schema: { type: string } }
 *       - { in: query, name: category,schema: { type: string } }
 *       - { in: query, name: brand,   schema: { type: string } }
 *       - { in: query, name: minPrice,schema: { type: number } }
 *       - { in: query, name: maxPrice,schema: { type: number } }
 *       - { in: query, name: sort,    schema: { type: string, default: '-createdAt' } }
 *     responses:
 *       200: { description: Paginated product list }
 */
router.get('/', ctrl.getAll);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by slug
 *     security: []
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Product }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get('/slug/:slug', ctrl.getBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Product }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 */
router.get('/:id', ctrl.getById);

// ── Admin only ────────────────────────────────────────────
router.post('/',    protect, authorize('admin', 'staff'), validate(schema.create), ctrl.create);
router.patch('/:id', protect, authorize('admin', 'staff'), validate(schema.update), ctrl.update);
router.delete('/:id', protect, authorize('admin', 'staff'), ctrl.remove);

module.exports = router;
