/**
 * Dữ liệu Lời chứng thực khách hàng & Quy trình phục vụ — Sauna Alpaca
 * 
 * 💡 GHI CHÚ CHO BẠN:
 * Bạn có thể dễ dàng thay đổi tên, lời nhận xét, hình ảnh hoặc các bước quy trình
 * trực tiếp trong file này mà không cần sửa giao diện.
 */

export interface TestimonialItem {
  id: string;
  name: string;
  age?: number;
  location: string;
  role: string;
  avatarText: string;
  quote: string;
  condition: string;
  rating: number;
}

export interface ProcessStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  timeframe?: string;
}

/**
 * Lời chứng thực của khách hàng tại Huế
 * Dễ dàng cập nhật / thêm bớt đánh giá của khách hàng thật tại đây.
 */
export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: '1',
    name: 'Cô Nguyễn Thị Lan',
    age: 58,
    location: 'P. Vỹ Dạ, TP. Huế',
    role: 'Khách hàng thuê gói 6 tháng',
    avatarText: 'NL',
    condition: 'Đau mạn tính khớp gối & mất ngủ',
    rating: 5,
    quote:
      'Tôi bị thoái hóa khớp gối mấy năm nay, mùa mưa ở Huế nhức buốt rất khó ngủ. Từ khi con trai thuê máy xông hơi tre này đặt ở góc phòng, mỗi tối tôi xông 20 phút ở 45 độ C. Người nhẹ bẫng, mồ hôi toát ra êm ái chứ không bị ngột như xông hơi nước ngoài tiệm. Đêm ngủ sâu giấc hơn hẳn.',
  },
  {
    id: '2',
    name: 'Anh Trần Hoàng Minh',
    age: 42,
    location: 'P. Phú Hội, TP. Huế',
    role: 'Người nhà bệnh nhân suy thận',
    avatarText: 'HM',
    condition: 'Chăm sóc người thân chạy thận nhân tạo',
    rating: 5,
    quote:
      'Mẹ tôi chạy thận 3 lần một tuần, bác sĩ có khuyên nên tìm phương pháp nhiệt hồng ngoại để hỗ trợ giãn mạch và giữ ấm. Tôi tìm hiểu thấy Sauna Alpaca có tài liệu nghiên cứu y khoa rõ ràng từ PubMed và có dịch vụ thuê thử tại Huế nên đăng ký ngay. Nhân viên đem đến lắp đặt tận nhà rất cẩn thận, hướng dẫn cụ thể từng nút bấm.',
  },
  {
    id: '3',
    name: 'Bác Lê Văn Dũng',
    age: 65,
    location: 'P. Thuận Hòa, TP. Huế',
    role: 'Khách hàng mua trọn đời',
    avatarText: 'VD',
    condition: 'Tê bì chân tay & huyết áp cao',
    rating: 5,
    quote:
      'Chất liệu tre ngửi rất thơm và mộc mạc, không bị mùi nhựa hay hóa chất. Máy làm nóng nhanh mà không ngột ngạt. Tôi với bà xã dùng chung mỗi ngày 1 lần. Đội ngũ kỹ thuật ở Huế nhiệt tình, gọi là có mặt hỗ trợ kiểm tra định kỳ chu đáo.',
  },
];

/**
 * Quy trình 4 bước phục vụ tận nhà tại Huế
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: 'Đăng ký & Tư vấn',
    subtitle: 'Nhanh chóng trong 5 phút',
    description:
      'Bạn điền form hoặc gọi hotline. Đội ngũ tư vấn viên sẽ tìm hiểu thể trạng, nhu cầu (mua hay thuê) và giải đáp mọi câu hỏi y khoa liên quan.',
    icon: '📞',
    timeframe: 'Phản hồi trong 5-15p',
  },
  {
    step: 2,
    title: 'Khảo sát không gian',
    subtitle: 'Tận nhà tại TP. Huế',
    description:
      'Kỹ thuật viên đến tận nhà đo đạc vị trí đặt (chỉ cần diện tích 1m²), kiểm tra ổ cắm điện 220V tiêu chuẩn và tư vấn vị trí đặt máy xông hơi tiện lợi nhất.',
    icon: '📐',
    timeframe: 'Hoàn toàn miễn phí',
  },
  {
    step: 3,
    title: 'Giao hàng & Lắp đặt',
    subtitle: 'Chỉ mất 30-60 phút',
    description:
      'Vận chuyển tận nhà miễn phí toàn TP. Huế. Lắp đặt khớp nối mô-đun tre gọn gàng, sạch sẽ, không cần đục phá hay sửa đổi cấu trúc nhà.',
    icon: '🚚',
    timeframe: 'Giao trong 2-5 ngày',
  },
  {
    step: 4,
    title: 'Hướng dẫn & Đồng hành',
    subtitle: 'An tâm trọn vẹn',
    description:
      'Hướng dẫn 1-1 cách sử dụng an toàn cho người lớn tuổi. Thiết lập lịch kiểm tra bảo dưỡng định kỳ tận nơi và hỗ trợ kỹ thuật nhanh chóng.',
    icon: '🤝',
    timeframe: 'Bảo dưỡng trọn vòng đời',
  },
];
