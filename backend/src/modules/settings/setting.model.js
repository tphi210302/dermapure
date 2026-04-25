'use strict';

const mongoose = require('mongoose');

/*
 * Site-wide settings — singleton document.
 * Used for: branding (logo, name, tagline), contact info,
 * homepage hero text, CTA section, footer tagline.
 */
const settingSchema = new mongoose.Schema(
  {
    // Singleton key — always 'main'
    key: { type: String, default: 'main', unique: true },

    // Branding
    siteName:  { type: String, default: 'Lumie', maxlength: 80 },
    tagline:   { type: String, default: 'Mỹ phẩm chính hãng — Tỏa sáng vẻ đẹp tự nhiên', maxlength: 200 },
    logoUrl:   { type: String, trim: true },

    // Contact
    hotline:   { type: String, default: '1800-123-456', maxlength: 30 },
    email:     { type: String, default: 'support@lumie.vn', maxlength: 80 },
    address:   { type: String, default: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', maxlength: 300 },
    facebook:  { type: String, trim: true },
    zalo:      { type: String, trim: true },
    instagram: { type: String, trim: true },
    tiktok:    { type: String, trim: true },

    // Homepage hero
    heroHeading:   { type: String, default: 'Bạn đang gặp vấn đề da nào?', maxlength: 200 },
    heroSubtext:   { type: String, default: 'Chọn vấn đề của bạn — nhận ngay combo liệu trình được dược sĩ da liễu khuyên dùng, giảm đến 25%.', maxlength: 400 },
    heroBadge:     { type: String, default: '✨ Tư vấn miễn phí · Liệu trình 30 ngày', maxlength: 120 },

    // Final CTA section
    finalCtaHeading: { type: String, default: 'Đăng ký thành viên — Hoàn toàn miễn phí', maxlength: 200 },
    finalCtaSubtext: { type: String, default: 'Nhận ưu đãi độc quyền, tích điểm đổi quà hấp dẫn và được tư vấn da miễn phí bởi đội ngũ dược sĩ da liễu.', maxlength: 400 },

    // Shipping thresholds (can tune via admin)
    freeShippingMin: { type: Number, default: 500000 },
    shippingFee:     { type: Number, default: 30000 },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Setting', settingSchema);
