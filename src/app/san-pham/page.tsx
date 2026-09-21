import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/fe/components/ui/Button';
import { Card } from '@/fe/components/ui/Card';
import { PRODUCT_SPECS, PRODUCT_INTRO, PRODUCT_GALLERY } from '@/fe/data/products';
import styles from './product.module.css';

export const metadata: Metadata = {
  title: 'Sản phẩm — Máy Xông Hơi Hồng Ngoại Xa Thông Minh',
  description:
    'Khám phá máy xông hơi hồng ngoại xa Sauna Alpaca tại Huế — Thiết kế tre tự nhiên 100%, bước sóng sinh học 5.6-15μm, mua sở hữu trọn đời hoặc thuê theo tháng linh hoạt.',
};

export default function ProductPage() {
  return (
    <>
      {/* ═══ Header ═══ */}
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>{PRODUCT_INTRO.name}</h1>
          <p className={styles.pageSubtitle}>{PRODUCT_INTRO.tagline}</p>
        </div>
      </div>

      {/* ═══ Chọn Mua hoặc Thuê (CTA Nhanh) ═══ */}
      <section className="section">
        <div className="container">
          <h2 className="section__title">Lựa chọn giải pháp phù hợp với bạn</h2>
          <p className="section__subtitle">
            Hai phương án linh hoạt giúp bạn và người thân tiếp cận công nghệ xông nhiệt dưỡng sinh ngay tại nhà
          </p>

          <div className={styles.optionsGrid}>
            <Card variant="elevated">
              <div className={styles.optionCard}>
                <span className={styles.optionIcon}>🏠</span>
                <h3 className={styles.optionTitle}>Mua thiết bị sở hữu trọn đời</h3>
                <p className={styles.optionDesc}>
                  Đầu tư sức khỏe lâu dài cho cả gia đình. Miễn phí vận chuyển & lắp đặt tận nhà tại Huế, bảo hành 1-2 năm, bảo dưỡng định kỳ.
                </p>
                <Button variant="primary" size="lg" fullWidth href="/san-pham/mua">
                  Tìm hiểu chi tiết gói Mua →
                </Button>
              </div>
            </Card>

            <Card variant="featured">
              <div className={styles.optionCard}>
                <span className={styles.popularBadge}>Được chọn nhiều ⭐</span>
                <span className={styles.optionIcon}>📋</span>
                <h3 className={styles.optionTitle}>Thuê theo tháng linh hoạt</h3>
                <p className={styles.optionDesc}>
                  Không cần vốn lớn ban đầu. Các gói 3, 6, 12 tháng linh hoạt, bảo trì miễn phí trọn gói, đổi máy mới ngay nếu có sự cố.
                </p>
                <Button variant="accent" size="lg" fullWidth href="/san-pham/thue">
                  Xem các gói Thuê ưu đãi →
                </Button>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="ghost" href="/san-pham/so-sanh">
              📊 Xem bảng so sánh chi tiết giữa Mua & Thuê →
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ Giới thiệu chi tiết sản phẩm (Dễ dàng cập nhật sau này) ═══ */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title">Giới thiệu sản phẩm Sauna Alpaca</h2>
          <p className="section__subtitle">
            {PRODUCT_INTRO.shortDescription}
          </p>

          {/* Đoạn văn mô tả tổng quan */}
          <div style={{ maxWidth: '800px', margin: '0 auto var(--space-2xl)', background: 'white', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            {PRODUCT_INTRO.fullDescription.map((p, idx) => (
              <p key={idx} style={{ fontSize: 'var(--fs-body)', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: 'var(--space-md)' }}>
                {p}
              </p>
            ))}
          </div>

          {/* Các khối thông tin mở rộng */}
          <div className={styles.introBlocksGrid}>
            {PRODUCT_INTRO.detailedSections.map((sec) => (
              <div key={sec.id} className={styles.introBlockCard}>
                <div className={styles.introBlockHeader}>
                  <span className={styles.introBlockIcon}>{sec.icon}</span>
                  <h3 className={styles.introBlockTitle}>{sec.title}</h3>
                </div>
                <p className={styles.introBlockSummary}>{sec.summary}</p>
                <div className={styles.introBlockList}>
                  {sec.points.map((pt, pIdx) => (
                    <div key={pIdx} className={styles.introBlockPoint}>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Gallery Hình ảnh thực tế (0Đ AI Generated Assets) ═══ */}
      <section className="section">
        <div className="container">
          <h2 className="section__title">Hình ảnh thực tế & Không gian gia đình</h2>
          <p className="section__subtitle">
            Khám phá kiểu dáng tinh gọn, chất liệu tre tự nhiên và trải nghiệm xông hơi ấm áp
          </p>

          <div className={styles.galleryGrid}>
            {PRODUCT_GALLERY.map((item) => (
              <div key={item.id} className={styles.galleryCard}>
                <div className={styles.galleryImageWrapper}>
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.galleryContent}>
                  <h3 className={styles.galleryTitle}>{item.title}</h3>
                  <p className={styles.galleryCaption}>{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Bảng thông số kỹ thuật ═══ */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section__title">Thông số kỹ thuật sản phẩm</h2>
          <p className="section__subtitle">
            Tiêu chuẩn an toàn điện và tối ưu cho người lớn tuổi
          </p>

          <div className={styles.specsGrid}>
            <table className={styles.specsTable}>
              <tbody>
                <tr><td>Tên sản phẩm</td><td>{PRODUCT_SPECS.name}</td></tr>
                <tr><td>Chất liệu vách</td><td>{PRODUCT_SPECS.material}</td></tr>
                <tr><td>Công nghệ nhiệt</td><td>{PRODUCT_SPECS.technology}</td></tr>
                <tr><td>Dải bước sóng</td><td>{PRODUCT_SPECS.wavelength}</td></tr>
                <tr><td>Công suất điện</td><td>{PRODUCT_SPECS.power}</td></tr>
                <tr><td>Nguồn điện</td><td>{PRODUCT_SPECS.voltage}</td></tr>
                <tr><td>Nhiệt độ cài đặt</td><td>{PRODUCT_SPECS.temperature}</td></tr>
                <tr><td>Kích thước</td><td>{PRODUCT_SPECS.dimensions}</td></tr>
                <tr><td>Trọng lượng</td><td>{PRODUCT_SPECS.weight}</td></tr>
                <tr><td>Sức chứa</td><td>{PRODUCT_SPECS.capacity}</td></tr>
                <tr><td>Bảo hành & Bảo trì</td><td>{PRODUCT_SPECS.warranty}</td></tr>
              </tbody>
            </table>

            <div className={styles.featuresList}>
              <h3 style={{ fontSize: 'var(--fs-h3)', color: 'var(--color-primary-dark)', marginBottom: 'var(--space-md)' }}>
                Đặc điểm vận hành nổi bật
              </h3>
              {PRODUCT_SPECS.features.map((feature, i) => (
                <div key={i} className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <span>{feature}</span>
                </div>
              ))}

              <div className={styles.specsActions}>
                <Button variant="accent" size="lg" href="/lien-he" className={styles.specsBtn}>
                  Đăng ký tư vấn tận nhà →
                </Button>
                <Button variant="outline" size="lg" href="/san-pham/so-sanh" className={styles.specsBtn}>
                  So sánh Mua vs Thuê
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Schema Markup (JSON-LD Product) ═══ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: PRODUCT_SPECS.name,
            description: PRODUCT_INTRO.shortDescription,
            category: 'Health Care Appliances',
            material: 'Bamboo',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'VND',
              price: 'Contact for Quote',
              availability: 'https://schema.org/InStock',
              areaServed: {
                '@type': 'City',
                name: 'Huế',
              },
            },
          }),
        }}
      />
    </>
  );
}
