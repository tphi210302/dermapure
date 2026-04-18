'use client';

import { useEffect, useState } from 'react';
// eslint-disable-next-line @next/next/no-img-element
import { Bundle, Product, SolutionType } from '@/types';
import { bundleService } from '@/services/bundle.service';
import { productService } from '@/services/product.service';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const inputCls = `w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm
                  focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none`;

const SOLUTION_LABEL: Record<SolutionType, string> = {
  'acne':       '🌿 Da mụn',
  'oily-skin':  '💧 Da dầu',
  'dark-spot':  '✨ Thâm nám',
};

const EMPTY: Partial<Bundle> & { productIds: string[] } = {
  slug: '',
  solutionType: 'acne',
  title: '',
  subtitle: '',
  description: '',
  instructions: '',
  benefits: [],
  discountPercent: 20,
  stockClaim: 50,
  durationDays: 30,
  image: '',
  isActive: true,
  productIds: [],
};

export default function AdminBundlesPage() {
  const [bundles, setBundles]   = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [editing, setEditing]   = useState<Bundle | null>(null);
  const [form, setForm]         = useState<typeof EMPTY>(EMPTY);
  const [benefitDraft, setBenefitDraft] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        bundleService.getAll(),
        productService.getAll({ limit: 200, sort: 'name' }),
      ]);
      setBundles((bRes.data as any).data);
      setProducts(((pRes.data as any).data.items || []) as Product[]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setBenefitDraft('');
  };

  const openEdit = (b: Bundle) => {
    setEditing(b);
    setForm({
      slug: b.slug,
      solutionType: b.solutionType,
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      instructions: b.instructions,
      benefits: b.benefits || [],
      discountPercent: b.discountPercent,
      stockClaim: b.stockClaim,
      durationDays: b.durationDays,
      image: b.image,
      isActive: b.isActive,
      productIds: (b.products || []).map((p: Product) => p._id),
    });
    setBenefitDraft('');
  };

  const addBenefit = () => {
    const t = benefitDraft.trim();
    if (!t) return;
    setForm((p) => ({ ...p, benefits: [...(p.benefits || []), t] }));
    setBenefitDraft('');
  };

  const removeBenefit = (i: number) =>
    setForm((p) => ({ ...p, benefits: (p.benefits || []).filter((_, idx) => idx !== i) }));

  const toggleProduct = (id: string) => {
    setForm((p) => {
      const has = p.productIds.includes(id);
      return { ...p, productIds: has ? p.productIds.filter((x) => x !== id) : [...p.productIds, id] };
    });
  };

  const selectedProducts = products.filter((p) => form.productIds.includes(p._id));
  const subtotal = selectedProducts.reduce((s, p) => s + p.price, 0);
  const bundlePrice = Math.round(subtotal * (1 - (form.discountPercent || 0) / 100) / 1000) * 1000;

  const save = async () => {
    if (!form.title) { toast.error('Vui lòng nhập tên combo'); return; }
    if (!form.slug)  { toast.error('Vui lòng nhập slug'); return; }
    if (form.productIds.length === 0) { toast.error('Vui lòng chọn ít nhất 1 sản phẩm'); return; }

    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        solutionType: form.solutionType,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        instructions: form.instructions,
        benefits: form.benefits,
        discountPercent: form.discountPercent,
        stockClaim: form.stockClaim,
        durationDays: form.durationDays,
        image: form.image,
        isActive: form.isActive,
        products: form.productIds,
        originalPrice: subtotal,
        bundlePrice: bundlePrice,
      };

      if (editing) {
        await bundleService.update(editing._id, payload);
        toast.success('Đã cập nhật combo');
      } else {
        await bundleService.create(payload);
        toast.success('Đã tạo combo mới');
      }
      setEditing(null);
      setForm(EMPTY);
      fetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setSaving(false); }
  };

  const remove = async (b: Bundle) => {
    if (!confirm(`Xoá combo "${b.title}"?`)) return;
    try {
      await bundleService.delete(b._id);
      toast.success('Đã xoá');
      fetchAll();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const filteredProducts = productSearch.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : products;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">🎯 Combo liệu trình</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý các combo 30 ngày hiển thị trên trang giải pháp (Mụn / Da dầu / Thâm).</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* LIST */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900">{bundles.length} combo</p>
            <button onClick={openCreate}
              className="px-4 py-2 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
              + Thêm combo
            </button>
          </div>

          {bundles.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-2">🎯</p>
              <p className="text-sm text-gray-500">Chưa có combo nào</p>
            </div>
          ) : bundles.map((b) => (
            <div key={b._id} className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${editing?._id === b._id ? 'border-rose-300' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl shrink-0 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-2xl overflow-hidden">
                  {b.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt="" className="w-full h-full object-cover" />
                  ) : SOLUTION_LABEL[b.solutionType].split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{b.title}</p>
                    <span className="badge badge-blue">{SOLUTION_LABEL[b.solutionType]}</span>
                    <span className={b.isActive ? 'badge-green' : 'badge-gray'}>{b.isActive ? 'Hoạt động' : 'Tắt'}</span>
                  </div>
                  {b.subtitle && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{b.subtitle}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="font-extrabold text-rose-600">{formatPrice(b.bundlePrice)}</span>
                    <span className="text-gray-400 line-through">{formatPrice(b.originalPrice)}</span>
                    <span className="text-emerald-600 font-bold">-{b.discountPercent}%</span>
                    <span className="text-gray-500">· {b.products?.length || 0} SP</span>
                    <span className="text-gray-400">· Còn {b.stockClaim} suất</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(b)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg">Sửa</button>
                <button onClick={() => remove(b)}
                  className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg">Xoá</button>
              </div>
            </div>
          ))}
        </div>

        {/* FORM */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <h3 className="font-extrabold text-gray-900 mb-4">
              {editing ? '✏️ Chỉnh sửa combo' : '➕ Tạo combo mới'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tên combo *</label>
                <input className={inputCls} value={form.title || ''}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="VD: Combo Trị Mụn 30 Ngày" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Slug * (URL)</label>
                  <input className={inputCls} value={form.slug || ''}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    placeholder="combo-tri-mun-30-ngay" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Loại giải pháp *</label>
                  <select className={inputCls} value={form.solutionType}
                    onChange={(e) => setForm((p) => ({ ...p, solutionType: e.target.value as SolutionType }))}>
                    <option value="acne">🌿 Da mụn</option>
                    <option value="oily-skin">💧 Da dầu</option>
                    <option value="dark-spot">✨ Thâm nám</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Phụ đề</label>
                <input className={inputCls} value={form.subtitle || ''}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="VD: Làm sạch sâu → Thông thoáng → Giảm viêm" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả dài</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.description || ''}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Hướng dẫn sử dụng</label>
                <textarea className={`${inputCls} resize-none font-mono text-xs`} rows={3} value={form.instructions || ''}
                  onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))}
                  placeholder="Sáng: ...&#10;Tối: ..." />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Ảnh combo (URL)</label>
                <input className={inputCls} value={form.image || ''}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://..." />
              </div>

              {/* Benefits */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Lợi ích (mỗi dòng 1 ý)</label>
                <div className="flex gap-2">
                  <input className={inputCls} value={benefitDraft}
                    onChange={(e) => setBenefitDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); }}}
                    placeholder="VD: Giảm 70% mụn viêm sau 4 tuần" />
                  <button type="button" onClick={addBenefit}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg">+</button>
                </div>
                {(form.benefits || []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.benefits!.map((b, i) => (
                      <li key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-xs">
                        <span className="text-emerald-800">✓ {b}</span>
                        <button onClick={() => removeBenefit(i)} className="text-red-500 hover:text-red-700 text-[10px]">✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Products selection */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Sản phẩm trong combo * <span className="font-normal text-rose-500">({form.productIds.length} đã chọn)</span>
                </label>
                <input className={`${inputCls} mb-2`}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tìm sản phẩm..." />
                <div className="max-h-52 overflow-y-auto bg-gray-50 border-2 border-gray-200 rounded-xl divide-y divide-gray-200">
                  {filteredProducts.slice(0, 30).map((p) => {
                    const picked = form.productIds.includes(p._id);
                    return (
                      <label key={p._id}
                        className={`flex items-center gap-2 px-2 py-2 cursor-pointer text-xs ${picked ? 'bg-rose-50' : 'hover:bg-white'}`}>
                        <input type="checkbox" checked={picked} onChange={() => toggleProduct(p._id)} className="h-3.5 w-3.5" />
                        <span className="flex-1 truncate font-medium">{p.name}</span>
                        <span className="text-rose-600 font-bold shrink-0">{formatPrice(p.price)}</span>
                      </label>
                    );
                  })}
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mt-2 bg-rose-50 border border-rose-200 rounded-xl p-2 text-xs">
                    <div className="flex justify-between text-gray-700 mb-0.5">
                      <span>Tổng gốc:</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-0.5">
                      <span>Giảm {form.discountPercent}%:</span>
                      <span className="text-emerald-600 font-semibold">-{formatPrice(subtotal - bundlePrice)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold pt-1 border-t border-rose-200">
                      <span>Giá combo:</span>
                      <span className="text-rose-600">{formatPrice(bundlePrice)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Giảm (%)</label>
                  <input type="number" className={inputCls} value={form.discountPercent || 0}
                    onChange={(e) => setForm((p) => ({ ...p, discountPercent: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Số ngày</label>
                  <input type="number" className={inputCls} value={form.durationDays || 30}
                    onChange={(e) => setForm((p) => ({ ...p, durationDays: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Còn X suất</label>
                  <input type="number" className={inputCls} value={form.stockClaim || 0}
                    onChange={(e) => setForm((p) => ({ ...p, stockClaim: Number(e.target.value) }))} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isActive ?? true} className="w-4 h-4 rounded"
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Hiển thị trên trang giải pháp
              </label>

              <button onClick={save} disabled={saving}
                className="w-full py-3 text-white font-extrabold rounded-xl shadow-md active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}>
                {saving ? 'Đang lưu...' : (editing ? '💾 Cập nhật' : '➕ Tạo combo')}
              </button>

              {editing && (
                <button onClick={() => { setEditing(null); setForm(EMPTY); }}
                  className="w-full py-2 text-gray-500 text-xs hover:text-gray-700">
                  Huỷ chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
