'use strict';

const orderService = require('./order.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const checkout = asyncHandler(async (req, res) => {
  try {
    const order = await orderService.checkout(req.user.id, req.body);
    return ApiResponse.created(res, order, 'Order placed successfully');
  } catch (err) {
    console.error('[checkout] user=%s role=%s err=%s', req.user?.id, req.user?.role, err?.message);
    throw err;
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await orderService.getMyOrders(req.user.id, { page, limit });
  return ApiResponse.paginated(res, result);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
  return ApiResponse.ok(res, order);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, status = '' } = req.query;
  const result = await orderService.getAllOrders({ page, limit, status });
  return ApiResponse.paginated(res, result);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingCode } = req.body;
  const order = await orderService.updateStatus(req.params.id, status, {
    changedBy: req.user.id, note, trackingCode,
  });
  return ApiResponse.ok(res, order, 'Order status updated');
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user.id);
  return ApiResponse.ok(res, order, 'Order cancelled');
});

const deleteOrder = asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id);
  return ApiResponse.noContent(res);
});

module.exports = { checkout, getMyOrders, getOrderById, getAllOrders, updateStatus, cancelOrder, deleteOrder };
