'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User     = require('../src/modules/users/user.model');
const Category = require('../src/modules/categories/category.model');
const Product  = require('../src/modules/products/product.model');

// ── Seed data ──────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Vitamins & Supplements', description: 'Essential vitamins and dietary supplements' },
  { name: 'Pain Relief',            description: 'Analgesics and anti-inflammatory products' },
  { name: 'Cold & Flu',             description: 'Medicines for cold and flu symptoms' },
  { name: 'Digestive Health',       description: 'Probiotics, antacids, and digestive aids' },
  { name: 'Skin Care',              description: 'Dermatological products and skincare essentials' },
  { name: 'Eye Care',               description: 'Eye drops, solutions, and supplements' },
];

const makeProducts = (categories) => {
  const [vitamins, pain, cold, digestive] = categories;
  return [
    {
      name: 'Vitamin C 1000mg',
      shortDescription: 'High-potency Vitamin C for immune support',
      description: 'Each tablet provides 1000mg of Vitamin C (ascorbic acid) to support your immune system and antioxidant defence.',
      price: 85000,
      comparePrice: 110000,
      category: vitamins._id,
      stock: 200,
      brand: 'NaturePlus',
      unit: 'bottle (60 tablets)',
      tags: ['vitamin c', 'immune', 'antioxidant'],
      images: ['https://placehold.co/600x600/e0f2fe/0369a1?text=Vitamin+C'],
    },
    {
      name: 'Omega-3 Fish Oil 1200mg',
      shortDescription: 'High-quality fish oil for heart and brain health',
      price: 195000,
      comparePrice: 240000,
      category: vitamins._id,
      stock: 150,
      brand: 'OceanPure',
      unit: 'bottle (90 softgels)',
      tags: ['omega-3', 'heart', 'brain'],
      images: ['https://placehold.co/600x600/e0f2fe/0369a1?text=Omega-3'],
    },
    {
      name: 'Ibuprofen 400mg Tablets',
      shortDescription: 'Fast-acting pain relief and anti-inflammatory',
      price: 45000,
      category: pain._id,
      stock: 300,
      brand: 'Pharmax',
      unit: 'box (20 tablets)',
      requiresPrescription: false,
      tags: ['pain', 'ibuprofen', 'anti-inflammatory'],
      images: ['https://placehold.co/600x600/fef3c7/92400e?text=Ibuprofen'],
    },
    {
      name: 'Paracetamol 500mg',
      shortDescription: 'Effective fever and mild pain relief',
      price: 25000,
      category: pain._id,
      stock: 500,
      brand: 'GenPharma',
      unit: 'strip (10 tablets)',
      tags: ['paracetamol', 'fever', 'pain'],
      images: ['https://placehold.co/600x600/fef3c7/92400e?text=Paracetamol'],
    },
    {
      name: 'Cold & Flu Relief Capsules',
      shortDescription: 'Multi-symptom cold and flu relief',
      price: 68000,
      comparePrice: 80000,
      category: cold._id,
      stock: 180,
      brand: 'FluAway',
      unit: 'box (16 capsules)',
      tags: ['cold', 'flu', 'decongestant'],
      images: ['https://placehold.co/600x600/dcfce7/166534?text=Cold+Flu'],
    },
    {
      name: 'Probiotic 10 Billion CFU',
      shortDescription: 'Daily probiotic for gut health and digestion',
      price: 320000,
      comparePrice: 380000,
      category: digestive._id,
      stock: 80,
      brand: 'GutBalance',
      unit: 'bottle (30 capsules)',
      tags: ['probiotic', 'gut health', 'digestion'],
      images: ['https://placehold.co/600x600/f3e8ff/6b21a8?text=Probiotic'],
    },
    {
      name: 'Magnesium Glycinate 400mg',
      shortDescription: 'Highly bioavailable magnesium for muscle and nerve support',
      price: 275000,
      category: vitamins._id,
      stock: 120,
      brand: 'NaturePlus',
      unit: 'bottle (60 capsules)',
      tags: ['magnesium', 'sleep', 'muscle'],
      images: ['https://placehold.co/600x600/e0f2fe/0369a1?text=Magnesium'],
    },
    {
      name: 'Antacid Chewable Tablets',
      shortDescription: 'Fast relief from heartburn and indigestion',
      price: 38000,
      category: digestive._id,
      stock: 250,
      brand: 'AcidCalm',
      unit: 'roll (12 tablets)',
      tags: ['antacid', 'heartburn', 'indigestion'],
      images: ['https://placehold.co/600x600/f3e8ff/6b21a8?text=Antacid'],
    },
  ];
};

// ── Main seed function ─────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Seed users — use create() so pre-save hooks (bcrypt) run
    const adminPassword = (process.env.SEED_ADMIN_PASSWORD || (() => { throw new Error('SEED_ADMIN_PASSWORD is required (set it in .env)'); })());
    const admin    = await User.create({ name: 'Admin User', email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com', password: adminPassword, role: 'admin',    isActive: true });
    const customer = await User.create({ name: 'John Doe',   email: 'customer@pharma.com',                              password: adminPassword, role: 'customer', isActive: true });
    console.log(`👤 Created admin: ${admin.email}`);
    console.log(`👤 Created customer: ${customer.email}`);

    // Seed categories — use create() so pre-save slug hook runs
    const categories = [];
    for (const cat of CATEGORIES) {
      const c = await Category.create(cat);
      categories.push(c);
    }
    console.log(`🗂️  Created ${categories.length} categories`);

    // Seed products — use create() so pre-save slug hook runs
    const productDefs = makeProducts(categories);
    const products = [];
    for (const def of productDefs) {
      const p = await Product.create(def);
      products.push(p);
    }
    console.log(`💊 Created ${products.length} products`);

    console.log('\n🌱 Seed complete!\n');
    console.log('─────────────────────────────────────');
    console.log('Admin:    ', process.env.SEED_ADMIN_EMAIL || 'admin@example.com');
    console.log('Password: ', (process.env.SEED_ADMIN_PASSWORD || (() => { throw new Error('SEED_ADMIN_PASSWORD is required (set it in .env)'); })()));
    console.log('Customer: ', 'customer@pharma.com');
    console.log('Password: ', (process.env.SEED_ADMIN_PASSWORD || (() => { throw new Error('SEED_ADMIN_PASSWORD is required (set it in .env)'); })()));
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
