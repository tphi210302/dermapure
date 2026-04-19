'use strict';

const router = require('express').Router();
const ctrl = require('./user.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validate.middleware');
const schema = require('./user.validation');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin) and profile (customer)
 */

// ── Customer ──────────────────────────────────────────────
router.patch('/me', protect, validate(schema.updateProfile), ctrl.updateProfile);

// ── Staff/Admin: affiliate ────────────────────────────────
router.get('/me/affiliate', protect, authorize('staff', 'admin'), ctrl.getMyAffiliate);
router.get('/affiliate/leaderboard', protect, authorize('admin'), ctrl.getAffiliateLeaderboard);

// ── Admin ─────────────────────────────────────────────────
router.post('/',   protect, authorize('admin'), validate(schema.adminCreateUser), ctrl.createUser);
router.get('/',    protect, authorize('admin'), ctrl.getAllUsers);
router.get('/:id', protect, authorize('admin'), ctrl.getUserById);
router.patch('/:id', protect, authorize('admin'), validate(schema.adminUpdateUser), ctrl.updateUser);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteUser);

module.exports = router;
