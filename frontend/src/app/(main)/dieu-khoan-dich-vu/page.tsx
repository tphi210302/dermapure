import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Điều khoản dịch vụ' };

const SECTIONS = [
  {
    title: '1. Chấp nhận điều khoản',
    content: [
      'Khi truy cập và sử dụng website DermaPure, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.',
      'Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.',
      'Chúng tôi có quyền cập nhật điều khoản bất cứ lúc nào. Thay đổi có hiệu lực ngay khi đăng tải lên website.',
    ],
  },
  {
    title: '2. Điều kiện sử dụng',
    content: [
      'Bạn phải từ 18 tuổi trở lên hoặc có sự giám sát của người giám hộ hợp pháp.',
      'Một người chỉ được đăng ký một tài khoản. Tài khoản không được chuyển nhượng.',
      'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.',
      'Không được sử dụng dịch vụ cho mục đích bất hợp pháp hoặc vi phạm pháp luật Việt Nam.',
    ],
  },
  {
    title: '3. Đặt hàng và thanh toán',
    content: [
      'Đơn hàng chỉ được xác nhận sau khi chúng tôi gửi email xác nhận đến địa chỉ của bạn.',
      'Giá sản phẩm được niêm yết bằng VNĐ và đã bao gồm VAT (nếu có).',
      'Chúng tôi chấp nhận: chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay), thanh toán khi nhận hàng (COD).',
      'Đối với sản phẩm đặc trị theo chỉ định bác sĩ da liễu, bạn cần cung cấp đơn kê hợp lệ trước khi xử lý.',
    ],
  },
  {
    title: '4. Giao hàng',
    content: [
      'Thời gian giao hàng: trong ngày tại Hà Nội (đơn trước 15:00), 1–3 ngày tại các tỉnh thành khác.',
      'Miễn phí vận chuyển cho đơn từ 500.000₫. Dưới mức này, phí vận chuyển được tính theo khu vực.',
      'Rủi ro hàng hóa chuyển sang bạn khi giao hàng thành công.',
      'Nếu không nhận được hàng trong thời gian dự kiến, vui lòng liên hệ hotline 1800-123-456.',
    ],
  },
  {
    title: '5. Đổi trả và hoàn tiền',
    content: [
      'Sản phẩm được đổi trả trong 7 ngày kể từ ngày nhận hàng nếu: hàng lỗi do nhà sản xuất, giao nhầm sản phẩm, hoặc hàng hết hạn sử dụng.',
      'Điều kiện: sản phẩm còn nguyên seal/bao bì, chưa qua sử dụng.',
      'Sản phẩm đã mở niêm phong và sản phẩm chăm sóc cá nhân đã sử dụng không được hoàn trả vì lý do vệ sinh.',
      'Hoàn tiền được thực hiện trong 5–7 ngày làm việc qua phương thức thanh toán ban đầu.',
    ],
  },
  {
    title: '6. Trách nhiệm về sức khoẻ',
    content: [
      'Thông tin sản phẩm trên website chỉ mang tính chất tham khảo, không thay thế tư vấn y tế chuyên nghiệp.',
      'Luôn đọc kỹ hướng dẫn sử dụng và hỏi ý kiến bác sĩ da liễu hoặc dược sĩ trước khi sử dụng, đặc biệt với sản phẩm đặc trị.',
      'Chúng tôi không chịu trách nhiệm về tác dụng phụ phát sinh do sử dụng sai chỉ định hoặc không đọc hướng dẫn.',
    ],
  },
  {
    title: '7. Sở hữu trí tuệ',
    content: [
      'Toàn bộ nội dung website (logo, hình ảnh, văn bản, thiết kế) thuộc sở hữu của DermaPure.',
      'Bạn không được sao chép, tái sản xuất hoặc phân phối nội dung mà không có sự đồng ý bằng văn bản.',
    ],
  },
  {
    title: '8. Giải quyết tranh chấp',
    content: [
      'Mọi tranh chấp phát sinh sẽ được giải quyết theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.',
      'Các bên ưu tiên giải quyết qua thương lượng. Nếu không thành công, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền tại Hà Nội.',
      'Liên hệ: legal@pharmashop.vn hoặc hotline 1800-123-456.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-blue-800 text-white py-14 px-4 text-center">
        <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          📋 Điều khoản & Quy định
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Điều khoản dịch vụ</h1>
        <p className="text-white/70 text-sm">Cập nhật lần cuối: 01/01/2025</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
          <p className="text-sm text-amber-800 leading-relaxed">
            Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ. Các điều khoản này điều chỉnh mối quan hệ giữa bạn và DermaPure trong quá trình mua sắm và sử dụng dịch vụ.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-4 text-base">{s.title}</h2>
              <ul className="space-y-2.5">
                {s.content.map((line, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                    <span className="text-primary-500 mt-0.5 shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-10">
          © {new Date().getFullYear()} DermaPure. Điều khoản này được soạn thảo theo pháp luật Việt Nam.
        </p>
      </div>
    </div>
  );
}
