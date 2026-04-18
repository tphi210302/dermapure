'use strict';

/*
 * Drops old non-sparse indexes on User.email / User.phone and recreates them
 * as `unique + sparse` so multiple users can have null email (phone-only accounts)
 * or null phone without hitting the MongoDB E11000 duplicate-key error.
 *
 * Run once after pulling the pivot to phone-required / email-optional auth.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../src/modules/users/user.model');

const DESIRED = [
  { field: 'email', options: { unique: true, sparse: true } },
  { field: 'phone', options: { unique: true, sparse: true } },
];

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma-shop';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
};

const run = async () => {
  await connect();
  const coll = User.collection;
  const existing = await coll.indexes();

  for (const { field, options } of DESIRED) {
    const name = `${field}_1`;
    const current = existing.find((i) => i.name === name);
    const needsRebuild =
      !current ||
      current.unique !== options.unique ||
      !!current.sparse !== !!options.sparse;

    if (needsRebuild) {
      if (current) {
        await coll.dropIndex(name);
        console.log(`🗑️  Dropped index: ${name}`);
      }
      await coll.createIndex({ [field]: 1 }, options);
      console.log(`✅ Created index: ${name} → ${JSON.stringify(options)}`);
    } else {
      console.log(`ℹ️  Index ${name} already correct`);
    }
  }

  console.log('\n📋 Final indexes:');
  (await coll.indexes()).forEach((i) => console.log(`   ${i.name}`, i.unique ? '[unique]' : '', i.sparse ? '[sparse]' : ''));
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
