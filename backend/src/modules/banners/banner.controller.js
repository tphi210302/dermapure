'use strict';

const service = require('./banner.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const includeInactive = req.user?.role === 'admin' || req.user?.role === 'staff';
  const items = await service.getAll({ type, includeInactive });
  return ApiResponse.ok(res, items);
});

const getById = asyncHandler(async (req, res) => {
  const b = await service.getById(req.params.id);
  return ApiResponse.ok(res, b);
});

const create = asyncHandler(async (req, res) => {
  const b = await service.create(req.body);
  return ApiResponse.created(res, b, 'Banner created');
});

const update = asyncHandler(async (req, res) => {
  const b = await service.update(req.params.id, req.body);
  return ApiResponse.ok(res, b, 'Banner updated');
});

const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return ApiResponse.ok(res, null, 'Banner deleted');
});

const reorder = asyncHandler(async (req, res) => {
  await service.reorder(req.body.items || []);
  return ApiResponse.ok(res, null, 'Reordered');
});

module.exports = { getAll, getById, create, update, remove, reorder };
