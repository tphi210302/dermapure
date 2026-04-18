'use strict';

const Joi = require('joi');

const create = Joi.object({
  name:        Joi.string().max(100).required(),
  description: Joi.string().max(500).optional(),
  image:       Joi.string().uri().optional(),
  isActive:    Joi.boolean().optional(),
});

const update = Joi.object({
  name:        Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  image:       Joi.string().uri().optional(),
  isActive:    Joi.boolean().optional(),
});

module.exports = { create, update };
