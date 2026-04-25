import Link from 'next/link';
import type { Metadata } from 'next';
import AboutCtaButtons from './AboutCtaButtons';

export const metadata: Metadata = { title: 'Về chúng tôi' };

const MILESTONES = [
  { year: '2018', title: 'Thành lập', desc: 'Lumié ra đời với sứ mệnh mang dược mỹ phẩm chính hãng đến tay người Việt.' },
  { year: '2020', title: 'Mở rộng', desc: 'Đạt 10.000 khách hàng, ra mắt dịch vụ tư vấn dược sĩ da liễu trực tuyến.' },
  { year: '2022', title: 'Chứng nhận', desc: 'Đạt chứng nhận GPP và hợp tác phân phối với các thương hiệu dược mỹ phẩm hàng đầu.' },
  { year: '2026', title: 'Hôm nay', desc: 'Hơn 50.000 khách hàng tin tưởng, liệu trình cá nhân hoá, giao hàng toàn quốc.' },
];

const TEAM = [
  { name: 'DS. Nguyễn Minh Khoa', role: 'Giám đốc điều hành & Dược sĩ trưởng', avatar: '👨‍⚕️' },
  { name: 'DS. Trần Thị Lan',     role: 'Trưởng phòng Chất lượng',             avatar: '👩‍⚕️' },
  { name: 'Lê Văn Hùng',          role: 'Giám đốc Công nghệ',                   avatar: '👨‍💻' },
  { name: 'Phạm Thu Hương',       role: 'Trưởng phòng Chăm sóc Khách hàng',    avatar: '👩‍💼' },
];

const VALUES = [
  { icon: '🏥', title: 'Chính hãng',    desc: 'Cam kết 100% hàng chính hãng, có nguồn gốc rõ ràng và giấy phép lưu hành hợp lệ.' },
  { icon: '❤️', title: 'Tận tâm',       desc: 'Đặt sức khoẻ của khách hàng lên trên hết trong mọi quyết định kinh doanh.' },
  { icon: '🔬', title: 'Khoa học',      desc: 'Mọi sản phẩm đều được kiểm định bởi dược sĩ và phòng lab độc lập.' },
  { icon: '🌱', title: 'Bền vững',      desc: 'Hướng đến đóng gói thân thiện môi trường và chuỗi cung ứng trách nhiệm.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            ✨ Về Lumié
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Làn da khoẻ đẹp,<br />
            <span className="text-blue-200">trách nhiệm của chúng tôi</span>
          </h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-xl mx-auto">
            Từ năm 2018, Lumié đã là người bạn đồng hành đáng tin cậy trong hành trình chăm sóc làn da của hàng chục nghìn khách hàng Việt Nam.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Mission */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Sứ mệnh</p>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                Mang dược mỹ phẩm chuẩn đến mọi làn da
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Lumié ra đời với một mục tiêu duy nhất: giúp người Việt dễ dàng tiếp cận dược mỹ phẩm chính hãng, được dược sĩ da liễu tư vấn cá nhân hoá, với giá minh bạch.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Chúng tôi hợp tác trực tiếp với các thương hiệu dược mỹ phẩm hàng đầu, loại bỏ trung gian, đảm bảo mỗi sản phẩm bạn nhận được là hàng thật — giá tốt nhất thị trường.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '50.000+', label: 'Khách hàng tin tưởng' },
                { num: '5.000+',  label: 'Sản phẩm chính hãng' },
                { num: '200+',    label: 'Đối tác nhà sản xuất' },
                { num: '6 năm',   label: 'Kinh nghiệm hoạt động' },
              ].map((s) => (
                <div key={s.label} className="bg-primary-50 rounded-2xl p-5 text-center">
                  <p className="text-2xl font-extrabold text-primary-700">{s.num}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Giá trị cốt lõi</p>
            <h2 className="text-2xl font-extrabold text-gray-900">Chúng tôi tin vào điều gì</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-card-md transition-shadow">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 md:p-10">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Hành trình</p>
            <h2 className="text-2xl font-extrabold text-gray-900">Chặng đường phát triển</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`flex gap-6 items-start ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`hidden md:flex flex-1 ${i % 2 === 0 ? 'justify-end text-right' : 'justify-start text-left'}`}>
                    <div className="max-w-xs">
                      <p className="font-bold text-gray-900 mb-1">{m.title}</p>
                      <p className="text-sm text-gray-500">{m.desc}</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md">
                      {m.year.slice(2)}
                    </div>
                    <p className="text-xs font-bold text-primary-600 mt-1">{m.year}</p>
                  </div>
                  <div className="flex-1 md:hidden">
                    <p className="font-bold text-gray-900 mb-1">{m.title}</p>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Đội ngũ</p>
            <h2 className="text-2xl font-extrabold text-gray-900">Ban lãnh đạo</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 text-center hover:shadow-card-md transition-shadow">
                <div className="text-5xl mb-3">{t.avatar}</div>
                <p className="font-bold text-gray-900 text-sm leading-snug">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{t.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary-600 to-blue-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-xl font-extrabold mb-2">Sẵn sàng chăm sóc sức khoẻ cùng chúng tôi?</h2>
          <p className="text-white/75 text-sm mb-6">Tham gia cùng 50.000+ khách hàng đang tin tưởng Lumié.</p>
          <AboutCtaButtons />
        </section>
      </div>
    </div>
  );
}
