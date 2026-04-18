'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bundle, SolutionType } from '@/types';
import { bundleService } from '@/services/bundle.service';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

/* ──────────────── VN content map ──────────────── */

type SolutionContent = {
  emoji: string;
  title: string;
  tagline: string;
  gradient: string;
  accentColor: string;
  problem: string;
  symptoms: { icon: string; label: string }[];
  causes:   { icon: string; label: string }[];
  mistakes: { icon: string; label: string }[];
  testimonials: { name: string; age: number; result: string; avatar: string }[];
};

const CONTENT: Record<SolutionType, SolutionContent> = {
  'acne': {
    emoji: '🌿',
    title: 'Giải pháp cho da mụn',
    tagline: 'Giảm 70% mụn viêm sau 30 ngày — không khô, không bong tróc',
    gradient: 'linear-gradient(135deg,#be123c 0%,#e11d48 40%,#fb7185 100%)',
    accentColor: 'rose',
    problem:
      'Mụn không chỉ ảnh hưởng đến vẻ ngoài — nó còn làm bạn mất tự tin khi giao tiếp, để lại thâm sẹo kéo dài nhiều tháng. Hơn 85% người Việt 15–40 tuổi từng gặp vấn đề về mụn.',
    symptoms: [
      { icon: '⚫',  label: 'Mụn đầu đen, đầu trắng' },
      { icon: '🔴', label: 'Mụn viêm, mụn mủ, mụn bọc' },
      { icon: '💧', label: 'Da dầu, lỗ chân lông to' },
      { icon: '🩹', label: 'Thâm và sẹo rỗ sau mụn' },
    ],
    causes: [
      { icon: '💧', label: 'Tuyến bã nhờn hoạt động quá mức' },
      { icon: '🧬', label: 'Tế bào chết tích tụ gây tắc nghẽn' },
      { icon: '🦠', label: 'Vi khuẩn P. acnes phát triển' },
      { icon: '😰', label: 'Stress, nội tiết tố, thức khuya' },
    ],
    mistakes: [
      { icon: '👆', label: 'Nặn mụn không đúng cách làm viêm lan rộng' },
      { icon: '🚿', label: 'Rửa mặt quá nhiều khiến da khô, tiết thêm dầu' },
      { icon: '⚠️', label: 'Dùng sản phẩm quá mạnh làm hỏng hàng rào da' },
      { icon: '☀️', label: 'Không chống nắng — thâm mụn đậm và lâu mờ' },
    ],
    testimonials: [
      { name: 'Ngọc Anh',   age: 22, result: 'Hết mụn viêm sau 3 tuần',        avatar: '👩' },
      { name: 'Minh Tuấn', age: 19, result: 'Da mịn màng, lỗ chân lông nhỏ', avatar: '👨' },
      { name: 'Hải Yến',    age: 27, result: 'Mụn ẩn giảm 80%, da đều màu',   avatar: '👩' },
    ],
  },
  'oily-skin': {
    emoji: '💧',
    title: 'Kiểm soát da dầu',
    tagline: 'Da khô thoáng 12 giờ — không bóng nhờn, không lỗ chân lông to',
    gradient: 'linear-gradient(135deg,#92400e 0%,#d97706 40%,#fbbf24 100%)',
    accentColor: 'amber',
    problem:
      'Da dầu khiến bạn lúc nào cũng bóng nhờn, lớp makeup trôi nhanh, lỗ chân lông to và dễ nổi mụn ẩn. 1 trong 3 người Việt có da dầu kèm lỗ chân lông to bẩm sinh.',
    symptoms: [
      { icon: '✨', label: 'Da bóng dầu chỉ sau 1–2 giờ' },
      { icon: '🕳️', label: 'Lỗ chân lông to, rõ' },
      { icon: '🌋', label: 'Mụn ẩn, sợi bã nhờn' },
      { icon: '😖', label: 'Makeup trôi nhanh, loang lổ' },
    ],
    causes: [
      { icon: '🧬', label: 'Di truyền tuyến bã nhờn hoạt động mạnh' },
      { icon: '🌡️', label: 'Thời tiết nóng ẩm Việt Nam' },
      { icon: '🍔', label: 'Ăn nhiều đồ cay, dầu mỡ, đồ ngọt' },
      { icon: '😴', label: 'Thiếu ngủ, stress mãn tính' },
    ],
    mistakes: [
      { icon: '🚿', label: 'Rửa mặt nhiều lần trong ngày → da tiết thêm dầu' },
      { icon: '❌', label: 'Không dưỡng ẩm vì sợ nhờn (sai lầm lớn nhất)' },
      { icon: '🧴', label: 'Dùng toner chứa cồn khô da, kích ứng' },
      { icon: '📰', label: 'Tin quảng cáo "làm khô da = hết dầu"' },
    ],
    testimonials: [
      { name: 'Thanh Hoa', age: 24, result: 'Da mát 12 giờ, không bóng',      avatar: '👩' },
      { name: 'Đức Anh',   age: 26, result: 'Lỗ chân lông se khít rõ rệt',    avatar: '👨' },
      { name: 'Phương Vy', age: 21, result: 'Makeup không trôi cả ngày dài',  avatar: '👩' },
    ],
  },
  'dark-spot': {
    emoji: '✨',
    title: 'Mờ thâm, sáng da',
    tagline: 'Mờ thâm rõ rệt sau 4 tuần — da đều màu, không còn đốm nâu',
    gradient: 'linear-gradient(135deg,#4338ca 0%,#7c3aed 40%,#c084fc 100%)',
    accentColor: 'violet',
    problem:
      'Thâm mụn, nám, tàn nhang làm da không đều màu, khiến bạn trông già hơn tuổi thật. Dưới ánh sáng mặt trời, các vết thâm càng đậm và khó mờ nếu không can thiệp đúng cách.',
    symptoms: [
      { icon: '🟤', label: 'Thâm nâu sau mụn kéo dài > 3 tháng' },
      { icon: '🟫', label: 'Nám má, nám mảng, tàn nhang' },
      { icon: '⚫', label: 'Đốm nâu do tuổi tác' },
      { icon: '🔍', label: 'Da không đều màu, xỉn màu' },
    ],
    causes: [
      { icon: '☀️', label: 'Tia UVA/UVB kích thích sản sinh melanin' },
      { icon: '🌋', label: 'Viêm sau mụn để lại sắc tố' },
      { icon: '👶', label: 'Nội tiết (thai kỳ, tránh thai)' },
      { icon: '⏰', label: 'Lão hóa tự nhiên của da' },
    ],
    mistakes: [
      { icon: '☀️', label: 'Không dùng kem chống nắng mỗi ngày — thâm khó mờ' },
      { icon: '💊', label: 'Dùng kem bôi trôi nổi không rõ nguồn gốc' },
      { icon: '🌿', label: 'Tin "thảo dược thiên nhiên" giúp trắng nhanh' },
      { icon: '⚡', label: 'Nôn nóng dùng acid mạnh → kích ứng, thâm đậm hơn' },
    ],
    testimonials: [
      { name: 'Linh Chi',  age: 30, result: 'Thâm nám mờ rõ sau 6 tuần',     avatar: '👩' },
      { name: 'Bảo Trân',  age: 28, result: 'Da sáng đều, không đốm nâu',   avatar: '👩' },
      { name: 'Quốc Khánh', age: 34, result: 'Nám má mờ 70%, da sáng hơn',   avatar: '👨' },
    ],
  },
};

const VALID_SLUGS: SolutionType[] = ['acne', 'oily-skin', 'dark-spot'];

/* ──────────────── Page component ──────────────── */

export default function SolutionPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart } = useCart();

  const [bundle, setBundle]   = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  const isValidSlug = VALID_SLUGS.includes(slug as SolutionType);
  const content = isValidSlug ? CONTENT[slug as SolutionType] : null;

  useEffect(() => {
    if (!isValidSlug) { setLoading(false); return; }
    bundleService.getBySolutionType(slug as SolutionType)
      .then(({ data }: any) => setBundle(data.data))
      .catch(() => setBundle(null))
      .finally(() => setLoading(false));
  }, [slug, isValidSlug]);

  const handleStartTreatment = async () => {
    if (!bundle) return;
    setAdding(true);
    try {
      for (const product of bundle.products) {
        await addToCart(product._id, 1);
      }
      toast.success(`Đã thêm combo ${bundle.title} vào giỏ hàng!`);
      router.push('/cart');
    } catch {
      toast.error('Có lỗi khi thêm combo vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  if (!isValidSlug) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Không tìm thấy giải pháp</h2>
        <p className="text-gray-500 mb-6">Chọn một trong các giải pháp bên dưới:</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {VALID_SLUGS.map((s) => (
            <Link key={s} href={`/solutions/${s}`}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700">
              {CONTENT[s].emoji} {CONTENT[s].title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!content) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ═════════════ HERO ═════════════ */}
      <section className="relative overflow-hidden text-white"
        style={{ background: content.gradient }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <div className="text-6xl sm:text-7xl mb-4">{content.emoji}</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            {content.title}
          </h1>
          <p className="text-white/90 text-base sm:text-xl max-w-2xl mx-auto mb-8">
            {content.tagline}
          </p>

          {bundle && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-5 py-2 text-sm font-bold">
              🔥 Chỉ còn <span className="text-yellow-200">{bundle.stockClaim}</span> suất ưu đãi hôm nay
            </div>
          )}
        </div>
      </section>

      {/* ═════════════ PROBLEM ═════════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-600 mb-3">
              <span>⚠️</span> Vấn đề bạn đang gặp
            </div>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{content.problem}</p>
          </div>
        </div>
      </section>

      {/* ═════════════ SYMPTOMS + CAUSES ═════════════ */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">
              🔎 Triệu chứng thường gặp
            </h3>
            <ul className="space-y-3">
              {content.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <span className="text-gray-700">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-500 mb-4">
              💡 Nguyên nhân
            </h3>
            <ul className="space-y-3">
              {content.causes.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <span className="text-gray-700">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═════════════ COMMON MISTAKES ═════════════ */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 sm:p-8">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-amber-700 mb-5">
              ❌ Những sai lầm khiến tình trạng nặng hơn
            </h3>
            <ul className="space-y-3">
              {content.mistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-amber-100">
                  <span className="text-xl shrink-0">{m.icon}</span>
                  <span className="text-gray-800 text-sm sm:text-base">{m.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═════════════ SOLUTION COMBO (MAIN SECTION) ═════════════ */}
      <section className="pb-12 sm:pb-16" id="combo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {bundle ? (
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
              style={{ background: content.gradient }}>

              {/* Badge ribbon */}
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 text-white font-extrabold text-sm uppercase tracking-widest">
                  💎 Giải pháp được khuyến nghị
                </span>
                <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 font-extrabold text-xs px-3 py-1 rounded-full">
                  🔥 Tiết kiệm {bundle.discountPercent}%
                </span>
              </div>

              <div className="p-6 sm:p-8 text-white">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">{bundle.title}</h2>
                {bundle.subtitle && <p className="text-white/80 mb-6">{bundle.subtitle}</p>}

                {/* Products in combo — mobile: horizontal scroll snap · desktop: 3-col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {bundle.products.map((product, idx) => (
                    <div key={product._id} className="bg-white rounded-2xl p-3 sm:p-4 text-gray-900 flex sm:block gap-3 sm:gap-0">
                      <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative w-20 h-20 sm:w-full sm:h-auto sm:mb-3 shrink-0">
                        {product.images?.[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 80px, 33vw" />
                        )}
                        <span className="absolute top-1 left-1 sm:top-2 sm:left-2 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow text-gray-900">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center sm:justify-start">
                        <h4 className="font-bold text-sm mb-0.5 sm:mb-1 line-clamp-2 sm:min-h-[2.5rem]">{product.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">{product.shortDescription}</p>
                        <p className="font-extrabold text-rose-600 text-sm">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                {bundle.benefits?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {bundle.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/15 border border-white/25 rounded-xl px-3 py-2">
                        <span className="text-green-300 font-extrabold shrink-0">✓</span>
                        <span className="text-white/95 text-sm">{b}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price + CTA */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 text-gray-900">
                  <div className="flex items-end gap-3 justify-between flex-wrap mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-1">Giá combo (tiết kiệm {bundle.discountPercent}%)</p>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black text-rose-600">
                          {formatPrice(bundle.bundlePrice)}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Liệu trình</p>
                      <p className="font-extrabold text-lg text-gray-900">{bundle.durationDays} ngày</p>
                    </div>
                  </div>

                  <button
                    onClick={handleStartTreatment}
                    disabled={adding}
                    className="w-full py-4 rounded-2xl font-extrabold text-white text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-60"
                    style={{ background: content.gradient }}
                  >
                    {adding ? 'Đang thêm...' : `🚀 Bắt đầu liệu trình ${bundle.durationDays} ngày`}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    🔒 COD — Thanh toán khi nhận hàng · Đổi trả 7 ngày
                  </p>
                </div>

                {/* Instructions */}
                {bundle.instructions && (
                  <div className="mt-6 bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/25">
                    <p className="text-xs font-extrabold text-white uppercase tracking-widest mb-2">
                      📖 Hướng dẫn sử dụng
                    </p>
                    <pre className="text-white/90 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {bundle.instructions}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 text-center">
              <p className="text-5xl mb-3">🎁</p>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Combo đang được cập nhật</h3>
              <p className="text-gray-500 mb-4">Liệu trình cho giải pháp này sẽ có sớm. Để lại thông tin để được tư vấn.</p>
              <Link href="/products" className="inline-block px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">
                Xem sản phẩm lẻ
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═════════════ TESTIMONIALS ═════════════ */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl font-extrabold text-gray-900 mb-2">Khách hàng nói gì</h3>
          <p className="text-center text-gray-500 mb-8">Kết quả thực tế sau khi sử dụng liệu trình</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {content.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.age} tuổi</p>
                  </div>
                </div>
                <div className="flex text-amber-400 mb-2">
                  {'★★★★★'.split('').map((s, j) => <span key={j}>{s}</span>)}
                </div>
                <p className="text-sm text-gray-700">"{t.result}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════ STICKY BOTTOM CTA ═════════════ */}
      {bundle && (
        <div className="sticky bottom-0 z-30 bg-white border-t-2 border-gray-200 shadow-2xl px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">🔥 Còn {bundle.stockClaim} suất • Tiết kiệm {bundle.discountPercent}%</p>
              <p className="font-extrabold text-rose-600 text-lg">
                {formatPrice(bundle.bundlePrice)}
                <span className="ml-2 text-sm text-gray-400 line-through font-normal">{formatPrice(bundle.originalPrice)}</span>
              </p>
            </div>
            <button
              onClick={handleStartTreatment}
              disabled={adding}
              className="px-5 sm:px-8 py-3 rounded-xl font-extrabold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 shrink-0"
              style={{ background: content.gradient }}
            >
              {adding ? '...' : 'Mua ngay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
