'use strict';

const User = require('./user.model');
const Order = require('../orders/order.model');
const ApiError = require('../../utils/ApiError');

const createUser = async (data) => {
  // Guard: email/phone uniqueness
  if (data.email) {
    const byEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (byEmail) throw ApiError.badRequest('Email đã được sử dụng');
  }
  const byPhone = await User.findOne({ phone: data.phone });
  if (byPhone) throw ApiError.badRequest('Số điện thoại đã được sử dụng');

  // Custom affiliate code — uppercase + uniqueness check
  if (data.affiliateCode) {
    data.affiliateCode = data.affiliateCode.trim().toUpperCase();
    if (!data.affiliateCode) {
      delete data.affiliateCode;
    } else {
      const byCode = await User.findOne({ affiliateCode: data.affiliateCode });
      if (byCode) throw ApiError.badRequest('Mã giới thiệu đã được sử dụng');
    }
  } else {
    delete data.affiliateCode;
  }

  const user = await User.create(data);
  return user.toSafeObject();
};

const getAllUsers = async ({ page = 1, limit = 20, search = '', role = '' }) => {
  const query = {};
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
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

  // Email uniqueness (if changed)
  if (data.email !== undefined) {
    const email = (data.email || '').trim().toLowerCase();
    if (email && email !== user.email) {
      const byEmail = await User.findOne({ _id: { $ne: user._id }, email });
      if (byEmail) throw ApiError.badRequest('Email đã được sử dụng');
      data.email = email;
    } else if (!email) {
      user.email = undefined;
      delete data.email;
    }
  }

  // Phone uniqueness (if changed)
  if (data.phone !== undefined) {
    const phone = (data.phone || '').trim();
    if (phone && phone !== user.phone) {
      const byPhone = await User.findOne({ _id: { $ne: user._id }, phone });
      if (byPhone) throw ApiError.badRequest('Số điện thoại đã được sử dụng');
      data.phone = phone;
    }
  }

  // Handle affiliate code change — normalize, enforce uniqueness, allow clear via ''/null
  if (data.affiliateCode !== undefined) {
    if (!data.affiliateCode) {
      user.affiliateCode = undefined;
      delete data.affiliateCode;
    } else {
      const code = data.affiliateCode.trim().toUpperCase();
      if (code !== user.affiliateCode) {
        const byCode = await User.findOne({ _id: { $ne: user._id }, affiliateCode: code });
        if (byCode) throw ApiError.badRequest('Mã giới thiệu đã được sử dụng');
        data.affiliateCode = code;
      }
    }
  }

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

// Generate a fresh affiliate code — base on name, 4-char suffix, guaranteed unique
const buildAffiliateCode = async (name) => {
  const base = (name || 'STAFF').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'STAFF';
  for (let i = 0; i < 5; i++) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const code = `${base}${suffix}`;
    const exists = await User.exists({ affiliateCode: code });
    if (!exists) return code;
  }
  // Fallback with timestamp
  return `${base}${Date.now().toString(36).toUpperCase().slice(-4)}`;
};

// Affiliate stats for the logged-in staff/admin
const getMyAffiliateStats = async (userId) => {
  const user = await User.findById(userId).select('name email role affiliateCode');
  if (!user) throw ApiError.notFound('User not found');
  if (user.role !== 'staff' && user.role !== 'admin' && user.role !== 'sales') {
    throw ApiError.forbidden('Affiliate is only available for staff/admin/sales');
  }

  // Backfill code for legacy staff/admin accounts created before affiliate feature
  if (!user.affiliateCode) {
    user.affiliateCode = await buildAffiliateCode(user.name);
    await user.save();
  }

  // Aggregate orders referred by this user — excluded cancelled
  const pipeline = [
    { $match: { affiliateStaff: user._id, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: null,
        orderCount:   { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ];
  const [agg] = await Order.aggregate(pipeline);
  const orderCount   = agg?.orderCount   || 0;
  const totalRevenue = agg?.totalRevenue || 0;

  return {
    code:         user.affiliateCode,
    orderCount,
    totalRevenue,
    user: { name: user.name, email: user.email, role: user.role },
  };
};

// Admin — aggregate referrals grouped by staff (leaderboard)
const getAffiliateLeaderboard = async () => {
  const pipeline = [
    { $match: { affiliateStaff: { $ne: null }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$affiliateStaff',
        orderCount:   { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'staff',
      },
    },
    { $unwind: '$staff' },
    {
      $project: {
        _id: 0,
        staffId:      '$_id',
        name:         '$staff.name',
        email:        '$staff.email',
        role:         '$staff.role',
        affiliateCode:'$staff.affiliateCode',
        orderCount:   1,
        totalRevenue: 1,
      },
    },
  ];
  return Order.aggregate(pipeline);
};

module.exports = {
  createUser, getAllUsers, getUserById, updateUser, deleteUser,
  updateProfile, getMyAffiliateStats, getAffiliateLeaderboard,
};
