'use strict';

const Voucher = require('./voucher.model');
const Order = require('../orders/order.model');
const ApiError = require('../../utils/ApiError');

const SHIPPING_FEE_FLAT = 30000; // fallback shipping fee (30K)

const getAll = async () =>
  Voucher.find({ isActive: true }).sort({ createdAt: -1 });

const getByCode = async (code) => {
  if (!code) throw ApiError.badRequest('Mã giảm giá không được để trống');
  const voucher = await Voucher.findOne({ code: code.trim().toUpperCase(), isActive: true });
  if (!voucher) throw ApiError.notFound('Mã giảm giá không tồn tại hoặc đã hết hạn');
  return voucher;
};

/**
 * Validate + compute discount without mutating the voucher.
 * Returns: { voucher, discount, freeShipping, note }
 */
const applyVoucher = async ({ code, userId, subtotal, shippingFee = SHIPPING_FEE_FLAT }) => {
  const voucher = await getByCode(code);

  if (voucher.expiresAt && voucher.expiresAt < new Date()) {
    throw ApiError.badRequest('Mã giảm giá đã hết hạn');
  }
  if (voucher.maxUses > 0 && voucher.usedCount >= voucher.maxUses) {
    throw ApiError.badRequest('Mã giảm giá đã hết lượt sử dụng');
  }
  if (voucher.minOrder > 0 && subtotal < voucher.minOrder) {
    throw ApiError.badRequest(
      `Đơn hàng tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}₫ để dùng mã này`
    );
  }
  if (voucher.firstOrderOnly) {
    const hasOrders = await Order.exists({ user: userId, status: { $ne: 'cancelled' } });
    if (hasOrders) throw ApiError.badRequest('Mã chỉ áp dụng cho đơn hàng đầu tiên');
  }

  let discount = 0;
  let freeShipping = false;
  let note = voucher.description || voucher.code;

  if (voucher.type === 'percent') {
    discount = Math.floor((subtotal * voucher.value) / 100);
    if (voucher.maxDiscount > 0) discount = Math.min(discount, voucher.maxDiscount);
    note = `Giảm ${voucher.value}% (mã ${voucher.code})`;
  } else if (voucher.type === 'fixed') {
    discount = Math.min(voucher.value, subtotal);
    note = `Giảm ${voucher.value.toLocaleString('vi-VN')}₫ (mã ${voucher.code})`;
  } else if (voucher.type === 'free-shipping') {
    freeShipping = true;
    discount = shippingFee;
    note = `Miễn phí vận chuyển (mã ${voucher.code})`;
  }

  return { voucher, discount, freeShipping, note };
};

/** Atomically increment usedCount after order is placed successfully. */
const markUsed = async (voucherId) => {
  await Voucher.updateOne({ _id: voucherId }, { $inc: { usedCount: 1 } });
};

const create = async (data) => {
  const existing = await Voucher.findOne({ code: data.code?.trim().toUpperCase() });
  if (existing) throw ApiError.conflict('Mã đã tồn tại');
  return Voucher.create({ ...data, code: data.code?.trim().toUpperCase() });
};

const update = async (id, data) => {
  if (data.code) data.code = data.code.trim().toUpperCase();
  const voucher = await Voucher.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!voucher) throw ApiError.notFound('Voucher not found');
  return voucher;
};

const remove = async (id) => {
  const voucher = await Voucher.findByIdAndDelete(id);
  if (!voucher) throw ApiError.notFound('Voucher not found');
};

/**
 * Auto-detect voucher that the user qualifies for — currently: first-order discount.
 * Returns null if none applies.
 */
const findAutoVoucher = async ({ userId, subtotal }) => {
  const hasOrders = await Order.exists({ user: userId, status: { $ne: 'cancelled' } });
  if (hasOrders) return null; // only first-order users

  // Find the best first-order voucher that matches subtotal
  const vouchers = await Voucher.find({
    isActive: true,
    firstOrderOnly: true,
    minOrder: { $lte: subtotal || 0 },
  }).sort({ value: -1 });

  for (const v of vouchers) {
    if (v.expiresAt && v.expiresAt < new Date()) continue;
    if (v.maxUses > 0 && v.usedCount >= v.maxUses) continue;
    return v;
  }
  return null;
};

module.exports = { getAll, getByCode, applyVoucher, findAutoVoucher, markUsed, create, update, remove };
