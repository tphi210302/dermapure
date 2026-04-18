'use client';

import { useCallback, useEffect, useState } from 'react';
import { Product, PaginatedResponse, Category } from '@/types';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import PaginationComp from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '', price: '',
  comparePrice: '', costPrice: '', category: '', stock: '', sku: '', brand: '',
  unit: 'viên', images: '', tags: '', requiresPrescription: false, isActive: true,
  ingredients: '', dosage: '', warnings: '',
};

/* ── profit helpers ── */
const marginPct = (sell: number, cost: number) =>
  sell > 0 && cost > 0 ? Math.round(((sell - cost) / sell) * 100) : null;

const ProfitBadge = ({ sell, cost }: { sell: number; cost: number }) => {
  if (!cost) return <span className="text-xs text-gray-300">—</span>;
  const p   = sell - cost;
  const pct = marginPct(sell, cost)!;
  const pos = p >= 0;
  return (
    <div>
      <p className={`text-xs font-bold ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
        {pos ? '+' : ''}{formatPrice(p)}
      </p>
      <p className={`text-[10px] ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{pct}% margin</p>
    </div>
  );
};

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Product>['data']['pagination'] | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Product | null>(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const fetchProducts = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const { data } = await productService.getAll({ page: p, limit: 15 });
      const resp = data as PaginatedResponse<Product>;
      setProducts(resp.data.items);
      setPagination(resp.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts(page);
    categoryService.getAll().then(({ data }) => setCategories((data as { data: Category[] }).data));
  }, [page]); // eslint-disable-line

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit   = (p: Product) => {
    setEditing(p);
    setForm({
      name:                 p.name,
      description:          p.description || '',
      shortDescription:     p.shortDescription || '',
      price:                String(p.price),
      comparePrice:         String(p.comparePrice || ''),
      costPrice:            String(p.costPrice || ''),
      category:             typeof p.category === 'object' ? p.category._id : p.category,
      stock:                String(p.stock),
      sku:                  p.sku || '',
      brand:                p.brand || '',
      unit:                 p.unit,
      images:               p.images.join(', '),
      tags:                 p.tags.join(', '),
      requiresPrescription: p.requiresPrescription,
      isActive:             p.isActive,
      ingredients:          p.ingredients || '',
      dosage:               p.dosage || '',
      warnings:             p.warnings || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category || !form.stock) {
      toast.error('Tên, giá bán, danh mục và tồn kho là bắt buộc');
      return;
    }
    const sellPrice = Number(form.price);
    const costP     = form.costPrice ? Number(form.costPrice) : 0;
    if (costP > sellPrice) {
      toast.error('Giá nhập không được cao hơn giá bán');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:                 form.name,
        description:          form.description || undefined,
        shortDescription:     form.shortDescription || undefined,
        price:                sellPrice,
        comparePrice:         form.comparePrice ? Number(form.comparePrice) : undefined,
        costPrice:            costP || undefined,
        category:             form.category,
        stock:                Number(form.stock),
        sku:                  form.sku || undefined,
        brand:                form.brand || undefined,
        unit:                 form.unit,
        images:               form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags:                 form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        requiresPrescription: form.requiresPrescription,
        isActive:             form.isActive,
        ingredients:          form.ingredients || undefined,
        dosage:               form.dosage || undefined,
        warnings:             form.warnings || undefined,
      };
      if (editing) {
        await productService.update(editing._id, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.create(payload);
        toast.success('Thêm sản phẩm thành công');
      }
      setModalOpen(false);
      fetchProducts(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await productService.delete(id);
      toast.success('Đã xóa sản phẩm');
      fetchProducts(page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  /* ── profit summary ── */
  const withCost              = products.filter((p) => p.costPrice && p.costPrice > 0);
  const totalSellPotential    = withCost.reduce((s, p) => s + p.price * p.stock, 0);
  const totalCostPotential    = withCost.reduce((s, p) => s + (p.costPrice || 0) * p.stock, 0);
  const totalProfitPotential  = totalSellPotential - totalCostPotential;
  const avgMargin             = totalSellPotential > 0
    ? Math.round((totalProfitPotential / totalSellPotential) * 100) : 0;

  /* live preview */
  const previewSell = Number(form.price) || 0;
  const previewCost = Number(form.costPrice) || 0;
  const previewProfit = previewSell - previewCost;
  const previewMargin = marginPct(previewSell, previewCost);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Sản phẩm</h2>
        <Button onClick={openCreate}>+ Thêm sản phẩm</Button>
      </div>

      {/* ── Profit summary ── */}
      {withCost.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wide mb-1">Doanh thu tiềm năng</p>
            <p className="text-base font-extrabold text-blue-700">{formatPrice(totalSellPotential)}</p>
            <p className="text-[10px] text-blue-400 mt-0.5">Nếu bán hết tồn</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-[11px] text-amber-500 font-bold uppercase tracking-wide mb-1">Vốn nhập kho</p>
            <p className="text-base font-extrabold text-amber-700">{formatPrice(totalCostPotential)}</p>
            <p className="text-[10px] text-amber-400 mt-0.5">Chi phí hàng tồn</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wide mb-1">Lợi nhuận dự kiến</p>
            <p className="text-base font-extrabold text-emerald-700">{formatPrice(totalProfitPotential)}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">{withCost.length} sản phẩm có giá nhập</p>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
            <p className="text-[11px] text-violet-500 font-bold uppercase tracking-wide mb-1">Biên lợi nhuận TB</p>
            <p className="text-base font-extrabold text-violet-700">{avgMargin}%</p>
            <p className="text-[10px] text-violet-400 mt-0.5">Trung bình toàn kho</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-semibold">Tên sản phẩm</th>
                  <th className="pb-3 pr-4 font-semibold">Danh mục</th>
                  <th className="pb-3 pr-4 font-semibold text-amber-600">Giá nhập</th>
                  <th className="pb-3 pr-4 font-semibold text-blue-600">Giá bán</th>
                  <th className="pb-3 pr-4 font-semibold text-emerald-600">Lợi nhuận/SP</th>
                  <th className="pb-3 pr-4 font-semibold">Tồn kho</th>
                  <th className="pb-3 pr-4 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900 max-w-[180px] truncate">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">
                      {typeof p.category === 'object' ? p.category.name : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {p.costPrice ? (
                        <span className="text-amber-700 font-semibold text-xs">{formatPrice(p.costPrice)}</span>
                      ) : (
                        <span className="text-gray-300 text-xs italic">Chưa nhập</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-bold text-gray-900 text-xs">{formatPrice(p.price)}</td>
                    <td className="py-3 pr-4">
                      <ProfitBadge sell={p.price} cost={p.costPrice || 0} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className={
                        p.stock === 0 ? 'text-red-600 font-semibold text-xs' :
                        p.stock <= 5  ? 'text-amber-600 font-semibold text-xs' :
                        'text-gray-700 text-xs'
                      }>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={p.isActive ? 'badge-green' : 'badge-gray'}>
                        {p.isActive ? 'Hoạt động' : 'Tắt'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs font-medium">Sửa</button>
                        <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline text-xs font-medium">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 line-clamp-2">{p.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {typeof p.category === 'object' ? p.category.name : '—'}
                    </p>
                  </div>
                  <span className={p.isActive ? 'badge-green shrink-0' : 'badge-gray shrink-0'}>
                    {p.isActive ? 'Hoạt động' : 'Tắt'}
                  </span>
                </div>

                {/* Price grid */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 rounded-lg p-2.5 mb-3">
                  <div>
                    <p className="text-gray-500 text-[10px]">Giá nhập</p>
                    <p className="font-bold text-amber-700 text-[11px]">
                      {p.costPrice ? formatPrice(p.costPrice) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">Giá bán</p>
                    <p className="font-extrabold text-rose-600 text-[11px]">{formatPrice(p.price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px]">Tồn kho</p>
                    <p className={`font-extrabold text-[11px] ${
                      p.stock === 0 ? 'text-red-600' :
                      p.stock <= 5  ? 'text-amber-600' :
                      'text-gray-700'
                    }`}>{p.stock}</p>
                  </div>
                </div>

                {/* Profit */}
                <div className="mb-3">
                  <ProfitBadge sell={p.price} cost={p.costPrice || 0} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(p)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg">Sửa</button>
                  <button onClick={() => handleDelete(p._id)}
                    className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg">Xóa</button>
                </div>
              </div>
            ))}
          </div>

          {pagination && <PaginationComp pagination={pagination} onPageChange={setPage} />}
        </>
      )}

      {/* ── Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">

          <Input label="Tên *" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <div>
            <label className="label">Danh mục *</label>
            <select className="input" value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              <option value="">Chọn danh mục</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* ── Pricing block ── */}
          <div className="sm:col-span-2">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 border border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                💰 Thông tin giá & lợi nhuận
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label text-amber-700">Giá nhập (vốn)</label>
                  <Input type="number" value={form.costPrice} placeholder="0"
                    onChange={(e) => setForm((p) => ({ ...p, costPrice: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-blue-700">Giá bán *</label>
                  <Input type="number" value={form.price} placeholder="0"
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Giá so sánh (gạch)</label>
                  <Input type="number" value={form.comparePrice} placeholder="0"
                    onChange={(e) => setForm((p) => ({ ...p, comparePrice: e.target.value }))} />
                </div>
              </div>

              {/* Live profit preview */}
              {previewSell > 0 && previewCost > 0 && (
                <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium ${
                  previewProfit >= 0
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  <span>
                    {previewProfit >= 0 ? '✅' : '⚠️'}{' '}
                    Lãi mỗi sản phẩm: <strong>{formatPrice(previewProfit)}</strong>
                  </span>
                  <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full border">
                    Biên: {previewMargin ?? 0}%
                  </span>
                </div>
              )}
              {previewSell > 0 && previewCost > previewSell && (
                <p className="text-xs text-red-500 font-medium">⚠️ Giá nhập đang cao hơn giá bán!</p>
              )}
            </div>
          </div>

          <Input label="Tồn kho *" type="number" value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
          <Input label="SKU" value={form.sku}
            onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} />
          <Input label="Thương hiệu" value={form.brand}
            onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
          <Input label="Đơn vị" value={form.unit}
            onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} />

          <div className="sm:col-span-2">
            <Input label="URL ảnh (cách nhau bằng dấu phẩy)" value={form.images}
              onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Tags (cách nhau bằng dấu phẩy)" value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Mô tả ngắn</label>
            <textarea className="input resize-none" rows={2} value={form.shortDescription}
              onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Mô tả đầy đủ</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          {/* ── Dermaceutical detail block ── */}
          <div className="sm:col-span-2">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50/30 border border-rose-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1.5">
                🧪 Thông tin dược mỹ phẩm
              </p>
              <div>
                <label className="label">Thành phần / Hoạt chất</label>
                <textarea className="input resize-none" rows={2}
                  placeholder="VD: Salicylic Acid 2%, Niacinamide 5%, Tea Tree Extract…"
                  value={form.ingredients}
                  onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))} />
              </div>
              <div>
                <label className="label">Cách sử dụng</label>
                <textarea className="input resize-none" rows={2}
                  placeholder="VD: Lấy 2-3 giọt thoa đều lên da sạch, massage nhẹ. Sáng/tối sau bước toner…"
                  value={form.dosage}
                  onChange={(e) => setForm((p) => ({ ...p, dosage: e.target.value }))} />
              </div>
              <div>
                <label className="label">Cảnh báo / Chống chỉ định</label>
                <textarea className="input resize-none" rows={2}
                  placeholder="VD: Tránh vùng mắt, tránh nắng khi dùng. Không dùng cho da nhạy cảm đang tổn thương…"
                  value={form.warnings}
                  onChange={(e) => setForm((p) => ({ ...p, warnings: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.requiresPrescription}
                onChange={(e) => setForm((p) => ({ ...p, requiresPrescription: e.target.checked }))} />
              Cần chỉ định BS da liễu
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
              Hoạt động
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-5 pt-4 border-t">
          <Button fullWidth onClick={handleSave} loading={saving}>
            {editing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
          <Button fullWidth variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
        </div>
      </Modal>
    </div>
  );
}
