"""
Kho tri thức chuyên sâu về máy xông hơi hồng ngoại Sauna Alpaca
Các câu trả lời cài đặt sẵn chuẩn y khoa và thực tế kinh doanh tại TP. Huế.
"""

KNOWLEDGE_DATA = [
    {
        "intent": "benh_than_fir",
        "title": "Hỗ trợ bệnh nhân suy thận & chạy thận nhân tạo",
        "keywords": [
            "thận", "suy thận", "chạy thận", "lọc máu", "avf", "đường mổ", 
            "cầu tay", "mạch máu", "nội mạc", "jasn", "tuần hoàn", "nội mô"
        ],
        "answer": (
            "Theo các nghiên cứu lâm sàng quốc tế (tiêu biểu trên tạp chí JASN - Hội Thận học Hoa Kỳ), "
            "tia hồng ngoại xa (FIR bước sóng sinh học 5.6 - 15μm) có tác dụng kích hoạt enzyme eNOS, "
            "sản sinh Oxit Nitric (NO) giúp giãn nở vi mạch, cải thiện lưu lượng tuần hoàn máu và hỗ trợ "
            "bảo tồn đường mổ thông động tĩnh mạch (AVF) cho bệnh nhân chạy thận nhân tạo.\n\n"
            "⚠️ Lưu ý quan trọng: Máy xông hơi tre Sauna Alpaca là thiết bị gia dụng chăm sóc sức khỏe, "
            "không thay thế phác đồ điều trị y khoa. Gia đình luôn cần tham khảo ý kiến bác sĩ chuyên khoa "
            "trước khi áp dụng cho người bệnh."
        )
    },
    {
        "intent": "goi_thue_hue",
        "title": "Chính sách và giá thuê theo tháng tại Huế",
        "keywords": [
            "thuê", "giá thuê", "gói thuê", "bao nhiêu một tháng", "tiền thuê", 
            "chi phí thuê", "đặt cọc", "máy thuê", "thuê máy xông"
        ],
        "answer": (
            "Sauna Alpaca đang triển khai chương trình thí điểm thuê theo tháng tại TP. Huế với 3 gói linh hoạt:\n"
            "• Gói 3 tháng: Trải nghiệm thực tế tại nhà cho gia đình.\n"
            "• Gói 6 tháng: Được lựa chọn nhiều nhất, tối ưu chi phí và hiệu quả trị liệu.\n"
            "• Gói 12 tháng: Tiết kiệm đến 25% kèm gói quà tặng thảo dược thiên nhiên.\n\n"
            "🎁 Đặc quyền trọn gói: Miễn phí 100% vận chuyển & lắp đặt tại nhà ở Huế, kỹ thuật viên bảo dưỡng "
            "định kỳ miễn phí và cam kết 1 đổi 1 ngay lập tức nếu máy có bất kỳ sự cố nào."
        )
    },
    {
        "intent": "gia_mua_thiet_bi",
        "title": "Giá bán máy xông hơi và chính sách bảo hành",
        "keywords": [
            "mua máy", "giá mua", "bán máy", "giá bán", "bao nhiêu tiền một máy", "sở hữu máy", 
            "chế độ bảo hành", "bảo hành bao lâu", "mua đứt"
        ],
        "answer": (
            "Khi mua thiết bị xông hơi Sauna Alpaca, quý khách được sở hữu trọn đời máy xông bằng gỗ tre tự nhiên "
            "với mức giá ưu đãi dành riêng cho thị trường Huế. Chính sách hậu mãi bao gồm:\n"
            "• Bảo hành chính hãng từ 1 - 2 năm tận nhà.\n"
            "• Miễn phí vận chuyển và lắp đặt hoàn thiện 60 phút tại TP. Huế.\n"
            "• Tặng kèm bộ phụ kiện và hướng dẫn phác đồ xông an toàn từ chuyên gia.\n\n"
            "Bạn có thể để lại số điện thoại hoặc gọi hotline 0385.927.274 để nhận bảng báo giá chi tiết và ưu đãi tháng này nhé!"
        )
    },
    {
        "intent": "nguoi_cao_tuoi_nhiet_do",
        "title": "Hướng dẫn nhiệt độ và thời gian cho người lớn tuổi",
        "keywords": [
            "nhiệt độ", "nhiệt độ an toàn", "người già", "người lớn tuổi", "người cao tuổi",
            "cha mẹ", "ông bà", "mấy độ", "bao nhiêu độ", "xông bao lâu", "thời gian xông", 
            "an toàn cho người già", "an toàn không"
        ],
        "answer": (
            "Dành cho người lớn tuổi, nhiệt độ khuyến nghị an toàn là từ 40°C đến 50°C trong khoảng 15 - 20 phút mỗi lần xông:\n"
            "1. Bật máy làm nóng trước 5 - 10 phút.\n"
            "2. Cho người lớn uống 1 cốc nước ấm (200 - 300ml) trước khi vào xông để bổ sung tuần hoàn dịch.\n"
            "3. Máy xông hơi tre Sauna Alpaca trang bị cảm biến kép tự ngắt khi quá nhiệt và hẹn giờ tự động, "
            "người nhà hoàn toàn yên tâm khi cha mẹ sử dụng độc lập."
        )
    },
    {
        "intent": "chong_chi_dinh_y_te",
        "title": "Đối tượng chống chỉ định và lưu ý an toàn",
        "keywords": [
            "chống chỉ định", "không nên xông", "kiêng xông", "ai không được xông", 
            "bà bầu", "mang thai", "trẻ em", "sốt cao", "say rượu", "uống bia"
        ],
        "answer": (
            "Các trường hợp KHÔNG nên hoặc cần tạm hoãn xông hơi:\n"
            "• Người đang sốt cao trên 38°C hoặc đang có viêm nhiễm cấp tính.\n"
            "• Phụ nữ đang mang thai.\n"
            "• Người vừa uống rượu bia hoặc trong trạng thái kiệt sức, say xỉn.\n"
            "• Bệnh nhân có tiền sử đột quỵ cấp, suy tim mất bù nặng, hoặc vừa phẫu thuật dưới 3 tháng.\n\n"
            "Nếu người thân có bệnh nền đặc biệt, hãy để lại số điện thoại hoặc gọi hotline 0385.927.274 để chuyên viên y tế đối chiếu cẩn thận trước khi sử dụng."
        )
    },
    {
        "intent": "lap_dat_khong_gian",
        "title": "Diện tích đặt máy & Tiêu chuẩn lắp đặt tại Huế",
        "keywords": [
            "lắp đặt", "diện tích", "kích thước", "kích thước máy", "chỗ để", 
            "ổ cắm", "nguồn điện", "220v", "nhà chật", "lắp bao lâu", "đặt ở đâu"
        ],
        "answer": (
            "Máy xông hơi Sauna Alpaca có kích thước 900 x 900 x 1900 mm (chỉ chiếm chưa đầy 1m² diện tích sàn nhà). "
            "Máy sử dụng nguồn điện 220V gia dụng thông thường (công suất 1350W tiết kiệm điện, tương đương 1 ấm đun nước), "
            "hoàn toàn không cần đường ống cấp thoát nước hay cải tạo đục phá tường.\n\n"
            "Đội ngũ kỹ thuật viên tại Huế sẽ mang máy tận nhà, lắp đặt và hướng dẫn sử dụng trong vòng 30 - 60 phút."
        )
    },
    {
        "intent": "xuat_xu_vat_lieu_tre",
        "title": "Chất liệu tre tự nhiên & Tấm nhiệt Carbon",
        "keywords": [
            "chất liệu tre", "vật liệu tre", "gỗ tre", "mùi tre", "hóa chất", "keo dán", 
            "tấm carbon", "sợi carbon", "bền không", "chất liệu máy"
        ],
        "answer": (
            "Vách máy xông hơi Sauna Alpaca được gia công từ 100% tre tự nhiên xử lý chống mối mọt bằng công nghệ sấy nhiệt "
            "cổ truyền, hoàn toàn không sử dụng hóa chất formaldehyde hay sơn độc hại. Khi gia nhiệt, tre tỏa hương thơm mộc tự nhiên.\n\n"
            "Hệ thống phát nhiệt sử dụng các tấm Carbon Crystal thế hệ mới, phát tia hồng ngoại xa đồng đều khắp phòng mà không gây bỏng rát bề mặt."
        )
    },
    {
        "intent": "so_sanh_xong_kho_fir_uot",
        "title": "So sánh xông hơi khô hồng ngoại FIR vs xông ướt",
        "keywords": [
            "khác gì xông ướt", "so sánh xông", "xông ướt truyền thống", "xông hơi khô", "nồi hơi nước", 
            "xông nào tốt hơn", "khác nhau thế nào"
        ],
        "answer": (
            "Khác biệt căn bản giữa 2 phương pháp:\n"
            "• Xông ướt truyền thống: Dùng nồi hơi đun nước nóng 80 - 100°C làm ẩm phòng, dễ gây khó thở, ngột ngạt và nguy cơ sốc nhiệt đối với người cao tuổi/người suy thận.\n"
            "• Xông khô hồng ngoại xa FIR (Sauna Alpaca): Nhiệt độ êm dịu 40 - 55°C, không khí thoáng đãng, tia FIR thấu sâu 3 - 5cm vào mô cơ để kích thích vi mạch và tuyến mồ hôi mà không làm tăng gánh nặng lên tim phổi."
        )
    },
    {
        "intent": "dau_nhuc_xuong_khop",
        "title": "Hỗ trợ giảm đau nhức xương khớp, tê bì chân tay",
        "keywords": [
            "xương khớp", "đau lưng", "thoái hóa khớp", "tê bì chân tay", "mỏi gối", 
            "viêm khớp", "đau vai gáy", "đau nhức mình mẩy"
        ],
        "answer": (
            "Nhiệt hồng ngoại xa giúp làm mềm các bó cơ co thắt, thúc đẩy tuần hoàn máu đến các ổ khớp bị thoái hóa, "
            "hỗ trợ giảm phù nề và giải tỏa chèn ép dây thần kinh gây tê bì tay chân. Nhiều khách hàng lớn tuổi tại Huế "
            "phản hồi cảm thấy nhẹ nhõm, đi lại linh hoạt hơn sau 1 - 2 tuần duy trì xông 2 - 3 lần/tuần."
        )
    },
    {
        "intent": "mat_ngu_thu_gian",
        "title": "Cải thiện giấc ngủ & Thư giãn thần kinh",
        "keywords": [
            "mất ngủ", "khó ngủ", "trằn trọc", "stress", 
            "căng thẳng thần kinh", "thư giãn", "ngủ không ngon", "sâu giấc"
        ],
        "answer": (
            "Xông hơi hồng ngoại 15 - 20 phút vào buổi chiều tối kích thích hệ thần kinh phó giao cảm, giúp cơ thể tiết endorphin "
            "giảm stress. Sau khi xông và tắm lại bằng nước ấm, thân nhiệt giảm dần tự nhiên, tạo tín hiệu sinh học đưa cơ thể "
            "vào giấc ngủ sâu và ngon hơn mà không cần phụ thuộc vào thuốc an thần."
        )
    },
    {
        "intent": "lien_he_dia_chi_hue",
        "title": "Địa chỉ liên hệ & Đội ngũ tại Huế",
        "keywords": [
            "địa chỉ ở đâu", "showroom ở đâu", "văn phòng ở đâu", "đến xem máy", 
            "qua xem trực tiếp", "địa chỉ cụ thể", "ở đường nào", "địa chỉ tại huế", 
            "hotline tư vấn", "số điện thoại hotline", "tổng đài hỗ trợ"
        ],
        "answer": (
            "Đội ngũ kỹ thuật và tư vấn Sauna Alpaca tại TP. Huế:\n"
            "📍 Địa chỉ: 64 Lê Thánh Tôn, P. Phú Xuân, TP. Huế\n"
            "📞 Hotline / Zalo: 0385.927.274 (Hỗ trợ 24/7)\n"
            "📧 Email: hoangminhduchphh@gmail.com\n"
            "Chúng tôi sẵn sàng mang thiết bị mẫu đến tận nhà bạn tại Huế để khảo sát vị trí và tư vấn hoàn toàn miễn phí."
        )
    },
    {
        "intent": "quy_trinh_dung_thu",
        "title": "Quy trình khảo sát & Trải nghiệm thử máy tại nhà",
        "keywords": [
            "dùng thử", "thử máy", "trải nghiệm thử", "khảo sát tận nhà", 
            "quy trình lắp", "thủ tục đăng ký"
        ],
        "answer": (
            "Quy trình 4 bước đơn giản để trải nghiệm xông hơi tại nhà ở Huế:\n"
            "1. Đăng ký: Nhắn tin/gọi hotline 0385.927.274 để chuyên viên ghi nhận nhu cầu.\n"
            "2. Khảo sát 15 phút: Kỹ thuật viên đến tận nhà đo đạc góc đặt máy và kiểm tra nguồn điện.\n"
            "3. Lắp đặt 60 phút: Bàn giao máy sạch sẽ, cắm điện thử nghiệm và kiểm tra an toàn.\n"
            "4. Hướng dẫn & Đồng hành: Kỹ thuật viên hướng dẫn cụ thể cách xông cho từng thành viên trong gia đình."
        )
    }
]
