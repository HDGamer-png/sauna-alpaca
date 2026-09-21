"""
Bộ kiểm thử toàn diện cho Python AI Engine & Alert Dispatcher
Chạy bằng: python test_engine.py
"""

import os
import sys
import json

# Đảm bảo in tiếng Việt chuẩn trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from ai_engine import engine
from alert_service import alert_service, ALERTS_FILE
from nlp_utils import normalize_text, remove_accents, extract_phone_number

def run_tests():
    print("=" * 70)
    print("🧪 BẮT ĐẦU KIỂM THỬ HỆ THỐNG AI ENGINE & PHÁT TÍN HIỆU CẢNH BÁO")
    print("=" * 70)

    test_cases = [
        {
            "name": "TEST 1: Y khoa chuẩn (Bệnh thận & AVF - Tiếng Việt có dấu)",
            "input": "Hồng ngoại xa hỗ trợ gì cho bệnh nhân suy thận chạy thận nhân tạo?",
            "expected_intent": "benh_than_fir",
            "expect_escalated": False
        },
        {
            "name": "TEST 2: Tiếng Việt không dấu + tiếng lóng (ng già, k)",
            "input": "nhiet do xong hoi cho ng gia co an toan k shop oi",
            "expected_intent": "nguoi_cao_tuoi_nhiet_do",
            "expect_escalated": False
        },
        {
            "name": "TEST 3: Hỏi gói thuê và giá (không dấu + từ viết tắt bn)",
            "input": "goi thue o hue bn tien mot thang",
            "expected_intent": "goi_thue_hue",
            "expect_escalated": False
        },
        {
            "name": "TEST 4: Bắt số điện thoại (Lead Generation)",
            "input": "Tôi ở Vỹ Dạ - Huế, hãy gọi lại số 0905.123.456 để tư vấn nhé",
            "expected_intent": "lead_captured",
            "expect_escalated": True,
            "expected_alert": "LEAD_PHONE"
        },
        {
            "name": "TEST 5: Khách muốn mua / cọc máy gấp (Chốt đơn khẩn)",
            "input": "Cho mình xin số tài khoản để mình đặt cọc thuê máy 6 tháng luôn nhé",
            "expected_intent": "urgent_purchase",
            "expect_escalated": True,
            "expected_alert": "URGENT_PURCHASE"
        },
        {
            "name": "TEST 6: Yêu cầu gặp người thật / tư vấn viên",
            "input": "Cho tôi gặp người thật để nói chuyện trực tiếp chứ không nhắn với bot",
            "expected_intent": "human_request",
            "expect_escalated": True,
            "expected_alert": "HUMAN_REQUEST"
        },
        {
            "name": "TEST 7: Tình huống y tế đặc biệt (Đột quỵ, tai biến)",
            "input": "Bố tôi vừa bị tai biến đột quỵ cách đây 2 tuần thì có xông hơi được không?",
            "expected_intent": "medical_alert",
            "expect_escalated": True,
            "expected_alert": "MEDICAL_ALERT"
        },
        {
            "name": "TEST 8: Câu hỏi ngoài kịch bản (Fallback)",
            "input": "Shop có bán kèm máy lọc nước và xe đạp tập thể dục không?",
            "expected_intent": "fallback",
            "expect_escalated": True,
            "expected_alert": "UNRESOLVED_QUERY"
        }
    ]

    passed = 0
    for idx, tc in enumerate(test_cases, 1):
        print(f"\n--- {tc['name']} ---")
        print(f"📥 Input: \"{tc['input']}\"")
        res = engine.process_message(tc['input'])

        intent = res.get("intent")
        escalated = res.get("escalated")
        alert_type = res.get("alert_type")
        reply = res.get("reply", "")

        print(f"🎯 Intent: {intent} (Kỳ vọng: {tc['expected_intent']})")
        print(f"🚨 Escalated: {escalated} (Kỳ vọng: {tc['expect_escalated']})")
        if tc.get("expected_alert"):
            print(f"🔔 Alert Type: {alert_type} (Kỳ vọng: {tc['expected_alert']})")
        print(f"💬 Phản hồi: {reply[:100]}...")

        # Đánh giá
        is_intent_ok = (intent == tc["expected_intent"])
        is_escalated_ok = (escalated == tc["expect_escalated"])
        is_alert_ok = True
        if tc.get("expected_alert"):
            is_alert_ok = (alert_type == tc["expected_alert"])

        if is_intent_ok and is_escalated_ok and is_alert_ok:
            print("✅ KẾT QUẢ: ĐẠT (PASS)")
            passed += 1
        else:
            print("❌ KẾT QUẢ: CHƯA ĐẠT (FAIL)")

    print("\n" + "=" * 70)
    print(f"📊 TỔNG KẾT KIỂM THỬ: {passed}/{len(test_cases)} test cases ĐẠT!")

    # Kiểm tra file alerts.json
    if os.path.exists(ALERTS_FILE):
        with open(ALERTS_FILE, "r", encoding="utf-8") as f:
            alerts = json.load(f)
        print(f"📁 Kiểm tra file alerts.json: Hiện đang có {len(alerts)} tín hiệu khẩn cấp được lưu trữ.")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
