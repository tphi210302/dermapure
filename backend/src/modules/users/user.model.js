'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },   // Số nhà, tên đường
    ward:   { type: String, trim: true },   // Phường / Xã
    city:   { type: String, trim: true },   // Quận / Huyện
    state:  { type: String, trim: true },   // Tỉnh / Thành phố
    country: { type: String, trim: true, default: 'Vietnam' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,        // multiple users can have no email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: ['customer', 'staff', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      unique: true,
      sparse: true,
      match: [/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ (vd: 0912345678)'],
    },
    address: addressSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
    // Affiliate code — auto-generated for staff/admin on creation
    affiliateCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    lockCount: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Hash password before save ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Auto-generate affiliateCode for staff/admin on creation ───
userSchema.pre('save', async function (next) {
  if (!this.isNew || this.affiliateCode) return next();
  if (this.role !== 'staff' && this.role !== 'admin') return next();
  const base = (this.name || 'STAFF').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'STAFF';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  this.affiliateCode = `${base}${suffix}`;
  next();
});

// ── Instance methods ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.lockCount;
  return obj;
};

// Progressive lock durations in minutes: 1 → 5 → 15 → 30 → 60
const LOCK_DURATIONS = [1, 5, 15, 30, 60];

/**
 * Increment failed login attempts.
 * Returns { message } if account just got locked, null otherwise.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  const maxAttempts = (this.role === 'admin' || this.role === 'staff') ? 3 : 5;

  // Previous lock expired → reset attempts (keep lockCount for progressive duration)
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({ $set: { loginAttempts: 1, lockUntil: null } });
    return null;
  }

  const newAttempts = (this.loginAttempts || 0) + 1;

  if (newAttempts >= maxAttempts) {
    const lockIndex = Math.min(this.lockCount || 0, LOCK_DURATIONS.length - 1);
    const lockMins = LOCK_DURATIONS[lockIndex];
    await this.updateOne({
      $set: {
        loginAttempts: 0,
        lockUntil: new Date(Date.now() + lockMins * 60 * 1000),
      },
      $inc: { lockCount: 1 },
    });
    return { message: `Quá nhiều lần đăng nhập sai. Tài khoản bị khóa ${lockMins} phút.` };
  }

  await this.updateOne({ $set: { loginAttempts: newAttempts } });
  return null;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
