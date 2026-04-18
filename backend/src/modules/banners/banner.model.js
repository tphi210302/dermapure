'use strict';

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['hero', 'promo', 'feature'],
      required: true,
      index: true,
    },
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    subtitle:    { type: String, trim: true, maxlength: 400 },
    badge:       { type: String, trim: true, maxlength: 60 },
    imageUrl:    { type: String, trim: true },
    ctaText:     { type: String, trim: true, maxlength: 60 },
    ctaHref:     { type: String, trim: true, maxlength: 500 },
    gradientFrom:{ type: String, trim: true, default: '#be123c' },
    gradientTo:  { type: String, trim: true, default: '#f43f5e' },
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

bannerSchema.index({ type: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
