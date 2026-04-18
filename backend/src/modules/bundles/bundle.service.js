'use strict';

const Bundle = require('./bundle.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

const POPULATE = { path: 'products', select: 'name slug price comparePrice images stock shortDescription rating' };

const getAll = async ({ solutionType, includeInactive = false } = {}) => {
  const query = {};
  if (!includeInactive) query.isActive = true;
  if (solutionType) query.solutionType = solutionType;
  return Bundle.find(query).populate(POPULATE).sort({ createdAt: -1 });
};

const getBySolutionType = async (solutionType) => {
  return Bundle.findOne({ solutionType, isActive: true }).populate(POPULATE);
};

const getBySlug = async (slug) => {
  const bundle = await Bundle.findOne({ slug, isActive: true }).populate(POPULATE);
  if (!bundle) throw ApiError.notFound('Bundle not found');
  return bundle;
};

const getById = async (id) => {
  const bundle = await Bundle.findById(id).populate(POPULATE);
  if (!bundle) throw ApiError.notFound('Bundle not found');
  return bundle;
};

const create = async (data) => {
  // validate products exist
  if (!data.products?.length) throw ApiError.badRequest('At least one product is required');
  const count = await Product.countDocuments({ _id: { $in: data.products }, isActive: true });
  if (count !== data.products.length) {
    throw ApiError.badRequest('One or more products are invalid or inactive');
  }
  const bundle = await Bundle.create(data);
  return bundle.populate(POPULATE);
};

const update = async (id, data) => {
  if (data.products?.length) {
    const count = await Product.countDocuments({ _id: { $in: data.products }, isActive: true });
    if (count !== data.products.length) {
      throw ApiError.badRequest('One or more products are invalid or inactive');
    }
  }
  const bundle = await Bundle.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(POPULATE);
  if (!bundle) throw ApiError.notFound('Bundle not found');
  return bundle;
};

const remove = async (id) => {
  const bundle = await Bundle.findByIdAndDelete(id);
  if (!bundle) throw ApiError.notFound('Bundle not found');
};

module.exports = { getAll, getBySolutionType, getBySlug, getById, create, update, remove };
