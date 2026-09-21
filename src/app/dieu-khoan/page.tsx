import type { Metadata } from 'next';
import { SITE_CONFIG, CONTACT_INFO } from '@/shared/lib/constants';
import styles from '../legal.module.css';
import pStyles from '../san-pham/product.module.css';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ Sauna Alpaca.',
};

export default function TermsPage() {
  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Điều khoản dịch vụ</h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className={styles.legalContent}>
            <p className={styles.lastUpdated}>Cập nhật lần cuối: Tháng 8, 2026</p>

            <h2>1. Giới thiệu</h2>
            <p>Các điều khoản dưới đây quy định quyền và nghĩa vụ khi bạn sử dụng dịch vụ mua hoặc thuê máy xông hơi hồng ngoại xa {SITE_CONFIG.name}.</p>

            <h2>2. Dịch vụ mua thiết bị</h2>
            <ul>
              <li>Giá bán được thỏa thuận trực tiếp qua tư vấn viên</li>
              <li>Thanh toán theo phương thức thỏa thuận (tiền mặt, chuyển khoản)</li>
              <li>Quyền sở hữu chuyển giao sau khi thanh toán đầy đủ</li>
              <li>Bảo hành 1-2 năm cho lỗi nhà sản xuất</li>
            </ul>

            <h2>3. Dịch vụ thuê thiết bị</h2>
            <ul>
              <li>Hợp đồng thuê có thời hạn 3, 6, hoặc 12 tháng</li>
              <li>Thanh toán phí thuê hàng tháng theo thỏa thuận</li>
              <li>Thiết bị vẫn thuộc sở hữu của {SITE_CONFIG.name}</li>
              <li>Khách hàng có trách nhiệm bảo quản thiết bị</li>
              <li>Đền bù thiệt hại nếu hư hỏng do sử dụng sai cách</li>
            </ul>

            <h2>4. Hủy và hoàn tiền</h2>
            <ul>
              <li><strong>Mua:</strong> Đổi trả trong 7 ngày nếu sản phẩm có lỗi nhà sản xuất</li>
              <li><strong>Thuê:</strong> Hủy hợp đồng sớm cần thông báo trước 30 ngày</li>
              <li>Hoàn tiền được xử lý trong 7-14 ngày làm việc</li>
            </ul>

            <h2>5. Giới hạn trách nhiệm</h2>
            <p>{SITE_CONFIG.name} không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng sản phẩm. Trách nhiệm tối đa không vượt quá giá trị đơn hàng.</p>

            <h2>6. Liên hệ</h2>
            <p>Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ: <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></p>
          </div>
        </div>
      </section>
    </>
  );
}
