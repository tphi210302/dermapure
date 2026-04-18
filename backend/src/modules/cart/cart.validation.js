'use strict';

const Joi = require('joi');

const addItem = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity:  Joi.number().integer().min(1).required(),
});

const updateItem = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

module.exports = { addItem, updateItem };
