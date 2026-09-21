'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CONTACT_INFO } from '@/shared/lib/constants';
import saunaImg from '@/fe/assets/anh_go_sauna_auth.jpg';
import styles from './CustomerAuthModal.module.css';

export interface CustomerProfile {
  phone: string;
  name: string;
  concern: string;
  loggedInAt?: string;
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customer: CustomerProfile) => void;
  onOpenChat?: () => void;
  onOpenOrders?: () => void;
}

const HEALTH_CONCERNS = [
  { id: 'kidney', label: '💧 Thải độc thận', value: 'Thải độc suy thận & vi tuần hoàn' },
  { id: 'joints', label: '🦴 Đau xương khớp', value: 'Đau nhức xương khớp, tê bì tay chân' },
  { id: 'sleep', label: '🌙 Ngủ & tuần hoàn', value: 'Mất ngủ, mệt mỏi, tuần hoàn kém' },
  { id: 'rent_0d', label: '🎋 Thuê trải nghiệm', value: 'Thuê máy trải nghiệm theo tháng' },
  { id: 'buy', label: '🏠 Mua buồng xông', value: 'Tư vấn mua buồng xông sở hữu trọn đời' },
];

/** Sinh chuỗi 4 ký tự Captcha ngẫu nhiên (loại bỏ ký tự dễ nhầm lẫn như 0, O, 1, I, l) */
const generateCaptchaText = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenChat,
  onOpenOrders,
}: CustomerAuthModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [selectedConcern, setSelectedConcern] = useState(HEALTH_CONCERNS[0].value);
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaText());
  const [captchaInput, setCaptchaInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null);
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  const refreshCaptcha = () => {
    const newCode = generateCaptchaText();
    setCaptchaCode(newCode);
    setCaptchaInput('');
  };

  // Khôi phục thông tin đăng nhập đã lưu trong localStorage và sinh mã Captcha
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    setSuccessMsg('');
    refreshCaptcha();

    try {
      const savedRaw = localStorage.getItem('sauna_alpaca_customer');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && parsed.phone) {
          setCurrentCustomer(parsed);
          setPhone(parsed.phone);
          setName(parsed.name || '');
          if (parsed.concern) setSelectedConcern(parsed.concern);
        }
      } else {
        setCurrentCustomer(null);
        setIsChangingPhone(false);
        setTimeout(() => phoneInputRef.current?.focus(), 150);
      }
    } catch {
      setCurrentCustomer(null);
    }
  }, [isOpen]);

  // Cập nhật Captcha khi đổi chế độ nhập SĐT
  useEffect(() => {
    if (isChangingPhone || !currentCustomer) {
      refreshCaptcha();
    }
  }, [isChangingPhone, currentCustomer]);

  if (!isOpen) return null;

  // Format số điện thoại chuẩn Việt Nam (10 số: 0905 123 456)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // chỉ lấy chữ số
    if (val.length > 10) val = val.slice(0, 10);
    setPhone(val);
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setErrorMsg('Vui lòng nhập số điện thoại của Quý khách');
      phoneInputRef.current?.focus();
      return;
    }

    // Kiểm tra đầu số Việt Nam thông dụng (03, 05, 07, 08, 09) và đủ 10 số
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMsg('Số điện thoại chưa hợp lệ (Ví dụ: 0905 123 456 - đủ 10 chữ số)');
      phoneInputRef.current?.focus();
      return;
    }

    // Kiểm tra mã xác thực Captcha
    if (!captchaInput.trim()) {
      setErrorMsg('Vui lòng nhập mã xác thực bảo mật (4 ký tự)');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg('Mã xác thực không chính xác. Hệ thống đã đổi mã mới, vui lòng thử lại.');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      const sessionId =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('sauna_alpaca_sid') || `sess_${Date.now()}`
          : '';

      const res = await fetch('/api/customer/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          name: name.trim() || 'Quý khách',
          concern: selectedConcern,
          session_id: sessionId,
          captcha: captchaInput.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newCustomer: CustomerProfile = {
          phone: cleanPhone,
          name: name.trim() || 'Quý khách',
          concern: selectedConcern,
          loggedInAt: new Date().toISOString(),
        };

        // Lưu đồng bộ vào localStorage
        localStorage.setItem('sauna_alpaca_customer', JSON.stringify(newCustomer));
        localStorage.setItem('sauna_alpaca_phone', cleanPhone);

        setCurrentCustomer(newCustomer);
        setIsChangingPhone(false);
        setSuccessMsg('Đăng nhập và kết nối chuyên viên thành công!');

        // Bắn event toàn hệ thống để Header và các components tự cập nhật
        window.dispatchEvent(new CustomEvent('sauna_customer_changed', { detail: newCustomer }));

        if (onSuccess) {
          onSuccess(newCustomer);
        }

        // Tự động đóng sau 1.2s nếu khách không tương tác thêm
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Có lỗi xảy ra khi xác thực thông tin');
      }
    } catch (err) {
      console.error('Lỗi gửi customer-auth:', err);
      setErrorMsg('Không thể kết nối máy chủ. Vui lòng thử lại hoặc gọi Hotline.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sauna_alpaca_customer');
    localStorage.removeItem('sauna_alpaca_phone');
    setCurrentCustomer(null);
    setPhone('');
    setName('');
    setIsChangingPhone(false);
    window.dispatchEvent(new CustomEvent('sauna_customer_changed', { detail: null }));
    setTimeout(() => phoneInputRef.current?.focus(), 150);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalWrapper} onClick={(e) => e.stopPropagation()}>
        {/* ──── HIỆU ỨNG TỎA SÁNG: VẦNG HÀO QUANG & 26 HẠT BỤI VÀNG HOÀNG GIA LƠ LỬNG ──── */}
        <div className={styles.effectStardustWrapper}>
          <div className={styles.stardustGlowBase} />
          {/* 26 hạt bụi vàng & tàn lửa ấm phân bổ tự nhiên quanh khung modal */}
          <span className={styles.stardustParticle1} />
          <span className={styles.stardustParticle2} />
          <span className={styles.stardustParticle3} />
          <span className={styles.stardustParticle4} />
          <span className={styles.stardustParticle5} />
          <span className={styles.stardustParticle6} />
          <span className={styles.stardustParticle7} />
          <span className={styles.stardustParticle8} />
          <span className={styles.stardustParticle9} />
          <span className={styles.stardustParticle10} />
          <span className={styles.stardustParticle11} />
          <span className={styles.stardustParticle12} />
          <span className={styles.stardustParticle13} />
          <span className={styles.stardustParticle14} />
          <span className={styles.stardustParticle15} />
          <span className={styles.stardustParticle16} />
          <span className={styles.stardustParticle17} />
          <span className={styles.stardustParticle18} />
          <span className={styles.stardustParticle19} />
          <span className={styles.stardustParticle20} />
          <span className={styles.stardustParticle21} />
          <span className={styles.stardustParticle22} />
          <span className={styles.stardustParticle23} />
          <span className={styles.stardustParticle24} />
          <span className={styles.stardustParticle25} />
          <span className={styles.stardustParticle26} />
        </div>



        <div className={styles.splitContainer}>
          {/* Background buồng xông gỗ tuyết tùng bao phủ toàn bộ modal */}
          <div className={styles.bgImageWrapper}>
            <Image
              src={saunaImg}
              alt="Buồng xông hơi hồng ngoại xa Sauna Alpaca"
              fill
              sizes="(max-width: 860px) 100vw, 820px"
              className={styles.bgImage}
              priority
            />
            <div className={styles.bgOverlay} />
          </div>

          {/* Nút Đóng Modal */}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            ✕
          </button>

          {/* ═══ CỘT TRÁI: THƯƠNG HIỆU, HÌNH ẢNH & CAM KẾT VỐN 0Đ ═══ */}
          <div className={styles.leftColumn}>
            <div className={styles.leftContent}>
              <div className={styles.leftContentTop}>
                <div className={styles.brandBadge}>
                <span className={styles.brandBadgeIcon}>🌿</span>
                <span>Sauna Alpaca • Huế</span>
              </div>

              <h2 className={styles.leftTitle}>
                Trị liệu xông hơi <br />
                <span className={styles.leftTitleHighlight}>Hồng ngoại xa</span>
              </h2>

              <p className={styles.leftDesc}>
                Nhiệt lượng êm dịu hỗ trợ thận và giảm đau nhức xương khớp tại nhà.
              </p>

              {/* Khối Huy Hiệu Trải Nghiệm */}
              <div className={styles.zeroCapitalBadge}>
                <span className={styles.zeroCapitalIcon}>✨</span>
                <div className={styles.zeroCapitalText}>
                  <strong>Trải nghiệm an tâm tại nhà</strong>
                </div>
              </div>

              {/* 3 Cam Kết Vàng */}
              <div className={styles.commitmentsList}>
                <div className={styles.commitmentItem}>
                  <span className={styles.commitmentIcon}>🌿</span>
                  <div className={styles.commitmentContent}>
                    <strong>Tư vấn chuyên sâu</strong>
                    <span>Bác sĩ YHCT theo sát phác đồ</span>
                  </div>
                </div>

                <div className={styles.commitmentItem}>
                  <span className={styles.commitmentIcon}>🚚</span>
                  <div className={styles.commitmentContent}>
                    <strong>Khảo sát & Lắp đặt tận nơi</strong>
                    <span>Kỹ thuật viên giao xe trong 2h tại Huế</span>
                  </div>
                </div>

                <div className={styles.commitmentItem}>
                  <span className={styles.commitmentIcon}>📦</span>
                  <div className={styles.commitmentContent}>
                    <strong>Dùng thử 3 ngày</strong>
                    <span>Cảm nhận thực tế trước khi thuê hay mua</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.leftFooter}>
              <span className={styles.leftFooterLabel}>Hotline Y học cổ truyền:</span>
              <a href={`tel:${CONTACT_INFO.phoneClean}`} className={styles.leftFooterPhone}>
                📞 {CONTACT_INFO.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ═══ CỘT PHẢI: FORM ĐĂNG NHẬP / TIẾP NHẬN SĐT (HIỆU ỨNG SƯƠNG HƠI NƯỚC) ═══ */}
        <div className={styles.rightColumn}>
          {currentCustomer && !isChangingPhone ? (
            /* Trạng thái ĐÃ ĐĂNG NHẬP */
            <div className={styles.profileBox}>
              <div className={styles.profileBadge}>
                <span className={styles.profileBadgeDot}></span>
                Đã kết nối với Chuyên viên
              </div>

              <h3 className={styles.profileTitle}>
                Kính chào, {currentCustomer.name || 'Quý khách'}!
              </h3>
              <p className={styles.profileDesc}>
                Số điện thoại của Quý khách đã được lưu an toàn trong hệ thống để bảo hành và theo dõi đơn hàng.
              </p>

              <div className={styles.profileInfoCard}>
                <div className={styles.profileInfoRow}>
                  <span className={styles.profileInfoLabel}>📞 Số điện thoại:</span>
                  <strong className={styles.profileInfoValue}>{currentCustomer.phone}</strong>
                </div>
                {currentCustomer.concern && (
                  <div className={styles.profileInfoRow}>
                    <span className={styles.profileInfoLabel}>🩺 Nhu cầu quan tâm:</span>
                    <span className={styles.profileInfoValue}>{currentCustomer.concern}</span>
                  </div>
                )}
              </div>

              <div className={styles.profileActions}>
                <button
                  type="button"
                  className={styles.btnActionPrimary}
                  onClick={() => {
                    onClose();
                    if (onOpenOrders) onOpenOrders();
                  }}
                >
                  <span className={styles.btnActionIcon}>📦</span>
                  <span>Xem tiến độ đơn hàng</span>
                </button>

                <button
                  type="button"
                  className={styles.btnActionSecondary}
                  onClick={() => {
                    onClose();
                    if (onOpenChat) onOpenChat();
                  }}
                >
                  <span className={styles.btnActionIcon}>💬</span>
                  <span>Trò chuyện với Chuyên viên</span>
                </button>

                <div className={styles.profileExtraLinks}>
                  <button
                    type="button"
                    className={styles.linkChangePhone}
                    onClick={() => setIsChangingPhone(true)}
                  >
                    🔄 Đổi số điện thoại khác
                  </button>
                  <span className={styles.divider}>•</span>
                  <button
                    type="button"
                    className={styles.linkLogout}
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Trạng thái FORM NHẬP SĐT */
            <div className={styles.formBox}>
              <div className={styles.formHeader}>
                <span className={styles.formHeaderIcon}>🎋</span>
                <div>
                  <h3 className={styles.formTitle}>
                    {isChangingPhone ? 'CẬP NHẬT SỐ ĐIỆN THOẠI' : 'ĐĂNG NHẬP / TIẾP NHẬN TƯ VẤN'}
                  </h3>
                  <p className={styles.formSubtitle}>
                    Chuyên viên Y học cổ truyền sẽ kết nối trong 5 phút để tư vấn phác đồ và hỗ trợ tạo đơn.
                  </p>
                </div>
              </div>

              {errorMsg && <div className={styles.errorAlert}>⚠️ {errorMsg}</div>}
              {successMsg && <div className={styles.successAlert}>✅ {successMsg}</div>}

              <form onSubmit={handleSubmit} className={styles.authForm}>
                {/* Số điện thoại */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="customer-phone" className={styles.fieldLabel}>
                    Số điện thoại của Quý khách <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.phoneInputWrapper}>
                    <div className={styles.phoneCountryBadge}>
                      <span className={styles.flagIcon}>🇻🇳</span>
                      <span className={styles.countryCode}>+84</span>
                    </div>
                    <input
                      ref={phoneInputRef}
                      id="customer-phone"
                      type="tel"
                      inputMode="numeric"
                      className={styles.phoneInput}
                      placeholder="Ví dụ: 0905 123 456"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <span className={styles.fieldHint}>
                    Dùng để tra cứu tiến độ đơn hàng và liên hệ giao máy tận nhà tại Huế.
                  </span>
                </div>

                {/* Họ và tên */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="customer-name" className={styles.fieldLabel}>
                    Họ và tên của Quý khách <span className={styles.optional}>(Để tiện xưng hô)</span>
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    className={styles.textInput}
                    placeholder="Ví dụ: Bác Minh / Cô Lan / Chị Hà..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Nhu cầu sức khỏe quan tâm */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Tình trạng sức khỏe hoặc nhu cầu quan tâm:
                  </label>
                  <div className={styles.concernsGrid}>
                    {HEALTH_CONCERNS.map((item) => {
                      const isSelected = selectedConcern === item.value;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`${styles.concernChip} ${
                            isSelected ? styles.concernChipSelected : ''
                          }`}
                          onClick={() => setSelectedConcern(item.value)}
                          disabled={isLoading}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mã xác thực bảo mật CAPTCHA (Phương án A) */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="customer-captcha" className={styles.fieldLabel}>
                    Mã xác thực bảo mật <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.captchaRow}>
                    <input
                      id="customer-captcha"
                      type="text"
                      maxLength={4}
                      className={styles.captchaInput}
                      placeholder="Nhập 4 ký tự"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      disabled={isLoading}
                      autoComplete="off"
                      required
                    />
                    <div
                      className={styles.captchaBox}
                      onClick={refreshCaptcha}
                      title="Mã bảo mật chống bot (Nhấp để đổi mã khác)"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          refreshCaptcha();
                        }
                      }}
                    >
                      <div className={styles.captchaChars}>
                        {captchaCode.split('').map((char, index) => (
                          <span
                            key={index}
                            className={styles[`captchaChar${index}`] || styles.captchaChar}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                      <div className={styles.captchaDecorLine} />
                    </div>
                    <button
                      type="button"
                      className={styles.captchaRefreshBtn}
                      onClick={refreshCaptcha}
                      title="Đổi mã bảo mật khác"
                      disabled={isLoading}
                      aria-label="Đổi mã bảo mật"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                {/* Nút Submit */}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner}>Đang kết nối chuyên viên...</span>
                  ) : (
                    <>
                      <span className={styles.submitBtnIcon}>🌿</span>
                      <span>Nhận hỗ trợ & tư vấn ngay</span>
                    </>
                  )}
                </button>

                {isChangingPhone && (
                  <button
                    type="button"
                    className={styles.cancelChangeBtn}
                    onClick={() => setIsChangingPhone(false)}
                  >
                    Quay lại thông tin trước
                  </button>
                )}
              </form>

              {/* Tra cứu đơn hàng cho khách vãng lai */}
              <div className={styles.guestOrderLookupWrapper}>
                <span>Quý khách đã có đơn hàng? </span>
                <button
                  type="button"
                  className={styles.guestOrderLookupLink}
                  onClick={() => {
                    onClose();
                    if (onOpenOrders) onOpenOrders();
                  }}
                >
                  Tra cứu tiến độ đơn tại đây →
                </button>
              </div>

              {/* Cam kết chân trang */}
              <div className={styles.securityNote}>
                🔒 Thông tin được bảo mật 100% theo tiêu chuẩn y khoa • Không gửi tin nhắn rác.
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
