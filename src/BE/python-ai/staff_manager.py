"""
Staff & Shift Manager — Quản lý nhân sự và giám sát ca trực (Check-in / Check-out)
Lưu trữ dữ liệu vào staff.json và shifts.json (100% Python thuần, Zero Database ngoài)
"""

import os
import sys
import json
import time
import threading
from datetime import datetime

# Đảm bảo in tiếng Việt chuẩn trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(__file__)
STAFF_FILE = os.path.join(BASE_DIR, "staff.json")
SHIFTS_FILE = os.path.join(BASE_DIR, "shifts.json")

# Danh sách nhân sự mặc định ban đầu (1 Chủ và 3 Nhân viên trực ca)
DEFAULT_STAFF = [
    {
        "id": "owner_01",
        "username": "admin_chu",
        "password": "sauna@owner123",
        "display_name": "Chủ Cửa Hàng (Admin Tổng)",
        "full_title": "Chủ Quản Lý Hệ Thống Sauna Alpaca Huế",
        "role": "owner",
        "avatar": "👑",
        "phone": "0905123456",
        "status": "active",
        "created_at": "2026-09-01 08:00:00"
    },
    {
        "id": "staff_01",
        "username": "admin_duc",
        "password": "sauna@123",
        "display_name": "Bác sĩ Đức",
        "full_title": "Bác sĩ Hoàng Minh Đức — Chuyên viên YHCT",
        "role": "staff",
        "avatar": "👨‍⚕️",
        "phone": "0905111222",
        "status": "active",
        "created_at": "2026-09-01 08:30:00"
    },
    {
        "id": "staff_02",
        "username": "admin_mai",
        "password": "sauna@123",
        "display_name": "Dược sĩ Mai",
        "full_title": "Dược sĩ Nguyễn Thị Mai — Tư vấn thảo dược & phác đồ",
        "role": "staff",
        "avatar": "👩‍⚕️",
        "phone": "0905333444",
        "status": "active",
        "created_at": "2026-09-01 09:00:00"
    },
    {
        "id": "staff_03",
        "username": "admin_hoang",
        "password": "sauna@123",
        "display_name": "KTV Hoàng",
        "full_title": "Kỹ thuật viên Lê Văn Hoàng — Giao máy & Lắp đặt",
        "role": "staff",
        "avatar": "👨‍🔧",
        "phone": "0905555666",
        "status": "active",
        "created_at": "2026-09-01 09:30:00"
    }
]

class StaffManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.staff_list = self._load_staff()
        self.shifts_list = self._load_shifts()

    def _load_staff(self) -> list:
        if os.path.exists(STAFF_FILE):
            try:
                with open(STAFF_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and len(data) > 0:
                        return data
            except Exception as e:
                print(f"⚠️ [StaffManager] Lỗi đọc {STAFF_FILE}: {e}")
        # Khởi tạo mặc định nếu chưa có
        self._save_staff_list(DEFAULT_STAFF)
        return DEFAULT_STAFF

    def _save_staff_list(self, staff_data: list):
        try:
            with open(STAFF_FILE, "w", encoding="utf-8") as f:
                json.dump(staff_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ [StaffManager] Lỗi lưu {STAFF_FILE}: {e}")

    def _load_shifts(self) -> list:
        if os.path.exists(SHIFTS_FILE):
            try:
                with open(SHIFTS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
            except Exception as e:
                print(f"⚠️ [StaffManager] Lỗi đọc {SHIFTS_FILE}: {e}")
        return []

    def _save_shifts_list(self):
        try:
            with open(SHIFTS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.shifts_list, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ [StaffManager] Lỗi lưu {SHIFTS_FILE}: {e}")

    def _safe_user(self, user: dict) -> dict:
        """Trả về user không kèm mật khẩu"""
        safe = {k: v for k, v in user.items() if k != "password"}
        return safe

    def authenticate(self, username: str, password: str) -> dict | None:
        """Kiểm tra tài khoản và mật khẩu đăng nhập"""
        with self.lock:
            username = username.strip().lower()
            password = password.strip()
            for s in self.staff_list:
                if s.get("username", "").lower() == username and s.get("password") == password:
                    if s.get("status") == "inactive":
                        return None
                    return self._safe_user(s)
            return None

    def get_all_staff(self, include_password: bool = False) -> list:
        """Lấy danh sách tất cả nhân sự (Chủ + Nhân viên)"""
        with self.lock:
            if include_password:
                return list(self.staff_list)
            return [self._safe_user(s) for s in self.staff_list]

    def create_staff(self, data: dict) -> tuple[bool, dict | str]:
        """Chủ tạo mới tài khoản nhân viên"""
        with self.lock:
            username = data.get("username", "").strip().lower()
            password = data.get("password", "").strip()
            display_name = data.get("display_name", "").strip()

            if not username or not password or not display_name:
                return False, "Thiếu thông tin bắt buộc (Username, Password, Họ tên)"

            # Kiểm tra trùng username
            for s in self.staff_list:
                if s.get("username", "").lower() == username:
                    return False, f"Tên đăng nhập '{username}' đã tồn tại!"

            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            staff_id = f"staff_{int(time.time())}"

            new_staff = {
                "id": staff_id,
                "username": username,
                "password": password,
                "display_name": display_name,
                "full_title": data.get("full_title", f"{display_name} — Chuyên viên tư vấn").strip(),
                "role": "staff",  # Nhân viên do chủ tạo ra luôn có role staff
                "avatar": data.get("avatar", "👨‍💼"),
                "phone": data.get("phone", "").strip(),
                "status": "active",
                "created_at": now_str
            }

            self.staff_list.append(new_staff)
            self._save_staff_list(self.staff_list)
            print(f"👤 [StaffManager] Chủ đã tạo nhân viên mới: {display_name} (@{username})")
            return True, self._safe_user(new_staff)

    def update_staff(self, staff_id: str, data: dict) -> tuple[bool, dict | str]:
        """Chủ cập nhật thông tin nhân viên hoặc đổi mật khẩu"""
        with self.lock:
            target = None
            for s in self.staff_list:
                if s.get("id") == staff_id:
                    target = s
                    break

            if not target:
                return False, "Không tìm thấy nhân viên"

            if "display_name" in data and data["display_name"].strip():
                target["display_name"] = data["display_name"].strip()
            if "full_title" in data and data["full_title"].strip():
                target["full_title"] = data["full_title"].strip()
            if "phone" in data:
                target["phone"] = data["phone"].strip()
            if "avatar" in data and data["avatar"].strip():
                target["avatar"] = data["avatar"].strip()
            if "password" in data and data["password"].strip():
                target["password"] = data["password"].strip()
            if "status" in data and data["status"] in ["active", "inactive"]:
                target["status"] = data["status"]

            self._save_staff_list(self.staff_list)
            print(f"🔄 [StaffManager] Đã cập nhật nhân viên: {target['display_name']} ({staff_id})")
            return True, self._safe_user(target)

    def delete_staff(self, staff_id: str) -> tuple[bool, str]:
        """Chủ xóa tài khoản nhân viên (không cho phép xóa Chủ)"""
        with self.lock:
            target = None
            for s in self.staff_list:
                if s.get("id") == staff_id:
                    target = s
                    break

            if not target:
                return False, "Không tìm thấy nhân viên"

            if target.get("role") == "owner":
                return False, "Không thể xóa tài khoản Chủ Cửa Hàng!"

            self.staff_list = [s for s in self.staff_list if s.get("id") != staff_id]
            self._save_staff_list(self.staff_list)
            print(f"🗑️ [StaffManager] Đã xóa nhân viên: {target.get('display_name')} ({staff_id})")
            return True, "Đã xóa nhân viên thành công"

    # ──── QUẢN LÝ CA TRỰC & CHẤM CÔNG (CHECK-IN / CHECK-OUT) ────

    def _calc_duration(self, in_time_str: str, out_time_str: str) -> tuple[str, int]:
        """Tính thời lượng ca làm việc theo phút và chuỗi hiển thị dễ hiểu"""
        try:
            t_in = datetime.strptime(in_time_str, "%Y-%m-%d %H:%M:%S")
            t_out = datetime.strptime(out_time_str, "%Y-%m-%d %H:%M:%S")
            diff_secs = int((t_out - t_in).total_seconds())
            if diff_secs < 0:
                diff_secs = 0
            mins = diff_secs // 60
            hours = mins // 60
            rem_mins = mins % 60
            if hours > 0:
                text = f"{hours} giờ {rem_mins} phút"
            else:
                text = f"{max(1, mins)} phút"
            return text, mins
        except Exception:
            return "Chưa xác định", 0

    def start_shift(self, staff_id: str) -> dict:
        """Tự động Check-in khi nhân viên đăng nhập"""
        with self.lock:
            # Lấy thông tin nhân viên
            staff = None
            for s in self.staff_list:
                if s.get("id") == staff_id:
                    staff = s
                    break

            if not staff:
                # Fallback nhân viên ẩn danh
                staff = {"id": staff_id, "display_name": "Chuyên viên trực", "full_title": "Chuyên viên tư vấn", "avatar": "👨‍💼"}

            now = datetime.now()
            now_str = now.strftime("%Y-%m-%d %H:%M:%S")

            # Nếu nhân viên này đã có 1 ca active thì kết thúc ca cũ trước khi tạo ca mới
            for shift in self.shifts_list:
                if shift.get("staff_id") == staff_id and shift.get("status") == "active":
                    shift["check_out_time"] = now_str
                    dur_text, dur_mins = self._calc_duration(shift.get("check_in_time", now_str), now_str)
                    shift["duration_text"] = dur_text
                    shift["duration_minutes"] = dur_mins
                    shift["status"] = "completed"

            shift_id = f"shift_{int(time.time())}_{staff_id}"
            new_shift = {
                "shift_id": shift_id,
                "staff_id": staff_id,
                "staff_name": staff.get("display_name", "Chuyên viên"),
                "staff_role": staff.get("full_title", "Chuyên viên tư vấn"),
                "staff_avatar": staff.get("avatar", "👨‍💼"),
                "check_in_time": now_str,
                "check_out_time": None,
                "duration_text": "Đang trực ca...",
                "duration_minutes": 0,
                "status": "active",
                "replies_count": 0,
                "date": now.strftime("%Y-%m-%d")
            }

            self.shifts_list.insert(0, new_shift)  # Ca mới nhất lên đầu
            self._save_shifts_list()
            print(f"🟢 [CHECK-IN CA TRỰC]: {new_shift['staff_name']} đã vào ca lúc {now_str} (Mã ca: {shift_id})")
            return new_shift

    def end_shift(self, shift_id: str = None, staff_id: str = None) -> dict | None:
        """Tự động Check-out khi nhân viên đăng xuất hoặc đổi ca"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            target = None

            for shift in self.shifts_list:
                if shift_id and shift.get("shift_id") == shift_id and shift.get("status") == "active":
                    target = shift
                    break
                elif staff_id and shift.get("staff_id") == staff_id and shift.get("status") == "active":
                    target = shift
                    break

            if target:
                target["check_out_time"] = now_str
                dur_text, dur_mins = self._calc_duration(target.get("check_in_time", now_str), now_str)
                target["duration_text"] = dur_text
                target["duration_minutes"] = dur_mins
                target["status"] = "completed"
                self._save_shifts_list()
                print(f"⚪ [CHECK-OUT CA TRỰC]: {target['staff_name']} đã ra ca lúc {now_str}. Thời lượng: {dur_text}, Đã tư vấn: {target.get('replies_count', 0)} tin")
                return target

            return None

    def force_end_shift(self, shift_id: str) -> tuple[bool, str]:
        """Chủ cửa hàng cưỡng chế kết thúc ca nếu nhân viên quên check-out"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            for shift in self.shifts_list:
                if shift.get("shift_id") == shift_id and shift.get("status") == "active":
                    shift["check_out_time"] = now_str
                    dur_text, dur_mins = self._calc_duration(shift.get("check_in_time", now_str), now_str)
                    shift["duration_text"] = f"{dur_text} (Chủ đã kết thúc ca)"
                    shift["duration_minutes"] = dur_mins
                    shift["status"] = "completed"
                    self._save_shifts_list()
                    print(f"🛑 [CHỦ KẾT THÚC CA]: Ca trực {shift_id} của {shift['staff_name']} đã được kết thúc bởi Chủ")
                    return True, "Đã kết thúc ca trực thành công"
            return False, "Không tìm thấy ca trực đang hoạt động"

    def record_staff_reply(self, staff_id: str):
        """Tăng số tin nhắn tư vấn mà nhân viên đã trả lời trong ca trực hiện tại"""
        with self.lock:
            for shift in self.shifts_list:
                if shift.get("staff_id") == staff_id and shift.get("status") == "active":
                    shift["replies_count"] = shift.get("replies_count", 0) + 1
                    self._save_shifts_list()
                    break

    def get_shifts(self, limit: int = 50) -> list:
        """Lấy danh sách lịch sử ca trực (có cập nhật thời gian động cho ca đang chạy)"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            result = []
            for s in self.shifts_list[:limit]:
                item = dict(s)
                if item.get("status") == "active":
                    dur_text, dur_mins = self._calc_duration(item.get("check_in_time", now_str), now_str)
                    item["duration_text"] = f"Đang trực ({dur_text})"
                    item["duration_minutes"] = dur_mins
                result.append(item)
            return result

    def get_active_shifts(self) -> list:
        """Lấy danh sách các nhân viên đang trực ca ngay bây giờ"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            active = []
            for s in self.shifts_list:
                if s.get("status") == "active":
                    item = dict(s)
                    dur_text, dur_mins = self._calc_duration(item.get("check_in_time", now_str), now_str)
                    item["duration_text"] = f"Đang trực ({dur_text})"
                    item["duration_minutes"] = dur_mins
                    active.append(item)
            return active

staff_manager = StaffManager()
