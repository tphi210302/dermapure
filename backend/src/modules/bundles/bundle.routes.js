'use strict';

const router = require('express').Router();
const ctrl = require('./bundle.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Bundles
 *   description: Product combos/bundles for skincare solution pages
 */

// Public
router.get('/', ctrl.getAll);
router.get('/solution/:slug', ctrl.getBySolutionType);   // /api/bundles/solution/acne
router.get('/slug/:slug',     ctrl.getBySlug);
router.get('/:id',            ctrl.getById);

// Admin
router.post('/',        protect, authorize('admin', 'staff'), ctrl.create);
router.patch('/:id',    protect, authorize('admin', 'staff'), ctrl.update);
router.delete('/:id',   protect, authorize('admin', 'staff'), ctrl.remove);

module.exports = router;
