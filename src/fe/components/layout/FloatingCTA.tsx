'use client';

import { useState } from 'react';
import { CONTACT_INFO } from '@/shared/lib/constants';
import { AIChatModal } from './AIChatModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import styles from './FloatingCTA.module.css';

/**
 * FloatingCTA — 2 nút tròn nổi ở góc phải dưới:
 * 1. Nút Zalo tròn
 * 2. Nút Trợ lý AI tròn (bấm mở/đóng cửa sổ chat thông minh)
 */
export function FloatingCTA() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);

  return (
    <>
      {/* Nút nổi tròn ở góc phải dưới — Tự động ẩn khi cửa sổ Chat hoặc Tra cứu đơn đang mở */}
      {!isChatOpen && !isOrderTrackingOpen && (
        <div className={styles.floatingCta} id="floating-cta">
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
