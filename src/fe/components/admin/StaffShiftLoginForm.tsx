'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './StaffShiftLoginForm.module.css';
import { AdminUser, AdminShift, saveStoredAdminSession } from '@/shared/lib/adminStaff';

interface StaffShiftLoginFormProps {
  onLoginSuccess: (user: AdminUser, shift: AdminShift | null) => void;
}

export function StaffShiftLoginForm({ onLoginSuccess }: StaffShiftLoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Đồng hồ thời gian thực tại Huế
  const [timeStr, setTimeStr] = useState('14:30:00');
  const [dateStr, setDateStr] = useState('Đang cập nhật...');
  // Lời chào thời gian thực (Buổi sáng tốt lành, Buổi trưa an lành, Buổi tối ấm áp...)
  const [greetingTitle, setGreetingTitle] = useState('Buổi sáng tốt lành!');
  // Tên cổng cho chủ cửa hàng: Ban ngày (06:00 - 18:00) -> "Điều Hành", ban đêm -> "Admin"
  const [ownerPortalLabel, setOwnerPortalLabel] = useState('Điều Hành');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      const rawDate = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      // In hoa thứ trong tuần (VD: CHỦ NHẬT, THỨ HAI...) theo yêu cầu
      if (rawDate.includes(',')) {
        const parts = rawDate.split(',');
        setDateStr(`${parts[0].trim().toUpperCase()}, ${parts.slice(1).join(',').trim()}`);
      } else {
        setDateStr(rawDate.toUpperCase());
      }

      // Cập nhật lời chào theo khung giờ thực tế
      const hour = now.getHours();
      if (hour >= 5 && hour < 11) {
        setGreetingTitle('Buổi sáng tốt lành!');
      } else if (hour >= 11 && hour < 14) {
        setGreetingTitle('Buổi trưa an lành!');
      } else if (hour >= 14 && hour < 18) {
        setGreetingTitle('Buổi chiều thuận lợi!');
      } else if (hour >= 18 && hour < 22) {
        setGreetingTitle('Buổi tối ấm áp!');
      } else {
        setGreetingTitle('Ca đêm tận tâm!');
      }

      // Ban ngày (06:00 - 18:00, mặt trời mọc đến lặn) -> "Điều Hành", ban đêm -> "Admin"
      const isDaytime = hour >= 6 && hour < 18;
      setOwnerPortalLabel(isDaytime ? 'Điều Hành' : 'Admin');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Đồng bộ thông tin khi trình duyệt tự động điền (Autofill)
  useEffect(() => {
    const syncAutofill = () => {
      const userEl = document.getElementById('staff-username') as HTMLInputElement | null;
      const passEl = document.getElementById('staff-password') as HTMLInputElement | null;
      if (userEl && userEl.value && userEl.value !== username) {
        setUsername(userEl.value);
      }
      if (passEl && passEl.value && passEl.value !== password) {
        setPassword(passEl.value);
      }
    };
    const t1 = setTimeout(syncAutofill, 100);
    const t2 = setTimeout(syncAutofill, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    // Đọc trực tiếp từ form DOM element để không bị lỡ dữ liệu do trình duyệt tự động điền (autofill)
    const form = e.currentTarget;
    const userInput = form.elements.namedItem('username') as HTMLInputElement | null;
    const passInput = form.elements.namedItem('password') as HTMLInputElement | null;

    const cleanUser = (userInput?.value ?? username).trim();
    const cleanPass = (passInput?.value ?? password).trim();

    if (!cleanUser) {
      setErrorMsg('Vui lòng nhập tên đăng nhập nhân viên!');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('Vui lòng nhập mật khẩu ca trực!');
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
        const shift: AdminShift | null = data.shift || null;

        // Lưu phiên đăng nhập an toàn
        saveStoredAdminSession(user, shift);
        onLoginSuccess(user, shift);
      } else {
        setErrorMsg(data.error || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập nhân viên:', err);
      setErrorMsg('Không thể kết nối máy chủ xác thực ca trực.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.splitPage}>
      {/* ──── NỬA BÊN TRÁI: HÌNH ẢNH BUỒNG XÔNG & ĐỒNG HỒ CA TRỰC HUẾ ──── */}
      <div className={styles.leftHero}>
        <div className={styles.heroTop}>
          <div className={styles.brandBadge}>
            <Image
              src="/images/logo-emblem.png"
              alt="Sauna Alpaca"
              width={20}
              height={20}
              className={styles.badgeLogoImg}
            />
            <span>SAUNA ALPACA HUẾ • NHÂN VIÊN</span>
          </div>
        </div>

        <div className={styles.heroCenter}>
          <div className={styles.heroCenterCard}>
            <div className={styles.liveClockBox}>
              <div className={styles.liveTime}>{timeStr}</div>
              <div className={styles.liveDate}>
                <span>📅 {dateStr}</span>
                <span>• TP. Huế</span>
              </div>
            </div>

            <h1 className={styles.heroQuote}>
              “TRỰC CA TẬN TÂM — VÌ SỨC KHỎE & BÌNH AN CỦA NGƯỜI DÂN CỐ ĐÔ”
            </h1>

            <p className={styles.heroDesc}>
              Không gian làm việc chuyên nghiệp kết nối trực tiếp với khách hàng tìm hiểu máy xông hơi hồng
              ngoại xa. Hệ thống tự động ghi nhận giờ vào ca, hỗ trợ trả lời tư vấn và điều phối giao xe thần tốc
              trong ngày tại TP. Huế.
            </p>
          </div>
        </div>

        <div className={styles.heroBottom}>
          <div className={styles.heroFeatureItem}>
            <span>🟢</span>
            <span>Tự động chấm công check-in / check-out</span>
          </div>
          <div className={styles.heroFeatureItem}>
            <span>💬</span>
            <span>Chuông báo hỗ trợ khách hàng 15s</span>
          </div>
          <div className={styles.heroFeatureItem}>
            <span>📦</span>
            <span>Điều phối 4 bước giao máy</span>
          </div>
        </div>
      </div>

      {/* ──── NỬA BÊN PHẢI: FORM ĐĂNG NHẬP THUẦN TÊN ĐĂNG NHẬP + MẬT KHẨU ──── */}
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

          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div className={styles.mobileBadge}>
                <Image
                  src="/images/logo-emblem.png"
                  alt="Sauna Alpaca"
                  width={16}
                  height={16}
                  className={styles.badgeLogoImg}
                />
                <span>SAUNA ALPACA HUẾ • NHÂN VIÊN</span>
              </div>
              <div className={styles.alpacaIconBox}>
                <Image
                  src="/images/logo-emblem.png"
                  alt="Sauna Alpaca Logo"
                  width={40}
                  height={40}
                  className={styles.alpacaLogoImg}
                  priority
                />
              </div>

              {/* Đồng hồ đếm thời gian thực tại Huế trong khung đăng nhập (Mobile) */}
              <div className={styles.cardLiveClock}>
                <div className={styles.cardLiveTime}>{timeStr}</div>
                <div className={styles.cardLiveDate}>
                  <span>📅 {dateStr}</span>
                  <span>• TP. Huế</span>
                </div>
              </div>

              <h2 className={styles.cardTitle}>{greetingTitle}</h2>
            <p className={styles.cardSubtitle}>
              Nhập tài khoản nhân viên của bạn để bắt đầu ca làm việc và tự động check-in
            </p>
          </div>

          {errorMsg && (
            <div className={styles.errorBanner}>
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Trường Tên đăng nhập */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Tên đăng nhập:</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  id="staff-username"
                  name="username"
                  type="text"
                  className={styles.input}
                  placeholder="Tên đăng nhập"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg(null);
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Trường Mật khẩu */}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="staff-password">
                <span>Mật khẩu:</span>
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="staff-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Mật khẩu"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                />
                <button
                  type="button"
                  className={styles.toggleEyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Nút submit */}
            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span>⏳</span>
                  <span>Đang kiểm tra thông tin...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Bắt đầu ca làm việc</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.cardFooter}>
            <div className={styles.linkOwner}>
              <span>Bạn là chủ cửa hàng?</span>
              <Link href="/admin" target="_blank" rel="noopener noreferrer">
                Đăng nhập tại {ownerPortalLabel}
              </Link>
            </div>
            <p className={styles.helperText}>
              Gặp sự cố tài khoản hoặc quên mật khẩu? Vui lòng liên hệ trực tiếp chủ cửa hàng để được cấp lại.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
