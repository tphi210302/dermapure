// ── Auth ──────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'sales' | 'staff' | 'admin';
  phone?: string;
  address?: Address;
  isActive: boolean;
  affiliateCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  recipientName?: string;  // Tên người nhận (checkout only)
  phone?: string;          // SĐT người nhận (checkout only)
  street?: string;         // Số nhà, tên đường
  ward?: string;           // Phường / Xã
  city?: string;           // Quận / Huyện
  state?: string;          // Tỉnh / Thành phố
  country?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  identifier: string;  // email or phone
  password: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;       // required
  password: string;
  email?: string;      // optional
}

// ── Category ──────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Product ───────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  category: Category | string;
  images: string[];
  stock: number;
  sku?: string;
  brand?: string;
  unit: string;
  tags: string[];
  requiresPrescription: boolean;
  isActive: boolean;
  rating: { average: number; count: number };
  ingredients?: string;
  dosage?: string;
  warnings?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Cart ──────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  updatedAt: string;
}

// ── Order ─────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface StatusHistory {
  status: OrderStatus;
  changedAt: string;
  changedBy?: User | string;
  note?: string;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  voucherCode?: string;
  discountNote?: string;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  trackingCode?: string;
  shippingAddress: Address;
  note?: string;
  affiliateStaff?: Pick<User, '_id' | 'name' | 'email' | 'role' | 'affiliateCode'> | null;
  affiliateCode?: string;
  handledBy?: Pick<User, '_id' | 'name' | 'email' | 'role'> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Bundle (skincare solution combos) ─────────────────────
export type SolutionType = 'acne' | 'oily-skin' | 'dark-spot';

export interface Bundle {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  solutionType: SolutionType;
  products: Product[];
  originalPrice: number;
  bundlePrice: number;
  discountPercent: number;
  durationDays: number;
  description?: string;
  instructions?: string;
  benefits: string[];
  image?: string;
  stockClaim: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── API generic wrappers ──────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Dashboard ─────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  totalCost: number;
  totalProfit: number;
  revenueByMonth: { month: string; revenue: number; cost: number; profit: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
}

// ── Query params ──────────────────────────────────────────
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}
