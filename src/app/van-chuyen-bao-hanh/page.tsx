import type { Metadata } from 'next';
import { SITE_CONFIG, CONTACT_INFO } from '@/shared/lib/constants';
import styles from '../legal.module.css';
import pStyles from '../san-pham/product.module.css';

export const metadata: Metadata = {
  title: 'Vận chuyển, Lắp đặt & Bảo hành',
  description: 'Chính sách vận chuyển, lắp đặt tận nhà và bảo hành máy xông hơi Sauna Alpaca tại Huế.',
};

export default function ShippingPage() {
  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Vận chuyển, Lắp đặt & Bảo hành</h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className={styles.legalContent}>
            <p className={styles.lastUpdated}>Cập nhật lần cuối: Tháng 8, 2026</p>

            <h2>1. Phạm vi giao hàng</h2>
            <ul>
              <li><strong>Toàn thành phố Huế:</strong> Giao hàng miễn phí</li>
              <li><strong>Ngoài khu vực phục vụ:</strong> Vui lòng liên hệ để được báo giá</li>
            </ul>

            <h2>2. Thời gian giao hàng & lắp đặt</h2>
            <ul>
              <li>Thời gian giao hàng: 2-5 ngày làm việc sau khi xác nhận đơn</li>
              <li>Lắp đặt tại nhà: 30-60 phút bởi kỹ thuật viên</li>
              <li>Hướng dẫn sử dụng chi tiết 1-1 sau lắp đặt</li>
              <li>Lịch giao hàng được thỏa thuận phù hợp với khách hàng</li>
            </ul>

            <h2>3. Bảo hành — Mua thiết bị</h2>
            <ul>
              <li><strong>Thời gian:</strong> 1-2 năm kể từ ngày lắp đặt</li>
              <li><strong>Phạm vi:</strong> Lỗi nhà sản xuất, linh kiện điện tử, tấm phát hồng ngoại</li>
              <li><strong>Không bảo hành:</strong> Hư hỏng do sử dụng sai cách, thiên tai, tự ý sửa chữa</li>
              <li><strong>Hình thức:</strong> Sửa chữa tại nhà hoặc thay thế linh kiện miễn phí</li>
            </ul>

            <h2>4. Bảo trì — Thuê thiết bị</h2>
            <ul>
              <li>Bảo dưỡng <strong>tận nơi</strong> trong suốt thời gian hợp đồng</li>
              <li>Đổi máy mới nếu thiết bị có lỗi kỹ thuật không sửa được</li>
              <li>Hỗ trợ kỹ thuật qua điện thoại: trong vòng 2 giờ</li>
              <li>Kỹ thuật viên đến tận nhà: trong vòng 24 giờ</li>
            </ul>

            <h2>5. Thu hồi thiết bị (thuê)</h2>
            <p>Khi hết hợp đồng thuê, {SITE_CONFIG.name} sẽ thu hồi thiết bị miễn phí tại nhà khách hàng. Khách hàng có quyền gia hạn hợp đồng hoặc chuyển sang mua với giá ưu đãi.</p>

            <h2>6. Liên hệ hỗ trợ</h2>
            <p>Hotline hỗ trợ kỹ thuật: <a href={`tel:${CONTACT_INFO.phoneClean}`}><strong>{CONTACT_INFO.phone}</strong></a></p>
            <p>Email: <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></p>
          </div>
        </div>
      </section>
    </>
  );
}
