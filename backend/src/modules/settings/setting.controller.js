'use strict';

const service = require('./setting.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const get = asyncHandler(async (req, res) => {
  const setting = await service.get();
  // Admin can update settings at any time — never cache at CDN or browser level
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return ApiResponse.ok(res, setting);
});

const update = asyncHandler(async (req, res) => {
  const setting = await service.update(req.body);
  return ApiResponse.ok(res, setting, 'Settings updated');
});

module.exports = { get, update };
