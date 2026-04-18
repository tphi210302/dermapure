'use strict';

const router = require('express').Router();
const ctrl = require('./setting.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');

router.get('/',     ctrl.get);
router.patch('/',   protect, authorize('admin'), ctrl.update);

module.exports = router;
