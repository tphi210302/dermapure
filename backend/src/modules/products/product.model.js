'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
      default: 'piece',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },
    ingredients: { type: String, trim: true },
    dosage:      { type: String, trim: true },
    warnings:    { type: String, trim: true },

    // ── Variants ────────────────────────────────────────────
    // Optional. When non-empty, the product is sold per-variant and the
    // top-level price/stock become the "default/fallback" for legacy orders.
    // Each variant has its own label (vd "30ml", "size L"), price, stock.
    variants: {
      type: [
        new mongoose.Schema(
          {
            label:        { type: String, trim: true, required: true, maxlength: 80 },
            price:        { type: Number, required: true, min: 0 },
            comparePrice: { type: Number, min: 0 },
            stock:        { type: Number, required: true, min: 0, default: 0 },
            sku:          { type: String, trim: true },
            image:        { type: String, trim: true }, // optional variant-specific image
          },
          { _id: true }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

// ── Indexes for search / filter ────────────────────────────
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

// ── Auto-generate slug ─────────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const base = this.name
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    // append a short unique suffix to avoid collisions
    this.slug = `${base}-${Date.now()}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
