'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

const RENAMES = {
  'Vitamins & Supplements': 'Vitamin & Thực phẩm bổ sung',
  'Pain Relief':            'Giảm đau & Hạ sốt',
  'Cold & Flu':             'Cảm cúm & Hô hấp',
  'Digestive Health':       'Tiêu hóa & Đường ruột',
  'Skin Care':              'Chăm sóc da',
  'Eye Care':               'Chăm sóc mắt',
  'Heart Health':           'Tim mạch & Huyết áp',
};

const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[\s&/\\]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const col = mongoose.connection.db.collection('categories');

  for (const [oldName, newName] of Object.entries(RENAMES)) {
    const result = await col.updateOne(
      { name: oldName },
      { $set: { name: newName, slug: toSlug(newName) } }
    );
    console.log(
      result.modifiedCount ? '✓' : '–',
      `"${oldName}" → "${newName}"`
    );
  }

  await mongoose.disconnect();
  console.log('\nHoàn tất.');
});
