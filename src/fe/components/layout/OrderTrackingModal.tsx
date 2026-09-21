'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './OrderTrackingModal.module.css';

export interface DeliveryStep {
  step: number;
  key: string;
  title: string;
  desc: string;
  done: boolean;
  timestamp?: string | null;
}

export interface Order {
  order_id: string;
  session_id: string;
  customer_name: string;
  phone: string;
  address: string;
  order_type: string;
  package_name: string;
  price_text: string;
  deposit_status: string;
  delivery_time: string;
  current_step: number;
  steps: DeliveryStep[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
}

export function OrderTrackingModal({ isOpen, onClose, onOpenChat }: OrderTrackingModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động tìm kiếm đơn hàng đã lưu khi người dùng mở modal
  useEffect(() => {
    if (!isOpen) return;

    const autoFetchOrder = async () => {
      // 1. Thử lấy từ session chat hiện tại
      const sid = typeof window !== 'undefined' ? sessionStorage.getItem('sauna_alpaca_sid') : null;
      if (sid) {
        try {
          const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sid)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.order) {
              setOrder(data.order);
              setSearchQuery(data.order.phone || data.order.order_id);
              return;
            }
          }
        } catch {
          // Bỏ qua lỗi nhẹ
        }
      }

      // 2. Thử lấy từ localStorage đã lưu từ lần trước
      const savedOrderId = typeof window !== 'undefined' ? localStorage.getItem('sauna_alpaca_last_order_id') : null;
      const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('sauna_alpaca_phone') : null;
      const lookupKey = savedOrderId || savedPhone;

      if (lookupKey) {
        setSearchQuery(lookupKey);
        await performLookup(lookupKey, false);
      } else {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    };

    autoFetchOrder();
  }, [isOpen]);

  const performLookup = async (query: string, showAlertOnNotFound = true) => {
    const q = query.trim();
    if (!q) return;

    setIsLoading(true);
    setNotFound(false);

    try {
      const res = await fetch(`/api/orders/lookup?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.order) {
          setOrder(data.order);
          setNotFound(false);
          // Ghi nhớ để lần sau vào lại tự động hiển thị
          if (typeof window !== 'undefined') {
            localStorage.setItem('sauna_alpaca_last_order_id', data.order.order_id);
            if (data.order.phone) {
              localStorage.setItem('sauna_alpaca_phone', data.order.phone);
            }
          }
        } else {
          setOrder(null);
          if (showAlertOnNotFound) {
            setNotFound(true);
          }
        }
      } else {
        setOrder(null);
        if (showAlertOnNotFound) setNotFound(true);
      }
    } catch (err) {
      console.error('Lỗi tra cứu đơn hàng:', err);
      setOrder(null);
      if (showAlertOnNotFound) setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchQuery, true);
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-label="Tra cứu đơn hàng"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>📦</div>
            <div>
              <h3 className={styles.headerTitle}>Tra Cứu & Theo Dõi Đơn Hàng</h3>
              <p className={styles.headerSubtitle}>
                Theo dõi hành trình điều phối và vận chuyển máy xông hơi tại TP. Huế
              </p>
            </div>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Khung tìm kiếm */}
        <div className={styles.searchSection}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Nhập Số điện thoại hoặc Mã đơn (VD: 0905... hoặc ORD-...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn} disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? 'Đang tra...' : '🔍 Tra cứu'}
            </button>
          </form>
        </div>

        {/* Nội dung kết quả */}
        <div className={styles.modalBody}>
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Đang kiểm tra dữ liệu đơn hàng...</p>
            </div>
          )}

          {!isLoading && notFound && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h4>Không tìm thấy đơn hàng</h4>
              <p>
                Không có đơn hàng nào khớp với thông tin &quot;{searchQuery}&quot;. Vui lòng kiểm tra lại số điện thoại hoặc liên hệ chuyên viên để được trợ giúp.
              </p>
              {onOpenChat && (
                <button
                  type="button"
                  className={styles.btnChatNow}
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                >
                  💬 Hỏi chuyên viên tư vấn ngay
                </button>
              )}
            </div>
          )}

          {!isLoading && !order && !notFound && (
            <div className={styles.initialState}>
              <div className={styles.initialIcon}>🌿</div>
              <h4>Chào mừng bạn quay trở lại Sauna Alpaca!</h4>
              <p>
                Nếu bạn đã đăng ký mua hoặc thuê máy xông hơi, vui lòng nhập <strong>Số điện thoại</strong> đặt hàng để xem ngay tiến độ giao xe và tình trạng lắp đặt tại nhà nhé.
              </p>
            </div>
          )}

          {!isLoading && order && (
            <div className={styles.orderCard}>
              {/* Thẻ định danh đơn hàng */}
              <div className={styles.orderTopRow}>
                <div>
                  <div className={styles.orderIdBadge}>
                    <span className={styles.truckIcon}>🚚</span> Mã đơn: <strong>#{order.order_id}</strong>
                  </div>
                  <div className={styles.customerName}>Khách hàng: <strong>{order.customer_name}</strong> {order.phone && `(📞 ${order.phone})`}</div>
                </div>
                <div className={styles.stepBadge}>
                  Bước {order.current_step}/4: {order.steps[order.current_step - 1]?.title}
                </div>
              </div>

              {/* Thông tin gói và địa chỉ */}
              <div className={styles.orderDetailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Gói thiết bị:</span>
                  <span className={styles.detailValueBold}>🌿 {order.package_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Chi phí:</span>
                  <span className={styles.detailValuePrice}>💰 {order.price_text}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Địa chỉ giao lắp:</span>
                  <span className={styles.detailValue}>📍 {order.address}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Thời gian hẹn giao:</span>
                  <span className={styles.detailValue}>⏰ {order.delivery_time}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Thanh toán / Đặt cọc:</span>
                  <span className={styles.detailValueDeposit}>{order.deposit_status}</span>
                </div>
                {order.notes && (
                  <div className={styles.detailItemFull}>
                    <span className={styles.detailLabel}>Ghi chú điều phối:</span>
                    <span className={styles.detailValueNote}>{order.notes}</span>
                  </div>
                )}
              </div>

              {/* ──── Thanh Tiến Trình Giao Hàng 4 Bước ──── */}
              <div className={styles.stepperContainer}>
                <div className={styles.stepperHeader}>
                  <span>TIẾN ĐỘ THỜI GIAN THỰC</span>
                  <span className={styles.stepperLiveDot}>• Trực tuyến tại Huế</span>
                </div>

                <div className={styles.stepperTrack}>
                  {order.steps.map((st) => {
                    const isCurrent = st.step === order.current_step;
                    const isPast = st.step < order.current_step;
                    return (
                      <div
                        key={st.step}
                        className={`${styles.stepCol} ${
                          isCurrent ? styles.stepColActive : isPast ? styles.stepColDone : styles.stepColPending
                        }`}
                      >
                        <div className={styles.stepCircle}>
                          {st.done ? '✓' : st.step}
                        </div>
                        <div className={styles.stepInfo}>
                          <div className={styles.stepTitle}>{st.title}</div>
                          <div className={styles.stepDesc}>{st.desc}</div>
                          {st.timestamp && (
                            <div className={styles.stepTime}>
                              🕒 {st.timestamp}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer thao tác nhanh */}
              <div className={styles.orderFooterActions}>
                <a href="tel:0385927274" className={styles.btnActionCall}>
                  📞 Gọi Kỹ thuật viên giao máy: 0385.927.274
                </a>
                {onOpenChat && (
                  <button
                    type="button"
                    className={styles.btnActionChat}
                    onClick={() => {
                      onClose();
                      onOpenChat();
                    }}
                  >
                    💬 Nhắn tin với Chuyên viên
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
