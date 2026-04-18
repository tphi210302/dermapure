'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('../src/modules/categories/category.model');
const Product  = require('../src/modules/products/product.model');

/*
 * Dược mỹ phẩm category taxonomy.
 * ORDER MATTERS — checked top to bottom, first match wins.
 * Product-type categories (physical form) are more specific and come FIRST.
 * Concern categories (what problem it solves) come LAST as broad fallback.
 */
const DERMACEUTICAL_CATEGORIES = [
  {
    name: 'Chống nắng',
    description: 'Kem chống nắng phổ rộng SPF, chống UVA/UVB',
    keywords: ['chống nắng', 'sunscreen', 'spf', 'sunblock'],
  },
  {
    name: 'Làm sạch da',
    description: 'Sữa rửa mặt, tẩy trang, tẩy tế bào chết',
    keywords: ['sữa rửa mặt', 'rửa mặt', 'tẩy trang', 'cleanser', 'tẩy tế bào', 'giấy thấm dầu', 'charcoal'],
  },
  {
    name: 'Toner & Cân bằng',
    description: 'Nước hoa hồng, toner cân bằng pH cho da',
    keywords: ['toner', 'nước hoa hồng'],
  },
  {
    name: 'Trị mụn',
    description: 'Sản phẩm chuyên biệt trị mụn viêm, mụn ẩn, mụn đầu đen',
    keywords: ['chấm mụn', 'trị mụn', 'acne'],
  },
  {
    name: 'Dưỡng ẩm',
    description: 'Kem dưỡng ẩm, lotion cấp ẩm, mặt nạ ngủ',
    keywords: ['dưỡng ẩm', 'hydrating', 'moisturizer', 'kem dưỡng matte', 'mặt nạ ngủ', 'matte oil-free'],
  },
  {
    name: 'Chống lão hóa',
    description: 'Retinol, peptide, chống nhăn, săn chắc da',
    keywords: ['retinol', 'peptide', 'chống nhăn', 'anti-aging', 'wrinkle'],
  },
  {
    name: 'Mờ thâm & Sáng da',
    description: 'Kem và serum làm mờ thâm mụn, nám, tàn nhang',
    keywords: ['mờ thâm', 'arbutin', 'tranexamic', 'whitening', 'alpha-arbutin', 'vitamin c 15%'],
  },
  {
    name: 'Serum đặc trị',
    description: 'Serum, tinh chất cô đặc cho da',
    keywords: ['serum', 'tinh chất', 'essence'],
  },
];

// Products that should stay pharma (oral supplements, medicine) — never remap to skincare
const PHARMA_PRODUCT_MARKERS = [
  'vitamin c 1000mg', 'omega-3', 'ibuprofen', 'paracetamol', 'cảm cúm',
  'men vi sinh', 'magie', 'kháng axit', 'viên ', 'tablet', 'capsule',
];

// Pharma categories to deactivate (kept in DB for order history integrity)
const PHARMA_TO_DEACTIVATE = [
  'pain relief', 'cold & flu', 'digestive health', 'eye care',
  'giảm đau', 'cảm cúm', 'tiêu hóa', 'chăm sóc mắt',
];

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma-shop';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
};

const isPharmaProduct = (product) => {
  const name = (product.name || '').toLowerCase();
  return PHARMA_PRODUCT_MARKERS.some((m) => name.includes(m));
};

const findMatchingCategory = (product, categoryDocs) => {
  // Match primarily on name + tags — NOT description (descriptions often mention adjacent concerns)
  const haystack = [
    product.name || '',
    ...(product.tags || []),
  ].join(' ').toLowerCase();

  for (const cat of categoryDocs) {
    if (cat.keywords.some((kw) => haystack.includes(kw.toLowerCase()))) {
      return cat.doc;
    }
  }
  return null;
};

const run = async () => {
  await connect();

  // ── 1. Create/upsert dermaceutical categories ─────────────
  const createdCats = [];
  for (const c of DERMACEUTICAL_CATEGORIES) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) {
      cat = await Category.create({ name: c.name, description: c.description, isActive: true });
      console.log(`✅ Created category: ${c.name}`);
    } else {
      if (!cat.isActive) { cat.isActive = true; await cat.save(); }
      console.log(`ℹ️  Category exists: ${c.name}`);
    }
    createdCats.push({ keywords: c.keywords, doc: cat });
  }

  // ── 2. Deactivate pharma-only categories ──────────────────
  console.log('\n── Deactivating pharma-only categories ──');
  const allCats = await Category.find({ isActive: true });
  for (const cat of allCats) {
    const lower = cat.name.toLowerCase();
    const shouldDeactivate = PHARMA_TO_DEACTIVATE.some((k) => lower.includes(k));
    const isDermaceutical = DERMACEUTICAL_CATEGORIES.some((d) => d.name === cat.name);
    if (shouldDeactivate && !isDermaceutical) {
      cat.isActive = false;
      await cat.save();
      console.log(`  🚫 Deactivated: ${cat.name}`);
    }
  }

  // Also handle "Vitamins & Supplements" / "Chăm sóc da" / etc.
  const vitamin = await Category.findOne({ name: /vitamin/i });
  if (vitamin && vitamin.isActive) {
    vitamin.isActive = false;
    await vitamin.save();
    console.log(`  🚫 Deactivated: ${vitamin.name}`);
  }

  // Deactivate the generic old "Chăm sóc da" parent since we now have specific subs
  const skincareOld = await Category.findOne({ name: /^chăm sóc da$/i });
  if (skincareOld && skincareOld.isActive) {
    skincareOld.isActive = false;
    await skincareOld.save();
    console.log(`  🚫 Deactivated: ${skincareOld.name} (replaced by specific dermaceutical categories)`);
  }

  // ── 3. Remap products to new dermaceutical categories ─────
  console.log('\n── Remapping products ──');
  const allProducts = await Product.find({});
  let remapped = 0;
  let unmapped = 0;
  let deactivatedPharma = 0;

  for (const product of allProducts) {
    // Pharma products (oral supplements, medicine) — deactivate, don't remap to skincare
    if (isPharmaProduct(product)) {
      if (product.isActive) {
        product.isActive = false;
        await product.save();
        console.log(`  🚫 Deactivated (pharma): ${product.name}`);
        deactivatedPharma++;
      }
      continue;
    }

    if (!product.isActive) continue;

    const matched = findMatchingCategory(product, createdCats);
    if (matched) {
      if (String(product.category) !== String(matched._id)) {
        product.category = matched._id;
        await product.save();
        console.log(`  🔄 ${product.name} → ${matched.name}`);
        remapped++;
      }
    } else {
      console.log(`  ⚠️  Unmapped: ${product.name}`);
      unmapped++;
    }
  }

  console.log(`\n📊 Summary: ${remapped} remapped, ${deactivatedPharma} pharma deactivated, ${unmapped} unmapped`);
  console.log('🎉 Migration complete');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
