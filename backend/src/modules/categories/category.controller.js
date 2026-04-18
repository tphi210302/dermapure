'use strict';

const categoryService = require('./category.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin';
  const categories = await categoryService.getAll(includeInactive);
  return ApiResponse.ok(res, categories);
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  return ApiResponse.ok(res, category);
});

const create = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  return ApiResponse.created(res, category, 'Category created');
});

const update = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  return ApiResponse.ok(res, category, 'Category updated');
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  return ApiResponse.ok(res, null, 'Category deleted');
});

module.exports = { getAll, getById, create, update, remove };
