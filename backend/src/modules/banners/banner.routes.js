'use strict';

const router = require('express').Router();
const ctrl = require('./banner.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const schema = require('./banner.validation');

// Public — list banners (by type if specified)
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// Admin CRUD
router.post('/',         protect, authorize('admin', 'staff'), validate(schema.create),  ctrl.create);
router.patch('/:id',     protect, authorize('admin', 'staff'), validate(schema.update),  ctrl.update);
router.delete('/:id',    protect, authorize('admin', 'staff'), ctrl.remove);
router.post('/reorder',  protect, authorize('admin', 'staff'), validate(schema.reorder), ctrl.reorder);

module.exports = router;
