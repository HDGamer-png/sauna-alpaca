'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CONTACT_INFO } from '@/shared/lib/constants';
import { AIChatModal } from './AIChatModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import styles from './FloatingCTA.module.css';

/**
 * FloatingCTA — 3 nút tròn nổi ở góc phải dưới:
 * 1. Nút Tra cứu đơn hàng (📦)
 * 2. Nút Zalo tròn
 * 3. Nút Trợ lý AI tròn (bấm mở/đóng cửa sổ chat thông minh)
 * 
 * Tự động xích lên khi cuộn xuống dưới cùng để không che khuất
 * mục "👑 Admin" và "🌿 Nhân Viên" ở footer.
 */
export function FloatingCTA() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isShiftedUp, setIsShiftedUp] = useState(false);

  // Lắng nghe sự kiện mở menu drawer trên Mobile để tự động ẩn nút nổi, tránh che khuất các nút thao tác
  useEffect(() => {
    const handleMobileNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen: boolean }>;
      setIsMobileNavOpen(!!customEvent.detail?.isOpen);
    };

    window.addEventListener('sauna_mobile_nav_toggle', handleMobileNav);
    return () => {
      window.removeEventListener('sauna_mobile_nav_toggle', handleMobileNav);
    };
  }, []);

  // Tự động xích lên khi lướt xuống chân trang để không che khuất mục Admin & Nhân Viên
  useEffect(() => {
    const checkBottomPosition = () => {
      const footerBottom = document.getElementById('footer-bottom');
      if (footerBottom) {
        const rect = footerBottom.getBoundingClientRect();
        // Khi phần chân trang chứa Admin & Nhân Viên tiến vào màn hình (hoặc cách đáy <= 30px)
        setIsShiftedUp(rect.top <= window.innerHeight + 10);
      } else {
        const scrollBottom = window.innerHeight + window.scrollY;
        const totalHeight = document.documentElement.scrollHeight;
        setIsShiftedUp(totalHeight - scrollBottom < 140);
      }
    };

    window.addEventListener('scroll', checkBottomPosition, { passive: true });
    window.addEventListener('resize', checkBottomPosition, { passive: true });

    // Sử dụng IntersectionObserver để phản hồi ngay khi DOM render xong hoặc layout thay đổi
    const footerBottom = document.getElementById('footer-bottom');
    let observer: IntersectionObserver | null = null;
    if (footerBottom && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        () => {
          checkBottomPosition();
        },
        { root: null, rootMargin: '0px 0px 20px 0px', threshold: [0, 0.1, 0.5, 1.0] }
      );
      observer.observe(footerBottom);
    }

    checkBottomPosition();

    return () => {
      window.removeEventListener('scroll', checkBottomPosition);
      window.removeEventListener('resize', checkBottomPosition);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      {/* Nút nổi tròn ở góc phải dưới — Tự động ẩn khi cửa sổ Chat, Tra cứu đơn hoặc Menu Drawer đang mở */}
      {!isChatOpen && !isOrderTrackingOpen && !isMobileNavOpen && (
        <div
          className={`${styles.floatingCta} ${isShiftedUp ? styles.floatingCtaShifted : ''}`}
          id="floating-cta"
        >
          {/* Nút Tra cứu đơn hàng */}
          <div className={styles.buttonWrapper}>
            <span className={styles.tooltip}>Theo dõi đơn hàng</span>
            <button
              type="button"
              onClick={() => setIsOrderTrackingOpen(true)}
              className={styles.circleBtnOrder}
              aria-label="Theo dõi đơn hàng"
              id="btn-order-track-cta"
            >
              <span>📦</span>
            </button>
          </div>

          {/* Nút Zalo tròn */}
          {CONTACT_INFO.zaloUrl && (
            <div className={styles.buttonWrapper}>
              <span className={styles.tooltip}>Chat qua Zalo</span>
              <a
                href={CONTACT_INFO.zaloUrl}
                className={styles.circleBtnZalo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat qua Zalo"
                id="btn-zalo-cta"
              >
                <span className={styles.zaloText}>Zalo</span>
              </a>
            </div>
          )}

          {/* Nút Trợ lý AI tròn */}
          <div className={styles.buttonWrapper}>
            <span className={styles.tooltip}>Chat với Trợ lý AI</span>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className={styles.circleBtnAI}
              aria-label="Chat với Trợ lý AI"
              id="btn-ai-chat"
            >
              <span className={styles.aiIcon}>🤖</span>
              <span className={styles.onlineBadge} />
            </button>
          </div>
        </div>
      )}

      {/* Cửa sổ Chat Trợ lý AI */}
      <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Cửa sổ Theo dõi tiến độ đơn hàng */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        onOpenChat={() => {
          setIsOrderTrackingOpen(false);
          setIsChatOpen(true);
        }}
      />
    </>
  );
}
