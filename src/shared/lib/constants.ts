/**
 * Hằng số toàn site — Sauna Alpaca
 * Thay đổi thông tin ở đây sẽ cập nhật toàn bộ website.
 */

export const SITE_CONFIG = {
  name: 'Sauna Alpaca',
  tagline: 'Máy Xông Hơi Hồng Ngoại Xa Thông Minh',
  description:
    'Máy xông hơi hồng ngoại xa gia dụng Sauna Alpaca - Thiết kế tre tự nhiên, hỗ trợ sức khỏe cho bệnh nhân suy thận và người lớn tuổi. Mua hoặc thuê theo tháng tại Huế.',
  url: 'https://saunaalpaca.vercel.app',
  locale: 'vi_VN',
  language: 'vi',
} as const;

export const CONTACT_INFO = {
  phone: '0385.927.274',
  phoneClean: '0385927274',
  email: 'hoangminhduchphh@gmail.com',
  address: 'TP. Huế',
  fullAddress: '64 Lê Thánh Tôn, P. Phú Xuân, TP. Huế',
  serviceArea: 'Toàn thành phố Huế',
  workingHours: '8:00 - 20:00 (Thứ 2 - Chủ nhật)',
  zaloUrl: 'https://zalo.me/g/thvoxc4iv40670xqgfis',
} as const;

export const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Nghiên cứu y khoa', href: '/nghien-cuu' },
  { label: 'Câu hỏi thường gặp', href: '/cau-hoi-thuong-gap' },
  {
    label: 'Sản phẩm',
    href: '/san-pham',
    children: [
      { label: 'Tổng quan sản phẩm', href: '/san-pham' },
      { label: 'Mua thiết bị', href: '/san-pham/mua' },
      { label: 'Thuê theo tháng', href: '/san-pham/thue' },
      { label: 'So sánh gói', href: '/san-pham/so-sanh' },
    ],
  },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
  { label: 'Điều khoản dịch vụ', href: '/dieu-khoan' },
  { label: 'Miễn trừ trách nhiệm y tế', href: '/mien-tru-y-te' },
  { label: 'Vận chuyển & Bảo hành', href: '/van-chuyen-bao-hanh' },
] as const;

export const MEDICAL_DISCLAIMER =
  'Sauna Alpaca là thiết bị gia dụng hỗ trợ sức khỏe, không phải thiết bị y tế. Sản phẩm không thay thế phác đồ điều trị của bác sĩ. Vui lòng tham khảo ý kiến bác sĩ trước khi sử dụng.';
