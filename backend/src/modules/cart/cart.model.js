'use strict';

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    // Optional — only set when the product uses variants. Stores the Product.variants._id
    // so we can resolve label/price at checkout time (price may have changed since add-to-cart).
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true, versionKey: false }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
