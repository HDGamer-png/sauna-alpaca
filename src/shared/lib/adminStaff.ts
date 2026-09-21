/**
 * Quản lý Định danh & Phiên đăng nhập Cổng Chuyên viên (Owner & Staff)
 */

export interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  full_title: string;
  role: 'owner' | 'staff';
  avatar: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface AdminShift {
  shift_id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  staff_avatar: string;
  check_in_time: string;
  check_out_time: string | null;
  duration_text: string;
  duration_minutes: number;
  status: 'active' | 'completed';
  replies_count: number;
  date?: string;
}

export interface AdminAuthSession {
  user: AdminUser;
  shift: AdminShift | null;
  timestamp: number;
}

const STORAGE_KEY = 'sauna_admin_session_v1';

export function getStoredAdminSession(): AdminAuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredAdminSession(user: AdminUser, shift: AdminShift | null): void {
  if (typeof window === 'undefined') return;
  try {
    const session: AdminAuthSession = {
      user,
      shift,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Lỗi lưu admin session vào localStorage:', err);
  }
}

export function updateStoredShift(shift: AdminShift | null): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredAdminSession();
    if (current) {
      current.shift = shift;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error('Lỗi cập nhật ca trực:', err);
  }
}

export function clearStoredAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Lỗi xóa admin session:', err);
  }
}
