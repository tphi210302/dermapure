'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Voucher = require('../src/modules/vouchers/voucher.model');

const VOUCHERS = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    maxDiscount: 50000,  // cap at 50K
    minOrder: 200000,
    firstOrderOnly: true,
    description: 'Giảm 10% cho đơn hàng đầu tiên (tối đa 50K, đơn từ 200K)',
    isActive: true,
  },
  {
    code: 'FREESHIP',
    type: 'free-shipping',
    value: 0,
    minOrder: 500000,
    firstOrderOnly: false,
    description: 'Miễn phí vận chuyển (đơn từ 500K)',
    isActive: true,
  },
  {
    code: 'DERMA50',
    type: 'fixed',
    value: 50000,
    minOrder: 500000,
    firstOrderOnly: false,
    description: 'Giảm 50.000₫ cho đơn từ 500K',
    isActive: true,
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  for (const v of VOUCHERS) {
    const existing = await Voucher.findOne({ code: v.code });
    if (existing) {
      await Voucher.updateOne({ code: v.code }, v);
      console.log(`  🔄 Updated voucher: ${v.code} — ${v.description}`);
    } else {
      await Voucher.create(v);
      console.log(`  ✅ Created voucher: ${v.code} — ${v.description}`);
    }
  }

  console.log('\n🎉 Voucher seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
