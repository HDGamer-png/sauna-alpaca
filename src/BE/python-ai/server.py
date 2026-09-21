"""
HTTP API Server cho Python AI Assistant & Seller Live Desk
Chạy độc lập trên máy (Localhost Port 8000).
100% sử dụng thư viện chuẩn Python (Zero API Key, Zero Database ngoài).
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import time
import urllib.parse
from ai_engine import engine
from alert_service import alert_service
from session_manager import session_manager
from order_manager import order_manager
from staff_manager import staff_manager

# Đảm bảo in tiếng Việt chuẩn trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

HOST = "127.0.0.1"
PORT = 8000

class AIChatHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        """Xử lý CORS preflight request từ trình duyệt hoặc Next.js"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data: dict | list, status_code: int = 200):
        """Hàm tiện ích gửi JSON UTF-8"""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        """
        Các endpoint GET:
        1. / hoặc /health: Kiểm tra trạng thái server
        2. /alerts: Xem danh sách tín hiệu khẩn cấp gần nhất
        3. /stop-alarm: Tắt chuông báo thức đang kêu
        4. /sessions: Lấy danh sách toàn bộ phiên chat (dành cho người bán)
        5. /session-detail?id=...: Xem chi tiết 1 phiên chat
        6. /customer-poll?id=...: Khách hàng kiểm tra tin nhắn mới từ chuyên viên
        """
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        if path in ["/", "/health"]:
            self._send_json({
                "status": "online",
                "service": "Sauna Alpaca Python AI Engine & Seller Live Desk",
                "version": "2.5.0",
                "features": [
                    "Zero API Key / 100% Pure Python Logic",
                    "Vietnamese NLP Normalization",
                    "Multi-tier Intent Engine",
                    "15s Alarm Clock Sound (winsound)",
                    "Seller Live Takeover Console",
                    "Real-time Session Management"
                ],
                "endpoints": {
                    "chat": "POST /chat",
                    "sessions": "GET /sessions",
                    "session_detail": "GET /session-detail?id=...",
                    "seller_reply": "POST /seller-reply",
                    "customer_poll": "GET /customer-poll?id=...",
                    "stop_alarm": "GET /stop-alarm",
                    "alerts": "GET /alerts"
                }
            })

        elif path.startswith("/alerts"):
            recent_alerts = alert_service.get_recent_alerts(limit=30)
            self._send_json({"alerts": recent_alerts, "total": len(recent_alerts)})

        elif path.startswith("/stop-alarm"):
            stopped = alert_service.stop_alarm()
            self._send_json({
                "status": "stopped" if stopped else "no_active_alarm",
                "message": "Đã tắt chuông báo thức thành công!" if stopped else "Không có chuông nào đang kêu."
            })

        elif path == "/sessions":
            # Dành cho Người bán: Lấy danh sách toàn bộ phiên trò chuyện
            sessions_list = session_manager.get_all_sessions()
            self._send_json({"sessions": sessions_list, "total": len(sessions_list)})

        elif path == "/orders":
            # Danh sách tất cả đơn hàng
            orders_list = order_manager.get_all_orders()
            self._send_json({"orders": orders_list, "total": len(orders_list)})

        elif path == "/order-by-session":
            # Lấy đơn hàng theo session_id
            session_id = query_params.get("session_id", [""])[0]
            order = order_manager.get_order_by_session(session_id)
            self._send_json({"order": order})

        elif path == "/lookup-order":
            # Khách hàng tra cứu đơn hàng bằng SĐT hoặc mã đơn
            q = query_params.get("q", [""])[0]
            order = order_manager.lookup_order(q)
            self._send_json({"found": bool(order), "order": order})

        elif path == "/session-detail":
            # Dành cho Người bán: Lấy chi tiết lịch sử tin nhắn của phiên kèm đơn hàng nếu có
            session_id = query_params.get("id", [""])[0]
            session = session_manager.get_session_detail(session_id, mark_as_read=True)
            if session:
                resp_data = dict(session)
                resp_data["order"] = order_manager.get_order_by_session(session_id)
                self._send_json(resp_data)
            else:
                self._send_json({"error": "Không tìm thấy session"}, 404)

        elif path == "/customer-poll":
            # Dành cho Khách hàng: Lấy tin nhắn cập nhật của phiên và tiến độ đơn hàng
            session_id = query_params.get("id", [""])[0]
            session = session_manager.get_session_detail(session_id, mark_as_read=False)
            if session:
                order = order_manager.get_order_by_session(session_id)
                self._send_json({
                    "id": session["id"],
                    "status": session["status"],
                    "messages": session["messages"],
                    "order": order
                })
        elif path == "/admin/staff":
            staff_list = staff_manager.get_all_staff()
            self._send_json({"staff": staff_list, "total": len(staff_list)})

        elif path == "/admin/shifts":
            shifts = staff_manager.get_shifts(limit=50)
            active_shifts = staff_manager.get_active_shifts()
            self._send_json({"shifts": shifts, "active_shifts": active_shifts, "total": len(shifts)})

        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """
        Các endpoint POST:
        1. /chat: Khách hàng gửi tin nhắn cho AI / Người bán
        2. /seller-reply: Người bán gửi tin nhắn trực tiếp cho khách
        3. /session-status: Cập nhật trạng thái phiên (resolved, human_taken)
        4. /stop-alarm: Tắt chuông báo thức
        """
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            payload = json.loads(raw_body) if raw_body else {}
        except Exception:
            payload = {}

        if path.startswith("/stop-alarm"):
            stopped = alert_service.stop_alarm()
            self._send_json({
                "status": "stopped" if stopped else "no_active_alarm",
                "message": "Đã tắt chuông báo thức thành công!" if stopped else "Không có chuông nào đang kêu."
            })
            return

        if path == "/seller-reply":
            # Người bán gửi tin nhắn phản hồi tới khách
            session_id = payload.get("session_id", "")
            text = payload.get("text", "").strip()
            seller_name = payload.get("seller_name", "Chuyên viên tư vấn Sauna Alpaca")
            seller_id = payload.get("seller_id", "")

            if not session_id or not text:
                self._send_json({"error": "Thiếu session_id hoặc text"}, 400)
                return

            # Tự động tắt chuông nếu đang kêu khi người bán bắt đầu trả lời
            alert_service.stop_alarm()

            # Ghi nhận số tin nhắn tư vấn của nhân viên trong ca trực hiện tại
            if seller_id:
                staff_manager.record_staff_reply(seller_id)

            msg = session_manager.record_seller_reply(session_id, text, seller_name)
            print(f"👨‍💼 [{seller_name.upper()} PHẢN HỒI]: ({session_id}) -> \"{text}\"")
            self._send_json({"success": True, "message": msg})
            return

        if path == "/admin/login":
            username = payload.get("username", "").strip()
            password = payload.get("password", "").strip()
            user = staff_manager.authenticate(username, password)
            if not user:
                self._send_json({"error": "Tên đăng nhập hoặc mật khẩu không chính xác!"}, 401)
                return

            shift = None
            if user.get("role") == "staff":
                shift = staff_manager.start_shift(user["id"])

            self._send_json({
                "success": True,
                "user": user,
                "shift": shift,
                "message": f"Xin chào {user.get('display_name')}!"
            })
            return

        if path == "/admin/logout":
            shift_id = payload.get("shift_id")
            staff_id = payload.get("staff_id")
            ended_shift = staff_manager.end_shift(shift_id=shift_id, staff_id=staff_id)
            self._send_json({
                "success": True,
                "shift": ended_shift,
                "message": "Đã kết thúc ca trực và đăng xuất an toàn."
            })
            return

        if path == "/admin/staff":
            # Chủ tạo mới tài khoản nhân viên
            success, res = staff_manager.create_staff(payload)
            if success:
                self._send_json({"success": True, "staff": res})
            else:
                self._send_json({"error": str(res)}, 400)
            return

        if path == "/admin/staff/update":
            # Chủ cập nhật tài khoản nhân viên
            staff_id = payload.get("id", "")
            success, res = staff_manager.update_staff(staff_id, payload)
            if success:
                self._send_json({"success": True, "staff": res})
            else:
                self._send_json({"error": str(res)}, 400)
            return

        if path == "/admin/staff/delete":
            # Chủ xóa tài khoản nhân viên
            staff_id = payload.get("id", "")
            success, res = staff_manager.delete_staff(staff_id)
            if success:
                self._send_json({"success": True, "message": res})
            else:
                self._send_json({"error": str(res)}, 400)
            return

        if path == "/admin/shifts/force-end":
            # Chủ cưỡng chế kết thúc ca trực
            shift_id = payload.get("shift_id", "")
            success, res = staff_manager.force_end_shift(shift_id)
            if success:
                self._send_json({"success": True, "message": res})
            else:
                self._send_json({"error": str(res)}, 400)
            return

        if path == "/session-status":
            session_id = payload.get("session_id", "")
            new_status = payload.get("status", "resolved")
            ok = session_manager.update_session_status(session_id, new_status)
            self._send_json({"success": ok})
            return

        if path == "/customer-auth":
            phone = payload.get("phone", "").strip()
            name = payload.get("name", "").strip()
            concern = payload.get("concern", "").strip()
            session_id = payload.get("session_id", "").strip()
            captcha = payload.get("captcha", "").strip()

            if not phone:
                self._send_json({"error": "Vui lòng nhập số điện thoại"}, 400)
                return

            if not session_id:
                session_id = f"cust_{int(time.time() * 1000)}"

            # Lấy hoặc tạo session cho khách
            sess = session_manager.get_or_create_session(session_id, initial_phone=phone)
            sess["phone"] = phone
            if name:
                sess["customer_name"] = name
            if concern:
                sess["health_concern"] = concern
            session_manager._save_sessions()

            lead_desc = f"Khách hàng {name or 'mới'} ({phone}) đăng ký tư vấn [Chính sách 0Đ]. Nhu cầu: {concern or 'Tìm hiểu xông hơi hồng ngoại xa'}"

            # Ghi nhận thông điệp tiếp nhận vào lịch sử chat
            system_chat_msg = (
                f"🌿 TIẾP NHẬN ĐĂNG KÝ TƯ VẤN [VỐN 0Đ]\n"
                f"• Họ tên: {name or 'Chưa cung cấp'}\n"
                f"• Số điện thoại: {phone}\n"
                f"• Nhu cầu hỗ trợ: {concern or 'Tư vấn phác đồ và trải nghiệm 0Đ'}\n"
                f"• Trạng thái: Đã kết nối chuyên viên trực tiếp (Đã xác thực Captcha: {captcha or 'Hợp lệ'})"
            )
            session_manager.record_user_message(session_id, system_chat_msg)

            # Phát tín hiệu chuông/alert thông báo cho chuyên viên
            alert_service.dispatch(
                alert_type="LEAD_PHONE",
                priority="urgent",
                message=lead_desc,
                phone=phone,
                metadata={"name": name, "concern": concern, "session_id": session_id, "captcha": captcha}
            )

            # Tra cứu xem SĐT này đã có đơn hàng nào trước đây chưa
            existing_order = order_manager.lookup_order(phone)

            print(f"🌿 [ĐĂNG KÝ SĐT THÀNH CÔNG (Captcha: {captcha or 'OK'})]: {phone} - {name} ({concern})")

            self._send_json({
                "success": True,
                "customer": {
                    "phone": phone,
                    "name": name,
                    "concern": concern
                },
                "session_id": session_id,
                "existing_order": existing_order,
                "message": "Tiếp nhận thông tin thành công!"
            })
            return

        if path == "/create-order":
            session_id = payload.get("session_id", "")
            customer_name = payload.get("customer_name", "")
            phone = payload.get("phone", "")
            address = payload.get("address", "")
            order_type = payload.get("order_type", "rent_6m")
            package_name = payload.get("package_name", "Gói thuê 6 tháng")
            price_text = payload.get("price_text", "950.000 đ/tháng")
            deposit_status = payload.get("deposit_status", "Chưa thanh toán (Thu khi giao)")
            delivery_time = payload.get("delivery_time", "Giao trong ngày tại TP. Huế")
            notes = payload.get("notes", "")

            if not session_id:
                session_id = f"direct_{int(time.time() * 1000)}"

            order = order_manager.create_order(
                session_id=session_id,
                customer_name=customer_name,
                phone=phone,
                address=address,
                order_type=order_type,
                package_name=package_name,
                price_text=price_text,
                deposit_status=deposit_status,
                delivery_time=delivery_time,
                notes=notes
            )

            # Cập nhật số điện thoại vào session nếu có
            if phone:
                sess = session_manager.get_session_detail(session_id, mark_as_read=False)
                if sess and not sess.get("phone"):
                    sess["phone"] = phone
                    session_manager._save_sessions()

            # Gửi thông báo đơn hàng vào khung chat cho khách thấy
            order_announcement = (
                f"📦 ĐÃ XÁC NHẬN ĐƠN HÀNG [{order['order_id']}]\n\n"
                f"• Gói: {package_name}\n"
                f"• Chi phí: {price_text}\n"
                f"• Giao tận nơi: {address}\n"
                f"• Dự kiến: {delivery_time}\n"
                f"• Thanh toán: {deposit_status}\n\n"
                f"🌿 Đơn hàng đã được đưa vào lịch điều phối giao xe. Kỹ thuật viên sẽ liên hệ và giao lắp hoàn thiện tận nhà cho quý khách tại TP. Huế!"
            )
            session_manager.record_seller_reply(session_id, order_announcement, "Hệ Thống Đơn Hàng Sauna Alpaca")

            self._send_json({"success": True, "order": order})
            return

        if path == "/update-order-step":
            order_id = payload.get("order_id", "")
            step = payload.get("step", 1)
            note = payload.get("note", "")

            if not order_id:
                self._send_json({"error": "Thiếu order_id"}, 400)
                return

            updated_order = order_manager.update_order_step(order_id, step, note)
            if not updated_order:
                self._send_json({"error": "Không tìm thấy order_id"}, 404)
                return

            step_titles = {
                1: "Tiếp nhận đơn hàng thành công",
                2: "Đang khử khuẩn ozone & kiểm tra kỹ thuật buồng xông",
                3: "Kỹ thuật viên đang giao xe tận nhà tại TP. Huế",
                4: "Đã hoàn tất lắp đặt & bàn giao hướng dẫn sử dụng"
            }
            step_name = step_titles.get(int(step), f"Bước {step}")

            # Đẩy thông báo tiến độ vào chat của khách
            if updated_order.get("session_id"):
                step_msg = f"🚚 CẬP NHẬT TIẾN ĐỘ GIAO HÀNG [{updated_order['order_id']}]:\n➔ Bước {step}/4: {step_name}"
                if note:
                    step_msg += f"\n(Ghi chú: {note})"
                session_manager.record_seller_reply(updated_order["session_id"], step_msg, "Điều Phối Giao Hàng Sauna Alpaca")

            self._send_json({"success": True, "order": updated_order})
            return

        if path == "/update-order-full":
            order_id = payload.get("order_id", "")
            if not order_id:
                self._send_json({"error": "Thiếu order_id"}, 400)
                return

            updated_order = order_manager.update_order_full(order_id, payload)
            if not updated_order:
                self._send_json({"error": "Không tìm thấy order_id"}, 404)
                return

            # Nếu người quản lý đổi bước, đẩy thông báo vào chat của khách
            if "step" in payload and updated_order.get("session_id"):
                step_val = int(payload["step"])
                step_titles = {
                    1: "Tiếp nhận đơn hàng",
                    2: "Đang khử khuẩn ozone & kiểm tra kỹ thuật máy",
                    3: "Kỹ thuật viên đang giao xe tận nhà tại TP. Huế",
                    4: "Đã hoàn tất lắp đặt & bàn giao hướng dẫn sử dụng"
                }
                step_msg = f"🚚 ĐIỀU PHỐI CẬP NHẬT TIẾN ĐỘ [{updated_order['order_id']}]:\n➔ Bước {step_val}/4: {step_titles.get(step_val, '')}"
                notes = payload.get("notes")
                if notes:
                    step_msg += f"\n(Ghi chú: {notes})"
                session_manager.record_seller_reply(updated_order["session_id"], step_msg, "Điều Phối Giao Hàng Sauna Alpaca")

            self._send_json({"success": True, "order": updated_order})
            return

        if path == "/chat":
            user_message = payload.get("message", "")
            history = payload.get("history", [])
            session_id = payload.get("session_id", "")
            customer_phone = payload.get("customer_phone", "")
            customer_name = payload.get("customer_name", "")

            # Đảm bảo có session
            sess = session_manager.get_or_create_session(session_id, initial_phone=customer_phone)
            actual_session_id = sess["id"]

            if customer_phone and not sess.get("phone"):
                sess["phone"] = customer_phone
            if customer_name and (not sess.get("customer_name") or sess.get("customer_name").startswith("Khách hàng #")):
                sess["customer_name"] = customer_name
            session_manager._save_sessions()

            print(f"📩 [NHẬN CÂU HỎI]: ({actual_session_id} - {sess.get('customer_name', '')} {sess.get('phone', '')}) \"{user_message}\"")

            # Gọi AI Engine xử lý logic độc lập
            result = engine.process_message(user_message, history)
            result["session_id"] = actual_session_id

            escalated = result.get("escalated", False)
            alert_type = result.get("alert_type")
            phone = result.get("phone")

            # Lưu vào session
            session_manager.record_user_message(
                session_id=actual_session_id,
                text=user_message,
                phone=phone,
                escalated=escalated,
                alert_type=alert_type
            )
            session_manager.record_bot_reply(
                session_id=actual_session_id,
                reply=result.get("reply", ""),
                escalated=escalated,
                alert_type=alert_type
            )

            escalated_flag = "🚨 [CẦN CAN THIỆP]" if escalated else "✅ [TỰ ĐỘNG]"
            intent_info = result.get("intent", "unknown")
            print(f"🤖 [TRẢ LỜI] {escalated_flag} ({intent_info}): {result.get('reply')[:70]}...\n")

            self._send_json(result)
            return

        self.send_response(404)
        self.end_headers()

def run():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, AIChatHandler)
    print("=" * 70)
    print("🌿 SAUNA ALPACA — PYTHON AI ENGINE & SELLER LIVE DESK (100% PURE LOGIC)")
    print(f"🚀 Server đang lắng nghe tại: http://{HOST}:{PORT}")
    print(f"📡 Endpoint Khách hàng: POST http://{HOST}:{PORT}/chat")
    print(f"👨‍💼 Endpoint Người bán:   GET  http://{HOST}:{PORT}/sessions")
    print(f"💬 Endpoint Trả lời:    POST http://{HOST}:{PORT}/seller-reply")
    print("🔔 Chuông báo thức:     15 giây (Winsound Beep non-blocking)")
    print("✨ ZERO API Key — Không dùng OpenAI, Gemini hay dịch vụ đám mây")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Đang dừng server Python...")
        httpd.server_close()

if __name__ == "__main__":
    run()
