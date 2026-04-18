'use strict';

const Category = require('./category.model');
const ApiError = require('../../utils/ApiError');

const getAll = async (includeInactive = false) => {
  const query = includeInactive ? {} : { isActive: true };
  return Category.find(query).sort({ name: 1 });
};

const getById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

const getBySlug = async (slug) => {
  const category = await Category.findOne({ slug, isActive: true });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

const create = async (data) => {
  const existing = await Category.findOne({ name: data.name });
  if (existing) throw ApiError.conflict('Category with this name already exists');
  return Category.create(data);
};

const update = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

const remove = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound('Category not found');
};

module.exports = { getAll, getById, getBySlug, create, update, remove };
