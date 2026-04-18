'use strict';

const mongoose = require('mongoose');

const VOUCHER_TYPES = ['percent', 'fixed', 'free-shipping'];

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Voucher code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 30,
    },
    type: {
      type: String,
      enum: VOUCHER_TYPES,
      required: true,
    },
    // For percent: 0-100 (e.g. 10 → 10%). For fixed: amount in VND. For free-shipping: ignored.
    value: { type: Number, default: 0, min: 0 },
    // Max discount amount (for percent type — caps the savings)
    maxDiscount: { type: Number, default: 0, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    // Only usable on first order per user (WELCOME10)
    firstOrderOnly: { type: Boolean, default: false },
    // Global usage cap; 0 = unlimited
    maxUses: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true, maxlength: 200 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

voucherSchema.statics.VOUCHER_TYPES = VOUCHER_TYPES;

module.exports = mongoose.model('Voucher', voucherSchema);
