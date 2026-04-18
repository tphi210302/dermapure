'use strict';

const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');

// ── Token helpers ──────────────────────────────────────────
const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
};

// ── Identifier helpers ─────────────────────────────────────
const isEmail = (s) => /^\S+@\S+\.\S+$/.test(s);
const normalizePhone = (p) => String(p || '').replace(/[\s\-()]/g, '');

// ── Auth service methods ───────────────────────────────────
const register = async ({ name, email, password, phone }) => {
  phone = normalizePhone(phone);
  if (!phone) throw ApiError.badRequest('Số điện thoại là bắt buộc');

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) throw ApiError.conflict('Số điện thoại đã được đăng ký');

  // Email is optional — only validate uniqueness if provided
  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
  if (cleanEmail) {
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) throw ApiError.conflict('Email đã được đăng ký');
  }

  const user = await User.create({ name, password, phone, ...(cleanEmail && { email: cleanEmail }) });

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

// identifier can be either email or phone number
const login = async ({ identifier, email, phone, password }) => {
  // Backwards-compat: accept either `identifier` OR legacy `email`/`phone`
  const raw = identifier || email || phone;
  if (!raw) throw ApiError.badRequest('Vui lòng nhập email hoặc số điện thoại');

  const query = isEmail(raw)
    ? { email: raw.toLowerCase().trim() }
    : { phone: normalizePhone(raw) };

  const user = await User.findOne(query).select(
    '+password +refreshToken +loginAttempts +lockUntil +lockCount'
  );
  if (!user) throw ApiError.unauthorized('Email/SĐT hoặc mật khẩu không đúng');
  if (!user.isActive) throw ApiError.forbidden('Your account has been deactivated');

  // Check if account is currently locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const remainingMins = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw ApiError.tooManyRequests(
      `Tài khoản tạm khóa. Vui lòng thử lại sau ${remainingMins} phút.`
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const locked = await user.incrementLoginAttempts();
    if (locked) throw ApiError.tooManyRequests(locked.message);
    throw ApiError.unauthorized('Email/SĐT hoặc mật khẩu không đúng');
  }

  // Success — reset lockout counters and issue tokens in one update
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  await User.findByIdAndUpdate(user._id, {
    $set: { loginAttempts: 0, lockUntil: null, lockCount: 0, refreshToken },
  });

  return { user: user.toSafeObject(), accessToken, refreshToken };
};

const refreshAccessToken = async (token) => {
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const newAccessToken = signAccessToken(user._id, user.role);
  const newRefreshToken = signRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeObject();
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.unauthorized('Mật khẩu hiện tại không đúng');
  user.password = newPassword;     // hashed via pre-save hook
  await user.save();
};

module.exports = { register, login, refreshAccessToken, logout, getMe, changePassword };
