'use strict';

const mongoose = require('mongoose');

const SOLUTION_TYPES = ['acne', 'oily-skin', 'dark-spot'];

const bundleSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Bundle slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Bundle title is required'],
      trim: true,
      maxlength: 150,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    solutionType: {
      type: String,
      enum: SOLUTION_TYPES,
      required: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    originalPrice: { type: Number, required: true, min: 0 },
    bundlePrice:   { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    durationDays: { type: Number, default: 30 },
    description: { type: String, trim: true, maxlength: 2000 },
    instructions: { type: String, trim: true, maxlength: 2000 },
    benefits:     [{ type: String, trim: true }],
    image:        { type: String, trim: true },
    stockClaim:   { type: Number, default: 50 },   // "Còn X suất" — fake urgency counter
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

bundleSchema.pre('save', function (next) {
  if (this.originalPrice > 0) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.bundlePrice) / this.originalPrice) * 100
    );
  }
  next();
});

bundleSchema.statics.SOLUTION_TYPES = SOLUTION_TYPES;

module.exports = mongoose.model('Bundle', bundleSchema);
