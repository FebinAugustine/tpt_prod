export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RefreshTokenResponse {
  message: string;
}

export interface StatsData {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  totalRevenue: number;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  offerPrice?: number;
  trainerPrice?: number;
  weight?: string;
  serve?: string;
  isImported: boolean;
  inStock: boolean;
  flavour?: string;
  company?: string;
  manufacturer?: string;
  howToUse?: string;
  whenToUse?: string;
  images: string[];
  isActive: boolean;
  sortOrder: number;
  category: string | Category;
  isTrending: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfferCard {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'upi' | 'razorpay';
  paymentStatus: 'pending' | 'verified' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  upiPaymentDetails?: {
    transactionId?: string;
    referenceNo?: string;
    paidAt?: string;
    screenshotUrl?: string;
  };
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  quantity: number;
  images: string[];
}

export interface Address {
  _id: string;
  user: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Career {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Press {
  _id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddProductDto {
  name: string;
  description?: string;
  price: number;
  offerPrice?: number;
  trainerPrice?: number;
  weight?: string;
  serve?: string;
  isImported?: boolean;
  inStock?: boolean;
  flavour?: string;
  company?: string;
  manufacturer?: string;
  howToUse?: string;
  whenToUse?: string;
  images?: string[];
  isActive?: boolean;
  sortOrder?: number;
  category?: string;
  isTrending?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
}