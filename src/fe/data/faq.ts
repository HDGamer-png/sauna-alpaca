/**
 * Dữ liệu FAQ — Sauna Alpaca
 */

import type { FAQItem } from '@/shared/types';

export const FAQ_DATA: FAQItem[] = [
  {
    question: 'Hồng ngoại xa (FIR) là gì?',
    answer:
      'Hồng ngoại xa (Far Infrared Ray - FIR) là bức xạ điện từ có bước sóng từ 5.6 đến 1000μm. Trong đó, dải sóng 5.6–15μm được gọi là "tia sự sống" vì có khả năng thẩm thấu sâu vào cơ thể (3-5cm), kích thích tuần hoàn máu và hỗ trợ quá trình trao đổi chất tự nhiên.',
    category: 'Công nghệ',
  },
  {
    question: 'Sauna Alpaca khác gì với phòng xông hơi thông thường?',
    answer:
      'Phòng xông hơi truyền thống (sauna ướt/khô) làm nóng không khí xung quanh, trong khi Sauna Alpaca sử dụng tia hồng ngoại xa để trực tiếp làm ấm cơ thể từ bên trong. Điều này giúp nhiệt độ phòng thấp hơn (40-65°C so với 80-100°C), dễ chịu hơn cho người lớn tuổi, và hiệu quả sâu hơn.',
    category: 'Sản phẩm',
  },
  {
    question: 'Ai nên sử dụng Sauna Alpaca?',
    answer:
      'Sauna Alpaca phù hợp cho: (1) Người lớn tuổi muốn cải thiện tuần hoàn máu, (2) Bệnh nhân suy thận mạn (có tham khảo ý kiến bác sĩ), (3) Người bị đau nhức cơ xương khớp, (4) Người bận rộn muốn thư giãn tại nhà, (5) Người muốn hỗ trợ giải độc cơ thể.',
    category: 'Sức khỏe',
  },
  {
    question: 'Ai không nên sử dụng?',
    answer:
      'Không nên sử dụng khi: đang mang thai, có bệnh tim nặng chưa được kiểm soát, đang sốt cao, có vết thương hở trên da, trẻ em dưới 12 tuổi. Luôn tham khảo ý kiến bác sĩ trước khi sử dụng nếu bạn có bệnh lý nền.',
    category: 'Sức khỏe',
  },
  {
    question: 'Mỗi lần xông bao lâu là phù hợp?',
    answer:
      'Khuyến nghị mỗi lần xông từ 15-30 phút, tùy theo thể trạng. Người mới bắt đầu nên xông 10-15 phút và tăng dần. Nhiệt độ nên đặt ở mức 40-55°C cho người lớn tuổi. Thiết bị có hẹn giờ tự động tắt để đảm bảo an toàn.',
    category: 'Sử dụng',
  },
  {
    question: 'Chi phí điện hàng tháng là bao nhiêu?',
    answer:
      'Máy xông hơi tiêu thụ khoảng 1-1.5 kWh mỗi lần sử dụng (30 phút). Nếu xông 1 lần/ngày, chi phí điện ước tính khoảng 100.000 - 150.000 VNĐ/tháng (tùy giá điện khu vực).',
    category: 'Chi phí',
  },
  {
    question: 'Giao hàng và lắp đặt như thế nào?',
    answer:
      'Chúng tôi giao hàng và lắp đặt miễn phí tại TP. Huế và vùng lân cận. Thời gian lắp đặt khoảng 30-60 phút. Kỹ thuật viên sẽ hướng dẫn sử dụng chi tiết tại nhà. Các khu vực ngoài Huế vui lòng liên hệ để được tư vấn.',
    category: 'Dịch vụ',
  },
  {
    question: 'Nên chọn Mua hay Thuê?',
    answer:
      'Nếu bạn chắc chắn muốn sử dụng lâu dài → Mua sẽ tiết kiệm hơn. Nếu muốn trải nghiệm trước hoặc ngân sách hạn chế → Thuê theo tháng là lựa chọn linh hoạt. Gói thuê 12 tháng có tùy chọn mua lại với giá ưu đãi.',
    category: 'Chi phí',
  },
  {
    question: 'Chính sách bảo hành như thế nào?',
    answer:
      'Mua thiết bị: Bảo hành 1-2 năm cho lỗi nhà sản xuất. Thuê thiết bị: Bảo dưỡng tận nơi trong suốt thời gian hợp đồng, đổi máy mới nếu có lỗi kỹ thuật. Cả hai đều được hỗ trợ kỹ thuật tại nhà.',
    category: 'Dịch vụ',
  },
  {
    question: 'Có cần nguồn điện đặc biệt không?',
    answer:
      'Không. Sauna Alpaca sử dụng nguồn điện gia dụng thông thường 220V. Chỉ cần 1 ổ cắm điện gần vị trí đặt máy xông hơi là đủ. Không cần sửa chữa hay thay đổi hệ thống điện trong nhà.',
    category: 'Sử dụng',
  },
];

export const FAQ_CATEGORIES = [
  'Tất cả',
  'Công nghệ',
  'Sản phẩm',
  'Sức khỏe',
  'Sử dụng',
  'Chi phí',
  'Dịch vụ',
] as const;
