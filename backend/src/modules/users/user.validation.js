'use strict';

const Joi = require('joi');

const updateProfile = Joi.object({
  name:  Joi.string().min(2).max(80).optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().pattern(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/).optional(),
  address: Joi.object({
    street:  Joi.string().allow('').optional(),
    ward:    Joi.string().allow('').optional(),
    city:    Joi.string().allow('').optional(),
    state:   Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
  }).optional(),
});

const adminUpdateUser = Joi.object({
  name:     Joi.string().min(2).max(80).optional(),
  role:     Joi.string().valid('customer', 'staff', 'admin').optional(),
  isActive: Joi.boolean().optional(),
  phone:    Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).optional(),
  password: Joi.string().min(8).optional(),
});

const adminCreateUser = Joi.object({
  name:     Joi.string().min(2).max(80).required(),
  email:    Joi.string().email().allow('').optional(),
  phone:    Joi.string().pattern(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/).required(),
  password: Joi.string().min(8).required(),
  role:     Joi.string().valid('customer', 'staff', 'admin').default('staff'),
  isActive: Joi.boolean().default(true),
});

module.exports = { updateProfile, adminUpdateUser, adminCreateUser };
