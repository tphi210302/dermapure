'use client';

import { useEffect, useState } from 'react';
import { cmsService, type Banner, type SiteSetting } from '@/services/cms.service';
import { getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

type Tab = 'hero' | 'promo' | 'feature' | 'setting';

const inputCls = `w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
                  focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none`;

const TAB_LABEL: Record<Tab, string> = {
  hero: '🎨 Banner Hero',
  promo: '🏷️ Banner Khuyến mãi',
  feature: '⭐ Tính năng nổi bật',
  setting: '⚙️ Thiết lập chung',
};

const EMPTY_BANNER: Partial<Banner> = {
  type: 'hero',
  title: '',
  subtitle: '',
  badge: '',
  imageUrl: '',
  ctaText: '',
  ctaHref: '',
  gradientFrom: '#be123c',
  gradientTo: '#f43f5e',
  order: 0,
  isActive: true,
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('hero');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [setting, setSetting] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm]       = useState<Partial<Banner>>(EMPTY_BANNER);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        cmsService.listBanners(),
        cmsService.getSetting(),
      ]);
      setBanners((bRes.data as any).data);
      setSetting((sRes.data as any).data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredBanners = banners.filter((b) => b.type === tab).sort((a, b) => a.order - b.order);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_BANNER, type: tab as Banner['type'], order: filteredBanners.length });
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ ...b });
  };

  const saveBanner = async () => {
    if (!form.title) { toast.error('Vui lòng nhập tiêu đề'); return; }
    setSaving(true);
    try {
      if (editing) {
        await cmsService.updateBanner(editing._id, form);
        toast.success('Đã cập nhật');
      } else {
        await cmsService.createBanner({ ...form, type: tab as Banner['type'] });
        toast.success('Đã thêm mới');
      }
      setEditing(null);
      setForm({ ...EMPTY_BANNER, type: tab as Banner['type'] });
      fetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  const deleteBanner = async (b: Banner) => {
    if (!confirm(`Xoá banner "${b.title}"?`)) return;
    try {
      await cmsService.deleteBanner(b._id);
      toast.success('Đã xoá');
      fetchAll();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const saveSetting = async () => {
    if (!setting) return;
    setSaving(true);
    try {
      await cmsService.updateSetting(setting);
      toast.success('Đã cập nhật thiết lập');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">🎨 Quản lý nội dung trang chủ</h2>
        <p className="text-sm text-gray-500 mt-1">Mọi thay đổi áp dụng ngay cho khách hàng, không cần deploy lại.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        {(['hero', 'promo', 'feature', 'setting'] as Tab[]).map((t) => (
          <button key={t} onClick={() => { setTab(t); setEditing(null); setForm({ ...EMPTY_BANNER, type: t === 'setting' ? 'hero' : t }); }}
            className={`flex-1 min-w-[140px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              tab === t ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={tab === t ? { background: 'linear-gradient(135deg,#e11d48,#f43f5e)' } : {}}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {/* ── Banner tabs ── */}
      {tab !== 'setting' && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900">{filteredBanners.length} mục</p>
              <button onClick={openCreate}
                className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
                + Thêm mới
              </button>
            </div>

            {filteredBanners.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-2">🎨</p>
                <p className="text-sm text-gray-500">Chưa có nội dung — nhấn "Thêm mới" để tạo.</p>
              </div>
            ) : filteredBanners.map((b) => (
              <div key={b._id} className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${editing?._id === b._id ? 'border-rose-300' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  {/* Preview thumbnail */}
                  <div className="h-16 w-16 rounded-xl shrink-0 overflow-hidden relative"
                    style={{ background: `linear-gradient(135deg, ${b.gradientFrom || '#e11d48'}, ${b.gradientTo || '#f43f5e'})` }}>
                    {b.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-2xl text-white/80">
                      {b.badge?.[0] || '🎨'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{b.title}</p>
                    {b.subtitle && <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{b.subtitle}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge ${b.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {b.isActive ? 'Hoạt động' : 'Tắt'}
                      </span>
                      <span className="text-[11px] text-gray-400">Thứ tự: {b.order}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(b)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg">Sửa</button>
                  <button onClick={() => deleteBanner(b)}
                    className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg">Xoá</button>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sticky top-24">
              <h3 className="font-extrabold text-gray-900 mb-4">
                {editing ? '✏️ Chỉnh sửa' : '➕ Thêm mới'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tiêu đề *</label>
                  <input className={inputCls} value={form.title || ''}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả phụ</label>
                  <textarea className={`${inputCls} resize-none`} rows={2} value={form.subtitle || ''}
                    onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Badge (nhãn nhỏ)</label>
                  <input className={inputCls} placeholder="VD: ✨ Mới · HOT" value={form.badge || ''}
                    onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Ảnh (URL)</label>
                  <input className={inputCls} placeholder="https://..." value={form.imageUrl || ''}
                    onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                  <p className="text-[10px] text-gray-400 mt-1">Để trống nếu không có ảnh. Dùng Cloudinary, Imgur, hoặc link CDN.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Nút CTA (text)</label>
                    <input className={inputCls} placeholder="Mua ngay" value={form.ctaText || ''}
                      onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Nút CTA (link)</label>
                    <input className={inputCls} placeholder="/products" value={form.ctaHref || ''}
                      onChange={(e) => setForm((p) => ({ ...p, ctaHref: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Màu gradient (từ)</label>
                    <div className="flex gap-1">
                      <input type="color" className="h-9 w-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                        value={form.gradientFrom || '#be123c'}
                        onChange={(e) => setForm((p) => ({ ...p, gradientFrom: e.target.value }))} />
                      <input className={inputCls} value={form.gradientFrom || ''}
                        onChange={(e) => setForm((p) => ({ ...p, gradientFrom: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Màu gradient (đến)</label>
                    <div className="flex gap-1">
                      <input type="color" className="h-9 w-12 border-2 border-gray-200 rounded-lg cursor-pointer"
                        value={form.gradientTo || '#f43f5e'}
                        onChange={(e) => setForm((p) => ({ ...p, gradientTo: e.target.value }))} />
                      <input className={inputCls} value={form.gradientTo || ''}
                        onChange={(e) => setForm((p) => ({ ...p, gradientTo: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Thứ tự hiển thị</label>
                  <input type="number" className={inputCls} value={form.order || 0}
                    onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))} />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isActive ?? true}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  Hiển thị trên trang chủ
                </label>

                {/* Gradient preview */}
                <div className="h-16 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${form.gradientFrom || '#e11d48'}, ${form.gradientTo || '#f43f5e'})` }}>
                  Xem trước màu
                </div>

                <button onClick={saveBanner} disabled={saving}
                  className="w-full py-3 text-white font-extrabold rounded-xl shadow-md active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
                  {saving ? 'Đang lưu...' : (editing ? '💾 Cập nhật' : '➕ Thêm mới')}
                </button>
                {editing && (
                  <button onClick={() => { setEditing(null); setForm({ ...EMPTY_BANNER, type: tab as Banner['type'] }); }}
                    className="w-full py-2 text-gray-500 text-xs hover:text-gray-700">
                    Huỷ chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Setting tab ── */}
      {tab === 'setting' && setting && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-6 max-w-3xl space-y-5">
          <section>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">🏷️ Thương hiệu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên trang web</label>
                <input className={inputCls} value={setting.siteName}
                  onChange={(e) => setSetting({ ...setting, siteName: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Slogan / Tagline</label>
                <input className={inputCls} value={setting.tagline}
                  onChange={(e) => setSetting({ ...setting, tagline: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">Logo URL</label>
                <input className={inputCls} placeholder="https://..." value={setting.logoUrl || ''}
                  onChange={(e) => setSetting({ ...setting, logoUrl: e.target.value })} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">🎯 Hero trang chủ</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Badge</label>
                <input className={inputCls} value={setting.heroBadge}
                  onChange={(e) => setSetting({ ...setting, heroBadge: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tiêu đề chính</label>
                <input className={inputCls} value={setting.heroHeading}
                  onChange={(e) => setSetting({ ...setting, heroHeading: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={setting.heroSubtext}
                  onChange={(e) => setSetting({ ...setting, heroSubtext: e.target.value })} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">📞 Liên hệ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Hotline</label>
                <input className={inputCls} value={setting.hotline}
                  onChange={(e) => setSetting({ ...setting, hotline: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email</label>
                <input className={inputCls} value={setting.email}
                  onChange={(e) => setSetting({ ...setting, email: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">Địa chỉ</label>
                <input className={inputCls} value={setting.address}
                  onChange={(e) => setSetting({ ...setting, address: e.target.value })} />
              </div>
              <div><label className="text-xs font-bold text-gray-700 block mb-1">Facebook</label>
                <input className={inputCls} placeholder="https://fb.com/..." value={setting.facebook || ''}
                  onChange={(e) => setSetting({ ...setting, facebook: e.target.value })} />
              </div>
              <div><label className="text-xs font-bold text-gray-700 block mb-1">Zalo</label>
                <input className={inputCls} value={setting.zalo || ''}
                  onChange={(e) => setSetting({ ...setting, zalo: e.target.value })} />
              </div>
              <div><label className="text-xs font-bold text-gray-700 block mb-1">Instagram</label>
                <input className={inputCls} value={setting.instagram || ''}
                  onChange={(e) => setSetting({ ...setting, instagram: e.target.value })} />
              </div>
              <div><label className="text-xs font-bold text-gray-700 block mb-1">TikTok</label>
                <input className={inputCls} value={setting.tiktok || ''}
                  onChange={(e) => setSetting({ ...setting, tiktok: e.target.value })} />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">💎 CTA cuối trang + Phí ship</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">Tiêu đề CTA</label>
                <input className={inputCls} value={setting.finalCtaHeading}
                  onChange={(e) => setSetting({ ...setting, finalCtaHeading: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả CTA</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={setting.finalCtaSubtext}
                  onChange={(e) => setSetting({ ...setting, finalCtaSubtext: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Phí ship mặc định (₫)</label>
                <input type="number" className={inputCls} value={setting.shippingFee}
                  onChange={(e) => setSetting({ ...setting, shippingFee: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Miễn phí ship từ (₫)</label>
                <input type="number" className={inputCls} value={setting.freeShippingMin}
                  onChange={(e) => setSetting({ ...setting, freeShippingMin: Number(e.target.value) })} />
              </div>
            </div>
          </section>

          <button onClick={saveSetting} disabled={saving}
            className="w-full py-3 text-white font-extrabold rounded-xl shadow-md active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
            {saving ? 'Đang lưu...' : '💾 Lưu thiết lập'}
          </button>
        </div>
      )}
    </div>
  );
}
