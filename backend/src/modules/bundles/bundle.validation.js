'use strict';

const Joi = require('joi');

const create = Joi.object({
  slug:            Joi.string().max(120).required(),
  title:           Joi.string().max(150).required(),
  subtitle:        Joi.string().max(300).allow('').optional(),
  solutionType:    Joi.string().valid('acne', 'oily-skin', 'dark-spot').required(),
  products:        Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  originalPrice:   Joi.number().min(0).required(),
  bundlePrice:     Joi.number().min(0).required(),
  discountPercent: Joi.number().min(0).max(100).optional(),
  durationDays:    Joi.number().integer().min(1).optional(),
  description:     Joi.string().max(2000).allow('').optional(),
  instructions:    Joi.string().max(2000).allow('').optional(),
  benefits:        Joi.array().items(Joi.string()).optional(),
  image:           Joi.string().uri({ allowRelative: true }).allow('').optional(),
  stockClaim:      Joi.number().integer().min(0).optional(),
  isActive:        Joi.boolean().optional(),
});

const update = Joi.object({
  slug:            Joi.string().max(120).optional(),
  title:           Joi.string().max(150).optional(),
  subtitle:        Joi.string().max(300).allow('').optional(),
  solutionType:    Joi.string().valid('acne', 'oily-skin', 'dark-spot').optional(),
  products:        Joi.array().items(Joi.string().hex().length(24)).min(1).optional(),
  originalPrice:   Joi.number().min(0).optional(),
  bundlePrice:     Joi.number().min(0).optional(),
  discountPercent: Joi.number().min(0).max(100).optional(),
  durationDays:    Joi.number().integer().min(1).optional(),
  description:     Joi.string().max(2000).allow('').optional(),
  instructions:    Joi.string().max(2000).allow('').optional(),
  benefits:        Joi.array().items(Joi.string()).optional(),
  image:           Joi.string().uri({ allowRelative: true }).allow('').optional(),
  stockClaim:      Joi.number().integer().min(0).optional(),
  isActive:        Joi.boolean().optional(),
});

module.exports = { create, update };
