'use strict';

const voucherService = require('./voucher.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const getAll = asyncHandler(async (req, res) => {
  const vouchers = await voucherService.getAll();
  return ApiResponse.ok(res, vouchers);
});

// Customer: auto-detect voucher user qualifies for (e.g. first-order discount)
const auto = asyncHandler(async (req, res) => {
  const subtotal = Number(req.query.subtotal || 0);
  const voucher = await voucherService.findAutoVoucher({ userId: req.user.id, subtotal });
  if (!voucher) return ApiResponse.ok(res, null);

  // Also compute the discount preview
  const result = await voucherService.applyVoucher({
    code: voucher.code, userId: req.user.id, subtotal,
  });
  return ApiResponse.ok(res, {
    code:         result.voucher.code,
    type:         result.voucher.type,
    discount:     result.discount,
    freeShipping: result.freeShipping,
    note:         result.note,
    description:  result.voucher.description,
  });
});

// Customer: preview apply a voucher to current cart subtotal
const apply = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await voucherService.applyVoucher({
    code,
    userId: req.user.id,
    subtotal: Number(subtotal || 0),
  });
  return ApiResponse.ok(res, {
    code:         result.voucher.code,
    type:         result.voucher.type,
    discount:     result.discount,
    freeShipping: result.freeShipping,
    note:         result.note,
  }, 'Mã hợp lệ');
});

const create = asyncHandler(async (req, res) => {
  const voucher = await voucherService.create(req.body);
  return ApiResponse.created(res, voucher, 'Voucher created');
});

const update = asyncHandler(async (req, res) => {
  const voucher = await voucherService.update(req.params.id, req.body);
  return ApiResponse.ok(res, voucher, 'Voucher updated');
});

const remove = asyncHandler(async (req, res) => {
  await voucherService.remove(req.params.id);
  return ApiResponse.ok(res, null, 'Voucher deleted');
});

module.exports = { getAll, apply, auto, create, update, remove };
