"""
Session Manager — Quản lý phiên hội thoại và tin nhắn 100% bằng logic Python nội bộ
Lưu trữ phiên vào sessions.json (Zero API Key, Zero Database ngoài)
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
SESSIONS_FILE = os.path.join(BASE_DIR, "sessions.json")

class SessionManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.sessions = self._load_sessions()

    def _load_sessions(self) -> dict:
        """Tải toàn bộ phiên từ sessions.json"""
        if os.path.exists(SESSIONS_FILE):
            try:
                with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ [SessionManager] Lỗi đọc {SESSIONS_FILE}, khởi tạo mới: {e}")
        return {}

    def _save_sessions(self):
        """Lưu toàn bộ phiên vào sessions.json (an toàn thread-safe)"""
        try:
            with open(SESSIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.sessions, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ [SessionManager] Lỗi lưu sessions.json: {e}")

    def get_or_create_session(self, session_id: str, initial_phone: str = None) -> dict:
        """Lấy phiên hiện tại hoặc khởi tạo phiên mới cho khách hàng"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            if not session_id or session_id not in self.sessions:
                actual_id = session_id or f"sess_{int(time.time() * 1000)}"
                # Rút ngắn id làm tên hiển thị
                short_id = actual_id.split('_')[-1][-4:]
                self.sessions[actual_id] = {
                    "id": actual_id,
                    "customer_name": f"Khách hàng #{short_id}",
                    "phone": initial_phone,
                    "status": "bot",  # "bot", "needs_human", "human_taken", "resolved"
                    "alert_type": None,
                    "created_at": now_str,
                    "last_activity": now_str,
                    "unread_for_seller": False,
                    "messages": [
                        {
                            "id": f"msg_welcome_{int(time.time())}",
                            "sender": "bot",
                            "text": "Xin chào! Tôi là Trợ lý Sức Khỏe AI của Sauna Alpaca 🌿. Tôi có thể hỗ trợ giải đáp gì cho bạn?",
                            "timestamp": datetime.now().strftime("%H:%M")
                        }
                    ]
                }
                self._save_sessions()
                return self.sessions[actual_id]

            # Cập nhật số điện thoại nếu phát hiện mới
            if initial_phone and not self.sessions[session_id].get("phone"):
                self.sessions[session_id]["phone"] = initial_phone
                self._save_sessions()

            return self.sessions[session_id]

    def record_user_message(self, session_id: str, text: str, phone: str = None, escalated: bool = False, alert_type: str = None):
        """Ghi nhận tin nhắn khách hàng gửi"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            time_hm = datetime.now().strftime("%H:%M")

            if session_id not in self.sessions:
                self.sessions[session_id] = {
                    "id": session_id,
                    "customer_name": f"Khách hàng #{session_id[-4:]}",
                    "phone": phone,
                    "status": "bot",
                    "alert_type": None,
                    "created_at": now_str,
                    "last_activity": now_str,
                    "unread_for_seller": False,
                    "messages": []
                }

            session = self.sessions[session_id]
            session["last_activity"] = now_str
            session["unread_for_seller"] = True

            if phone:
                session["phone"] = phone

            if escalated:
                session["status"] = "needs_human"
                session["alert_type"] = alert_type

            session["messages"].append({
                "id": f"msg_user_{int(time.time() * 1000)}",
                "sender": "user",
                "text": text,
                "timestamp": time_hm
            })

            self._save_sessions()

    def record_bot_reply(self, session_id: str, reply: str, escalated: bool = False, alert_type: str = None):
        """Ghi nhận câu trả lời của bot vào phiên"""
        with self.lock:
            if session_id in self.sessions:
                time_hm = datetime.now().strftime("%H:%M")
                session = self.sessions[session_id]
                session["messages"].append({
                    "id": f"msg_bot_{int(time.time() * 1000)}",
                    "sender": "bot",
                    "text": reply,
                    "timestamp": time_hm,
                    "escalated": escalated,
                    "alert_type": alert_type
                })
                self._save_sessions()

    def record_seller_reply(self, session_id: str, text: str, seller_name: str = "Chuyên viên tư vấn") -> dict:
        """Ghi nhận tin nhắn chuyên viên (người bán) gõ trả lời trực tiếp cho khách"""
        with self.lock:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            time_hm = datetime.now().strftime("%H:%M")

            if session_id not in self.sessions:
                return {"error": "Session không tồn tại"}

            session = self.sessions[session_id]
            session["status"] = "human_taken"
            session["last_activity"] = now_str
            session["unread_for_seller"] = False

            new_msg = {
                "id": f"msg_seller_{int(time.time() * 1000)}",
                "sender": "seller",
                "seller_name": seller_name,
                "text": text,
                "timestamp": time_hm
            }
            session["messages"].append(new_msg)
            self._save_sessions()
            return new_msg

    def get_all_sessions(self) -> list:
        """Lấy danh sách tất cả các phiên, sắp xếp phiên mới nhất hoặc cần hỗ trợ lên đầu"""
        with self.lock:
            sessions_list = list(self.sessions.values())
            # Ưu tiên needs_human lên trước, sau đó sắp theo last_activity giảm dần
            def _sort_key(s):
                priority = 0
                if s.get("status") == "needs_human":
                    priority = 2
                elif s.get("unread_for_seller"):
                    priority = 1
                return (priority, s.get("last_activity", ""))

            sessions_list.sort(key=_sort_key, reverse=True)
            return sessions_list

    def get_session_detail(self, session_id: str, mark_as_read: bool = True) -> dict:
        """Lấy toàn bộ tin nhắn của 1 phiên và đánh dấu người bán đã xem"""
        with self.lock:
            if session_id not in self.sessions:
                return None
            session = self.sessions[session_id]
            if mark_as_read:
                session["unread_for_seller"] = False
                self._save_sessions()
            return session

    def update_session_status(self, session_id: str, new_status: str) -> bool:
        """Cập nhật trạng thái phiên (needs_human, human_taken, resolved)"""
        with self.lock:
            if session_id in self.sessions:
                self.sessions[session_id]["status"] = new_status
                self._save_sessions()
                return True
        return False

# Instance dùng chung toàn hệ thống
session_manager = SessionManager()
