'use strict';

const router = require('express').Router();
const ctrl = require('./banner.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

// Public — list banners (by type if specified)
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// Admin CRUD
router.post('/',         protect, authorize('admin'), ctrl.create);
router.patch('/:id',     protect, authorize('admin'), ctrl.update);
router.delete('/:id',    protect, authorize('admin'), ctrl.remove);
router.post('/reorder',  protect, authorize('admin'), ctrl.reorder);

module.exports = router;
