import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/shared/lib/constants';
import styles from '../legal.module.css';
import pStyles from '../san-pham/product.module.css';

export const metadata: Metadata = {
  title: 'Miễn trừ trách nhiệm y tế',
  description: 'Tuyên bố miễn trừ trách nhiệm y tế — Sauna Alpaca là thiết bị gia dụng, không phải thiết bị y tế.',
};

export default function MedicalDisclaimerPage() {
  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Miễn trừ trách nhiệm y tế</h1>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className={styles.legalContent}>
            <p className={styles.lastUpdated}>Cập nhật lần cuối: Tháng 8, 2026</p>

            <div className={styles.warningBox}>
              <p><strong>⚕️ TUYÊN BỐ QUAN TRỌNG:</strong> {SITE_CONFIG.name} là thiết bị gia dụng hỗ trợ sức khỏe. Đây <strong>KHÔNG</strong> phải thiết bị y tế và <strong>KHÔNG</strong> thay thế phác đồ điều trị của bác sĩ.</p>
            </div>

            <h2>1. Bản chất sản phẩm</h2>
            <p>{SITE_CONFIG.name} là máy xông hơi sử dụng công nghệ hồng ngoại xa (FIR) được thiết kế như thiết bị gia dụng nhằm hỗ trợ sức khỏe và thư giãn. Sản phẩm không được đăng ký hoặc cấp phép như thiết bị y tế.</p>

            <h2>2. Không thay thế điều trị y tế</h2>
            <ul>
              <li>Sản phẩm <strong>không</strong> có tác dụng chẩn đoán, điều trị, chữa trị hay phòng ngừa bất kỳ bệnh tật nào</li>
              <li>Các thông tin về lợi ích sức khỏe trên website chỉ mang tính tham khảo từ nghiên cứu khoa học</li>
              <li>Không được ngừng hoặc thay đổi bất kỳ phương pháp điều trị nào mà bác sĩ đã kê đơn</li>
            </ul>

            <h2>3. Tham khảo ý kiến bác sĩ</h2>
            <p><strong>Bắt buộc tham khảo ý kiến bác sĩ trước khi sử dụng</strong> nếu bạn thuộc một trong các trường hợp sau:</p>
            <ul>
              <li>Đang điều trị bệnh mạn tính (suy thận, tim mạch, tiểu đường...)</li>
              <li>Đang sử dụng thuốc kê đơn</li>
              <li>Có tiền sử bệnh tim mạch</li>
              <li>Đang mang thai hoặc nghi ngờ mang thai</li>
              <li>Trẻ em dưới 16 tuổi</li>
            </ul>

            <h2>4. Chống chỉ định</h2>
            <p><strong>KHÔNG sử dụng</strong> sản phẩm trong các trường hợp:</p>
            <ul>
              <li>Đang sốt cao (trên 38.5°C)</li>
              <li>Suy tim nặng không kiểm soát được</li>
              <li>Có vết thương hở hoặc viêm da cấp tính</li>
              <li>Đang trong tình trạng say rượu hoặc sử dụng chất kích thích</li>
              <li>Mới phẫu thuật trong vòng 48 giờ</li>
              <li>Có thiết bị cấy ghép điện tử (máy tạo nhịp tim)</li>
            </ul>

            <h2>5. Giới hạn trách nhiệm</h2>
            <p>{SITE_CONFIG.name} không chịu trách nhiệm cho bất kỳ hậu quả sức khỏe nào phát sinh từ việc sử dụng sản phẩm mà không tuân thủ hướng dẫn sử dụng hoặc không tham khảo ý kiến bác sĩ.</p>
          </div>
        </div>
      </section>
    </>
  );
}
