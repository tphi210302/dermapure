'use strict';

const service = require('./setting.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const get = asyncHandler(async (req, res) => {
  const setting = await service.get();
  return ApiResponse.ok(res, setting);
});

const update = asyncHandler(async (req, res) => {
  const setting = await service.update(req.body);
  return ApiResponse.ok(res, setting, 'Settings updated');
});

module.exports = { get, update };
