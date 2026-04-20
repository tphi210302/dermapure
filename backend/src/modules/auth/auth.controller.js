'use strict';

const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ApiResponse.created(res, result, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return ApiResponse.ok(res, result, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  return ApiResponse.ok(res, tokens, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  return ApiResponse.ok(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return ApiResponse.ok(res, user);
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return ApiResponse.ok(res, null, 'Đổi mật khẩu thành công');
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.requestPasswordReset(req.body);
  // Always return the same message to prevent email enumeration
  return ApiResponse.ok(res, null,
    'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.');
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return ApiResponse.ok(res, null, 'Mật khẩu đã được đặt lại. Hãy đăng nhập bằng mật khẩu mới.');
});

module.exports = {
  register, login, refreshToken, logout, getMe, changePassword,
  forgotPassword, resetPassword,
};
