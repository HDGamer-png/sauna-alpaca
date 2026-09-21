/**
 * ============================================================================
 * KHU VỰC QUẢN LÝ THÔNG TIN SẢN PHẨM — SAUNA ALPACA
 * ============================================================================
 * 
 * 💡 HƯỚNG DẪN DÀNH CHO BẠN:
 * Khi có thông tin mới về sản phẩm (nội dung giới thiệu chi tiết, hình ảnh chụp thật,
 * thông số kỹ thuật, giá bán chính thức, chính sách bảo hành...), bạn CHỈ CẦN
 * cập nhật các trường dữ liệu trong file này. Toàn bộ các trang trên website
 * sẽ tự động cập nhật đồng bộ mà không làm hỏng giao diện.
 */

import type { PricingPlan } from '@/shared/types';
import imgMain from '@/fe/assets/anh_san_pham.jpg';
import imgRoom from '@/fe/assets/anh_khong_gian_phong.jpg';
import imgDetail from '@/fe/assets/anh_chi_tiet_tre.jpg';
import imgUser from '@/fe/assets/anh_nguoi_lon_tuoi.jpg';

// ──── 1. THÔNG TIN GIỚI THIỆU TỔNG QUAN VỀ SẢN PHẨM ────
export const PRODUCT_INTRO = {
  name: 'Máy Xông Hơi Hồng Ngoại Xa Sauna Alpaca',
  model: 'ALPACA-FIR-01',
  tagline: 'Chăm sóc vi tuần hoàn & hồi phục sức khỏe chuyên sâu tại nhà',
  shortDescription:
    'Sự kết hợp tinh tế giữa nghệ thuật tre tự nhiên Việt Nam và công nghệ hồng ngoại xa (FIR) bước sóng sinh học 5.6 – 15μm. Thiết kế chuẩn y học gia đình, nhiệt êm dịu, không ngột ngạt, tối ưu cho người lớn tuổi và hỗ trợ bệnh nhân suy thận mạn.',
  
  // Bạn có thể mở rộng đoạn văn mô tả chi tiết tại đây
  fullDescription: [
    'Sauna Alpaca được ra đời từ trăn trở: Làm sao để người cao tuổi và những người bệnh mạn tính (đặc biệt là bệnh nhân suy thận chạy thận nhân tạo) có thể tiếp cận liệu pháp xông nhiệt an toàn ngay tại nhà mà không phải chịu cảm giác ngột ngạt, khó thở của phòng xông hơi nước truyền thống.',
    'Khác biệt hoàn toàn với sauna thông thường vốn dùng hơi nước làm nóng không khí lên 80°C - 100°C gây áp lực lớn cho tim mạch, Sauna Alpaca sử dụng các tấm phát nhiệt Carbon Crystal phát ra bước sóng hồng ngoại xa (5.6 - 15μm). Bước sóng này thẩm thấu sâu từ 3 - 5cm vào các mô cơ, sưởi ấm dịu dàng cơ thể từ bên trong ở mức nhiệt thư thái 40°C - 55°C, giúp kích hoạt giãn nở vi mạch, tăng sinh oxit nitric (NO) và hỗ trợ đào thải độc tố tự nhiên qua tuyến mồ hôi.',
  ],

  // Các khối nội dung giới thiệu chi tiết từng khía cạnh (Có thể thêm/sửa/xóa dễ dàng)
  detailedSections: [
    {
      id: 'material',
      title: 'Vật liệu Tre Tự Nhiên 100% — Thân thiện & Bền bỉ',
      icon: '🎋',
      summary: 'Gỗ tre ép thanh cao cấp xử lý chống ẩm mốc theo tiêu chuẩn sinh học, không hóa chất độc hại.',
      points: [
        'Giữ nhiệt tối ưu, cách âm và tạo hương thơm mộc tự nhiên thư thái khi xông.',
        'Độ bền cơ học vượt trội, không cong vênh hay nứt vỡ dưới biến thiên nhiệt độ.',
        'Vật liệu xanh tái sinh bền vững, an toàn tuyệt đối cho người có da nhạy cảm.',
      ],
    },
    {
      id: 'technology',
      title: 'Công Nghệ Hồng Ngoại Xa (FIR) Bước Sóng Sinh Học',
      icon: '✨',
      summary: 'Tấm phát nhiệt Carbon Crystal phát ra dải sóng hồng ngoại xa 5.6 – 15μm chuẩn y khoa.',
      points: [
        'Thẩm thấu sâu vào tầng hạ bì, kích thích tuần hoàn máu và tái tạo tế bào.',
        'Hỗ trợ cải thiện chức năng nội mạc mạch máu ở bệnh nhân chạy thận nhân tạo (đã chứng minh trên JASN).',
        'Làm ấm cơ thể tự nhiên mà không gây khô da hay sốc nhiệt.',
      ],
    },
    {
      id: 'design',
      title: 'Thiết Kế Thông Minh Cho Không Gian Gia Đình Việt',
      icon: '🏠',
      summary: 'Kích thước nhỏ gọn 0.9m x 0.9m, chỉ cần 1m² diện tích trong phòng ngủ hoặc phòng khách.',
      points: [
        'Khớp nối mô-đun chuẩn xác, lắp đặt hoàn thiện chỉ trong 30-60 phút không cần sửa chữa nhà.',
        'Sử dụng nguồn điện gia dụng thông thường 220V, cắm trực tiếp ổ điện gia đình.',
        'Tiêu thụ điện năng cực thấp: chỉ ~1.2 - 1.5 kWh cho mỗi phiên xông 30 phút.',
      ],
    },
    {
      id: 'safety',
      title: 'Hệ Thống An Toàn Kép Cho Người Cao Tuổi',
      icon: '🛡️',
      summary: 'Thiết kế nút bấm to bản, cảm biến ngắt nhiệt tự động kép chống quá nhiệt.',
      points: [
        'Bảng điều khiển nhiệt độ & thời gian trực quan, dễ bấm cho mắt kém.',
        'Tự động ngắt nguồn khi nhiệt độ vượt ngưỡng an toàn hoặc hết thời gian hẹn giờ.',
        'Cửa kính cường lực trong suốt tạo không gian khoáng đạt, có thể mở đẩy nhẹ nhàng từ bên trong bất cứ lúc nào.',
      ],
    },
  ],
};

// ──── 2. DANH SÁCH HÌNH ẢNH SẢN PHẨM TRỰC QUAN ────
export const PRODUCT_GALLERY = [
  {
    id: 'img-1',
    src: imgRoom,
    title: 'Máy xông hơi trong không gian gia đình',
    caption: 'Thiết kế gọn gàng, tinh tế trong phòng ngủ hoặc phòng khách gia đình',
  },
  {
    id: 'img-2',
    src: imgDetail,
    title: 'Cận cảnh chất liệu tre tự nhiên & tấm phát nhiệt',
    caption: 'Gỗ tre cao cấp cùng tấm sưởi hồng ngoại xa công nghệ Carbon Crystal',
  },
  {
    id: 'img-3',
    src: imgUser,
    title: 'Trải nghiệm xông hơi thư giãn cho người cao tuổi',
    caption: 'Nhiệt độ dịu ấm 40-55°C, mang lại cảm giác nhẹ nhõm, khoan khoái',
  },
  {
    id: 'img-4',
    src: imgMain,
    title: 'Toàn cảnh thiết bị máy xông hơi Sauna Alpaca',
    caption: 'Kiểu dáng trang nhã, vật liệu tre sinh thái hài hòa với nội thất',
  },
];

// ──── 3. THÔNG SỐ KỸ THUẬT CHI TIẾT ────
export const PRODUCT_SPECS = {
  name: 'Máy Xông Hơi Hồng Ngoại Xa Sauna Alpaca',
  material: 'Tre tự nhiên 100% (ép thanh cao cấp, sấy chân không)',
  technology: 'Tấm phát nhiệt hồng ngoại xa (FIR) Carbon Crystal',
  wavelength: '5.6 – 15 μm (dải sóng sinh học hữu ích)',
  power: '1000W – 1400W (tiêu chuẩn gia đình)',
  voltage: '220V / 50Hz (nguồn điện thông thường)',
  temperature: '35°C – 65°C (khuyến nghị 40°C – 55°C cho người lớn tuổi)',
  timerRange: '0 – 60 phút (tự động ngắt)',
  dimensions: '900 x 900 x 1800 mm (Dài x Rộng x Cao)',
  weight: '~45 kg (thiết kế mô-đun tháo lắp linh hoạt)',
  capacity: '1 người lớn ngồi thoải mái',
  warranty: '1 – 2 năm chính hãng đối với mua; bảo dưỡng miễn phí khi thuê',
  features: [
    'Vật liệu tre tự nhiên 100%, mùi hương thảo mộc mộc mạc',
    'Tấm phát hồng ngoại xa công nghệ Carbon Crystal bền bỉ',
    'Bảng điều khiển thông minh, hẹn giờ ngắt an toàn kép',
    'Cửa kính cường lực chịu nhiệt, quan sát bên ngoài thông thoáng',
    'Lắp đặt mô-đun khớp nối nhanh, không cần sửa nhà',
    'Tiêu thụ điện năng chỉ ~1.2 - 1.5 kWh mỗi lần xông',
    'Phù hợp mọi không gian: nhà phố, căn hộ, phòng trị liệu tại Huế',
  ],
} as const;

// ──── 4. GÓI MUA SỞ HỮU TRỌN ĐỜI ────
export const BUY_PLAN: PricingPlan = {
  id: 'buy',
  name: 'Mua thiết bị sở hữu trọn đời',
  description: 'Đầu tư sức khỏe dài hạn cho cha mẹ và cả gia đình',
  features: [
    'Sở hữu vĩnh viễn máy xông hơi Sauna Alpaca',
    'Bảo hành chính hãng 1 - 2 năm tận nơi',
    'Miễn phí vận chuyển & lắp đặt tận nhà toàn TP. Huế',
    'Kiểm tra, bảo dưỡng kỹ thuật định kỳ tại nhà',
    'Kỹ thuật viên hướng dẫn sử dụng 1-1 chu đáo cho người lớn tuổi',
    'Hỗ trợ kỹ thuật và thay thế linh kiện trọn đời sản phẩm',
    'Tặng kèm bộ phụ kiện: khăn xông chuyên dụng & thảm lót tre',
  ],
  ctaText: 'Liên hệ tư vấn mua ngay',
  ctaHref: '/lien-he?nhuCau=mua',
};

// ──── 5. CÁC GÓI THUÊ THEO THÁNG LINH HOẠT ────
export const RENT_PLANS: PricingPlan[] = [
  {
    id: 'rent-3',
    name: 'Gói thuê 3 tháng',
    description: 'Trải nghiệm xông phục hồi ngắn hạn, linh hoạt',
    features: [
      'Thời hạn thuê: 3 tháng',
      'Chi phí hàng tháng phải chăng, không cần vốn lớn ban đầu',
      'Miễn phí vận chuyển & lắp đặt tận nhà tại Huế',
      'Bảo trì kỹ thuật miễn phí trọn gói trong suốt hợp đồng',
      'Đổi máy mới ngay nếu có bất kỳ lỗi kỹ thuật nào',
      'Kỹ thuật viên hướng dẫn tận tình tại nhà',
      'Hỗ trợ kỹ thuật 24/7',
    ],
    ctaText: 'Đăng ký thuê 3 tháng',
    ctaHref: '/lien-he?nhuCau=thue&goi=3thang',
  },
  {
    id: 'rent-6',
    name: 'Gói thuê 6 tháng',
    description: 'Gói được nhiều gia đình tại Huế lựa chọn nhất',
    features: [
      'Thời hạn thuê: 6 tháng',
      'Mức giá ưu đãi tiết kiệm hơn so với gói 3 tháng',
      'Miễn phí vận chuyển & lắp đặt trọn gói tại nhà',
      'Bảo dưỡng định kỳ 2 tháng/lần tận nơi miễn phí',
      'Đổi máy mới ngay nếu phát sinh lỗi kỹ thuật',
      'Hỗ trợ kỹ thuật ưu tiên trong vòng 2 giờ tại Huế',
      'Ưu tiên giữ máy hoặc chuyển đổi sang mua với giá ưu đãi',
    ],
    highlighted: true,
    ctaText: 'Đăng ký thuê 6 tháng',
    ctaHref: '/lien-he?nhuCau=thue&goi=6thang',
  },
  {
    id: 'rent-12',
    name: 'Gói thuê 12 tháng',
    description: 'Tiết kiệm chi phí tối đa, chăm sóc sức khỏe quanh năm',
    features: [
      'Thời hạn thuê: 12 tháng',
      'Mức giá thuê tháng tốt nhất (tiết kiệm đến 25%)',
      'Miễn phí 100% vận chuyển, lắp đặt & thu hồi máy',
      'Bảo dưỡng định kỳ tận nhà hoàn toàn miễn phí',
      'Đổi máy đời mới nhất khi có nâng cấp công nghệ',
      'Đặc quyền: Tùy chọn mua đứt máy với giá khấu trừ ưu đãi',
      'Hỗ trợ kỹ thuật chuyên biệt 24/7',
    ],
    ctaText: 'Đăng ký thuê 12 tháng',
    ctaHref: '/lien-he?nhuCau=thue&goi=12thang',
  },
];

// ──── 6. BẢNG SO SÁNH MUA VS THUÊ ────
export const COMPARISON_TABLE = {
  headers: ['Tiêu chí so sánh', 'Mua thiết bị sở hữu', 'Thuê theo tháng'],
  rows: [
    ['Ngân sách ban đầu', 'Thanh toán 1 lần trọn gói', 'Chỉ trả phí thuê định kỳ hàng tháng'],
    ['Quyền sở hữu', 'Sở hữu trọn đời sản phẩm', 'Thuê dùng, trả lại khi hết hợp đồng'],
    ['Vận chuyển & lắp đặt', 'Miễn phí tận nhà tại Huế', 'Miễn phí tận nhà tại Huế'],
    ['Bảo hành / Bảo dưỡng', 'Bảo hành 1-2 năm chính hãng', 'Bảo dưỡng tận nơi miễn phí suốt thời gian thuê'],
    ['Xử lý khi có sự cố', 'Kỹ thuật sửa chữa tận nơi', 'Đổi máy mới ngay lập tức'],
    ['Nâng cấp máy mới', 'Tự chi trả nếu muốn đổi', 'Được ưu tiên nâng cấp dòng máy mới'],
    ['Tính linh hoạt', 'Cố định lâu dài', 'Linh hoạt đổi gói 3-6-12 tháng hoặc dừng thuê'],
    ['Khả năng mua lại', 'Đã là chủ sở hữu', 'Gói 12 tháng có đặc quyền mua lại giá tốt'],
    ['Đối tượng phù hợp nhất', 'Gia đình muốn dùng thường xuyên nhiều năm', 'Người muốn dùng thử hoặc ngân sách linh hoạt'],
  ],
} as const;
