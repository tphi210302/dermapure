'use strict';

const Joi = require('joi');

const HEX = /^#[0-9a-fA-F]{3,8}$/;

const create = Joi.object({
  type:         Joi.string().valid('hero', 'promo', 'feature').required(),
  title:        Joi.string().max(200).required(),
  subtitle:     Joi.string().max(300).allow('').optional(),
  badge:        Joi.string().max(80).allow('').optional(),
  imageUrl:     Joi.string().uri({ allowRelative: true }).allow('').optional(),
  ctaText:      Joi.string().max(80).allow('').optional(),
  ctaHref:      Joi.string().max(500).allow('').optional(),
  gradientFrom: Joi.string().pattern(HEX).allow('').optional(),
  gradientTo:   Joi.string().pattern(HEX).allow('').optional(),
  order:        Joi.number().integer().min(0).optional(),
  isActive:     Joi.boolean().optional(),
});

const update = Joi.object({
  type:         Joi.string().valid('hero', 'promo', 'feature').optional(),
  title:        Joi.string().max(200).optional(),
  subtitle:     Joi.string().max(300).allow('').optional(),
  badge:        Joi.string().max(80).allow('').optional(),
  imageUrl:     Joi.string().uri({ allowRelative: true }).allow('').optional(),
  ctaText:      Joi.string().max(80).allow('').optional(),
  ctaHref:      Joi.string().max(500).allow('').optional(),
  gradientFrom: Joi.string().pattern(HEX).allow('').optional(),
  gradientTo:   Joi.string().pattern(HEX).allow('').optional(),
  order:        Joi.number().integer().min(0).optional(),
  isActive:     Joi.boolean().optional(),
});

const reorder = Joi.object({
  items: Joi.array()
    .items(Joi.object({
      _id:   Joi.string().hex().length(24).required(),
      order: Joi.number().integer().min(0).required(),
    }))
    .min(1)
    .required(),
});

module.exports = { create, update, reorder };
