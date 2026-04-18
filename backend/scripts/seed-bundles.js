'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('../src/modules/categories/category.model');
const Product  = require('../src/modules/products/product.model');
const Bundle   = require('../src/modules/bundles/bundle.model');

const SKINCARE_PRODUCTS = {
  acne: [
    {
      name: 'Sữa rửa mặt Salicylic Acid 2%',
      shortDescription: 'Làm sạch sâu, kiểm soát dầu, giảm mụn đầu đen',
      description: 'Sữa rửa mặt dịu nhẹ chứa Salicylic Acid 2% giúp loại bỏ bã nhờn và tế bào chết trong lỗ chân lông, ngăn ngừa mụn tái phát.',
      price: 189000, comparePrice: 250000,
      stock: 120, brand: 'DermaPure', unit: 'chai 150ml',
      tags: ['mụn', 'salicylic', 'sữa rửa mặt'],
      images: ['https://placehold.co/600x600/fce7f3/be123c?text=Salicylic+Cleanser'],
    },
    {
      name: 'Serum BHA 2% + Niacinamide',
      shortDescription: 'Thu nhỏ lỗ chân lông, giảm mụn viêm',
      description: 'Kết hợp BHA 2% và Niacinamide 5% giúp thông thoáng lỗ chân lông, giảm viêm và làm đều màu da.',
      price: 295000, comparePrice: 380000,
      stock: 80, brand: 'DermaPure', unit: 'chai 30ml',
      tags: ['bha', 'serum', 'mụn', 'niacinamide'],
      images: ['https://placehold.co/600x600/fce7f3/be123c?text=BHA+Serum'],
    },
    {
      name: 'Kem chấm mụn Tea Tree + Zinc',
      shortDescription: 'Làm xẹp mụn viêm qua đêm',
      description: 'Kem chấm mụn với tinh dầu Tea Tree và Zinc PCA, giúp làm xẹp nốt mụn viêm nhanh chóng, không để lại thâm.',
      price: 149000, comparePrice: 200000,
      stock: 150, brand: 'DermaPure', unit: 'tuýp 15ml',
      tags: ['chấm mụn', 'tea tree', 'zinc'],
      images: ['https://placehold.co/600x600/fce7f3/be123c?text=Acne+Spot'],
    },
  ],
  'oily-skin': [
    {
      name: 'Toner cân bằng dầu BHA',
      shortDescription: 'Kiểm soát dầu, se khít lỗ chân lông',
      description: 'Toner với BHA 1% và chiết xuất trà xanh giúp kiểm soát dầu, làm sạch sâu và se khít lỗ chân lông.',
      price: 165000, comparePrice: 220000,
      stock: 100, brand: 'ClearSkin', unit: 'chai 200ml',
      tags: ['toner', 'da dầu', 'bha'],
      images: ['https://placehold.co/600x600/fef3c7/92400e?text=Oil+Control+Toner'],
    },
    {
      name: 'Kem dưỡng Matte Oil-Free',
      shortDescription: 'Dưỡng ẩm không nhờn cho da dầu',
      description: 'Kem dưỡng ẩm siêu nhẹ, finish matte, không chứa dầu, giúp da ẩm mịn suốt 12 giờ mà không bóng nhờn.',
      price: 245000, comparePrice: 320000,
      stock: 90, brand: 'ClearSkin', unit: 'hũ 50ml',
      tags: ['kem dưỡng', 'da dầu', 'matte'],
      images: ['https://placehold.co/600x600/fef3c7/92400e?text=Matte+Moisturizer'],
    },
    {
      name: 'Giấy thấm dầu Charcoal (200 tờ)',
      shortDescription: 'Thấm dầu tức thì, không làm khô da',
      description: 'Giấy thấm dầu từ than tre, thấm nhanh, giữ lại độ ẩm tự nhiên của da. Gấp gọn, tiện mang theo.',
      price: 55000, comparePrice: 75000,
      stock: 250, brand: 'ClearSkin', unit: 'hộp 200 tờ',
      tags: ['giấy thấm dầu', 'charcoal'],
      images: ['https://placehold.co/600x600/fef3c7/92400e?text=Oil+Blotting'],
    },
  ],
  'dark-spot': [
    {
      name: 'Serum Vitamin C 15% + E',
      shortDescription: 'Làm sáng da, mờ thâm, chống oxy hóa',
      description: 'Serum Vitamin C tinh khiết 15% kết hợp Vitamin E giúp làm sáng da, mờ vết thâm sau mụn và bảo vệ da khỏi gốc tự do.',
      price: 385000, comparePrice: 480000,
      stock: 70, brand: 'GlowLab', unit: 'chai 30ml',
      tags: ['vitamin c', 'serum', 'thâm', 'sáng da'],
      images: ['https://placehold.co/600x600/e0e7ff/4338ca?text=Vitamin+C+Serum'],
    },
    {
      name: 'Kem mờ thâm Alpha-Arbutin 2%',
      shortDescription: 'Mờ thâm nám sau 4 tuần',
      description: 'Kem dưỡng với Alpha-Arbutin 2% và chiết xuất cam thảo giúp mờ nám, tàn nhang và đốm nâu sau 4–6 tuần sử dụng.',
      price: 325000, comparePrice: 420000,
      stock: 85, brand: 'GlowLab', unit: 'tuýp 30g',
      tags: ['thâm', 'nám', 'arbutin'],
      images: ['https://placehold.co/600x600/e0e7ff/4338ca?text=Arbutin+Cream'],
    },
    {
      name: 'Kem chống nắng SPF 50+ PA++++',
      shortDescription: 'Chống nắng phổ rộng, không để lại vệt trắng',
      description: 'Kem chống nắng SPF 50+ PA++++ bảo vệ toàn diện khỏi UVA/UVB, ngăn ngừa nám và lão hóa da.',
      price: 265000, comparePrice: 350000,
      stock: 110, brand: 'GlowLab', unit: 'tuýp 50ml',
      tags: ['chống nắng', 'spf50', 'nám'],
      images: ['https://placehold.co/600x600/e0e7ff/4338ca?text=Sunscreen'],
    },
  ],
};

const BUNDLES = [
  {
    slug: 'combo-tri-mun-30-ngay',
    solutionType: 'acne',
    title: 'Combo Trị Mụn 30 Ngày',
    subtitle: 'Làm sạch sâu → Thông thoáng → Làm xẹp mụn viêm',
    description: 'Liệu trình 3 bước giúp giảm mụn rõ rệt sau 4 tuần: sữa rửa mặt Salicylic → Serum BHA + Niacinamide → Chấm mụn Tea Tree. Phù hợp da mụn từ nhẹ đến trung bình.',
    instructions: 'Sáng: Rửa mặt → Toner → Serum → Kem chống nắng\nTối: Rửa mặt → Serum BHA → Kem chấm mụn (chấm lên nốt mụn) → Kem dưỡng ẩm',
    benefits: [
      'Giảm 70% mụn viêm sau 4 tuần',
      'Thu nhỏ lỗ chân lông rõ rệt',
      'Không kích ứng, không bong tróc',
      'Phù hợp mọi loại da mụn',
    ],
    discountPercent: 22,
    stockClaim: 47,
    image: 'https://placehold.co/800x600/fce7f3/be123c?text=Combo+Acne',
  },
  {
    slug: 'combo-kiem-soat-dau-30-ngay',
    solutionType: 'oily-skin',
    title: 'Combo Kiểm Soát Dầu 30 Ngày',
    subtitle: 'Làm sạch → Cân bằng → Dưỡng ẩm không nhờn',
    description: 'Liệu trình chuyên biệt cho da dầu: Toner BHA + Kem dưỡng Matte Oil-Free + Giấy thấm dầu. Giúp da sạch mát, kiềm dầu suốt 12 giờ.',
    instructions: 'Sáng/Tối: Rửa mặt sạch → Toner BHA → Kem dưỡng Matte\nBan ngày: Dùng giấy thấm dầu khi cần',
    benefits: [
      'Kiềm dầu suốt 12 giờ',
      'Se khít lỗ chân lông',
      'Da mịn màng, finish matte',
      'Không gây khô, không bong tróc',
    ],
    discountPercent: 20,
    stockClaim: 35,
    image: 'https://placehold.co/800x600/fef3c7/92400e?text=Combo+Oily',
  },
  {
    slug: 'combo-mo-tham-sang-da-30-ngay',
    solutionType: 'dark-spot',
    title: 'Combo Mờ Thâm Sáng Da 30 Ngày',
    subtitle: 'Chống oxy hóa → Mờ thâm → Bảo vệ khỏi UV',
    description: 'Liệu trình 3 bước: Serum Vitamin C + Kem Alpha-Arbutin + Kem chống nắng SPF 50+. Mờ thâm rõ rệt sau 4–6 tuần, ngăn thâm mới hình thành.',
    instructions: 'Sáng: Rửa mặt → Vitamin C → Kem dưỡng → Kem chống nắng (BẮT BUỘC)\nTối: Rửa mặt → Kem Alpha-Arbutin → Kem dưỡng ẩm',
    benefits: [
      'Mờ thâm sau mụn rõ rệt sau 4 tuần',
      'Làm sáng da đều màu',
      'Ngăn nám, tàn nhang mới',
      'Chống lão hóa, chống oxy hóa',
    ],
    discountPercent: 25,
    stockClaim: 28,
    image: 'https://placehold.co/800x600/e0e7ff/4338ca?text=Combo+Dark+Spot',
  },
];

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/pharma-shop';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connect();

  // Find or create skincare category
  let skincareCategory =
       await Category.findOne({ slug: 'skin-care' })
    || await Category.findOne({ slug: 'cham-soc-da' })
    || await Category.findOne({ name: /skin/i })
    || await Category.findOne({ name: /chăm sóc da/i });

  if (!skincareCategory) {
    skincareCategory = await Category.create({
      name: 'Chăm Sóc Da',
      description: 'Sản phẩm dược mỹ phẩm cho da',
    });
    console.log(`✅ Created category: ${skincareCategory.name}`);
  } else {
    console.log(`ℹ️  Using existing category: ${skincareCategory.name}`);
  }

  for (const bundle of BUNDLES) {
    console.log(`\n── Seeding bundle: ${bundle.title} ──`);

    // Upsert products for this solution type
    const productIds = [];
    let originalPrice = 0;

    for (const p of SKINCARE_PRODUCTS[bundle.solutionType]) {
      let product = await Product.findOne({ name: p.name });
      if (!product) {
        product = await Product.create({ ...p, category: skincareCategory._id, isActive: true });
        console.log(`  ✅ Created product: ${product.name}`);
      } else {
        console.log(`  ℹ️  Product exists: ${product.name}`);
      }
      productIds.push(product._id);
      originalPrice += product.price;
    }

    const bundlePrice = Math.round(originalPrice * (1 - bundle.discountPercent / 100) / 1000) * 1000;

    const payload = {
      ...bundle,
      products: productIds,
      originalPrice,
      bundlePrice,
      isActive: true,
    };

    const existing = await Bundle.findOne({ slug: bundle.slug });
    if (existing) {
      await Bundle.updateOne({ _id: existing._id }, payload);
      console.log(`  🔄 Updated bundle: ${bundle.slug} — ${bundlePrice.toLocaleString()}₫`);
    } else {
      await Bundle.create(payload);
      console.log(`  ✅ Created bundle: ${bundle.slug} — ${bundlePrice.toLocaleString()}₫`);
    }
  }

  console.log('\n🎉 Bundle seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
