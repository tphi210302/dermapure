'use strict';

const bundleService = require('./bundle.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  const { solutionType } = req.query;
  const includeInactive = req.user?.role === 'admin';
  const bundles = await bundleService.getAll({ solutionType, includeInactive });
  return ApiResponse.ok(res, bundles);
});

const getBySolutionType = asyncHandler(async (req, res) => {
  const bundle = await bundleService.getBySolutionType(req.params.slug);
  return ApiResponse.ok(res, bundle);
});

const getBySlug = asyncHandler(async (req, res) => {
  const bundle = await bundleService.getBySlug(req.params.slug);
  return ApiResponse.ok(res, bundle);
});

const getById = asyncHandler(async (req, res) => {
  const bundle = await bundleService.getById(req.params.id);
  return ApiResponse.ok(res, bundle);
});

const create = asyncHandler(async (req, res) => {
  const bundle = await bundleService.create(req.body);
  return ApiResponse.created(res, bundle, 'Bundle created');
});

const update = asyncHandler(async (req, res) => {
  const bundle = await bundleService.update(req.params.id, req.body);
  return ApiResponse.ok(res, bundle, 'Bundle updated');
});

const remove = asyncHandler(async (req, res) => {
  await bundleService.remove(req.params.id);
  return ApiResponse.ok(res, null, 'Bundle deleted');
});

module.exports = { getAll, getBySolutionType, getBySlug, getById, create, update, remove };
