'use strict';

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price:    { type: Number, required: true, min: 0 }, // snapshot of price at purchase time
  },
  { _id: true }
);

const addressSchema = new mongoose.Schema(
  {
    street:  { type: String, trim: true },   // Số nhà, tên đường
    ward:    { type: String, trim: true },   // Phường / Xã
    city:    { type: String, trim: true },   // Quận / Huyện
    state:   { type: String, trim: true },   // Tỉnh / Thành phố
    phone:   { type: String, trim: true },   // SĐT người nhận (copy từ user khi đặt)
    recipientName: { type: String, trim: true }, // Tên người nhận
    country: { type: String, trim: true, default: 'Vietnam' },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status:    { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note:      { type: String, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, 'Order must have at least one item'],
    },
    subtotal:    { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    discount:    { type: Number, default: 0, min: 0 },
    voucherCode: { type: String, trim: true, uppercase: true },
    discountNote:{ type: String, trim: true, maxlength: 200 },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    trackingCode: {
      type: String,
      trim: true,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true, versionKey: false }
);

// Initial status entry for new orders
orderSchema.pre('save', function (next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, note: 'Đơn hàng được tạo' });
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
