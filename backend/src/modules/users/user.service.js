'use strict';

const User = require('./user.model');
const ApiError = require('../../utils/ApiError');

const createUser = async (data) => {
  // Guard: email/phone uniqueness
  if (data.email) {
    const byEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (byEmail) throw ApiError.badRequest('Email đã được sử dụng');
  }
  const byPhone = await User.findOne({ phone: data.phone });
  if (byPhone) throw ApiError.badRequest('Số điện thoại đã được sử dụng');

  const user = await User.create(data);
  return user.toSafeObject();
};

const getAllUsers = async ({ page = 1, limit = 20, search = '', role = '' }) => {
  const query = {};
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  Object.assign(user, data);
  await user.save();
  return user.toSafeObject();
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');
};

const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeObject();
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, updateProfile };
