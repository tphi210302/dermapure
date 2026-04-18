import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Chính sách bảo mật' };

const SECTIONS = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content: [
      'Thông tin cá nhân bạn cung cấp khi đăng ký tài khoản: họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng.',
      'Thông tin giao dịch: lịch sử đơn hàng, phương thức thanh toán (chúng tôi KHÔNG lưu trữ thông tin thẻ ngân hàng đầy đủ).',
      'Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, trang bạn truy cập nhằm mục đích cải thiện dịch vụ.',
    ],
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    content: [
      'Xử lý và giao đơn hàng của bạn.',
      'Gửi xác nhận đơn hàng và thông báo trạng thái giao hàng.',
      'Hỗ trợ khách hàng và giải quyết khiếu nại.',
      'Gửi thông tin khuyến mãi (bạn có thể hủy đăng ký bất cứ lúc nào).',
      'Phân tích dữ liệu để cải thiện sản phẩm và dịch vụ.',
    ],
  },
  {
    title: '3. Chia sẻ thông tin',
    content: [
      'Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba.',
      'Thông tin chỉ được chia sẻ với đối tác giao hàng (tên, số điện thoại, địa chỉ) để thực hiện đơn hàng.',
      'Chúng tôi có thể chia sẻ thông tin khi có yêu cầu từ cơ quan nhà nước có thẩm quyền theo quy định pháp luật.',
    ],
  },
  {
    title: '4. Bảo mật thông tin',
    content: [
      'Mọi dữ liệu truyền tải được mã hóa bằng SSL 256-bit.',
      'Mật khẩu được lưu trữ dưới dạng mã hóa (hash), chúng tôi không thể đọc mật khẩu của bạn.',
      'Chỉ nhân viên có thẩm quyền mới được phép truy cập dữ liệu khách hàng.',
      'Hệ thống được kiểm tra bảo mật định kỳ bởi đội ngũ chuyên gia.',
    ],
  },
  {
    title: '5. Quyền của bạn',
    content: [
      'Quyền truy cập: yêu cầu xem thông tin chúng tôi lưu trữ về bạn.',
      'Quyền chỉnh sửa: cập nhật thông tin cá nhân trong tài khoản hoặc liên hệ hỗ trợ.',
      'Quyền xóa: yêu cầu xóa tài khoản và dữ liệu liên quan (trừ dữ liệu cần lưu trữ theo quy định pháp luật).',
      'Quyền từ chối: hủy nhận email marketing bất cứ lúc nào qua link "Hủy đăng ký" trong email.',
    ],
  },
  {
    title: '6. Cookie',
    content: [
      'Chúng tôi sử dụng cookie kỹ thuật cần thiết để website hoạt động bình thường.',
      'Cookie phân tích (Google Analytics) để hiểu cách khách hàng sử dụng website — bạn có thể từ chối trong cài đặt trình duyệt.',
      'Cookie không được dùng để theo dõi bạn trên các website khác.',
    ],
  },
  {
    title: '7. Liên hệ',
    content: [
      'Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ: privacy@pharmashop.vn',
      'Hotline: 1800-123-456 (Thứ 2 – Thứ 7, 8:00–20:00)',
      'Địa chỉ: Số 1 Đại Cồ Việt, Quận Hai Bà Trưng, Hà Nội',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-blue-800 text-white py-14 px-4 text-center">
        <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          🔒 Bảo mật & Quyền riêng tư
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Chính sách bảo mật</h1>
        <p className="text-white/70 text-sm">Cập nhật lần cuối: 01/01/2025</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <p className="text-sm text-blue-800 leading-relaxed">
            DermaPure cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi sử dụng dịch vụ của DermaPure.
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
          Bằng cách sử dụng dịch vụ của DermaPure, bạn đồng ý với chính sách bảo mật này.
        </p>
      </div>
    </div>
  );
}
