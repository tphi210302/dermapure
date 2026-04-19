'use strict';

const Joi = require('joi');

const checkout = Joi.object({
  shippingAddress: Joi.object({
    recipientName: Joi.string().required().messages({ 'any.required': 'Vui lòng nhập tên người nhận' }),
    phone:         Joi.string().pattern(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/).required().messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ',
      'any.required': 'Vui lòng nhập số điện thoại',
    }),
    street:  Joi.string().required().messages({ 'any.required': 'Vui lòng nhập số nhà, tên đường' }),
    ward:    Joi.string().required().messages({ 'any.required': 'Vui lòng chọn Phường/Xã' }),
    state:   Joi.string().required().messages({ 'any.required': 'Vui lòng chọn Tỉnh/Thành phố' }),
    city:    Joi.string().allow('').optional(),   // LEGACY — district (now abolished)
    country: Joi.string().optional(),
  }).required(),
  note: Joi.string().max(500).allow('').optional(),
  voucherCode: Joi.string().max(30).allow('').optional(),
  affiliateCode: Joi.string().max(30).allow('').optional(),
});

const updateStatus = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    .required(),
  note:         Joi.string().max(300).allow('').optional(),
  trackingCode: Joi.string().max(100).allow('').optional(),
});

module.exports = { checkout, updateStatus };
