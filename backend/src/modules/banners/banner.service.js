'use strict';

const Banner = require('./banner.model');
const ApiError = require('../../utils/ApiError');

const getAll = async ({ type, includeInactive = false } = {}) => {
  const query = {};
  if (type) query.type = type;
  if (!includeInactive) query.isActive = true;
  return Banner.find(query).sort({ type: 1, order: 1, createdAt: 1 });
};

const getById = async (id) => {
  const banner = await Banner.findById(id);
  if (!banner) throw ApiError.notFound('Banner not found');
  return banner;
};

const create = async (data) => Banner.create(data);

const update = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!banner) throw ApiError.notFound('Banner not found');
  return banner;
};

const remove = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw ApiError.notFound('Banner not found');
};

const reorder = async (items) => {
  // items: [{ id, order }]
  await Promise.all(items.map((it) => Banner.updateOne({ _id: it.id }, { order: it.order })));
  return true;
};

module.exports = { getAll, getById, create, update, remove, reorder };
