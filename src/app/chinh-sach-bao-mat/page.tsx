import type { Metadata } from 'next';
import { SITE_CONFIG, CONTACT_INFO } from '@/shared/lib/constants';
import styles from '../legal.module.css';
import pStyles from '../san-pham/product.module.css';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Chính sách bảo mật và quyền riêng tư của Sauna Alpaca.',
};

export default function PrivacyPage() {
  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Chính sách bảo mật</h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className={styles.legalContent}>
            <p className={styles.lastUpdated}>Cập nhật lần cuối: Tháng 8, 2026</p>

            <h2>1. Thông tin chúng tôi thu thập</h2>
            <p>{SITE_CONFIG.name} thu thập các thông tin sau khi bạn sử dụng dịch vụ:</p>
            <ul>
              <li><strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, địa chỉ, email</li>
              <li><strong>Thông tin nhu cầu:</strong> Lựa chọn mua/thuê, gói dịch vụ</li>
              <li><strong>Thông tin sức khỏe (nếu cung cấp):</strong> Tình trạng sức khỏe được bạn tự nguyện chia sẻ qua form ghi chú</li>
              <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, trình duyệt, thiết bị truy cập (qua cookie)</li>
            </ul>

            <div className={styles.warningBox}>
              <p><strong>⚠️ Lưu ý về dữ liệu sức khỏe:</strong> Chúng tôi chỉ thu thập thông tin sức khỏe khi bạn tự nguyện cung cấp. Dữ liệu này được bảo vệ nghiêm ngặt theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.</p>
            </div>

            <h2>2. Mục đích sử dụng</h2>
            <ul>
              <li>Liên hệ tư vấn và xử lý đơn hàng</li>
              <li>Cung cấp dịch vụ lắp đặt, bảo hành, bảo trì</li>
              <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
              <li>Cải thiện chất lượng sản phẩm và dịch vụ</li>
            </ul>

            <h2>3. Lưu trữ và bảo vệ dữ liệu</h2>
            <p>Dữ liệu được lưu trữ trên hệ thống Supabase với mã hóa AES-256. Chỉ nhân viên được ủy quyền mới có quyền truy cập. Dữ liệu sức khỏe được lưu trữ riêng biệt với quyền truy cập hạn chế.</p>

            <h2>4. Quyền của bạn</h2>
            <ul>
              <li><strong>Quyền truy cập:</strong> Bạn có quyền yêu cầu xem toàn bộ dữ liệu cá nhân chúng tôi lưu trữ</li>
              <li><strong>Quyền chỉnh sửa:</strong> Bạn có quyền yêu cầu sửa đổi thông tin không chính xác</li>
              <li><strong>Quyền xóa:</strong> Bạn có quyền yêu cầu xóa vĩnh viễn dữ liệu cá nhân</li>
              <li><strong>Quyền phản đối:</strong> Bạn có quyền từ chối nhận thông tin marketing</li>
            </ul>

            <h2>5. Chia sẻ với bên thứ ba</h2>
            <p>Chúng tôi <strong>không bán</strong> dữ liệu cá nhân cho bên thứ ba. Thông tin chỉ được chia sẻ với đối tác vận chuyển/lắp đặt khi cần thiết để hoàn thành dịch vụ.</p>

            <h2>6. Liên hệ về quyền riêng tư</h2>
            <p>Để thực hiện các quyền trên hoặc có thắc mắc về bảo mật, vui lòng liên hệ:</p>
            <ul>
              <li>Email: <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></li>
              <li>Điện thoại: <a href={`tel:${CONTACT_INFO.phoneClean}`}>{CONTACT_INFO.phone}</a></li>
              <li>Địa chỉ: {CONTACT_INFO.fullAddress}</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
