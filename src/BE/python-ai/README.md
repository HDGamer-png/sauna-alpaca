# 🌿 Sauna Alpaca — Python AI Engine (100% Độc lập / Offline)

Hệ thống AI xử lý ngôn ngữ tự nhiên (NLP) chuyên biệt cho máy xông hơi hồng ngoại Sauna Alpaca.  
Chạy hoàn toàn cục bộ trên máy tính, **không phụ thuộc vào bất kỳ API bên ngoài nào (OpenAI, Gemini...)** và **hoàn toàn 0Đ**.

---

## 📂 Cấu trúc thư mục

```
python-ai/
├── server.py         # HTTP Server lắng nghe tại http://127.0.0.1:8000
├── ai_engine.py      # Bộ não xử lý ngôn ngữ, chấm điểm từ khóa, bắt số điện thoại
├── knowledge.py      # Kho tri thức chuyên môn (Sản phẩm, bệnh suy thận, gói thuê, nhiệt độ)
├── leads.json        # Danh sách số điện thoại khách hàng để lại tự động lưu vào đây
├── test_engine.py    # File kiểm thử nhanh logic AI trong dòng lệnh
└── run.bat           # File bấm đúp chuột để chạy server nhanh trên Windows
```

---

## 🚀 Cách khởi chạy

### Cách 1: Chạy bằng file `.bat` (Nhanh nhất)
Nhấp đúp chuột vào file **`run.bat`** trong thư mục `python-ai`.

### Cách 2: Chạy bằng lệnh Terminal
```bash
python server.py
```
*(Hoặc dùng đường dẫn: `"%LOCALAPPDATA%\Python\bin\python.exe" server.py`)*

Server sẽ lắng nghe tại cổng: **`http://127.0.0.1:8000`**

---

## 💡 Các tính năng nổi bật đã tích hợp

1. **Khả năng trả lời chuyên môn cao**:
   - Cơ sở y khoa về tia hồng ngoại xa (FIR) hỗ trợ bệnh nhân suy thận, giãn vi mạch, bảo tồn đường mổ AVF.
   - Các gói thuê theo tháng thí điểm tại TP. Huế.
   - Hướng dẫn mức nhiệt an toàn (40°C - 50°C) cho người cao tuổi.
   - Kích thước máy xông hơi tre (chỉ 1m² sàn), công suất điện 220V, thời gian lắp đặt tận nhà.

2. **Tự động bắt số điện thoại (Lead Generation)**:
   - Bất cứ khi nào khách hàng gõ số điện thoại (VD: *"Gọi lại cho tôi số 0905123456 nhé"*), AI sẽ tự động trích xuất và lưu ngay vào file **`leads.json`** kèm mốc thời gian.

3. **Cơ chế dự phòng thông minh (Fallback)**:
   - Next.js kết nối trực tiếp với Python qua route `/api/chat`.
   - Nếu bạn quên chưa bật server Python, website vẫn tự động kích hoạt bộ trả lời dự phòng nên khách hàng sẽ không bao giờ gặp lỗi gián đoạn.

---

## ✍️ Cách bổ sung thêm kiến thức cho AI

Mở file **`knowledge.py`** và thêm một mục mới vào mảng `KNOWLEDGE_DATA`:
```python
{
    "intent": "ten_chu_de_moi",
    "title": "Tiêu đề chủ đề",
    "keywords": ["từ_khóa_1", "từ_khóa_2", "cụm từ liên quan"],
    "answer": "Nội dung câu trả lời mà AI sẽ gửi cho khách hàng..."
}
```
Lưu file và khởi động lại `server.py` là AI sẽ tự động học được kiến thức mới ngay lập tức!
