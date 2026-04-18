'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('../src/modules/categories/category.model');
const Product  = require('../src/modules/products/product.model');

const ACCESSORY_CATEGORY = {
  name: 'Phụ kiện chăm sóc da',
  description: 'Bông tẩy trang, giấy tẩy trang, băng đô, khăn lau chuyên dụng',
};

const ACCESSORIES = [
  {
    name: 'Bông tẩy trang cotton (100 miếng)',
    shortDescription: 'Bông mềm, không xơ, thấm hút tốt',
    description: 'Bông tẩy trang 100% cotton organic, không xơ, không kích ứng, thấm hút gấp 3 lần bông thường. Phù hợp mọi loại da, cả da nhạy cảm.',
    price: 45000, comparePrice: 65000,
    stock: 500, brand: 'DermaPure', unit: 'gói 100 miếng',
    tags: ['bông tẩy trang', 'cotton', 'phụ kiện'],
    images: ['https://placehold.co/600x600/fff1f2/e11d48?text=Cotton+Pad'],
  },
  {
    name: 'Giấy tẩy trang 3 lớp (80 tờ)',
    shortDescription: 'Làm sạch makeup sâu, không trôi phấn',
    description: 'Giấy tẩy trang 3 lớp tẩm sẵn dung dịch micellar water. Tiện lợi khi đi du lịch, không cần rửa lại với nước.',
    price: 85000, comparePrice: 120000,
    stock: 300, brand: 'DermaPure', unit: 'hộp 80 tờ',
    tags: ['giấy tẩy trang', 'micellar', 'phụ kiện', 'du lịch'],
    images: ['https://placehold.co/600x600/fff1f2/e11d48?text=Makeup+Wipes'],
  },
  {
    name: 'Băng đô rửa mặt Spa',
    shortDescription: 'Cố định tóc khi rửa mặt, đắp mặt nạ',
    description: 'Băng đô co giãn mềm mại, giữ tóc khỏi vùng da mặt. Chất liệu vải thun thoáng khí, không gây đau đầu.',
    price: 35000, comparePrice: 50000,
    stock: 400, brand: 'DermaPure', unit: 'cái',
    tags: ['băng đô', 'spa', 'phụ kiện'],
    images: ['https://placehold.co/600x600/fff1f2/e11d48?text=Headband'],
  },
  {
    name: 'Khăn lau mặt microfiber (3 cái)',
    shortDescription: 'Lau khô nhẹ nhàng, kháng khuẩn',
    description: 'Khăn microfiber cao cấp, siêu thấm hút, kháng khuẩn tự nhiên. Tẩy tế bào chết nhẹ nhàng khi dùng thường xuyên.',
    price: 99000, comparePrice: 150000,
    stock: 250, brand: 'DermaPure', unit: 'bộ 3 cái',
    tags: ['khăn mặt', 'microfiber', 'phụ kiện'],
    images: ['https://placehold.co/600x600/fff1f2/e11d48?text=Face+Towel'],
  },
  {
    name: 'Cọ thoa mặt nạ silicone',
    shortDescription: 'Thoa đều mặt nạ, không hao sản phẩm',
    description: 'Cọ silicone mềm, dễ vệ sinh, giúp thoa mặt nạ đều hơn và giữ vệ sinh cho tay.',
    price: 55000, comparePrice: 80000,
    stock: 200, brand: 'DermaPure', unit: 'cái',
    tags: ['cọ', 'silicone', 'mặt nạ', 'phụ kiện'],
    images: ['https://placehold.co/600x600/fff1f2/e11d48?text=Mask+Brush'],
  },
];

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma-shop';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connect();

  let cat = await Category.findOne({ name: ACCESSORY_CATEGORY.name });
  if (!cat) {
    cat = await Category.create({ ...ACCESSORY_CATEGORY, isActive: true });
    console.log(`✅ Created category: ${cat.name}`);
  } else {
    if (!cat.isActive) { cat.isActive = true; await cat.save(); }
    console.log(`ℹ️  Category exists: ${cat.name}`);
  }

  for (const p of ACCESSORIES) {
    const existing = await Product.findOne({ name: p.name });
    if (existing) {
      console.log(`  ℹ️  Product exists: ${p.name}`);
      continue;
    }
    await Product.create({ ...p, category: cat._id, isActive: true });
    console.log(`  ✅ Created: ${p.name}`);
  }

  console.log('\n🎉 Accessories seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
