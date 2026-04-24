'use strict';

const Cart = require('./cart.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

const populateOptions = [{ path: 'items.product', select: 'name price images stock brand unit variants' }];

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(populateOptions);
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const addItem = async (userId, { productId, quantity, variantId }) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound('Product not found or unavailable');

  // If product has variants, buyer MUST pick one and we check that variant's stock
  let stockAvailable = product.stock;
  let resolvedVariantId;
  if (product.variants && product.variants.length > 0) {
    if (!variantId) throw ApiError.badRequest('Vui lòng chọn loại sản phẩm');
    const variant = product.variants.id(variantId);
    if (!variant) throw ApiError.badRequest('Loại sản phẩm không hợp lệ');
    stockAvailable = variant.stock;
    resolvedVariantId = variant._id;
  }
  if (stockAvailable < quantity) throw ApiError.badRequest(`Chỉ còn ${stockAvailable} sản phẩm`);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  // Same product+variant counts as the same line; different variants = separate lines
  const existingIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      String(item.variantId || '') === String(resolvedVariantId || '')
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty > stockAvailable) throw ApiError.badRequest(`Chỉ còn ${stockAvailable} sản phẩm`);
    cart.items[existingIndex].quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity, variantId: resolvedVariantId });
  }

  await cart.save();
  return cart.populate(populateOptions);
};

const updateItem = async (userId, productId, quantity, variantId) => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  let stockAvailable = product.stock;
  if (variantId && product.variants && product.variants.length > 0) {
    const variant = product.variants.id(variantId);
    if (!variant) throw ApiError.badRequest('Loại sản phẩm không hợp lệ');
    stockAvailable = variant.stock;
  }
  if (stockAvailable < quantity) throw ApiError.badRequest(`Chỉ còn ${stockAvailable} sản phẩm`);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = cart.items.find(
    (i) => i.product.toString() === productId && String(i.variantId || '') === String(variantId || '')
  );
  if (!item) throw ApiError.notFound('Item not in cart');

  item.quantity = quantity;
  await cart.save();
  return cart.populate(populateOptions);
};

const removeItem = async (userId, productId, variantId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  cart.items = cart.items.filter(
    (i) => !(i.product.toString() === productId && String(i.variantId || '') === String(variantId || ''))
  );
  await cart.save();
  return cart.populate(populateOptions);
};

const clearCart = async (userId) => {
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
