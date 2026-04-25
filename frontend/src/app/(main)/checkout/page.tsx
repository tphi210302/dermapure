'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/order.service';
import { voucherService, type AppliedVoucher } from '@/services/voucher.service';
import { getErrorMessage, formatPrice } from '@/lib/utils';
import VietnamAddressPicker from '@/components/address/VietnamAddressPicker';
import StreetAutocomplete from '@/components/address/StreetAutocomplete';
import { readAffiliateRef, clearAffiliateRef } from '@/components/affiliate/AffiliateCapture';
import { cloudinaryThumb } from '@/lib/cloudinary';
import { addressService } from '@/services/address.service';
import type { SavedAddress } from '@/types';
import toast from 'react-hot-toast';

const SHIPPING_FEE      = 30000;
const FREE_SHIPPING_MIN = 500000;

const inputCls = `w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20
                  focus:outline-none transition-all duration-200`;

const PHONE_RE = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, cartCount, refreshCart } = useCart();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    recipientName: user?.name  || '',
    phone:         user?.phone || '',
    street:        user?.address?.street || '',
    ward:          user?.address?.ward   || '',
    city:          user?.address?.city   || '',
    state:         user?.address?.state  || '',
    country:       'Vietnam',
    note:          '',
  });

  // Address book — saved addresses on user account
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [editMode,       setEditMode]       = useState(false); // when true, shows form fields

  useEffect(() => {
    addressService.list()
      .then((res) => {
        const list = (res.data as any).data as SavedAddress[];
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          fillFormFromAddress(def);
          setSelectedAddrId(def._id);
          setEditMode(false);
        } else {
          setEditMode(true); // no saved → show form
        }
      })
      .catch(() => setEditMode(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillFormFromAddress = (a: SavedAddress) => {
    setForm((p) => ({
      ...p,
      recipientName: a.recipientName,
      phone:         a.phone,
      street:        a.street,
      ward:          a.ward,
      city:          a.city || '',
      state:         a.state,
      country:       a.country || 'Vietnam',
    }));
    setErrors({});
  };

  const pickAddress = (a: SavedAddress) => {
    setSelectedAddrId(a._id);
    fillFormFromAddress(a);
    setEditMode(false);
  };

  const startNewAddress = () => {
    setSelectedAddrId(null);
    setEditMode(true);
    setForm((p) => ({
      ...p,
      recipientName: user?.name || '',
      phone:         user?.phone || '',
      street: '', ward: '', city: '', state: '',
    }));
  };

  const startEditSelected = () => setEditMode(true);

  const deleteAddress = async (id: string) => {
    if (!confirm('Xoá địa chỉ này?')) return;
    try {
      const res = await addressService.remove(id);
      const list = (res.data as any).data as SavedAddress[];
      setSavedAddresses(list);
      if (selectedAddrId === id) {
        if (list.length > 0) pickAddress(list.find((a) => a.isDefault) || list[0]);
        else startNewAddress();
      }
      toast.success('Đã xoá địa chỉ');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // Voucher state
  const [voucherCode,    setVoucherCode]    = useState('');
  const [voucher,        setVoucher]        = useState<AppliedVoucher | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [isAutoApplied,  setIsAutoApplied]  = useState(false);

  // Affiliate — detect and warn
  const [affiliateRef, setAffiliateRef] = useState<string | null>(null);
  useEffect(() => {
    setAffiliateRef(readAffiliateRef());
  }, []);
  const isInternalBuyer = user?.role === 'staff' || user?.role === 'sales' || user?.role === 'admin';
  const isSelfReferral = !!(
    affiliateRef &&
    user?.affiliateCode &&
    affiliateRef.toUpperCase() === user.affiliateCode.toUpperCase()
  );

  // Auto-apply first-order discount on mount (runs once when cart is loaded)
  useEffect(() => {
    if (!cart || cart.items.length === 0 || voucher) return;
    voucherService.auto(cartTotal)
      .then(({ data }: any) => {
        if (data.data) {
          setVoucher(data.data as AppliedVoucher);
          setIsAutoApplied(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.items.length]);

  const baseShipping = cartTotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const shippingFee  = voucher?.freeShipping ? 0 : baseShipping;
  const discount     = voucher?.discount || 0;
  const finalTotal   = Math.max(0, cartTotal + shippingFee - discount);

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) { toast.error('Nhập mã trước khi áp dụng'); return; }
    setVoucherLoading(true);
    try {
      const { data } = await voucherService.apply(code, cartTotal);
      setVoucher(data.data as AppliedVoucher);
      toast.success(`Đã áp dụng: ${(data.data as AppliedVoucher).note}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setVoucher(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => {
    setVoucher(null);
    setVoucherCode('');
  };

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const setAddress = (a: { state: string; ward: string; city?: string }) => {
    setForm((p) => ({ ...p, ...a, city: a.city ?? '' }));
    setErrors((p) => ({ ...p, state: '', ward: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.recipientName.trim()) e.recipientName = 'Vui lòng nhập tên người nhận';
    if (!form.phone.trim())          e.phone        = 'Vui lòng nhập SĐT';
    else if (!PHONE_RE.test(form.phone.trim())) e.phone = 'SĐT không hợp lệ';
    if (!form.street.trim()) e.street = 'Vui lòng nhập số nhà, tên đường';
    if (!form.state)         e.state  = 'Chọn tỉnh/thành phố';
    if (!form.ward)          e.ward   = 'Chọn phường/xã';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 1: validate then open confirm dialog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) { toast.error('Giỏ hàng trống'); return; }
    if (!validate()) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    setShowConfirm(true);
  };

  // Step 2: actually submit after user confirms
  const confirmCheckout = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      // Sync address to the user's book — best-effort, silent.
      try {
        const payload = {
          label:         'Nhà',
          recipientName: form.recipientName.trim(),
          phone:         form.phone.trim(),
          street:        form.street.trim(),
          ward:          form.ward,
          city:          form.city,
          state:         form.state,
          country:       form.country,
        };
        if (selectedAddrId && editMode) {
          // Edited an existing entry → update it
          await addressService.update(selectedAddrId, payload);
        } else if (!selectedAddrId) {
          // Brand-new entry → add it
          await addressService.add({ ...payload, isDefault: savedAddresses.length === 0 });
        }
      } catch { /* ignore */ }

      // Strip affiliate code if buyer is internal (staff/sales/admin): they NEVER earn
      // commission — neither from their own code nor from a colleague's. Backend also
      // enforces this, but this is clearer to the user.
      let affiliateCode: string | undefined = readAffiliateRef() || undefined;
      if (affiliateCode && isInternalBuyer) {
        affiliateCode = undefined;
      }
      await orderService.checkout({
        shippingAddress: {
          recipientName: form.recipientName.trim(),
          phone:         form.phone.trim(),
          street:        form.street.trim(),
          ward:          form.ward,
          city:          form.city,
          state:         form.state,
          country:       form.country,
        },
        note: form.note.trim() || undefined,
        voucherCode: voucher?.code,
        affiliateCode,
      });
      clearAffiliateRef();
      await Promise.all([refreshCart(), refreshUser()]);
      toast.success('Đặt hàng thành công! 🎉');
      router.push('/orders');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">📦</p>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Không có gì để thanh toán</h2>
        <Link href="/products" className="inline-block px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700">
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Thanh toán</h1>
        <p className="text-sm text-gray-500 mt-1">Điền thông tin giao hàng để hoàn tất đơn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form — on mobile shows AFTER the summary so user knows the total before scrolling through fields */}
        <form onSubmit={handleSubmit} className="order-2 lg:order-1 lg:col-span-3 space-y-5">

          {/* ── Saved address picker ── */}
          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <h2 className="font-bold text-gray-900">Địa chỉ đã lưu</h2>
                </div>
                <button type="button" onClick={startNewAddress}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700">
                  + Thêm mới
                </button>
              </div>

              <div className="space-y-2">
                {savedAddresses.map((a) => {
                  const isPicked = a._id === selectedAddrId && !editMode;
                  return (
                    <div key={a._id}
                      className={`group relative rounded-xl border-2 p-3 cursor-pointer transition-all ${
                        isPicked ? 'border-rose-500 bg-rose-50/40' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => pickAddress(a)}>
                      <div className="flex items-start gap-3">
                        <div className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                          isPicked ? 'border-rose-500' : 'border-gray-300'
                        }`}>
                          {isPicked && <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 text-sm">{a.recipientName}</p>
                            <span className="text-xs text-gray-500">·</span>
                            <p className="text-xs font-mono text-gray-600">{a.phone}</p>
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                              {a.label}
                            </span>
                            {a.isDefault && (
                              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {a.street}, {a.ward}, {a.state}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isPicked && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); startEditSelected(); }}
                              className="text-[11px] text-primary-600 hover:underline font-semibold">
                              Sửa
                            </button>
                          )}
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteAddress(a._id); }}
                            className="text-[11px] text-red-500 hover:underline font-semibold">
                            Xoá
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Form fields — only shown when adding new OR editing selected ── */}
          {(editMode || savedAddresses.length === 0) && (
          <>
          {/* Recipient */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">
                {selectedAddrId ? 'Sửa địa chỉ' : savedAddresses.length === 0 ? 'Thông tin người nhận' : 'Thêm địa chỉ mới'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Họ tên người nhận *</label>
                <input className={inputCls} placeholder="Nguyễn Văn A"
                  value={form.recipientName} onChange={(e) => set('recipientName', e.target.value)} />
                {errors.recipientName && <p className="text-xs text-rose-600 mt-1">{errors.recipientName}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Số điện thoại *</label>
                <input type="tel" className={inputCls} placeholder="0912345678"
                  value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">Địa chỉ giao hàng</h2>
              {savedAddresses.length > 0 && (
                <button type="button" onClick={() => { setEditMode(false); if (savedAddresses[0]) pickAddress(savedAddresses.find((a) => a.isDefault) || savedAddresses[0]); }}
                  className="ml-auto text-xs text-gray-500 hover:text-gray-700">
                  ← Quay lại danh sách
                </button>
              )}
            </div>

            <div className="space-y-4">
              <VietnamAddressPicker
                value={{ state: form.state, ward: form.ward }}
                onChange={setAddress}
                error={{ state: errors.state, ward: errors.ward }}
              />
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Số nhà, tên đường * <span className="text-[10px] font-normal text-rose-500">(gõ để xem gợi ý từ OpenStreetMap)</span>
                </label>
                <StreetAutocomplete
                  className={inputCls}
                  value={form.street}
                  onChange={(v) => set('street', v)}
                  state={form.state}
                  city={form.city}
                  ward={form.ward}
                  error={errors.street}
                  placeholder="Số nhà, tên đường (vd: 123 Cầu Giấy)"
                />
              </div>
            </div>
          </div>
          </>
          )}

          {/* Note */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">Ghi chú đơn hàng</h2>
              <span className="text-xs text-gray-400">(tùy chọn)</span>
            </div>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Giao sau 18h, để tại sảnh…"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-extrabold rounded-2xl text-base
                       shadow-lg hover:shadow-xl active:scale-[0.98] transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e,#fb7185)' }}
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Đang đặt hàng…
              </>
            ) : (
              <>🚀 Đặt hàng — {formatPrice(finalTotal)}</>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            🔒 Thanh toán COD · Nhận hàng rồi thanh toán · Đổi trả 7 ngày
          </p>
        </form>

        {/* Order summary — appears FIRST on mobile so user sees total + voucher upfront */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 lg:sticky lg:top-24">
            <h2 className="font-bold text-gray-900 mb-4">
              Tóm tắt đơn hàng
              <span className="ml-2 text-sm font-normal text-gray-400">({cartCount} sản phẩm)</span>
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                const variant = item.variantId ? item.product.variants?.find((v) => v._id === item.variantId) : null;
                const unitPrice = variant?.price ?? item.product.price;
                const lineKey = `${item.product._id}-${item.variantId || ''}`;
                return (
                  <div key={lineKey} className="flex items-center gap-3">
                    <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-gray-100">
                      <Image
                        src={cloudinaryThumb(variant?.image || item.product.images?.[0] || 'https://placehold.co/44x44/f0f9ff/0369a1?text=P', 100)}
                        alt={item.product.name} fill className="object-cover" sizes="44px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        {variant?.colorHex && (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full border border-white ring-1 ring-rose-200 shrink-0"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        {variant && (
                          <span className="text-rose-600 font-bold">
                            {variant.color ? `${variant.color} · ` : ''}{variant.label} ·
                          </span>
                        )}
                        <span>× {item.quantity}</span>
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 shrink-0">
                      {formatPrice(unitPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Affiliate notice */}
            {affiliateRef && (
              <div className={`border-t border-gray-100 mt-4 pt-4`}>
                {isInternalBuyer ? (
                  <div className="rounded-xl px-3 py-2.5 border-2 bg-amber-50 border-amber-200 text-[11px] text-amber-800">
                    ⚠️ Tài khoản nội bộ (nhân viên/sales/admin) đặt đơn <strong>không tính hoa hồng</strong> — mã <span className="font-mono font-bold">{affiliateRef}</span> sẽ bị bỏ qua.
                  </div>
                ) : (
                  <div className="rounded-xl px-3 py-2.5 border-2 bg-rose-50 border-rose-200 text-[11px] text-rose-800">
                    🎯 Giới thiệu bởi: <span className="font-mono font-bold">{affiliateRef}</span>
                  </div>
                )}
              </div>
            )}

            {/* Voucher input */}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <p className="text-xs font-bold text-gray-700 mb-2">🎁 Mã giảm giá</p>
              {voucher ? (
                <div className="rounded-xl px-3 py-2.5 border-2 bg-emerald-50 border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-gray-900">{voucher.code}</p>
                      <p className="text-[11px] text-gray-600 truncate mt-0.5">{voucher.note}</p>
                    </div>
                    {!isAutoApplied && (
                      <button onClick={removeVoucher} className="text-[11px] font-semibold text-red-500 hover:underline shrink-0">Bỏ</button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-mono uppercase tracking-wider
                                 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                      placeholder="NHẬP MÃ (VD: FREESHIP)"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={applyVoucher}
                      disabled={voucherLoading}
                      className="px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-60 transition-all"
                      style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e)' }}
                    >
                      {voucherLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    💡 Mã khả dụng: <span className="font-mono font-bold text-rose-600">FREESHIP</span> (miễn phí ship ≥500K) · <span className="font-mono font-bold text-rose-600">DERMA50</span> (giảm 50K đơn ≥500K)
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span><span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Vận chuyển</span>
                {shippingFee === 0
                  ? <span className="text-emerald-600 font-semibold">Miễn phí</span>
                  : <span>{formatPrice(shippingFee)}</span>}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{voucher?.note || 'Giảm giá'}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span className="text-rose-600 text-lg">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[
                { icon: '🚚', text: cartTotal >= FREE_SHIPPING_MIN ? 'Đơn từ 500K — miễn phí ship' : 'Dùng mã FREESHIP để miễn phí ship' },
                { icon: '⚡', text: 'Giao trong ngày tại Hà Nội' },
                { icon: '🔄', text: 'Đổi trả dễ dàng trong 7 ngày' },
                { icon: '✅', text: '100% hàng chính hãng' },
              ].map((g) => (
                <div key={g.text} className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{g.icon}</span>{g.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center text-2xl shrink-0">
                🛒
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Xác nhận đặt hàng?</h3>
                <p className="text-xs text-gray-500">Vui lòng kiểm tra lại thông tin đơn hàng</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-4">
              <div className="pb-2 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-500 mb-1">GIAO ĐẾN</p>
                <p className="font-semibold text-gray-900">{form.recipientName} · {form.phone}</p>
                <p className="text-xs text-gray-600">
                  {form.street}, {form.ward}, {form.state}
                </p>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({cartCount} sản phẩm)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                {shippingFee === 0
                  ? <span className="text-emerald-600 font-semibold">Miễn phí</span>
                  : <span>{formatPrice(shippingFee)}</span>}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="truncate">{voucher?.note || 'Giảm giá'}</span>
                  <span className="shrink-0 ml-2">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-gray-900 pt-2 border-t border-gray-200 text-base">
                <span>Tổng thanh toán</span>
                <span className="text-rose-600 text-lg">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mb-4">
              💵 Thanh toán khi nhận hàng (COD)
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 py-3 font-bold rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={confirmCheckout}
                disabled={loading}
                className="flex-1 py-3 font-extrabold text-white rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#e11d48,#f43f5e,#fb7185)' }}
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Đang đặt…
                  </>
                ) : (
                  <>✓ Xác nhận</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
