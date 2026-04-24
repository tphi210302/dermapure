'use strict';

const Joi = require('joi');

const variantSchema = Joi.object({
  _id:          Joi.string().hex().length(24).optional(),
  label:        Joi.string().max(80).required(),
  price:        Joi.number().min(0).required(),
  comparePrice: Joi.number().min(0).optional().allow(null),
  stock:        Joi.number().integer().min(0).required(),
  sku:          Joi.string().allow('').optional(),
  image:        Joi.string().allow('').optional(),
  color:        Joi.string().max(40).allow('').optional(),
  colorHex:     Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).allow('').optional(),
});

const create = Joi.object({
  name:                 Joi.string().max(200).required(),
  description:          Joi.string().optional(),
  shortDescription:     Joi.string().max(300).optional(),
  price:                Joi.number().min(0).required(),
  comparePrice:         Joi.number().min(0).optional(),
  costPrice:            Joi.number().min(0).optional(),
  category:             Joi.string().hex().length(24).required(),
  images:               Joi.array().items(Joi.string()).optional(),
  stock:                Joi.number().integer().min(0).required(),
  sku:                  Joi.string().optional(),
  brand:                Joi.string().optional(),
  unit:                 Joi.string().optional(),
  tags:                 Joi.array().items(Joi.string()).optional(),
  requiresPrescription: Joi.boolean().optional(),
  isActive:             Joi.boolean().optional(),
  ingredients:          Joi.string().optional(),
  dosage:               Joi.string().optional(),
  warnings:             Joi.string().optional(),
  variants:             Joi.array().items(variantSchema).optional(),
});

const update = Joi.object({
  name:                 Joi.string().max(200).optional(),
  description:          Joi.string().optional(),
  shortDescription:     Joi.string().max(300).optional(),
  price:                Joi.number().min(0).optional(),
  comparePrice:         Joi.number().min(0).optional(),
  costPrice:            Joi.number().min(0).optional(),
  category:             Joi.string().hex().length(24).optional(),
  images:               Joi.array().items(Joi.string()).optional(),
  stock:                Joi.number().integer().min(0).optional(),
  sku:                  Joi.string().optional(),
  brand:                Joi.string().optional(),
  unit:                 Joi.string().optional(),
  tags:                 Joi.array().items(Joi.string()).optional(),
  requiresPrescription: Joi.boolean().optional(),
  isActive:             Joi.boolean().optional(),
  ingredients:          Joi.string().optional(),
  dosage:               Joi.string().optional(),
  warnings:             Joi.string().optional(),
  variants:             Joi.array().items(variantSchema).optional(),
});

module.exports = { create, update };
