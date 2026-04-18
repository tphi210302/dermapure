'use strict';

const Cart = require('./cart.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

const populateOptions = [{ path: 'items.product', select: 'name price images stock brand unit' }];

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(populateOptions);
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const addItem = async (userId, { productId, quantity }) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found or unavailable');
  if (product.stock < quantity) throw ApiError.badRequest(`Only ${product.stock} items available in stock`);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > product.stock) throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
    cart.items[existingIndex].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return cart.populate(populateOptions);
};

const updateItem = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  if (product.stock < quantity) throw ApiError.badRequest(`Only ${product.stock} items in stock`);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw ApiError.notFound('Item not in cart');

  item.quantity = quantity;
  await cart.save();
  return cart.populate(populateOptions);
};

const removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  return cart.populate(populateOptions);
};

const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
