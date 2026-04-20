'use strict';

const Joi = require('joi');

// VN phone pattern: starts with 0 or +84, followed by 9 digits (3/5/7/8/9 prefix)
const phonePattern = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

const register = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().allow('').optional(),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
  }),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (vd: 0912345678)',
    'any.required': 'Số điện thoại là bắt buộc',
  }),
});

// Login accepts either email or phone via `identifier`
const login = Joi.object({
  identifier: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập email hoặc số điện thoại',
  }),
  password: Joi.string().required(),
});

const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự',
  }),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng nhập email',
  }),
});

const resetPassword = Joi.object({
  token: Joi.string().hex().length(64).required().messages({
    'any.required': 'Thiếu token đặt lại mật khẩu',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
  }),
});

module.exports = { register, login, refreshToken, changePassword, forgotPassword, resetPassword };
