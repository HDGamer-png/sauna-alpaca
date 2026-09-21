"""
Order Manager — Quản lý Đơn Hàng & Tiến Độ Giao Hàng (100% Logic Python Nội Bộ)
Lưu trữ đơn hàng vào orders.json (Zero API Key, Zero Database ngoài)
Hỗ trợ cả đơn Mua đứt và đơn Thuê theo tháng tại TP. Huế
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
ORDERS_FILE = os.path.join(BASE_DIR, "orders.json")

# Danh sách 4 bước giao hàng chuẩn hóa
DELIVERY_STEPS_CONFIG = [
    {"step": 1, "key": "received", "title": "Tiếp nhận đơn hàng", "desc": "Chuyên viên đã chốt đơn & xác nhận thông tin"},
    {"step": 2, "key": "prepared", "title": "Khử khuẩn & Đóng gói", "desc": "Kiểm tra kỹ thuật & khử khuẩn ozone buồng xông"},
    {"step": 3, "key": "shipping", "title": "Kỹ thuật viên đang giao xe", "desc": "Đang vận chuyển miễn phí tận nhà tại TP. Huế"},
    {"step": 4, "key": "completed", "title": "Đã lắp đặt & Bàn giao", "desc": "Hoàn tất lắp đặt và hướng dẫn khách sử dụng tại chỗ"}
]

class OrderManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.orders = self._load_orders()

    def _load_orders(self) -> dict:
        """Tải toàn bộ đơn hàng từ orders.json"""
        if os.path.exists(ORDERS_FILE):
            try:
                with open(ORDERS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ [OrderManager] Lỗi đọc {ORDERS_FILE}, khởi tạo mới: {e}")
        return {}

    def _save_orders(self):
        """Lưu toàn bộ đơn hàng vào orders.json thread-safe"""
        try:
            with open(ORDERS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.orders, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ [OrderManager] Lỗi lưu orders.json: {e}")

    def create_order(
        self,
        session_id: str,
        customer_name: str,
        phone: str,
        address: str,
        order_type: str,
        package_name: str,
        price_text: str,
        deposit_status: str = "Chưa thanh toán (Thu khi giao)",
        delivery_time: str = "Giao trong ngày tại TP. Huế",
        notes: str = ""
    ) -> dict:
        """Tạo đơn hàng mới liên kết trực tiếp với phiên chat"""
        with self.lock:
            now_dt = datetime.now()
            now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
            time_hm = now_dt.strftime("%H:%M")
            date_prefix = now_dt.strftime("%y%m%d")
            
            # Sinh mã đơn hàng dạng ORD-YYMMDD-XXXX
            short_id = session_id.split('_')[-1][-4:] if session_id else str(int(time.time() % 10000)).zfill(4)
            order_id = f"ORD-{date_prefix}-{short_id}"

            # Khởi tạo 4 mốc tiến trình giao hàng
            steps = []
            for item in DELIVERY_STEPS_CONFIG:
                steps.append({
                    "step": item["step"],
                    "key": item["key"],
                    "title": item["title"],
                    "desc": item["desc"],
                    "done": (item["step"] == 1),
                    "timestamp": time_hm if item["step"] == 1 else None
                })

            order_data = {
                "order_id": order_id,
                "session_id": session_id,
                "customer_name": customer_name or f"Khách hàng #{short_id}",
                "phone": phone or "",
                "address": address or "TP. Huế (Giao tận nhà)",
                "order_type": order_type,       # "rent_3m", "rent_6m", "rent_12m", "buy"
                "package_name": package_name,
                "price_text": price_text,
                "deposit_status": deposit_status,
                "delivery_time": delivery_time,
                "current_step": 1,
                "steps": steps,
                "notes": notes,
                "created_at": now_str,
                "updated_at": now_str
            }

            self.orders[order_id] = order_data
            self._save_orders()
            print(f"📦 [OrderManager] Đã tạo đơn hàng mới: {order_id} cho {customer_name} ({order_type})")
            return order_data

    def get_order_by_id(self, order_id: str) -> dict | None:
        """Lấy chi tiết đơn hàng theo order_id"""
        with self.lock:
            return self.orders.get(order_id)

    def get_order_by_session(self, session_id: str) -> dict | None:
        """Lấy đơn hàng gần nhất của một phiên chat cụ thể"""
        with self.lock:
            if not session_id:
                return None
            # Tìm đơn có session_id trùng khớp (lấy đơn mới nhất nếu có nhiều đơn)
            matching = [o for o in self.orders.values() if o.get("session_id") == session_id]
            if matching:
                matching.sort(key=lambda x: x.get("created_at", ""), reverse=True)
                return matching[0]
            return None

    def update_order_step(self, order_id: str, new_step: int, note: str = None) -> dict | None:
        """
        Cập nhật bước tiến độ giao hàng (1: Tiếp nhận, 2: Khử khuẩn, 3: Đang giao xe, 4: Hoàn tất)
        """
        with self.lock:
            if order_id not in self.orders:
                return None

            order = self.orders[order_id]
            new_step = max(1, min(4, int(new_step)))
            now_dt = datetime.now()
            now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
            time_hm = now_dt.strftime("%H:%M")

            order["current_step"] = new_step
            order["updated_at"] = now_str
            if note:
                order["notes"] = f"{order.get('notes', '')}\n[{time_hm}] {note}".strip()

            for s in order["steps"]:
                if s["step"] <= new_step:
                    s["done"] = True
                    if not s["timestamp"]:
                        s["timestamp"] = time_hm
                else:
                    s["done"] = False
                    s["timestamp"] = None

            self._save_orders()
            step_name = DELIVERY_STEPS_CONFIG[new_step - 1]["title"]
            print(f"🚚 [OrderManager] Đơn {order_id} đã cập nhật -> Bước {new_step}: {step_name}")
            return order

    def lookup_order(self, query: str) -> dict | None:
        """
        Tra cứu đơn hàng bằng:
        1. Số điện thoại (chuẩn hóa chỉ lấy các chữ số)
        2. Mã đơn hàng order_id (chứa hoặc khớp chính xác)
        """
        with self.lock:
            if not query:
                return None
            q_clean = query.strip()
            digits = "".join(c for c in q_clean if c.isdigit())

            for o in sorted(self.orders.values(), key=lambda x: x.get("created_at", ""), reverse=True):
                # Khớp mã đơn
                if q_clean.upper() in o.get("order_id", "").upper():
                    return o
                # Khớp số điện thoại
                phone = o.get("phone", "")
                phone_digits = "".join(c for c in phone if c.isdigit())
                if digits and len(digits) >= 9:
                    if digits in phone_digits or phone_digits in digits:
                        return o
            return None

    def update_order_full(self, order_id: str, updates: dict) -> dict | None:
        """
        Cập nhật toàn diện đơn hàng dành riêng cho người quản lý:
        - step (1 đến 4)
        - address
        - phone
        - customer_name
        - deposit_status
        - delivery_time
        - notes
        """
        with self.lock:
            if order_id not in self.orders:
                return None

            order = self.orders[order_id]
            now_dt = datetime.now()
            now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
            time_hm = now_dt.strftime("%H:%M")

            if "address" in updates and updates["address"]:
                order["address"] = str(updates["address"]).strip()
            if "phone" in updates and updates["phone"]:
                order["phone"] = str(updates["phone"]).strip()
            if "customer_name" in updates and updates["customer_name"]:
                order["customer_name"] = str(updates["customer_name"]).strip()
            if "deposit_status" in updates and updates["deposit_status"]:
                order["deposit_status"] = str(updates["deposit_status"]).strip()
            if "delivery_time" in updates and updates["delivery_time"]:
                order["delivery_time"] = str(updates["delivery_time"]).strip()
            if "notes" in updates and updates["notes"] is not None:
                order["notes"] = str(updates["notes"]).strip()

            if "step" in updates and updates["step"] is not None:
                new_step = max(1, min(4, int(updates["step"])))
                order["current_step"] = new_step
                for s in order["steps"]:
                    if s["step"] <= new_step:
                        s["done"] = True
                        if not s["timestamp"]:
                            s["timestamp"] = time_hm
                    else:
                        s["done"] = False
                        s["timestamp"] = None

            order["updated_at"] = now_str
            self._save_orders()
            print(f"📝 [OrderManager] Quản lý đã cập nhật đơn {order_id} thành công.")
            return order

    def get_all_orders(self) -> list:
        """Lấy danh sách tất cả các đơn hàng, sắp xếp mới nhất lên đầu"""
        with self.lock:
            orders_list = list(self.orders.values())
            orders_list.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return orders_list

# Instance dùng chung toàn hệ thống
order_manager = OrderManager()
