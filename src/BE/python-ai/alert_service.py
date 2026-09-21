"""
Alert Service — Dịch vụ phát tín hiệu cảnh báo đa kênh thời gian thực cho người bán
Hỗ trợ:
1. Âm thanh chuông báo động trên Windows (winsound.Beep / console bell)
2. Khung viền cảnh báo nổi bật trên Terminal console
3. Lưu trữ hồ sơ tín hiệu khẩn cấp vào alerts.json
4. Bắn tin nhắn rung chuông về điện thoại qua Telegram Bot (0Đ chi phí)
"""

import os
import sys
import json
import time
import threading
from datetime import datetime
import urllib.request
import urllib.parse

# Đảm bảo UTF-8 trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(__file__)
CONFIG_FILE = os.path.join(BASE_DIR, "alert_config.json")
ALERTS_FILE = os.path.join(BASE_DIR, "alerts.json")

# Danh mục phân loại tín hiệu ưu tiên
ALERT_TYPES = {
    "LEAD_PHONE": {
        "title": "KHÁCH ĐỂ LẠI SỐ ĐIỆN THOẠI (LEAD MỚI)",
        "icon": "📞",
        "badge": "LEAD MỚI",
        "action": "Gọi điện / nhắn Zalo tư vấn và chốt lịch khảo sát tận nhà tại Huế."
    },
    "URGENT_PURCHASE": {
        "title": "KHÁCH MUỐN ĐẶT MUA / THUÊ / CỌC TIỀN NGAY",
        "icon": "💰",
        "badge": "CHỐT ĐƠN KHẨN",
        "action": "Chủ động nhắn tin / gọi điện ngay để gửi thông tin cọc và xếp lịch giao máy."
    },
    "HUMAN_REQUEST": {
        "title": "KHÁCH YÊU CẦU GẶP TRỰC TIẾP TƯ VẤN VIÊN",
        "icon": "🙋",
        "badge": "CẦN HỖ TRỢ",
        "action": "Tiếp quản cuộc trò chuyện, hỗ trợ giải đáp trực tiếp cho khách hàng."
    },
    "MEDICAL_ALERT": {
        "title": "TÌNH HUỐNG Y TẾ ĐẶC BIỆT / BỆNH LÝ NHẠY CẢM",
        "icon": "🩺",
        "badge": "LƯU Ý Y TẾ",
        "action": "Tư vấn kỹ lưỡng, nhắc khách tham khảo ý kiến bác sĩ điều trị trước khi dùng."
    },
    "UNRESOLVED_QUERY": {
        "title": "CÂU HỎI NGOÀI KỊCH BẢN (KHÁCH CẦN THÊM THÔNG TIN)",
        "icon": "❓",
        "badge": "CHƯA RÕ Ý ĐỊNH",
        "action": "Kiểm tra nội dung câu hỏi để bổ sung kiến thức hoặc chủ động hỗ trợ."
    }
}

class AlertManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.config = self.load_config()
        self.current_alarm_event = None

    def load_config(self) -> dict:
        """Tải cấu hình từ alert_config.json"""
        defaults = {
            "sound_enabled": True,
            "sound_type": "alarm_clock",
            "sound_duration_sec": 15,
            "alarm_frequency": 2200,
            "console_banner": True,
            "telegram": {
                "enabled": False,
                "bot_token": "",
                "chat_id": ""
            },
            "max_alerts_stored": 200
        }
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    defaults.update(data)
            except Exception as e:
                print(f"⚠️ [AlertManager] Không thể đọc {CONFIG_FILE}, dùng cấu hình mặc định: {e}")
        return defaults

    def stop_alarm(self) -> bool:
        """Tắt chuông báo thức đang kêu ngay lập tức"""
        with self.lock:
            if self.current_alarm_event and not self.current_alarm_event.is_set():
                self.current_alarm_event.set()
                print("🔕 [AlertManager] Đã ngắt chuông báo thức theo lệnh người bán!")
                return True
        return False

    def play_alert_sound(self):
        """
        Phát âm thanh chuông báo thức kéo dài 15 giây trên Windows trong luồng nền (non-blocking).
        Mô phỏng nhịp chuông đồng hồ báo thức dồn dập (tít-tít-tít-tít... nghỉ... lặp lại liên tục trong 15s).
        """
        cfg = self.load_config()
        if not cfg.get("sound_enabled", True):
            return

        # Dừng chuông cũ nếu đang kêu dở
        self.stop_alarm()

        stop_event = threading.Event()
        with self.lock:
            self.current_alarm_event = stop_event

        def _play():
            duration_sec = cfg.get("sound_duration_sec", 15)
            freq = cfg.get("alarm_frequency", 2200)
            start_time = time.time()

            try:
                import winsound
                while (time.time() - start_time) < duration_sec:
                    if stop_event.is_set():
                        break

                    # 4 tiếng bíp dồn dập chuẩn đồng hồ báo thức điện tử (tít-tít-tít-tít)
                    for _ in range(4):
                        if stop_event.is_set():
                            break
                        winsound.Beep(freq, 70)
                        time.sleep(0.04)

                    # Khoảng nghỉ ngắn giữa các nhịp báo thức (~0.5s)
                    for _ in range(5):
                        if stop_event.is_set():
                            break
                        time.sleep(0.1)

            except Exception:
                # Fallback chuông console nếu winsound không hỗ trợ
                try:
                    while (time.time() - start_time) < duration_sec and not stop_event.is_set():
                        for _ in range(4):
                            sys.stdout.write('\a')
                            sys.stdout.flush()
                            time.sleep(0.08)
                        time.sleep(0.5)
                except Exception:
                    pass

        threading.Thread(target=_play, daemon=True).start()

    def print_console_banner(self, alert: dict):
        """In khung viền cảnh báo nổi bật trên Terminal của người bán"""
        if not self.config.get("console_banner", True):
            return

        alert_info = ALERT_TYPES.get(alert["type"], {
            "title": "TÍN HIỆU CẦN CHÚ Ý",
            "icon": "⚠️",
            "badge": "CHÚ Ý",
            "action": "Kiểm tra tin nhắn của khách hàng."
        })

        border = "=" * 70
        print("\n" + border)
        print(f"🚨 [SAUNA ALPACA - TÍN HIỆU NGƯỜI BÁN] {alert_info['icon']} {alert_info['title']}")
        print(f"⏰ Thời gian: {alert['timestamp']} | Mức độ: [{alert['priority'].upper()}]")
        print(f"🔔 CHUÔNG BÁO THỨC ĐANG ĐỔ (15 GIÂY) — Tắt sớm tại: http://127.0.0.1:8000/stop-alarm")
        if alert.get("phone"):
            print(f"📞 SỐ ĐIỆN THOẠI KHÁCH: >>> {alert['phone']} <<<")
        print(f"💬 Khách gửi: \"{alert['message']}\"")
        print(f"👉 Hành động đề xuất: {alert_info['action']}")
        print(border + "\n")

    def send_telegram_notification(self, alert: dict):
        """Gửi thông báo rung chuông về điện thoại qua Telegram Bot (miễn phí)"""
        tg_cfg = self.config.get("telegram", {})
        if not tg_cfg.get("enabled", False):
            return

        bot_token = tg_cfg.get("bot_token", "").strip()
        chat_id = tg_cfg.get("chat_id", "").strip()

        if not bot_token or not chat_id:
            return

        def _send():
            try:
                alert_info = ALERT_TYPES.get(alert["type"], {"title": "TÍN HIỆU MỚI", "icon": "⚠️", "action": ""})
                text = (
                    f"🚨 *[SAUNA ALPACA - CẢNH BÁO TÍN HIỆU]* 🚨\n\n"
                    f"{alert_info['icon']} *Loại:* {alert_info['title']}\n"
                    f"⚡ *Mức độ:* `{alert['priority']}`\n"
                    f"⏰ *Thời gian:* `{alert['timestamp']}`\n"
                )
                if alert.get("phone"):
                    text += f"📞 *Số điện thoại:* `{alert['phone']}`\n"
                text += (
                    f"💬 *Nội dung:* _{alert['message']}_\n\n"
                    f"👉 *Đề xuất:* {alert_info['action']}\n"
                    f"📍 *Hotline hỗ trợ:* `0385.927.274`"
                )

                url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                payload = {
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "Markdown"
                }
                data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        print("📲 [TELEGRAM] Đã gửi thông báo về điện thoại thành công!")
            except Exception as e:
                print(f"⚠️ [TELEGRAM ERROR]: Không thể gửi cảnh báo qua Telegram: {e}")

        threading.Thread(target=_send, daemon=True).start()

    def record_alert(self, alert: dict):
        """Ghi nhận tín hiệu vào file alerts.json an toàn (thread-safe)"""
        with self.lock:
            alerts = []
            if os.path.exists(ALERTS_FILE):
                try:
                    with open(ALERTS_FILE, "r", encoding="utf-8") as f:
                        alerts = json.load(f)
                except Exception:
                    alerts = []

            alerts.insert(0, alert)  # Đưa tin nhắn mới nhất lên đầu danh sách

            # Giới hạn số lượng bản ghi lưu trữ
            max_records = self.config.get("max_alerts_stored", 200)
            if len(alerts) > max_records:
                alerts = alerts[:max_records]

            try:
                with open(ALERTS_FILE, "w", encoding="utf-8") as f:
                    json.dump(alerts, f, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f"❌ [AlertManager] Lỗi ghi alerts.json: {e}")

    def get_recent_alerts(self, limit: int = 20) -> list:
        """Đọc danh sách các tín hiệu gần đây"""
        with self.lock:
            if not os.path.exists(ALERTS_FILE):
                return []
            try:
                with open(ALERTS_FILE, "r", encoding="utf-8") as f:
                    alerts = json.load(f)
                return alerts[:limit]
            except Exception:
                return []

    def dispatch(self, alert_type: str, priority: str, message: str, phone: str = None, metadata: dict = None) -> dict:
        """
        Hàm trung tâm phát tín hiệu:
        Kích hoạt đồng thời Âm thanh + Console + File Log + Telegram
        """
        alert_record = {
            "id": f"alert_{int(time.time() * 1000)}",
            "type": alert_type,
            "priority": priority,  # "high", "urgent", "medium"
            "message": message,
            "phone": phone,
            "metadata": metadata or {},
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "pending"
        }

        # 1. Phát chuông âm thanh trên Windows
        self.play_alert_sound()

        # 2. In khung viền nổi bật ra Terminal
        self.print_console_banner(alert_record)

        # 3. Ghi vào file alerts.json
        self.record_alert(alert_record)

        # 4. Gửi về điện thoại qua Telegram Bot (nếu có cấu hình)
        self.send_telegram_notification(alert_record)

        return alert_record

# Khởi tạo instance dùng chung
alert_service = AlertManager()
