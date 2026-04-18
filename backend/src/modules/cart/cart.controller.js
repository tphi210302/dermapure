'use strict';

const cartService = require('./cart.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getCart    = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  return ApiResponse.ok(res, cart);
});

const addItem    = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  return ApiResponse.ok(res, cart, 'Item added to cart');
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.productId, req.body.quantity);
  return ApiResponse.ok(res, cart, 'Cart updated');
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  return ApiResponse.ok(res, cart, 'Item removed');
});

const clearCart  = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  return ApiResponse.ok(res, null, 'Cart cleared');
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
