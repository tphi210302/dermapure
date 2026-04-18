'use strict';

const productService = require('./product.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  // Admins can see inactive products
  if (req.user?.role !== 'admin') {
    req.query.isActive = 'true';
  }
  const result = await productService.getAll(req.query);
  return ApiResponse.paginated(res, result);
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  return ApiResponse.ok(res, product);
});

const getBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getBySlug(req.params.slug);
  return ApiResponse.ok(res, product);
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  return ApiResponse.created(res, product, 'Product created');
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  return ApiResponse.ok(res, product, 'Product updated');
});

const remove = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  return ApiResponse.ok(res, null, 'Product deleted');
});

module.exports = { getAll, getById, getBySlug, create, update, remove };
