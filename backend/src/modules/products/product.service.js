'use strict';

const Product = require('./product.model');
const ApiError = require('../../utils/ApiError');

/**
 * Build a Mongoose filter object from query params.
 */
const buildFilter = ({ search, category, minPrice, maxPrice, brand, requiresPrescription, isActive }) => {
  const filter = {};

  // Regex search — partial match, case-insensitive, works with Vietnamese
  if (search) {
    const re = { $regex: search, $options: 'i' };
    filter.$or = [
      { name:             re },
      { brand:            re },
      { tags:             re },
      { shortDescription: re },
    ];
  }

  if (category)             filter.category = category;
  if (brand)                filter.brand = { $regex: brand, $options: 'i' };
  if (requiresPrescription !== undefined) {
    filter.requiresPrescription = requiresPrescription === 'true';
  }

  // Admin can see inactive; public only active
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  return filter;
};

const getAll = async (queryParams) => {
  const {
    page  = 1,
    limit = 12,
    sort  = '-createdAt',
    ...filterParams
  } = queryParams;

  const filter = buildFilter(filterParams);
  const skip   = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const getBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const create = async (data) => {
  if (data.sku) {
    const existing = await Product.findOne({ sku: data.sku });
    if (existing) throw ApiError.conflict('SKU already exists');
  }
  return Product.create(data);
};

const update = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

const remove = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound('Product not found');
};

/**
 * Decrement stock atomically (used during checkout).
 * Throws if stock is insufficient.
 */
const decrementStock = async (id, quantity, session, variantId) => {
  const options = { new: true };
  if (session) options.session = session;

  // Per-variant stock
  if (variantId) {
    const product = await Product.findOneAndUpdate(
      { _id: id, 'variants._id': variantId, 'variants.stock': { $gte: quantity } },
      { $inc: { 'variants.$.stock': -quantity } },
      options
    );
    if (!product) throw ApiError.badRequest('Hết hàng cho loại đã chọn');
    return product;
  }

  // Top-level stock
  const product = await Product.findOneAndUpdate(
    { _id: id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    options
  );
  if (!product) {
    throw ApiError.badRequest('Insufficient stock for one or more products');
  }
  return product;
};

module.exports = { getAll, getById, getBySlug, create, update, remove, decrementStock };
