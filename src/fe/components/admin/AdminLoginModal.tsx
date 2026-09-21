'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdminLoginModal.module.css';
import { AdminUser, AdminShift, saveStoredAdminSession } from '@/shared/lib/adminStaff';

interface AdminLoginModalProps {
  onLoginSuccess: (user: AdminUser, shift: AdminShift | null) => void;
  isOpen?: boolean;
}

// Danh sách câu chúc ngẫu nhiên được tinh chỉnh độ dài chuẩn xác, vừa vặn khung card
const ADMIN_RANDOM_GREETINGS = [
  'Quản lý tốt nhé!',
  'Một ngày điều hành hiệu quả!',
  'Vững tay chèo cùng Sauna Alpaca!',
  'Chúc bạn kinh doanh hồng phát!',
  'Điều hành hanh thông & thuận lợi!',
  'Năng lượng tích cực cho ngày mới!',
  'Sáng suốt & an tâm trong từng quyết định!',
  'Chào mừng bạn trở lại điều hành!',
  'Chúc ngày làm việc tràn đầy cảm hứng!',
];

export function AdminLoginModal({ onLoginSuccess, isOpen = true }: AdminLoginModalProps) {
  const [username, setUsername] = useState('admin_chu');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lời chúc ngẫu nhiên được chọn mỗi khi mở trang
  const [greeting, setGreeting] = useState('Quản lý tốt nhé!');

  // Đồng hồ số chạy thời gian thực tại Huế
  const [timeStr, setTimeStr] = useState('14:30:00');

  useEffect(() => {
    // Chọn ngẫu nhiên 1 câu chúc khi component mount
    const randomIndex = Math.floor(Math.random() * ADMIN_RANDOM_GREETINGS.length);
    setGreeting(ADMIN_RANDOM_GREETINGS[randomIndex]);

    // Cập nhật đồng hồ thời gian thực
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMsg('Vui lòng nhập tên đăng nhập quản trị!');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const user: AdminUser = data.user;
        if (user.role !== 'owner') {
          setErrorMsg('Tài khoản này là nhân viên trực ca. Vui lòng đăng nhập tại Cổng Nhân Viên (/nhanvien)!');
          return;
        }
        const shift: AdminShift | null = data.shift || null;
        saveStoredAdminSession(user, shift);
        onLoginSuccess(user, shift);
      } else {
        setErrorMsg(data.error || 'Tên đăng nhập hoặc mật khẩu quản trị không chính xác!');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập admin:', err);
      setErrorMsg('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.splitPage}>
      {/* ──── NỬA TRÁI (40%): NỀN PHÒNG XÔNG GỖ TUYẾT TÙNG, BADGE ĐIỀU HÀNH, ĐỒNG HỒ & QUOTE ──── */}
      <div className={styles.leftPane}>
        {/* Badge kính mờ trên cùng */}
        <div className={styles.leftHeader}>
          <div className={styles.glassPillBadge}>
            <span className={styles.badgeDot}>●</span>
            <span>SAUNA ALPACA HUẾ • ĐIỀU HÀNH</span>
          </div>
        </div>

        {/* Khối đồng hồ to & câu khẩu hiệu ở trung tâm */}
        <div className={styles.leftCenter}>
          <div className={styles.liveClockBox}>
            <div className={styles.liveTime}>{timeStr} • TP. Huế</div>
            <h1 className={styles.heroQuote}>
              “ĐIỀU HÀNH TOÀN DIỆN — NÂNG TẦM TRẢI NGHIỆM TRỊ LIỆU CỐ ĐÔ”
            </h1>
          </div>
        </div>

        {/* Thanh điều khiển / tiện ích tối giản dưới cùng */}
        <div className={styles.leftFooter}>
          <div className={styles.navCircleBtns}>
            <button
              type="button"
              className={styles.circleBtn}
              title="Đổi câu chúc ngẫu nhiên"
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * ADMIN_RANDOM_GREETINGS.length);
                setGreeting(ADMIN_RANDOM_GREETINGS[randomIndex]);
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className={styles.circleBtn}
              title="Đổi câu chúc ngẫu nhiên"
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * ADMIN_RANDOM_GREETINGS.length);
                setGreeting(ADMIN_RANDOM_GREETINGS[randomIndex]);
              }}
            >
              ›
            </button>
          </div>

          <div className={styles.actionPill}>
            <span>⚡</span>
            <span>Điều hành toàn diện • Giám sát 24/7</span>
          </div>

          <div className={styles.navCircleBtns}>
            <button type="button" className={styles.circleBtn} title="Tùy chọn">
              •••
            </button>
          </div>
        </div>
      </div>

      {/* ──── NỬA PHẢI (60%): MẪU 9: THẺ GỖ TUYẾT TÙNG DÁT VÀNG + BỤI VÀNG LƠ LỬNG ──── */}
      <div className={styles.rightPane}>
        <div className={styles.cardWrapper}>
          {/* ──── HIỆU ỨNG TỎA SÁNG: VẦNG HÀO QUANG & BỤI VÀNG HOÀNG GIA LƠ LỬNG ──── */}
          <div className={styles.effectStardustWrapper}>
            <div className={styles.stardustGlowBase} />
            {/* 26 hạt bụi vàng & tàn lửa ấm phân bổ tự nhiên quanh khung thẻ */}
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

          {/* ──── THẺ CARD ĐĂNG NHẬP GỖ TUYẾT TÙNG DÁT VÀNG 24K (MẪU 9) ──── */}
          <div className={styles.loginCard}>
            {/* Biểu tượng lá thảo mộc & làn hơi nước xông thanh thoát với ánh kim vàng */}
            <div className={styles.cardHeader}>
              <div className={styles.leafIconBox}>
                <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 3 làn hơi xông ấm áp ánh vàng */}
                  <path d="M19 10C18 12.5 20.5 14 19.5 16.5" stroke="#E4B56C" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                  <path d="M24 7.5C23 10.5 25.5 12.5 24.5 16.5" stroke="#FFD8A8" strokeWidth="2" strokeLinecap="round" />
                  <path d="M29 10C28 12.5 30.5 14 29.5 16.5" stroke="#E4B56C" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                  {/* 2 chiếc lá thảo dược tự nhiên hòa sắc ngọc lục bảo & viền vàng hoàng gia */}
                  <path d="M24 32C24 32 13 30.5 12 20C22.5 19 24 29.5 24 32Z" fill="#3D7A54" stroke="#D4872C" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M24 32C24 32 35 30.5 36 20C25.5 19 24 29.5 24 32Z" fill="#589B72" stroke="#D4872C" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M24 32V36" stroke="#D4872C" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className={styles.managementBadge}>
                BAN ĐIỀU HÀNH
              </div>

              {/* Câu chúc ngẫu nhiên màu vàng ngà kim quang */}
              <h2 className={styles.greetingTitle}>{greeting}</h2>
              <p className={styles.greetingSubtitle}>Xác thực tài khoản quản trị hệ thống</p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMsg && (
              <div className={styles.errorBanner}>
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form đăng nhập rãnh gỗ khắc chìm dạng viên thuốc */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Tên đăng nhập */}
              <div className={styles.formGroup}>
                <div className={styles.pillInputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className={styles.pillInput}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Tên đăng nhập"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className={styles.formGroup}>
                <div className={styles.pillInputWrapper}>
                  <span className={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.pillInput}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Nút Đăng nhập dát vàng hổ phách nung chảy */}
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.loadingSpinner}>⏳</span>
                    <span>ĐANG XÁC THỰC...</span>
                  </>
                ) : (
                  <span>ĐĂNG NHẬP QUẢN TRỊ</span>
                )}
              </button>
            </form>

            {/* Dẫn link chuyển cổng nhân viên */}
            <div className={styles.cardFooter}>
              <span className={styles.footerText}>Bạn là nhân viên trực ca?</span>
              <Link href="/nhanvien" className={styles.footerLink}>
                Đến Cổng Nhân Viên
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
