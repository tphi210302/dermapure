# 🚀 Deploy Free — DermaPure

Hướng dẫn deploy **miễn phí vĩnh viễn** với:
- **Frontend** → [Vercel](https://vercel.com) (Next.js native, không sleep)
- **Backend** → [Render](https://render.com) (free 750h/tháng, sleep sau 15p idle)
- **Database** → [MongoDB Atlas](https://cloud.mongodb.com) (free 512MB)

Tổng thời gian: ~20 phút.

---

## ⚠️ TRƯỚC KHI DEPLOY — Security checklist

- [ ] `.env` KHÔNG BAO GIỜ commit (đã có trong `.gitignore`)
- [ ] `JWT_SECRET` random 32+ ký tự (Render auto-generate)
- [ ] `SEED_ADMIN_PASSWORD` là mật khẩu MẠNH, không dùng mật khẩu dev
- [ ] `MONGO_URI` chỉ có trong env vars của Render (không có trong code)
- [ ] Verify không có secrets bị staged:
  ```bash
  git status | grep -E "\.env$"   # PHẢI TRỐNG
  ```

---

## 📋 PHASE 0 — Push code lên GitHub

```bash
cd pharma-shop
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Tạo repo mới trên github.com (private khuyến nghị)
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

---

## 🗄️ PHASE 1 — MongoDB Atlas (5 phút)

1. Vào [cloud.mongodb.com](https://cloud.mongodb.com) → **Sign up free**
2. Tạo cluster: **M0 FREE** · Region: **Singapore** (gần Việt Nam)
3. **Database Access** → Add user:
   - Username: `<random>`
   - Password: `<random 20 chars>` — lưu lại cẩn thận
4. **Network Access** → Add IP: **`0.0.0.0/0`** (Render dùng IP động)
5. **Database** → Cluster0 → **Connect** → **Drivers** → copy URI:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/pharma-shop?retryWrites=true&w=majority
   ```
   Thay `<password>` bằng password thật, thêm `/pharma-shop` trước dấu `?`.

---

## 🖥️ PHASE 2 — Backend lên Render (5 phút)

1. Vào [render.com](https://render.com) → **Sign up with GitHub**
2. **New +** → **Blueprint** → Connect GitHub repo vừa push
3. Render đọc `render.yaml` → chọn **Apply**
4. Điền 4 env vars thủ công (JWT secrets Render auto-generate):

   | Key | Value |
   |---|---|
   | `MONGO_URI` | URI từ Atlas ở Phase 1 |
   | `CLIENT_ORIGIN` | *(để trống — cập nhật sau Phase 3)* |
   | `SEED_ADMIN_EMAIL` | email admin của bạn |
   | `SEED_ADMIN_PASSWORD` | mật khẩu admin **MẠNH** (≥12 ký tự, có số + ký tự đặc biệt) |

5. Nhấn **Apply** → Render build backend (~3 phút)
6. Khi xong, copy **backend URL**: `https://<service>.onrender.com`
7. Test: mở `https://<service>.onrender.com/api/health` → phải thấy `{"success":true}`

---

## 🌐 PHASE 3 — Frontend lên Vercel (2 phút)

1. Vào [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **Add New** → **Project** → chọn GitHub repo
3. **Root Directory**: click Edit → chọn `frontend`
4. **Environment Variables** → thêm 1 biến:
   ```
   NEXT_PUBLIC_API_URL = https://<service>.onrender.com
   ```
   *(dán URL backend Render ở Phase 2)*
5. Nhấn **Deploy** → Vercel build (~2 phút)
6. Khi xong, copy **frontend URL**: `https://<project>.vercel.app`

---

## 🔗 PHASE 4 — Nối Backend ↔ Frontend

Quay lại **Render → backend service → Environment**, cập nhật:

```
CLIENT_ORIGIN = https://<project>.vercel.app
```

Có thể list nhiều domain: `https://dermapure.vercel.app,https://dermapure-preview.vercel.app`.

Lưu → Render tự restart (~30s).

---

## 🌱 PHASE 5 — Seed dữ liệu sản xuất

Vào Render backend → tab **Shell**:

```bash
npm run fix:indexes            # Fix email/phone indexes
npm run seed                   # Tạo admin user + products cơ bản
npm run migrate:dermaceutical  # Đổi sang 9 danh mục dược mỹ phẩm
npm run seed:bundles           # 3 combo liệu trình
npm run seed:accessories       # Phụ kiện bông tẩy trang
npm run seed:vouchers          # WELCOME10 + FREESHIP + DERMA50
npm run seed:cms               # Banners + site settings
```

---

## ✅ PHASE 6 — Kiểm tra

**Backend:**
```
GET https://<service>.onrender.com/api/health      → 200
GET https://<service>.onrender.com/api/products    → list products
GET https://<service>.onrender.com/api/categories  → 9 danh mục
```

**Frontend** `https://<project>.vercel.app`:
- [ ] Trang chủ load, không lỗi CORS
- [ ] Click "Da mụn" → `/solutions/acne` → thấy combo
- [ ] Đăng ký tài khoản mới bằng SĐT
- [ ] Đăng nhập admin bằng `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` đã set
- [ ] Vào `/admin/content` → sửa banner → lưu → F5 thấy đổi

---

## 🔧 Sau deploy — cập nhật dễ dàng

**Code changes:** `git push` → Render + Vercel auto-deploy.

**Content changes (không cần deploy):**
- Admin → `/admin/content` — sửa banner, settings
- Admin → `/admin/bundles` — combo liệu trình
- Admin → `/admin/products` — thêm/sửa sản phẩm
- Admin → `/admin/orders` — xử lý đơn

---

## ⚠️ Lưu ý free tier

### Render (backend)
- **Sleep sau 15 phút idle** → request đầu sau đó mất ~30–60s khởi động
- Cách khắc phục miễn phí: [UptimeRobot](https://uptimerobot.com) ping `/api/health` mỗi 14 phút → giữ awake 24/7
- 750h/tháng đủ chạy 1 service liên tục cả tháng

### MongoDB Atlas
- 512MB storage — đủ cho ~10.000 orders
- Nếu gần đầy → nâng M10 ($9/tháng) hoặc xoá logs/orders cũ

### Vercel
- Unlimited bandwidth (Hobby plan) cho project cá nhân
- 100 GB bandwidth/tháng — thừa cho site e-commerce nhỏ/vừa

---

## 🛡️ Production security

| Mục | Trạng thái |
|---|---|
| JWT secrets random (≥32 chars) | Render auto-generate ✓ |
| Password bcrypt cost 12 | ✓ |
| Rate limit auth (15 fail/15min) | ✓ |
| Helmet security headers | ✓ |
| CORS allowlist (CLIENT_ORIGIN) | ✓ |
| Account lockout 1→60 phút | ✓ |
| Password min 8 ký tự | ✓ |
| MongoDB sparse unique indexes | ✓ |
| `.env` gitignored | ✓ |
| No hardcoded secrets | ✓ |

---

## 🆘 Troubleshoot

**"Network Error" khi frontend gọi API:**
- Kiểm tra `CLIENT_ORIGIN` (Render) chứa domain Vercel
- Kiểm tra `NEXT_PUBLIC_API_URL` (Vercel) trỏ đúng URL Render
- Re-deploy frontend sau khi đổi env

**"MongoDB connection error":**
- Kiểm tra `MONGO_URI` có `/pharma-shop` trước `?`
- Network Access Atlas đã add `0.0.0.0/0`

**Admin login 401:**
- Chạy lại `npm run seed` trong Render Shell để tạo admin

**Frontend build fail (`useSearchParams` error):**
- Code mới nhất đã fix, đảm bảo đã push lên GitHub trước khi Vercel import
