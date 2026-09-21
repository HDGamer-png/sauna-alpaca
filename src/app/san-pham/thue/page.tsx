import type { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/fe/components/ui/Button';
import { Card } from '@/fe/components/ui/Card';
import { RENT_PLANS } from '@/fe/data/products';
import imgUser from '@/fe/assets/anh_nguoi_lon_tuoi.jpg';
import styles from '../product.module.css';

export const metadata: Metadata = {
  title: 'Thuê Máy Xông Hơi Theo Tháng — Linh Hoạt & Tiết Kiệm tại Huế',
  description:
    'Thuê máy xông hơi hồng ngoại xa Sauna Alpaca theo tháng tại Huế — Gói 3, 6, 12 tháng. Không cần vốn lớn, miễn phí lắp đặt, bảo dưỡng tận nơi trọn đời hợp đồng.',
};

export default function RentPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>Thuê máy xông hơi theo tháng</h1>
          <p className={styles.pageSubtitle}>
            Trải nghiệm xông phục hồi sức khỏe không cần đầu tư vốn lớn — Linh hoạt, an tâm, tiết kiệm
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Banner giới thiệu giải pháp thuê */}
          <div className={styles.specsGrid} style={{ marginBottom: 'var(--space-3xl)', alignItems: 'center' }}>
            <div>
              <span className={styles.popularBadge} style={{ position: 'static', display: 'inline-block', marginBottom: 'var(--space-sm)' }}>
                Giải pháp thông minh
              </span>
              <h2 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-primary-dark)' }}>
                Tại sao dịch vụ thuê được ưa chuộng?
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-md)' }}>
                Mô hình thuê theo tháng giúp gia đình bạn dễ dàng trải nghiệm hiệu quả xông dưỡng sinh hồng ngoại xa ngay tại nhà mà không phải đắn đo về chi phí đầu tư thiết bị ban đầu.
              </p>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <span><strong>Không rủi ro:</strong> Đổi máy mới lập tức nếu có bất kỳ lỗi kỹ thuật nào.</span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <span><strong>Bảo dưỡng miễn phí:</strong> Kỹ thuật viên kiểm tra tấm nhiệt định kỳ tại nhà.</span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✓</div>
                  <span><strong>Linh hoạt thời hạn:</strong> Dễ dàng gia hạn, nâng cấp hoặc kết thúc hợp đồng khi hết nhu cầu.</span>
                </div>
              </div>
            </div>

            <div className={styles.galleryImageWrapper} style={{ height: '340px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <Image
                src={imgUser}
                alt="Người lớn tuổi trải nghiệm xông hơi phục hồi sức khỏe an toàn"
                fill
                priority
                sizes="(max-width: 960px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <h2 className="section__title">Lựa chọn gói thuê phù hợp</h2>
          <p className="section__subtitle">
            3 gói thuê linh hoạt — Thời hạn càng dài, giá thuê càng tiết kiệm
          </p>

          <div className={styles.pricingGrid}>
            {RENT_PLANS.map((plan) => (
              <Card
                key={plan.id}
                variant={plan.highlighted ? 'featured' : 'elevated'}
                className={plan.highlighted ? styles.pricingHighlighted : ''}
              >
                <div className={styles.pricingCard}>
                  <div className={styles.pricingHeader}>
                    <div className={styles.pricingBadgeRow}>
                      {plan.highlighted ? (
                        <span className={styles.pricingCardBadge}>Được chọn nhiều nhất ⭐</span>
                      ) : null}
                    </div>
                    <h3 className={styles.pricingName}>{plan.name}</h3>
                    <p className={styles.pricingDesc}>{plan.description}</p>
                    <div className={styles.pricingPrice}>Liên hệ báo giá</div>
                  </div>

                  <div className={styles.pricingFeatures}>
                    {plan.features.map((feature, i) => (
                      <div key={i} className={styles.pricingFeature}>
                        <span className={styles.checkIcon}>✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.pricingButtonWrapper}>
                    <Button
                      variant={plan.highlighted ? 'accent' : 'primary'}
                      fullWidth
                      href={plan.ctaHref}
                    >
                      {plan.ctaText}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
            <Button variant="ghost" href="/san-pham/so-sanh">
              📊 So sánh chi tiết quyền lợi giữa Mua và Thuê →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
