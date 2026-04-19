'use strict';

const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const User = require('../users/user.model');
const voucherService = require('../vouchers/voucher.service');
const { decrementStock } = require('../products/product.service');
const ApiError = require('../../utils/ApiError');

const SHIPPING_FEE      = 30000;  // 30K flat
const FREE_SHIPPING_MIN = 500000; // free over 500K

const populateOrder = [
  { path: 'user',           select: 'name email phone' },
  { path: 'items.product',  select: 'name images price brand unit' },
  { path: 'affiliateStaff', select: 'name email affiliateCode role' },
  { path: 'handledBy',      select: 'name email role' },
];

// ── Checkout ───────────────────────────────────────────────
const checkout = async (userId, { shippingAddress, note, voucherCode, affiliateCode }) => {
  // 1. Load cart with populated products
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }

  // 2. Validate availability and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw ApiError.badRequest(`Product "${product?.name}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
    }
    orderItems.push({
      product:  product._id,
      quantity: item.quantity,
      price:    product.price,
    });
    subtotal += product.price * item.quantity;
  }

  // 3. Compute shipping fee (free over 500K)
  let shippingFee = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;

  // 4. Apply voucher if provided
  let discount = 0;
  let discountNote;
  let appliedVoucher = null;
  if (voucherCode) {
    const result = await voucherService.applyVoucher({
      code: voucherCode, userId, subtotal, shippingFee,
    });
    discount = result.discount;
    discountNote = result.note;
    appliedVoucher = result.voucher;
    if (result.freeShipping) shippingFee = 0; // voucher makes shipping free
  }

  const totalAmount = Math.max(0, subtotal + shippingFee - discount);

  // 5. Decrement stock for each item
  for (const item of cart.items) {
    await decrementStock(item.product._id, item.quantity, null);
  }

  // 5b. Resolve affiliate code → staff user (ignore if not found, don't fail order)
  let affiliateStaff = null;
  let resolvedAffiliateCode = null;
  if (affiliateCode) {
    const code = affiliateCode.trim().toUpperCase();
    const staff = await User.findOne({
      affiliateCode: code,
      role: { $in: ['staff', 'admin'] },
      isActive: true,
    }).select('_id affiliateCode');
    if (staff && staff._id.toString() !== userId.toString()) {
      affiliateStaff = staff._id;
      resolvedAffiliateCode = staff.affiliateCode;
    }
  }

  // 6. Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    subtotal,
    shippingFee,
    discount,
    voucherCode: appliedVoucher?.code,
    discountNote,
    totalAmount,
    shippingAddress,
    note,
    affiliateStaff,
    affiliateCode: resolvedAffiliateCode,
  });

  // 7. Mark voucher used + clear cart
  if (appliedVoucher) await voucherService.markUsed(appliedVoucher._id);
  cart.items = [];
  await cart.save();

  // 8. Remember shipping address on user profile for next time
  await User.findByIdAndUpdate(userId, {
    $set: {
      'address.street':  shippingAddress.street,
      'address.ward':    shippingAddress.ward,
      'address.city':    shippingAddress.city,
      'address.state':   shippingAddress.state,
      'address.country': shippingAddress.country || 'Vietnam',
    },
  });

  return order.populate(populateOrder);
};

// ── Get my orders (customer) ───────────────────────────────
const getMyOrders = async (userId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Order.find({ user: userId })
      .populate(populateOrder)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments({ user: userId }),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

// ── Get order by ID ────────────────────────────────────────
const getOrderById = async (id, userId, role) => {
  const order = await Order.findById(id).populate(populateOrder);
  if (!order) throw ApiError.notFound('Order not found');
  // Customers can only see their own orders
  const isStaffOrAdmin = role === 'admin' || role === 'staff';
  if (!isStaffOrAdmin && order.user._id.toString() !== userId) {
    throw ApiError.forbidden('Not authorised to view this order');
  }
  return order;
};

// ── Get all orders (admin) ─────────────────────────────────
const getAllOrders = async ({ page = 1, limit = 15, status = '' }) => {
  const query = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Order.find(query)
      .populate(populateOrder)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Order.countDocuments(query),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

// ── Update order status (admin) ────────────────────────────
const updateStatus = async (id, status, { changedBy, note, trackingCode } = {}) => {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');

  // Prevent invalid transitions
  if (order.status === 'delivered' || order.status === 'cancelled') {
    throw ApiError.badRequest(`Cannot change status of a ${order.status} order`);
  }

  if (order.status !== status) {
    order.status = status;
    order.statusHistory.push({ status, changedBy, note, changedAt: new Date() });
  }
  if (trackingCode !== undefined) order.trackingCode = trackingCode;
  if (changedBy) order.handledBy = changedBy;
  await order.save();
  return order.populate(populateOrder);
};

// ── Cancel order (customer) ────────────────────────────────
const cancelOrder = async (id, userId) => {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== userId) throw ApiError.forbidden('Not authorised');
  if (order.status !== 'pending') throw ApiError.badRequest('Chỉ có thể hủy đơn khi đang chờ xử lý');

  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', changedBy: userId, note: 'Khách hàng hủy đơn', changedAt: new Date() });
  await order.save();
  return order.populate(populateOrder);
};

// ── Delete order (admin) ────────────────────────────────────
const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

module.exports = { checkout, getMyOrders, getOrderById, getAllOrders, updateStatus, cancelOrder, deleteOrder };
