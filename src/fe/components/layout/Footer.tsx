'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  SITE_CONFIG,
  CONTACT_INFO,
  NAV_LINKS,
  FOOTER_LEGAL_LINKS,
  MEDICAL_DISCLAIMER,
} from '@/shared/lib/constants';
import styles from './Footer.module.css';

/**
 * Footer — Chứa thông tin liên hệ, links pháp lý, disclaimer y tế.
 * Ban ngày (06:00 - 18:00, mặt trời mọc đến lặn): "👑 Điều Hành"
 * Ban đêm (18:00 - 06:00, thời gian còn lại): "👑 Admin"
 */
export function Footer() {
  const currentYear = new Date().getFullYear();
  const [adminLabel, setAdminLabel] = useState('👑 Điều Hành');

  useEffect(() => {
    const updateAdminLabel = () => {
      const hour = new Date().getHours();
      // Ban ngày: từ mặt trời mọc (06:00) đến mặt trời lặn (18:00)
      const isDaytime = hour >= 6 && hour < 18;
      setAdminLabel(isDaytime ? '👑 Điều Hành' : '👑 Admin');
    };
    updateAdminLabel();
    const interval = setInterval(updateAdminLabel, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToTop = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer} id="footer">
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.footerBrand}>
            <Link
              href="/"
              className={styles.footerLogo}
              onClick={handleScrollToTop}
              aria-label="Sauna Alpaca - Về đầu trang"
            >
              <div className={styles.footerLogoIcon}>
                <Image
                  src="/images/logo-emblem.png"
                  alt="Sauna Alpaca Logo"
                  width={32}
                  height={32}
                  className={styles.footerLogoImg}
                />
              </div>
              <span className={styles.footerLogoName}>{SITE_CONFIG.name}</span>
            </Link>
            <p className={styles.footerDescription}>
              Máy xông hơi hồng ngoại xa gia dụng thông minh — Thiết kế tre tự nhiên, mang công nghệ
              chăm sóc sức khỏe hiện đại đến mọi gia đình tại Huế.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.footerColumn}>
            <h4>Liên kết nhanh</h4>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink} onClick={handleScrollToTop}>
                Trang chủ
              </Link>
              <Link href="/san-pham" className={styles.footerLink}>
                Sản phẩm
              </Link>
              <Link href="/san-pham/mua" className={styles.footerLink}>
                Mua thiết bị
              </Link>
              <Link href="/san-pham/thue" className={styles.footerLink}>
                Thuê theo tháng
              </Link>
              <Link href="/nghien-cuu" className={styles.footerLink}>
                Nghiên cứu y khoa
              </Link>
              <Link href="/cau-hoi-thuong-gap" className={styles.footerLink}>
                Câu hỏi thường gặp
              </Link>
              <Link href="/lien-he" className={styles.footerLink}>
                Liên hệ & Báo giá
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className={styles.footerColumn}>
            <h4>Chính sách</h4>
            <div className={styles.footerLinks}>
              {FOOTER_LEGAL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.footerColumn}>
            <h4>Liên hệ</h4>
            <div className={styles.footerContact}>
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}>📞</span>
                <a href={`tel:${CONTACT_INFO.phoneClean}`} className={styles.footerContactLink}>
                  {CONTACT_INFO.phone}
                </a>
              </div>
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}>✉️</span>
                <a href={`mailto:${CONTACT_INFO.email}`} className={styles.footerContactLink}>
                  {CONTACT_INFO.email}
                </a>
              </div>
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}>📍</span>
                <span>{CONTACT_INFO.fullAddress}</span>
              </div>
              <div className={styles.footerContactItem}>
                <span className={styles.footerContactIcon}>🕐</span>
                <span>{CONTACT_INFO.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className={styles.footerDisclaimer}>
          <p className={styles.disclaimerText}>⚕️ {MEDICAL_DISCLAIMER}</p>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom} id="footer-bottom">
          <p className={styles.copyright}>
            © {currentYear} {SITE_CONFIG.name}. Mọi quyền được bảo lưu.
          </p>
          <div className={styles.footerBottomLinks}>
            <Link href="/chinh-sach-bao-mat" className={styles.footerBottomLink}>
              Bảo mật
            </Link>
            <Link href="/dieu-khoan" className={styles.footerBottomLink}>
              Điều khoản
            </Link>
            <Link
              href="/nhanvien"
              className={styles.footerBottomLink}
              title="Cổng Nhân Viên Trực Ca Sauna Alpaca"
              target="_blank"
              rel="noopener noreferrer"
            >
              🌿 Nhân Viên
            </Link>
            <Link
              href="/admin"
              className={styles.footerBottomLink}
              title={adminLabel === '👑 Điều Hành' ? 'Trang Điều Hành (Dành cho Chủ Cửa Hàng)' : 'Trang Admin (Dành cho Chủ Cửa Hàng)'}
              target="_blank"
              rel="noopener noreferrer"
            >
              {adminLabel}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
