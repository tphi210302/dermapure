'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Legacy single-address subdocument (kept for backward compatibility on existing user docs)
const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    ward:   { type: String, trim: true },
    city:   { type: String, trim: true },
    state:  { type: String, trim: true },
    country: { type: String, trim: true, default: 'Vietnam' },
  },
  { _id: false }
);

// New multi-address book subdocument — what new code uses
const addressBookSchema = new mongoose.Schema(
  {
    label:         { type: String, trim: true, default: 'Nhà', maxlength: 40 },  // Nhà, Cơ quan, ...
    recipientName: { type: String, trim: true, required: true, maxlength: 80 },
    phone:         {
      type: String, trim: true, required: true,
      match: [/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ'],
    },
    street:        { type: String, trim: true, required: true, maxlength: 200 },
    ward:          { type: String, trim: true, required: true, maxlength: 100 },
    city:          { type: String, trim: true, maxlength: 100 },
    state:         { type: String, trim: true, required: true, maxlength: 100 },
    country:       { type: String, trim: true, default: 'Vietnam' },
    isDefault:     { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
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
      enum: ['customer', 'sales', 'staff', 'admin'],
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
    // Address book — multiple saved addresses, one default
    addresses: { type: [addressBookSchema], default: [] },
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
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
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
  if (this.role !== 'staff' && this.role !== 'admin' && this.role !== 'sales') return next();
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
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// Progressive lock durations in minutes: 1 → 5 → 15 → 30 → 60
const LOCK_DURATIONS = [1, 5, 15, 30, 60];

/**
 * Increment failed login attempts.
 * Returns { locked, message, remaining } — `remaining` is attempts left before lockout.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  const maxAttempts = (this.role === 'admin' || this.role === 'staff' || this.role === 'sales') ? 3 : 5;

  // Previous lock expired → reset attempts (keep lockCount for progressive duration)
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({ $set: { loginAttempts: 1, lockUntil: null } });
    return { locked: false, remaining: maxAttempts - 1 };
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
    return {
      locked: true,
      message: `Quá nhiều lần đăng nhập sai. Tài khoản bị khóa ${lockMins} phút.`,
    };
  }

  await this.updateOne({ $set: { loginAttempts: newAttempts } });
  return { locked: false, remaining: maxAttempts - newAttempts };
};

const User = mongoose.model('User', userSchema);
module.exports = User;
