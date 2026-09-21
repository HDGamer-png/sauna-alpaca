'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/fe/components/ui/Card';
import { Button } from '@/fe/components/ui/Button';
import { CONTACT_INFO, MEDICAL_DISCLAIMER } from '@/shared/lib/constants';
import styles from '../content.module.css';
import pStyles from '../san-pham/product.module.css';

/**
 * Form Liên hệ & Đặt hàng — Tối ưu cho người lớn tuổi
 * Tự động đồng bộ với nhu cầu và gói thuê từ URL
 */
function ContactFormContent() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nhuCau, setNhuCau] = useState<string>('');
  const [goiThue, setGoiThue] = useState<string>('6thang');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tự động nhận tham số từ URL
  useEffect(() => {
    const paramNhuCau = searchParams.get('nhuCau');
    const paramGoi = searchParams.get('goi');

    if (paramNhuCau && ['mua', 'thue', 'tuvan'].includes(paramNhuCau)) {
      setNhuCau(paramNhuCau);
    }
    if (paramGoi && ['3thang', '6thang', '12thang'].includes(paramGoi)) {
      setGoiThue(paramGoi);
    }
  }, [searchParams]);

  const validate = (formData: FormData) => {
    const errs: Record<string, string> = {};
    const hoTen = formData.get('hoTen') as string;
    const sdt = formData.get('soDienThoai') as string;
    const diaChi = formData.get('diaChi') as string;

    if (!hoTen || hoTen.trim().length < 2) errs.hoTen = 'Vui lòng nhập họ tên của bạn';
    if (!sdt || !/^(0[3|5|7|8|9])[0-9]{8}$/.test(sdt.replace(/\s+/g, '')))
      errs.soDienThoai = 'Số điện thoại gồm 10 chữ số (VD: 0912345678)';
    if (!diaChi || diaChi.trim().length < 5) errs.diaChi = 'Vui lòng nhập địa chỉ cụ thể tại Huế';
    if (!nhuCau) errs.nhuCau = 'Vui lòng chọn nhu cầu của bạn';

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Honeypot check chống bot
    if (formData.get('website')) return;

    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hoTen: formData.get('hoTen'),
          soDienThoai: formData.get('soDienThoai'),
          diaChi: formData.get('diaChi'),
          nhuCau,
          goiThue: nhuCau === 'thue' ? goiThue : undefined,
          ghiChu: formData.get('ghiChu'),
          website: formData.get('website'),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrors({ form: result.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ form: 'Lỗi kết nối mạng. Vui lòng gọi trực tiếp hotline để được hỗ trợ.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div className={pStyles.pageHeader}>
          <div className="container">
            <h1 className={pStyles.pageTitle}>Liên hệ & Đặt hàng</h1>
          </div>
        </div>
        <section className="section">
          <div className="container container--narrow">
            <div className={styles.successMessage}>
              <span className={styles.successIcon}>✅</span>
              <h2 className={styles.successTitle}>Đăng ký thành công!</h2>
              <p className={styles.successText}>
                Chúng tôi đã nhận được thông tin. Đội ngũ chuyên viên tư vấn Sauna Alpaca tại Huế sẽ gọi lại cho bạn trong vòng{' '}
                <strong>5 - 15 phút</strong>.
              </p>
              <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: 0, fontSize: 'var(--fs-small)', color: 'var(--color-text-secondary)' }}>
                  Nếu cần hỗ trợ gấp hoặc muốn hẹn giờ lắp đặt ngay, hãy gọi:
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 'var(--fs-h4)' }}>
                  <a href={`tel:${CONTACT_INFO.phoneClean}`} style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                    📞 {CONTACT_INFO.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Liên hệ tư vấn & Đặt hàng</h1>
          <p className={pStyles.pageSubtitle}>
            Thí điểm giao hàng, khảo sát và lắp đặt miễn phí tận nhà tại TP. Huế
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.contactGrid}>
            {/* Cột thông tin liên hệ & Google Maps */}
            <div className={styles.contactInfo}>
              <Card variant="elevated">
                <div className={styles.contactCard}>
                  <h3 className={styles.contactTitle}>
                    Thông tin liên hệ trực tiếp
                  </h3>
                  <div className={styles.contactItem}>
                    <span className={styles.contactItemIcon}>📞</span>
                    <div className={styles.contactItemContent}>
                      <div className={styles.contactItemLabel}>Hotline tư vấn (24/7)</div>
                      <div className={styles.contactItemValue}>
                        <a href={`tel:${CONTACT_INFO.phoneClean}`} style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                          {CONTACT_INFO.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactItemIcon}>💬</span>
                    <div className={styles.contactItemContent}>
                      <div className={styles.contactItemLabel}>Zalo hỗ trợ</div>
                      <div className={styles.contactItemValue}>
                        <a href={CONTACT_INFO.zaloUrl} target="_blank" rel="noopener noreferrer">
                          Nhắn tin qua Zalo →
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactItemIcon}>✉️</span>
                    <div className={styles.contactItemContent}>
                      <div className={styles.contactItemLabel}>Email</div>
                      <div className={styles.contactItemValue}>
                        <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
                      </div>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactItemIcon}>📍</span>
                    <div className={styles.contactItemContent}>
                      <div className={styles.contactItemLabel}>Địa chỉ kinh doanh</div>
                      <div className={styles.contactItemValue}>{CONTACT_INFO.fullAddress}</div>
                    </div>
                  </div>
                  <div className={styles.contactItem}>
                    <span className={styles.contactItemIcon}>🕐</span>
                    <div className={styles.contactItemContent}>
                      <div className={styles.contactItemLabel}>Giờ làm việc</div>
                      <div className={styles.contactItemValue}>{CONTACT_INFO.workingHours}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Bản đồ Google Maps nhúng tại Huế */}
              <div className={styles.mapWrapper}>
                <div className={styles.mapCard}>
                  <div className={styles.mapHeader}>
                    <span className={styles.mapLocationBadge}>
                      📍 Điểm phục vụ tại Huế
                    </span>
                    <a
                      href="https://maps.google.com/?q=64+Lê+Thánh+Tôn,+Phú+Xuân,+TP+Huế"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                      Mở bản đồ lớn →
                    </a>
                  </div>
                  <iframe
                    title="Vị trí Sauna Alpaca tại Huế"
                    className={styles.mapIframe}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=64+L%C3%AA+Th%C3%A1nh+T%C3%B4n,+Ph%C3%BA+Xu%C3%A2n,+Hu%E1%BA%BF&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  />
                </div>

                <div className={styles.mapServiceBadge}>
                  <span>🚚</span>
                  <span><strong>Khu vực giao hàng:</strong> Miễn phí toàn bộ các phường, xã thuộc TP. Huế. Kỹ thuật viên có mặt trong vòng 24 giờ.</span>
                </div>
              </div>

              <div className={styles.disclaimer}>
                <p>⚕️ {MEDICAL_DISCLAIMER}</p>
              </div>
            </div>

            {/* Cột Form Đăng Ký */}
            <Card variant="elevated">
              <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Đăng ký tư vấn & Báo giá</h2>
                <p className={styles.formSubtitle}>
                  Chỉ mất 30 giây — Chúng tôi sẽ liên hệ lại ngay để khảo sát và tư vấn
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.formGrid}>
                    {/* Honeypot field chống bot */}
                    <div className={styles.honeypot}>
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    {/* Họ tên */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="hoTen">
                        Họ và tên của bạn <span className={styles.formRequired}>*</span>
                      </label>
                      <input
                        id="hoTen"
                        name="hoTen"
                        type="text"
                        className={styles.formInput}
                        placeholder="VD: Nguyễn Văn An"
                        required
                      />
                      {errors.hoTen && <span className={styles.formError}>{errors.hoTen}</span>}
                    </div>

                    {/* Số điện thoại */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="soDienThoai">
                        Số điện thoại nhận tư vấn <span className={styles.formRequired}>*</span>
                      </label>
                      <input
                        id="soDienThoai"
                        name="soDienThoai"
                        type="tel"
                        className={styles.formInput}
                        placeholder="VD: 0987 654 321"
                        required
                      />
                      {errors.soDienThoai && (
                        <span className={styles.formError}>{errors.soDienThoai}</span>
                      )}
                    </div>

                    {/* Địa chỉ */}
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.formLabel} htmlFor="diaChi">
                        Địa chỉ lắp đặt tại Huế <span className={styles.formRequired}>*</span>
                      </label>
                      <input
                        id="diaChi"
                        name="diaChi"
                        type="text"
                        className={styles.formInput}
                        placeholder="Số nhà, tên đường, phường/xã tại TP. Huế"
                        required
                      />
                      {errors.diaChi && <span className={styles.formError}>{errors.diaChi}</span>}
                    </div>

                    {/* Chọn nhu cầu */}
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.formLabel}>
                        Bạn đang quan tâm đến hình thức nào? <span className={styles.formRequired}>*</span>
                      </label>
                      <div className={styles.formRadioGroup}>
                        <label className={styles.formRadioLabel}>
                          <input
                            type="radio"
                            name="nhuCau"
                            value="thue"
                            checked={nhuCau === 'thue'}
                            onChange={(e) => setNhuCau(e.target.value)}
                          />
                          📋 Thuê theo tháng
                        </label>
                        <label className={styles.formRadioLabel}>
                          <input
                            type="radio"
                            name="nhuCau"
                            value="mua"
                            checked={nhuCau === 'mua'}
                            onChange={(e) => setNhuCau(e.target.value)}
                          />
                          🏠 Mua trọn đời
                        </label>
                        <label className={styles.formRadioLabel}>
                          <input
                            type="radio"
                            name="nhuCau"
                            value="tuvan"
                            checked={nhuCau === 'tuvan'}
                            onChange={(e) => setNhuCau(e.target.value)}
                          />
                          💬 Cần tư vấn thêm
                        </label>
                      </div>
                      {errors.nhuCau && <span className={styles.formError}>{errors.nhuCau}</span>}
                    </div>

                    {/* Lựa chọn gói thuê linh hoạt (Hiện ra khi nhuCau === 'thue') */}
                    {nhuCau === 'thue' && (
                      <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <div className={styles.rentalPlansContainer}>
                          <div className={styles.rentalPlanTitle}>
                            Chọn gói thuê mong muốn:
                          </div>
                          <div className={styles.rentalPlanGrid}>
                            <div
                              className={`${styles.rentalPlanCard} ${
                                goiThue === '3thang' ? styles.rentalPlanCardSelected : ''
                              }`}
                              onClick={() => setGoiThue('3thang')}
                            >
                              <div className={styles.rentalPlanHeader}>
                                <span className={styles.rentalPlanName}>Gói 3 tháng</span>
                              </div>
                              <span className={styles.rentalPlanSub}>Trải nghiệm ngắn hạn</span>
                            </div>

                            <div
                              className={`${styles.rentalPlanCard} ${
                                goiThue === '6thang' ? styles.rentalPlanCardSelected : ''
                              }`}
                              onClick={() => setGoiThue('6thang')}
                            >
                              <div className={styles.rentalPlanHeader}>
                                <span className={styles.rentalPlanName}>Gói 6 tháng</span>
                                <span className={styles.rentalPlanBadge}>Phổ biến ⭐</span>
                              </div>
                              <span className={styles.rentalPlanSub}>Bảo dưỡng 2 tháng/lần</span>
                            </div>

                            <div
                              className={`${styles.rentalPlanCard} ${
                                goiThue === '12thang' ? styles.rentalPlanCardSelected : ''
                              }`}
                              onClick={() => setGoiThue('12thang')}
                            >
                              <div className={styles.rentalPlanHeader}>
                                <span className={styles.rentalPlanName}>Gói 12 tháng</span>
                                <span className={styles.rentalPlanBadge}>Tiết kiệm 25%</span>
                              </div>
                              <span className={styles.rentalPlanSub}>Đặc quyền mua lại máy</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ghi chú */}
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.formLabel} htmlFor="ghiChu">
                        Ghi chú thêm (Tình trạng sức khỏe, khung giờ tiện nghe máy...)
                      </label>
                      <textarea
                        id="ghiChu"
                        name="ghiChu"
                        className={styles.formTextarea}
                        placeholder="VD: Người xông là mẹ 65 tuổi hay đau nhức gối; liên hệ sau 17h chiều giúp tôi..."
                        maxLength={500}
                      />
                    </div>

                    {/* Nút gửi */}
                    <div className={styles.formSubmitRow}>
                      {errors.form && (
                        <p
                          className={styles.formError}
                          style={{
                            textAlign: 'center',
                            padding: 'var(--space-sm)',
                            background: '#FEE2E2',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          {errors.form}
                        </p>
                      )}
                      <Button
                        type="submit"
                        variant="accent"
                        size="lg"
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? '⏳ Đang gửi yêu cầu...' : '📩 Gửi đăng ký tư vấn tận nhà'}
                      </Button>
                      <p className="text-muted text-center" style={{ fontSize: 'var(--fs-caption)' }}>
                        Thông tin của bạn được cam kết bảo mật tuyệt đối theo{' '}
                        <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)' }}>
          Đang tải thông tin liên hệ...
        </div>
      }
    >
      <ContactFormContent />
    </Suspense>
  );
}
