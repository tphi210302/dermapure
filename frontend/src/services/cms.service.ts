import api from '@/lib/axios';

export interface Banner {
  _id: string;
  type: 'hero' | 'promo' | 'feature';
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaHref?: string;
  gradientFrom?: string;
  gradientTo?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  _id: string;
  siteName: string;
  tagline: string;
  logoUrl?: string;
  hotline: string;
  email: string;
  address: string;
  facebook?: string;
  zalo?: string;
  instagram?: string;
  tiktok?: string;
  heroHeading: string;
  heroSubtext: string;
  heroBadge: string;
  finalCtaHeading: string;
  finalCtaSubtext: string;
  freeShippingMin: number;
  shippingFee: number;
}

export const cmsService = {
  listBanners: (type?: 'hero' | 'promo' | 'feature') =>
    api.get('/banners', { params: type ? { type } : {} }),

  createBanner: (data: Partial<Banner>) => api.post('/banners', data),
  updateBanner: (id: string, data: Partial<Banner>) => api.patch(`/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/banners/${id}`),

  getSetting: () => api.get('/settings'),
  updateSetting: (data: Partial<SiteSetting>) => api.patch('/settings', data),
};
