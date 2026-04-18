'use client';

import { useEffect, useState } from 'react';
import { Category } from '@/types';
import { categoryService } from '@/services/category.service';
import { getErrorMessage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', image: '', isActive: true };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [saving, setSaving]         = useState(false);

  const fetch = async () => {
    setLoading(true);
    categoryService.getAll()
      .then(({ data }) => setCategories((data as { data: Category[] }).data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit   = (c: Category) => { setEditing(c); setForm({ name: c.name, description: c.description || '', image: c.image || '', isActive: c.isActive }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error('Tên là bắt buộc'); return; }
    setSaving(true);
    try {
      if (editing) {
        await categoryService.update(editing._id, form);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create(form);
        toast.success('Thêm danh mục thành công');
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa danh mục này?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Đã xóa danh mục');
      fetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Danh mục</h2>
        <Button onClick={openCreate}>+ Thêm danh mục</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 pr-4">Tên</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Mô tả</th>
                  <th className="pb-3 pr-4">Trạng thái</th>
                  <th className="pb-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{c.slug}</td>
                    <td className="py-3 pr-4 text-gray-600 max-w-[200px] truncate">{c.description || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={c.isActive ? 'badge-green' : 'badge-gray'}>{c.isActive ? 'Hoạt động' : 'Tắt'}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)}    className="text-blue-600 hover:underline text-xs font-medium">Sửa</button>
                        <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline text-xs font-medium">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {categories.map((c) => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="font-mono text-[11px] text-gray-400 truncate">{c.slug}</p>
                  </div>
                  <span className={c.isActive ? 'badge-green' : 'badge-gray'}>{c.isActive ? 'Hoạt động' : 'Tắt'}</span>
                </div>
                {c.description && <p className="text-sm text-gray-600 mb-3">{c.description}</p>}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(c)} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Sửa</button>
                  <button onClick={() => handleDelete(c._id)} className="flex-1 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}>
        <div className="space-y-4">
          <Input label="Tên *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Mô tả" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <Input label="URL ảnh" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Hoạt động
          </label>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t">
          <Button fullWidth onClick={handleSave} loading={saving}>{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
          <Button fullWidth variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
        </div>
      </Modal>
    </div>
  );
}
