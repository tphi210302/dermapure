'use strict';

const Setting = require('./setting.model');

const get = async () => {
  let s = await Setting.findOne({ key: 'main' });
  if (!s) s = await Setting.create({ key: 'main' }); // auto-create singleton on first read
  return s;
};

const update = async (data) => {
  // Never allow changing the key
  delete data.key;
  const s = await Setting.findOneAndUpdate(
    { key: 'main' },
    data,
    { new: true, upsert: true, runValidators: true }
  );
  return s;
};

module.exports = { get, update };
