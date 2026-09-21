import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/fe/components/ui/Button';
import { Card } from '@/fe/components/ui/Card';
import { BUY_PLAN, PRODUCT_SPECS } from '@/fe/data/products';
import { CONTACT_INFO } from '@/shared/lib/constants';
import imgRoom from '@/fe/assets/anh_khong_gian_phong.jpg';
import imgDetail from '@/fe/assets/anh_chi_tiet_tre.jpg';
import styles from '../product.module.css';

export const metadata: Metadata = {
  title: 'Mua Máy Xông Hơi Hồng Ngoại Xa — Sở Hữu Trọn Đời tại Huế',
  description:
    'Mua máy xông hơi hồng ngoại xa Sauna Alpaca — Sở hữu trọn đời, bảo hành 1-2 năm, lắp đặt và bảo dưỡng định kỳ tận nhà tại TP. Huế.',
};

export default function BuyPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Mua thiết bị Sauna Alpaca</h1>
          <p className={styles.pageSubtitle}>
            Sở hữu trọn đời máy xông hơi hồng ngoại xa — Đầu tư bền vững cho sức khỏe cha mẹ và cả gia đình
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Header hình ảnh + quyền lợi chính */}
          <div className={styles.specsGrid} style={{ marginBottom: 'var(--space-3xl)' }}>
            <div className={styles.galleryImageWrapper} style={{ height: '380px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <Image
                src={imgRoom}
                alt="Máy xông hơi Sauna Alpaca đặt trong phòng ngủ gia đình"
                fill
                priority
                sizes="(max-width: 960px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div>
              <span className={styles.popularBadge} style={{ position: 'static', display: 'inline-block', marginBottom: 'var(--space-sm)' }}>
                Đầu tư trọn đời
              </span>
              <h2 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-primary-dark)' }}>
                Quyền lợi đặc quyền khi mua
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.7 }}>
                Khi sở hữu máy xông hơi Sauna Alpaca, bạn được chăm sóc toàn diện từ khâu khảo sát không gian tận nhà tại Huế đến bảo trì, kiểm tra nhiệt định kỳ.
              </p>

              <div className={styles.featuresList}>
                {BUY_PLAN.features.map((feature, i) => (
                  <div key={i} className={styles.featureItem}>
                    <div className={styles.featureIcon}>✓</div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className={styles.buyActionButtons}>
                <Button variant="accent" size="lg" href="/lien-he?nhuCau=mua">
                  Liên hệ báo giá ưu đãi
                </Button>
                <Button variant="outline" size="lg" href={`tel:${CONTACT_INFO.phoneClean}`} icon="📞">
                  Gọi tư vấn trực tiếp
                </Button>
              </div>
            </div>
          </div>

          {/* Chi tiết kỹ thuật & Ảnh cận cảnh chất liệu */}
          <div className={styles.specsGrid}>
            <Card variant="elevated">
              <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-primary-dark)' }}>
                Thông số kỹ thuật tiêu chuẩn
              </h3>
              <table className={styles.specsTable}>
                <tbody>
                  <tr><td>Tên sản phẩm</td><td>{PRODUCT_SPECS.name}</td></tr>
                  <tr><td>Chất liệu</td><td>{PRODUCT_SPECS.material}</td></tr>
                  <tr><td>Công nghệ</td><td>{PRODUCT_SPECS.technology}</td></tr>
                  <tr><td>Bước sóng FIR</td><td>{PRODUCT_SPECS.wavelength}</td></tr>
                  <tr><td>Công suất điện</td><td>{PRODUCT_SPECS.power}</td></tr>
                  <tr><td>Kích thước</td><td>{PRODUCT_SPECS.dimensions}</td></tr>
                  <tr><td>Khối lượng</td><td>{PRODUCT_SPECS.weight}</td></tr>
                  <tr><td>Chính sách bảo hành</td><td>1 - 2 năm chính hãng tại nhà</td></tr>
                </tbody>
              </table>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className={styles.galleryImageWrapper} style={{ height: '240px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <Image
                  src={imgDetail}
                  alt="Cận cảnh vân tre tự nhiên và tấm sưởi hồng ngoại xa"
                  fill
                  sizes="(max-width: 960px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <Card variant="outlined">
                <p style={{ margin: 0, fontSize: 'var(--fs-small)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  💡 <strong>Cam kết từ Sauna Alpaca Huế:</strong> Khảo sát không gian miễn phí trước khi quyết định mua. Lắp đặt thử nghiệm, hướng dẫn cách sử dụng cặn kẽ cho người lớn tuổi trong gia đình.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
