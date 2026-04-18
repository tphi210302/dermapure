'use strict';

const router = require('express').Router();
const ctrl = require('./voucher.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

// Public — list active vouchers (for marketing display)
router.get('/', ctrl.getAll);

// Customer — auto-detect applicable voucher (first-order discount, etc.)
router.get('/auto', protect, ctrl.auto);

// Customer — validate voucher against current cart
router.post('/apply', protect, ctrl.apply);

// Admin CRUD
router.post('/',     protect, authorize('admin'), ctrl.create);
router.patch('/:id', protect, authorize('admin'), ctrl.update);
router.delete('/:id', protect, authorize('admin'), ctrl.remove);

module.exports = router;
