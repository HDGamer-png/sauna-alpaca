/**
 * Types chung cho toàn bộ dự án Sauna Alpaca
 */

// ──── Navigation ────
export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

// ──── Form ────
export type NhuCau = 'mua' | 'thue';
export type GoiThue = '3thang' | '6thang' | '12thang';

export interface ContactFormData {
  hoTen: string;
  soDienThoai: string;
  diaChi: string;
  phuongXa?: string;
  nhuCau: NhuCau;
  goiThue?: GoiThue;
  ghiChu?: string;
  /** Honeypot field — phải để trống */
  website?: string;
}

// ──── Product ────
export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  features: string[];
  images: string[];
  category: 'mua' | 'thue';
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaHref: string;
}

// ──── Research ────
export interface ResearchArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  source: string;
  publishedDate: string;
  content: string;
}

// ──── FAQ ────
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// ──── API Response ────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
