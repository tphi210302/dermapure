'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Banner  = require('../src/modules/banners/banner.model');
const Setting = require('../src/modules/settings/setting.model');

const HERO_BANNERS = [
  {
    type: 'hero', order: 0, isActive: true,
    badge: '✨ Dược mỹ phẩm chính hãng',
    title: 'Làn da khoẻ đẹp, tự tin mỗi ngày',
    subtitle: 'Bộ sưu tập serum, kem dưỡng và chống nắng từ các thương hiệu dược mỹ phẩm được bác sĩ da liễu khuyên dùng.',
    ctaText: 'Xem liệu trình',
    ctaHref: '/solutions/acne',
    gradientFrom: '#881337',
    gradientTo:   '#fb7185',
    imageUrl: 'https://placehold.co/600x700/fce7f3/be123c?text=Dermaceutical',
  },
  {
    type: 'hero', order: 1, isActive: true,
    badge: '🎯 Liệu trình 30 ngày',
    title: 'Combo cá nhân hoá, tiết kiệm đến 25%',
    subtitle: 'Mỗi liệu trình gồm 3 sản phẩm phối hợp chuẩn phác đồ dược sĩ da liễu — giảm mụn / kiểm soát dầu / mờ thâm sau 30 ngày.',
    ctaText: 'Chọn liệu trình',
    ctaHref: '/solutions/acne',
    gradientFrom: '#9f1239',
    gradientTo:   '#f472b6',
    imageUrl: 'https://placehold.co/600x700/fff1f2/9f1239?text=30-Day+Combo',
  },
  {
    type: 'hero', order: 2, isActive: true,
    badge: '🎁 Ưu đãi thành viên',
    title: 'Đăng ký miễn phí, nhận ngay 10% off',
    subtitle: 'Tích điểm mỗi đơn hàng, đổi quà hấp dẫn và nhận ưu đãi sinh nhật cùng nhiều phúc lợi độc quyền.',
    ctaText: 'Đăng ký ngay',
    ctaHref: '/register',
    gradientFrom: '#4c0519',
    gradientTo:   '#e11d48',
    imageUrl: 'https://placehold.co/600x700/fecdd3/4c0519?text=Membership',
  },
];

const PROMO_BANNERS = [
  {
    type: 'promo', order: 0, isActive: true,
    badge: '💎 Liệu trình 30 ngày',
    title: 'Combo cá nhân hoá cho da mụn',
    subtitle: 'Phác đồ chuẩn dược sĩ da liễu — 3 sản phẩm phối hợp, giảm 22% giá gốc.',
    ctaText: 'Xem combo',
    ctaHref: '/solutions/acne',
    gradientFrom: '#9f1239',
    gradientTo:   '#e11d48',
  },
  {
    type: 'promo', order: 1, isActive: true,
    badge: '✨ Mờ thâm sáng da',
    title: 'Liệu trình Vitamin C chuyên sâu',
    subtitle: 'Bộ 3 sản phẩm làm sáng da đều màu, mờ thâm sau 4-6 tuần.',
    ctaText: 'Khám phá',
    ctaHref: '/solutions/dark-spot',
    gradientFrom: '#7c3aed',
    gradientTo:   '#c084fc',
  },
];

const FEATURES = [
  {
    type: 'feature', order: 0, isActive: true,
    badge: '💎',
    title: 'Liệu trình cá nhân hoá',
    subtitle: 'Combo 30 ngày tuỳ chỉnh theo vấn đề da: mụn, dầu, thâm nám — thiết kế bởi dược sĩ.',
    gradientFrom: '#be123c', gradientTo: '#f43f5e',
  },
  {
    type: 'feature', order: 1, isActive: true,
    badge: '🔬',
    title: 'Thành phần hoạt chất rõ ràng',
    subtitle: 'Mọi sản phẩm công khai hoạt chất + nồng độ (BHA 2%, Niacinamide 5%, Vitamin C 15%...).',
    gradientFrom: '#7c3aed', gradientTo: '#a78bfa',
  },
  {
    type: 'feature', order: 2, isActive: true,
    badge: '📞',
    title: 'Tư vấn 1-1 với dược sĩ',
    subtitle: 'Hotline + Zalo 24/7. Chụp ảnh da → nhận phác đồ riêng trong 15 phút.',
    gradientFrom: '#0891b2', gradientTo: '#22d3ee',
  },
  {
    type: 'feature', order: 3, isActive: true,
    badge: '🎯',
    title: 'Cam kết hiệu quả 30 ngày',
    subtitle: 'Không cảm nhận được cải thiện sau liệu trình đầu → hoàn tiền 100%.',
    gradientFrom: '#d97706', gradientTo: '#fbbf24',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Seed banners (clear existing then recreate for dev-mode default)
  await Banner.deleteMany({ type: { $in: ['hero', 'promo', 'feature'] } });
  const all = [...HERO_BANNERS, ...PROMO_BANNERS, ...FEATURES];
  await Banner.insertMany(all);
  console.log(`✅ Seeded ${all.length} banners (${HERO_BANNERS.length} hero + ${PROMO_BANNERS.length} promo + ${FEATURES.length} features)`);

  // Ensure Setting singleton exists
  const existingSetting = await Setting.findOne({ key: 'main' });
  if (!existingSetting) {
    await Setting.create({ key: 'main' });
    console.log('✅ Created default Setting singleton');
  } else {
    console.log('ℹ️  Setting singleton already exists');
  }

  console.log('\n🎉 CMS seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => { console.error('❌', err); process.exit(1); });
