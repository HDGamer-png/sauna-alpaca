"""
AI Engine — Bộ não xử lý ngôn ngữ tự nhiên (NLP) đa tầng bằng Python độc lập
Tích hợp:
1. Chuẩn hóa tiếng Việt (có dấu, không dấu, từ viết tắt, tiếng lóng)
2. Bộ so khớp tri thức chuyên sâu 12+ chủ đề
3. Nhận diện các "Trường hợp cao hơn" (Escalation) và tự động phát tín hiệu cho người bán
"""

import re
import json
import os
import sys
from datetime import datetime

# Đảm bảo in tiếng Việt chuẩn trên Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from knowledge import KNOWLEDGE_DATA
from nlp_utils import normalize_text, remove_accents, extract_phone_number
from alert_service import alert_service

BASE_DIR = os.path.dirname(__file__)
LEADS_FILE = os.path.join(BASE_DIR, "leads.json")

class SaunaAIEngine:
    def __init__(self):
        self.knowledge = KNOWLEDGE_DATA
        self._prepare_knowledge()

    def _prepare_knowledge(self):
        """Tiền xử lý kho tri thức để tăng tốc độ đối soát từ khóa"""
        for item in self.knowledge:
            norm_kws = []
            unacc_kws = []
            for kw in item["keywords"]:
                norm_kw = normalize_text(kw)
                unacc_kw = remove_accents(norm_kw)
                norm_kws.append(norm_kw)
                unacc_kws.append(unacc_kw)
            item["_norm_keywords"] = norm_kws
            item["_unacc_keywords"] = unacc_kws

    def save_lead(self, phone: str, message: str) -> dict:
        """Lưu trữ số điện thoại khách hàng vào leads.json"""
        leads = []
        if os.path.exists(LEADS_FILE):
            try:
                with open(LEADS_FILE, "r", encoding="utf-8") as f:
                    leads = json.load(f)
            except Exception:
                leads = []

        new_lead = {
            "phone": phone,
            "message": message,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        leads.insert(0, new_lead)

        try:
            with open(LEADS_FILE, "w", encoding="utf-8") as f:
                json.dump(leads, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ Lỗi ghi file leads.json: {e}")

        return new_lead

    def score_match(self, norm_text: str, unacc_text: str, item: dict) -> float:
        """
        Tính điểm tương đồng giữa câu nói của khách và chủ đề tri thức:
        - So khớp chuẩn theo ranh giới từ (padded với khoảng trắng)
        - Cụm nhiều từ có trọng số hàm mũ để ưu tiên độ đặc hiệu cao
        """
        padded_norm = f" {norm_text} "
        padded_unacc = f" {unacc_text} "
        score = 0.0

        for norm_kw in item["_norm_keywords"]:
            if norm_kw and f" {norm_kw} " in padded_norm:
                num_words = len(norm_kw.split())
                score += (num_words ** 1.3) * 3.0

        for unacc_kw in item["_unacc_keywords"]:
            if unacc_kw and f" {unacc_kw} " in padded_unacc:
                num_words = len(unacc_kw.split())
                score += (num_words ** 1.3) * 2.0

        return score

    def check_purchase_intent(self, norm_text: str, unacc_text: str) -> bool:
        """Nhận diện ý định mua hàng / thuê máy / chuyển khoản / chốt đơn gấp"""
        purchase_triggers = [
            "mua ngay", "dat mua", "thue ngay", "dat thue", "chot don", 
            "chuyen khoan", "so tai khoan", "stk", "dat coc", "coc tien", 
            "gui stk", "mai giao", "ship cho toi", "giao cho minh", 
            "lay mot may", "lay 1 may", "cho minh 1 may", "cho toi thue", 
            "gui tai khoan", "so tien coc", "tien coc bao nhieu"
        ]
        return any(trig in unacc_text for trig in purchase_triggers)

    def check_human_request(self, norm_text: str, unacc_text: str) -> bool:
        """Nhận diện yêu cầu gặp người thật / tư vấn viên trực tiếp"""
        human_triggers = [
            "gap nguoi that", "gap nhan vien", "chuyen may", "tu van truc tiep", 
            "goi cho toi", "nguoi ho tro", "noi chuyen voi nguoi", "bot a", 
            "co ai truc khong", "nhan vien dau", "gap chu shop", "gap ky thuat", 
            "khieu nai", "nguoi that dau", "can nguoi tu van"
        ]
        return any(trig in unacc_text for trig in human_triggers)

    def check_medical_caution(self, norm_text: str, unacc_text: str) -> bool:
        """Nhận diện tình huống y tế đặc biệt / bệnh nhân nhạy cảm cần bác sĩ"""
        medical_triggers = [
            "dot quy", "tai bien", "sot cao", "ung thu", "vua mo", 
            "phau thuat tim", "may tao nhip", "suy tim nang", "bang huyet", 
            "nguy kich", "cap cuu", "tai bien mach mau", "chay mau"
        ]
        return any(trig in unacc_text for trig in medical_triggers)

    def process_message(self, user_text: str, history: list = None) -> dict:
        """
        Bộ xử lý chính đa tầng:
        Tầng 1: Kiểm tra đầu vào rỗng
        Tầng 2: Bắt số điện thoại (Lead Generation) -> Phát tín hiệu khẩn cấp
        Tầng 3: Nhận diện ý định chốt đơn / mua / thuê gấp -> Phát tín hiệu khẩn cấp
        Tầng 4: Nhận diện yêu cầu gặp người thật -> Phát tín hiệu khẩn cấp
        Tầng 5: Nhận diện cảnh báo y tế đặc biệt -> Phát tín hiệu khẩn cấp
        Tầng 6: Chào hỏi xã giao
        Tầng 7: So khớp kho tri thức cài sẵn (12+ chủ đề)
        Tầng 8: Phản hồi dự phòng thông minh (Fallback)
        """
        clean_text = user_text.strip()
        if not clean_text:
            return {
                "reply": "Xin chào! Tôi là Trợ lý AI của Sauna Alpaca 🌿. Tôi có thể hỗ trợ giải đáp gì cho bạn về máy xông hơi hồng ngoại?",
                "intent": "empty",
                "escalated": False
            }

        # Chuẩn hóa văn bản tiếng Việt
        norm_text = normalize_text(clean_text)
        unacc_text = remove_accents(norm_text)

        # -------------------------------------------------------------
        # TẦNG 2: PHÁT HIỆN SỐ ĐIỆN THOẠI (LEAD CAPTURE) -> TÍN HIỆU KHẨN
        # -------------------------------------------------------------
        phone = extract_phone_number(clean_text)
        if phone:
            self.save_lead(phone, clean_text)
            # Phát tín hiệu chuông + console + alerts.json + Telegram
            alert_service.dispatch(
                alert_type="LEAD_PHONE",
                priority="urgent",
                message=clean_text,
                phone=phone,
                metadata={"action": "lead_captured"}
            )
            return {
                "reply": (
                    f"Dạ chuyên viên Sauna Alpaca đã ghi nhận số điện thoại {phone} của bạn! 🌿\n\n"
                    "Chúng tôi đã phát tín hiệu tới bộ phận tư vấn tại TP. Huế và sẽ liên hệ lại qua Zalo/Điện thoại "
                    "trong vòng 15 phút để tư vấn chi tiết, gửi báo giá ưu đãi và sắp xếp lịch trải nghiệm tận nhà nhé. Cảm ơn bạn!"
                ),
                "intent": "lead_captured",
                "phone": phone,
                "escalated": True,
                "priority": "urgent",
                "alert_type": "LEAD_PHONE"
            }

        # -------------------------------------------------------------
        # TẦNG 3: NHẬN DIỆN Ý ĐỊNH MUA / THUÊ / CỌC TIỀN GẤP -> TÍN HIỆU KHẨN
        # -------------------------------------------------------------
        if self.check_purchase_intent(norm_text, unacc_text):
            alert_service.dispatch(
                alert_type="URGENT_PURCHASE",
                priority="urgent",
                message=clean_text,
                metadata={"intent": "purchase_order"}
            )
            return {
                "reply": (
                    "Dạ tuyệt vời ạ! Đội ngũ Sauna Alpaca tại Huế đã nhận được tín hiệu đặt máy/thuê máy của bạn và đang sẵn sàng phục vụ! 🚀\n\n"
                    "• Chúng tôi giao và lắp đặt miễn phí tận nhà trong ngày tại TP. Huế.\n"
                    "• Để nhận số tài khoản đặt cọc và xếp lịch kỹ thuật viên đến lắp đặt ngay, "
                    "bạn vui lòng **để lại số điện thoại** tại đây hoặc bấm nút **Gọi ngay Hotline 0385.927.274** để được phục vụ tức thì nhé!"
                ),
                "intent": "urgent_purchase",
                "escalated": True,
                "priority": "urgent",
                "alert_type": "URGENT_PURCHASE"
            }

        # -------------------------------------------------------------
        # TẦNG 4: YÊU CẦU GẶP TƯ VẤN VIÊN / NGƯỜI THẬT -> TÍN HIỆU KHẨN
        # -------------------------------------------------------------
        if self.check_human_request(norm_text, unacc_text):
            alert_service.dispatch(
                alert_type="HUMAN_REQUEST",
                priority="high",
                message=clean_text,
                metadata={"intent": "human_handover"}
            )
            return {
                "reply": (
                    "Dạ vâng, tôi đã phát tín hiệu kết nối khẩn cấp tới chuyên viên tư vấn Sauna Alpaca tại TP. Huế! 🔔\n\n"
                    "Chuyên viên sẽ tiếp nhận và hỗ trợ trực tiếp cho bạn ngay. Bạn có thể:\n"
                    "1. Để lại **Số điện thoại** tại khung chat này để chuyên viên gọi lại ngay.\n"
                    "2. Hoặc bấm gọi trực tiếp **Hotline 0385.927.274** (phục vụ 24/7 tại Huế) để trao đổi nhanh nhất nhé!"
                ),
                "intent": "human_request",
                "escalated": True,
                "priority": "high",
                "alert_type": "HUMAN_REQUEST"
            }

        # -------------------------------------------------------------
        # TẦNG 5: TÌNH HUỐNG Y TẾ ĐẶC BIỆT / BỆNH LÝ NHẠY CẢM -> TÍN HIỆU
        # -------------------------------------------------------------
        if self.check_medical_caution(norm_text, unacc_text):
            alert_service.dispatch(
                alert_type="MEDICAL_ALERT",
                priority="high",
                message=clean_text,
                metadata={"intent": "medical_caution"}
            )
            return {
                "reply": (
                    "⚠️ Lưu ý an toàn y tế đặc biệt:\n\n"
                    "Đối với các tình trạng bệnh lý nhạy cảm (như vừa đột quỵ, bệnh tim nặng, sốt cao, vừa phẫu thuật...), "
                    "cơ thể rất nhạy với sự thay đổi nhiệt độ và tuyệt đối cần có sự thăm khám, đồng ý từ bác sĩ điều trị trước khi xông hơi.\n\n"
                    "Đội ngũ chuyên viên Sauna Alpaca đã nhận được thông tin câu hỏi của bạn. "
                    "Bạn hãy để lại số điện thoại hoặc gọi hotline 0385.927.274 để chuyên viên y tế trao đổi kỹ hơn về tiền sử bệnh trước khi quyết định nhé!"
                ),
                "intent": "medical_alert",
                "escalated": True,
                "priority": "high",
                "alert_type": "MEDICAL_ALERT"
            }

        # -------------------------------------------------------------
        # TẦNG 6: CÁC CÂU CHÀO HỎI THÔNG THƯỜNG
        # -------------------------------------------------------------
        greetings = ["chao", "hello", "hi", "alo", "ban oi", "shop oi", "ad oi", "xin chao"]
        if unacc_text in greetings or (len(unacc_text.split()) <= 3 and any(g in unacc_text for g in greetings)):
            return {
                "reply": (
                    "Xin chào! Tôi là Trợ lý Sức Khỏe AI của Sauna Alpaca 🌿.\n\n"
                    "Tôi có thể hỗ trợ giải đáp nhanh cho bạn về:\n"
                    "1. 🩺 Cơ chế hồng ngoại xa FIR hỗ trợ bệnh nhân suy thận & bảo tồn đường mổ AVF\n"
                    "2. 📦 Bảng giá và 3 gói thuê theo tháng linh hoạt tại TP. Huế\n"
                    "3. 👴 Mức nhiệt và thời gian an toàn cho người lớn tuổi\n"
                    "4. 🏠 Diện tích đặt máy (chỉ 1m²) và tiêu chuẩn lắp đặt tại nhà\n\n"
                    "Bạn đang quan tâm đến nội dung nào để tôi tư vấn chi tiết nhé?"
                ),
                "intent": "greeting",
                "escalated": False
            }

        # -------------------------------------------------------------
        # TẦNG 7: ĐỐI SOÁT VỚI KHO TRI THỨC CHUYÊN SÂU CÀI SẴN
        # -------------------------------------------------------------
        best_item = None
        highest_score = 0.0

        for item in self.knowledge:
            score = self.score_match(norm_text, unacc_text, item)
            if score > highest_score:
                highest_score = score
                best_item = item

        # Ngưỡng tin cậy chấp nhận câu trả lời đã cài đặt sẵn
        if highest_score >= 1.8 and best_item:
            return {
                "reply": best_item["answer"],
                "intent": best_item["intent"],
                "confidence": round(highest_score, 2),
                "escalated": False
            }

        # -------------------------------------------------------------
        # TẦNG 8: FALLBACK DỰ PHÒNG KHI CÂU HỎI NGOÀI KỊCH BẢN
        # -------------------------------------------------------------
        # Nếu câu hỏi có độ dài đáng kể (> 15 ký tự) mà không khớp, thông báo nhẹ cho người bán
        if len(clean_text) >= 15:
            alert_service.dispatch(
                alert_type="UNRESOLVED_QUERY",
                priority="medium",
                message=clean_text,
                metadata={"confidence": highest_score}
            )

        return {
            "reply": (
                f"Cảm ơn câu hỏi của bạn về: \"{clean_text}\". 🌿\n\n"
                "Hiện tại câu hỏi này cần thêm thông tin chuyên môn cụ thể. "
                "Bạn có thể để lại **Số điện thoại** tại đây hoặc gọi trực tiếp Hotline **0385.927.274** "
                "(Hỗ trợ kỹ thuật & y tế 24/7 tại Huế) để đội ngũ chuyên viên giải đáp cặn kẽ nhất cho bạn nhé!"
            ),
            "intent": "fallback",
            "confidence": round(highest_score, 2),
            "escalated": len(clean_text) >= 15,
            "priority": "medium",
            "alert_type": "UNRESOLVED_QUERY" if len(clean_text) >= 15 else None
        }

# Khởi tạo instance duy nhất
engine = SaunaAIEngine()
