'use strict';

const adminService = require('./admin.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getDashboard = asyncHandler(async (_req, res) => {
  const data = await adminService.getDashboard();
  return ApiResponse.ok(res, data);
});

module.exports = { getDashboard };
