# DermaPure — Dược Mỹ Phẩm E-Commerce

Nền tảng thương mại điện tử chuyên dược mỹ phẩm da liễu với liệu trình combo cá nhân hoá, tối ưu cho traffic TikTok.

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB 7
- **Auth:** JWT + refresh token rotation
- **Deployment:** Docker Compose

## 🚀 Quick Start

### 1. Clone & configure

```bash
git clone <repo-url> dermapure
cd dermapure
cp .env.example .env
# Mở .env, thay JWT_SECRET và JWT_REFRESH_SECRET bằng chuỗi random dài
# Quick generate:  openssl rand -base64 48
```

### 2. Chạy Docker

```bash
docker compose up -d --build
```

Đợi ~1 phút cho MongoDB + backend lên. Kiểm tra:

```bash
docker compose ps
curl http://localhost:5000/api/health
```

### 3. Seed dữ liệu mẫu

```bash
# Lần đầu setup — fix MongoDB indexes
docker exec pharma-backend npm run fix:indexes

# Sản phẩm + admin user
docker exec pharma-backend npm run seed

# Dược mỹ phẩm: 8 danh mục + bundle 30 ngày
docker exec pharma-backend npm run migrate:dermaceutical
docker exec pharma-backend npm run seed:bundles
docker exec pharma-backend npm run seed:accessories
```

### 4. Truy cập

- **Shop:** http://localhost:3000
- **Admin:** http://localhost:3000/admin (login với `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
- **API docs:** http://localhost:5000/api/docs

## 🔐 Security Notes

- `.env` file chứa secrets — **không bao giờ commit**
- JWT secrets phải ≥ 32 ký tự random (dùng `openssl rand -base64 48`)
- Đổi `SEED_ADMIN_PASSWORD` ngay sau khi deploy production
- CORS allowlist qua `CLIENT_ORIGIN` (comma-separated domains)
- Rate limit: global 100/15min + auth endpoint 15/15min (skip successful)
- Account lockout: 1→5→15→30→60 phút tăng dần sau 5 lần sai
- Password bcrypt cost 12, min 8 ký tự
- MongoDB indexes: phone + email đều `unique + sparse` (cho phép null)

## 🎯 Tính năng chính

### Customer
- Trang chủ: hero chọn vấn đề da (Mụn · Dầu · Thâm) → dẫn vào 3 solution pages với combo liệu trình 30 ngày
- Duyệt 9 danh mục: Làm sạch, Toner, Serum, Trị mụn, Mờ thâm, Dưỡng ẩm, Chống nắng, Chống lão hóa, Phụ kiện
- Bộ lọc rose-themed: click danh mục áp dụng ngay, sort/price cần Apply
- Checkout với **Vietnam address picker** 3 cấp (Tỉnh → Huyện → Xã)
- Auth: đăng ký/đăng nhập bằng **SĐT hoặc email**
- Profile: 3 tabs Thông tin · Địa chỉ · Mật khẩu
- Order tracking: timeline status history + tracking code

### Admin
- Dashboard với revenue chart
- Quản lý Sản phẩm / Danh mục / Đơn hàng / Người dùng
- Order detail: cập nhật status + note nội bộ + mã vận đơn
- Mobile responsive: hamburger sidebar + card views

## 📁 Cấu trúc thư mục

```
pharma-shop/
├── docker-compose.yml        # Dev compose (dùng env vars)
├── .env.example              # Template — copy thành .env
├── backend/
│   ├── src/
│   │   ├── app.js            # Express bootstrap
│   │   ├── server.js
│   │   ├── config/           # db, swagger, logger
│   │   ├── middleware/       # auth, role, validate, error
│   │   ├── utils/            # ApiResponse, ApiError, asyncHandler
│   │   └── modules/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── cart/
│   │       ├── orders/
│   │       ├── bundles/      # Liệu trình combo
│   │       └── admin/
│   ├── scripts/
│   │   ├── seed.js                           # Seed ban đầu
│   │   ├── migrate-categories-dermaceutical  # Chuyển sang danh mục skincare
│   │   ├── seed-bundles.js                   # 3 combo liệu trình
│   │   ├── seed-accessories.js               # Bông/giấy tẩy trang...
│   │   └── fix-user-indexes.js               # Fix email/phone sparse
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (main)/       # Layout có Navbar + BottomNav
│   │   │   ├── (auth)/       # Login + Register
│   │   │   └── admin/        # Admin panel
│   │   ├── components/       # Navbar, BottomNav, product, order, address
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── services/         # API clients (axios)
│   │   └── types/            # TypeScript interfaces
│   ├── .env.local.example
│   └── Dockerfile
└── README.md
```

## 🛠️ Development

```bash
# Restart sau khi sửa backend
docker compose restart backend

# Rebuild sau khi thêm npm package
docker compose up -d --build backend

# Logs
docker compose logs -f backend

# Shell vào container
docker exec -it pharma-backend sh
docker exec -it pharma-mongodb mongosh pharma-shop

# Stop everything
docker compose down

# Stop + xoá volume (MẤT DATA!)
docker compose down -v
```

## 📜 License

MIT
