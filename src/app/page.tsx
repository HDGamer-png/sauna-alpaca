import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/fe/components/ui/Button';
import { Card } from '@/fe/components/ui/Card';
import { SaunaChair3DViewer } from '@/fe/components/ui/SaunaChair3DViewer';
import { CONTACT_INFO } from '@/shared/lib/constants';
import { PROCESS_STEPS, TESTIMONIALS_DATA } from '@/fe/data/testimonials';
import heroImage from '@/fe/assets/anh_khong_gian_phong.jpg';
import styles from './page.module.css';
import cStyles from './content.module.css';

/**
 * Trang chủ — Sauna Alpaca
 * Landing page hoàn chỉnh:
 * 1. Hero (CTA chính + Ảnh không gian phòng khách ấm áp)
 * 2. Benefits (4 lợi ích y khoa)
 * 3. Product Preview (Mua vs Thuê)
 * 4. Quy trình 4 bước tận nhà tại Huế
 * 5. Research (Cơ sở khoa học PubMed)
 * 6. Testimonials (Lời chứng thực khách hàng tại Huế)
 * 7. CTA cuối trang
 */
export default function HomePage() {
  return (
    <>
      {/* ═══ 1. HERO SECTION ═══ */}
      <section className={styles.hero} id="hero">
        <div className={`container ${styles.heroContainer}`}>
          {/* DIV RIÊNG DÀNH CHO BẢN DEMO SẢN PHẨM Ở NGAY ĐẦU TRANG */}
          <div className={styles.heroDemoWrapper}>
            <SaunaChair3DViewer />
          </div>

          {/* CÂU NỘI DUNG TRONG ẢNH NGAY DƯỚI DEMO SẢN PHẨM */}
          <div className={styles.heroContentBelow}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              Thí điểm tại Huế — Khảo sát & Lắp đặt tận nhà
            </div>

            <h1 className={styles.heroTitle}>
              Chăm sóc sức khỏe{' '}
              <span className={styles.heroTitleAccent}>tại nhà</span> với công nghệ
              hồng ngoại xa
            </h1>

            <p className={styles.heroDescription}>
              Máy xông hơi Sauna Alpaca — thiết kế tre tự nhiên 100%, hỗ trợ tuần hoàn máu, giảm đau
              nhức xương khớp và hồi phục vi tuần hoàn. An toàn tuyệt đối cho người lớn tuổi và hỗ trợ người bệnh thận.
            </p>

            <div className={styles.heroCtas}>
              <Button
                variant="accent"
                size="lg"
                href="/san-pham"
                icon="🎋"
                className={styles.heroCtaBtn}
              >
                Xem chi tiết sản phẩm
              </Button>
              <Button
                variant="outlineLight"
                size="lg"
                href={`tel:${CONTACT_INFO.phoneClean}`}
                icon="📞"
                className={styles.heroCtaBtn}
              >
                Gọi tư vấn miễn phí
              </Button>
            </div>

            <div className={styles.heroTrust}>
              <div className={styles.heroTrustItem}>
                <span className={styles.heroTrustNumber}>100%</span>
                <span className={styles.heroTrustLabel}>Tre tự nhiên</span>
              </div>
              <div className={styles.heroTrustItem}>
                <span className={styles.heroTrustNumber}>FIR</span>
                <span className={styles.heroTrustLabel}>Hồng ngoại xa 5.6-15μm</span>
              </div>
              <div className={styles.heroTrustItem}>
                <span className={styles.heroTrustNumber}>1 m²</span>
                <span className={styles.heroTrustLabel}>Gọn gàng trong nhà</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. BENEFITS SECTION ═══ */}
      <section className={`section ${styles.benefits}`} id="benefits">
        <div className="container">
          <h2 className="section__title">Vì sao chọn xông hồng ngoại xa tại nhà?</h2>
          <p className="section__subtitle">
            Khác biệt với xông hơi nước truyền thống gây khó thở và gánh nặng tim mạch, nhiệt hồng ngoại xa thẩm thấu sâu, êm dịu và an toàn cho người lớn tuổi.
          </p>

          <div className={styles.benefitsGrid}>
            {BENEFITS.map((benefit, index) => (
              <Card key={index} variant="elevated">
                <div className={styles.benefitCard}>
                  <span className={styles.benefitIcon}>{benefit.icon}</span>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p className={styles.benefitDescription}>{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. PRODUCT PREVIEW SECTION ═══ */}
      <section className={`section ${styles.productPreview}`} id="product-preview">
        <div className="container">
          <h2 className="section__title">Giải pháp linh hoạt theo nhu cầu</h2>
          <p className="section__subtitle">
            Hai cách tiếp cận linh hoạt — Thuê theo tháng không cần vốn lớn hoặc Mua sở hữu trọn đời
          </p>

          <div className={styles.productGrid}>
            {/* Thuê */}
            <Card variant="featured" className={styles.productCardItem}>
              <div className={styles.productCard}>
                <span className={styles.productCardBadge}>Phổ biến nhất ⭐</span>
                <span className={styles.productCardIcon}>📋</span>
                <h3 className={styles.productCardTitle}>Thuê theo tháng</h3>
                <p className={styles.productCardPrice}>Liên hệ báo giá ưu đãi</p>
                <div className={styles.productCardFeatures}>
                  {RENT_FEATURES.map((feature, index) => (
                    <div key={index} className={styles.productCardFeature}>
                      <span className={styles.featureCheck}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.productCardAction}>
                  <Button variant="accent" fullWidth href="/san-pham/thue">
                    Xem chi tiết các gói thuê →
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mua */}
            <Card variant="elevated" className={styles.productCardItem}>
              <div className={styles.productCard}>
                <span className={styles.productCardIcon}>🏠</span>
                <h3 className={styles.productCardTitle}>Mua thiết bị sở hữu trọn đời</h3>
                <p className={styles.productCardPrice}>Liên hệ báo giá ưu đãi</p>
                <div className={styles.productCardFeatures}>
                  {BUY_FEATURES.map((feature, index) => (
                    <div key={index} className={styles.productCardFeature}>
                      <span className={styles.featureCheck}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.productCardAction}>
                  <Button variant="primary" fullWidth href="/san-pham/mua">
                    Tìm hiểu quyền lợi mua →
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.galleryOverviewWrapper}>
            <Link href="/san-pham" className={styles.galleryOverviewCta}>
              <span className={styles.galleryOverviewIcon}>🔍</span>
              <span>Xem trang tổng quan sản phẩm & Gallery hình ảnh</span>
              <span className={styles.galleryOverviewArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 4. PROCESS SECTION (Quy trình 4 bước) ═══ */}
      <section className="section section--alt" id="process">
        <div className="container">
          <h2 className="section__title">Quy trình phục vụ tận nhà tại Huế</h2>
          <p className="section__subtitle">
            Đơn giản, nhanh chóng và không làm xáo trộn không gian sống của gia đình bạn
          </p>

          <div className={cStyles.processGrid}>
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className={cStyles.processStepCard}>
                <div className={cStyles.processStepBadge}>0{step.step}</div>
                <div className={cStyles.processStepIcon}>{step.icon}</div>
                <h3 className={cStyles.processStepTitle}>{step.title}</h3>
                <div className={cStyles.processStepSubtitle}>{step.subtitle}</div>
                <p className={cStyles.processStepDesc}>{step.description}</p>
                {step.timeframe && (
                  <div>
                    <span className={cStyles.processStepTime}>⏱️ {step.timeframe}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. RESEARCH SECTION ═══ */}
      <section className={`section ${styles.research}`} id="research">
        <div className="container">
          <div className={styles.researchContent}>
            <div className={styles.researchVisual}>
              <span className={styles.researchVisualIcon}>🔬</span>
              <h3 className={styles.researchVisualTitle}>Cơ sở khoa học vững chắc</h3>
              <p className={styles.researchVisualText}>
                Công nghệ hồng ngoại xa bước sóng 5.6-15μm đã được ghi nhận trên nhiều tạp chí y khoa quốc tế uy tín (JASN, Pain Medicine Journal, Canadian Journal of Cardiology).
              </p>
            </div>

            <div className={styles.researchText}>
              <h2 className="section__title">Nghiên cứu lâm sàng quốc tế</h2>
              <p className="section__subtitle" style={{ textAlign: 'left', margin: 0 }}>
                Hỗ trợ tăng sinh Nitric Oxide (NO), cải thiện lưu thông máu và hỗ trợ chức năng nội mạc mạch máu ở bệnh nhân suy thận mạn.
              </p>

              <div className={styles.researchList}>
                {RESEARCH_HIGHLIGHTS.map((item, index) => (
                  <div key={index} className={styles.researchItem}>
                    <div className={styles.researchItemIcon}>{item.icon}</div>
                    <div className={styles.researchItemContent}>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" href="/nghien-cuu">
                Đọc các bài nghiên cứu chi tiết →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. TESTIMONIALS SECTION (Khách hàng nói gì) ═══ */}
      <section className="section" id="testimonials">
        <div className="container">
          <h2 className="section__title">Khách hàng tại Huế nói gì về Sauna Alpaca?</h2>
          <p className="section__subtitle">
            Trải nghiệm thực tế của người dùng và người nhà bệnh nhân tại TP. Huế
          </p>

          <div className={cStyles.testimonialGrid}>
            {TESTIMONIALS_DATA.map((item) => (
              <div key={item.id} className={cStyles.testimonialCard}>
                <div className={cStyles.testimonialRating}>
                  {'★'.repeat(item.rating)}
                </div>
                <p className={cStyles.testimonialQuote}>
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className={cStyles.testimonialAuthor}>
                  <div className={cStyles.testimonialAvatar}>
                    {item.avatarText}
                  </div>
                  <div className={cStyles.testimonialInfo}>
                    <span className={cStyles.testimonialName}>{item.name} {item.age ? `(${item.age} tuổi)` : ''}</span>
                    <span className={cStyles.testimonialRole}>{item.role}</span>
                    <span className={cStyles.testimonialLocation}>📍 {item.location} • {item.condition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. CTA SECTION ═══ */}
      <section className={`section ${styles.cta}`} id="cta">
        <div className="container">
          <h2 className={styles.ctaTitle}>Sẵn sàng trải nghiệm tại nhà?</h2>
          <p className={styles.ctaDescription}>
            Hãy để chúng tôi khảo sát không gian miễn phí và tư vấn gói xông phù hợp nhất với thể trạng của bạn hoặc người thân.
          </p>
          <div className={styles.ctaButtons}>
            <Button
              variant="accent"
              size="lg"
              href="/lien-he"
              icon="✉️"
              className={styles.ctaBtn}
            >
              Đăng ký tư vấn tận nhà
            </Button>
            <Button
              variant="outlineLight"
              size="lg"
              href={`tel:${CONTACT_INFO.phoneClean}`}
              icon="📞"
              className={styles.ctaBtn}
            >
              Gọi hotline: {CONTACT_INFO.phone}
            </Button>
          </div>
          <p className={styles.ctaPhone}>
            Địa chỉ phục vụ tại Huế: <strong>{CONTACT_INFO.fullAddress}</strong>
          </p>
        </div>
      </section>

      {/* Schema Markup — JSON-LD LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Sauna Alpaca Huế',
            description: 'Cung cấp và cho thuê máy xông hơi hồng ngoại xa gia dụng tre tự nhiên tại TP. Huế',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '64 Lê Thánh Tôn, P. Phú Xuân',
              addressLocality: 'Huế',
              addressRegion: 'Thừa Thiên Huế',
              addressCountry: 'VN',
            },
            telephone: CONTACT_INFO.phoneClean,
            areaServed: 'Huế',
            priceRange: '$$',
          }),
        }}
      />
    </>
  );
}

/* ──── Static Highlights Data ──── */
const BENEFITS = [
  {
    icon: '❤️',
    title: 'Hỗ trợ vi tuần hoàn & tim mạch',
    description: 'Nhiệt sâu kích thích giãn vi mạch, tăng lưu thông máu và giảm gánh nặng áp lực cho thành mạch.',
  },
  {
    icon: '🦴',
    title: 'Xoa dịu đau nhức xương khớp',
    description: 'Nhiệt hồng ngoại xa thẩm thấu 3-5cm giúp giãn cơ, giảm xơ cứng khớp gối và đau mỏi lưng mùa lạnh ở Huế.',
  },
  {
    icon: '🧘',
    title: 'Thư giãn & cải thiện giấc ngủ',
    description: 'Giảm căng thẳng hệ thần kinh, toát mồ hôi êm dịu không ngột ngạt, giúp người lớn tuổi ngủ sâu giấc hơn.',
  },
  {
    icon: '🫁',
    title: 'Hỗ trợ bệnh nhân suy thận',
    description: 'Nghiên cứu lâm sàng quốc tế chỉ ra liệu pháp FIR hỗ trợ bảo tồn chức năng nội mạc mạch máu ở bệnh nhân chạy thận.',
  },
];

const BUY_FEATURES = [
  'Sở hữu trọn đời sản phẩm',
  'Bảo hành 1 - 2 năm tận nơi',
  'Miễn phí lắp đặt tận nhà tại Huế',
  'Bảo trì kỹ thuật định kỳ',
  'Hướng dẫn sử dụng 1-1 cho cha mẹ',
  'Chất liệu tre tự nhiên 100% bền bỉ',
];

const RENT_FEATURES = [
  'Không cần vốn đầu tư lớn ban đầu',
  'Các gói 3 / 6 / 12 tháng linh hoạt',
  'Miễn phí 100% vận chuyển & lắp đặt',
  'Bảo dưỡng miễn phí suốt chu kỳ thuê',
  'Đổi máy mới lập tức nếu có sự cố',
  'Tùy chọn mua lại máy với giá ưu đãi',
];

const RESEARCH_HIGHLIGHTS = [
  {
    icon: '📊',
    title: 'Giãn nở nội mạc mạch máu',
    description: 'Nghiên cứu chỉ ra liệu pháp FIR kích hoạt enzyme eNOS tăng sản sinh NO, cải thiện lưu thông mạch máu.',
  },
  {
    icon: '🏥',
    title: 'Bảo tồn đường thông AVF cho bệnh nhân thận',
    description: 'Bài báo trên tạp chí JASN ghi nhận cải thiện lưu lượng máu và giảm tắc nghẽn đường mổ AVF.',
  },
  {
    icon: '🧬',
    title: 'Giảm chất trung gian gây viêm',
    description: 'Tia hồng ngoại 5.6-15μm giảm các cytokine gây viêm, làm dịu đau nhức khớp mạn tính mà không cần dùng thuốc.',
  },
];
