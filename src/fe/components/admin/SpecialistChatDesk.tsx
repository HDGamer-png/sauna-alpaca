'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '@/app/admin/chat/adminChat.module.css';

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'seller';
  seller_name?: string;
  text: string;
  timestamp: string;
  escalated?: boolean;
}

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
  order_type: 'rent_3m' | 'rent_6m' | 'rent_12m' | 'buy';
  package_name: string;
  price_text: string;
  deposit_status: string;
  delivery_time: string;
  current_step: number;
  steps: DeliveryStep[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  customer_name: string;
  phone?: string;
  status: 'bot' | 'needs_human' | 'human_taken' | 'resolved';
  alert_type?: string;
  created_at: string;
  last_activity: string;
  unread_for_seller?: boolean;
  messages: Message[];
  order?: Order | null;
}

const QUICK_SNIPPETS = [
  'Dạ chào bạn, tôi là Đức - Chuyên viên tư vấn Sauna Alpaca tại Huế 🌿. Tôi có thể hỗ trợ gì cho bạn ngay bây giờ?',
  'Dạ bên mình hỗ trợ giao hàng và lắp đặt hoàn thiện tận nhà miễn phí trong ngày tại TP. Huế nhé ạ!',
  'Tôi đã nhận được số điện thoại của bạn, tôi sẽ liên hệ lại trực tiếp qua Zalo/Điện thoại ngay nhé!',
  'Dạ gói thuê 6 tháng hiện đang có ưu đãi tặng kèm bộ thảo dược thiên nhiên và miễn phí bảo dưỡng định kỳ.',
];

const PACKAGE_OPTIONS = [
  {
    type: 'rent_6m' as const,
    badge: '⭐ Phổ biến nhất tại Huế',
    name: 'Gói thuê 6 tháng — Trị liệu & Tặng thảo dược',
    price: '950.000 đ/tháng (Tặng 5 hộp thảo dược thiên nhiên)',
  },
  {
    type: 'rent_3m' as const,
    badge: '🌿 Trải nghiệm linh hoạt',
    name: 'Gói thuê 3 tháng — Phục hồi thể trạng',
    price: '1.200.000 đ/tháng (Miễn phí vận chuyển & Lắp đặt)',
  },
  {
    type: 'rent_12m' as const,
    badge: '💰 Tiết kiệm đến 25%',
    name: 'Gói thuê 12 tháng — Chăm sóc dài hạn bền vững',
    price: '750.000 đ/tháng (Bảo dưỡng định kỳ miễn phí tận nơi)',
  },
  {
    type: 'buy' as const,
    badge: '💎 Sở hữu vĩnh viễn',
    name: 'Mua máy mới 100% — Bảo hành chính hãng 2 năm',
    price: '14.900.000 đ (Tặng trọn bộ phụ kiện & 1 đổi 1)',
  },
];

import { AdminUser } from '@/shared/lib/adminStaff';

/**
 * Làm sạch nội dung tin nhắn hiển thị cho chuyên viên tư vấn:
 * Loại bỏ chữ '[VỐN 0Đ]', '[Chính sách 0Đ]' và 'mã xác thực Captcha'
 */
export function cleanSpecialistMessageText(text: string): string {
  if (!text) return text;
  return text
    .replace(/\s*\[VỐN\s*0Đ\]/gi, '')
    .replace(/\s*\[Chính\s*sách\s*0Đ\]/gi, '')
    .replace(/\s*\(Đã xác thực Captcha:[^)]*\)/gi, '')
    .replace(/Tư vấn phác đồ và trải nghiệm\s*0Đ/gi, 'Tư vấn phác đồ và trải nghiệm');
}

interface SpecialistChatDeskProps {
  onOpenCreateOrder?: (customerInfo: { customerName: string; phone: string; address?: string }) => void;
  hideHeader?: boolean;
  currentUser?: AdminUser | null;
}

export function SpecialistChatDesk({ onOpenCreateOrder, hideHeader = true, currentUser }: SpecialistChatDeskProps) {
  const dynamicSnippets = [
    `Dạ chào bạn, tôi là ${currentUser?.display_name || 'Đức'} - Chuyên viên tư vấn Sauna Alpaca tại Huế 🌿. Tôi có thể hỗ trợ gì cho bạn ngay bây giờ?`,
    'Dạ bên mình hỗ trợ giao hàng và lắp đặt hoàn thiện tận nhà miễn phí trong ngày tại TP. Huế nhé ạ!',
    'Tôi đã nhận được số điện thoại của bạn, tôi sẽ liên hệ lại trực tiếp qua Zalo/Điện thoại ngay nhé!',
    'Dạ gói thuê 6 tháng hiện đang có ưu đãi tặng kèm bộ thảo dược thiên nhiên và miễn phí bảo dưỡng định kỳ.',
  ];
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'needs_human' | 'has_phone' | 'resolved'>('all');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const messagesStreamRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Quản lý Đơn hàng fallback nội bộ
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    orderType: 'rent_6m' as 'rent_3m' | 'rent_6m' | 'rent_12m' | 'buy',
    packageName: 'Gói thuê 6 tháng — Trị liệu & Tặng thảo dược',
    priceText: '950.000 đ/tháng (Tặng 5 hộp thảo dược thiên nhiên)',
    customerName: '',
    phone: '',
    address: 'TP. Huế (Giao tận nhà miễn phí)',
    depositStatus: 'Chưa thanh toán (Thu khi giao máy)',
    deliveryTime: 'Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)',
    notes: 'Lắp đặt hoàn thiện, kiểm tra nguồn điện và hướng dẫn người nhà sử dụng.',
  });

  const handleOpenOrder = () => {
    if (!activeSession) return;
    if (onOpenCreateOrder) {
      onOpenCreateOrder({
        customerName: activeSession.customer_name || '',
        phone: activeSession.phone || '',
        address: 'TP. Huế (Giao tận nhà miễn phí)',
      });
    } else {
      setOrderForm({
        orderType: 'rent_6m',
        packageName: 'Gói thuê 6 tháng — Trị liệu & Tặng thảo dược',
        priceText: '950.000 đ/tháng (Tặng 5 hộp thảo dược thiên nhiên)',
        customerName: activeSession.customer_name || '',
        phone: activeSession.phone || '',
        address: 'TP. Huế (Giao tận nhà miễn phí)',
        depositStatus: 'Chưa thanh toán (Thu khi giao máy)',
        deliveryTime: 'Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)',
        notes: 'Lắp đặt hoàn thiện, kiểm tra nguồn điện và hướng dẫn người nhà sử dụng.',
      });
      setIsCreateOrderOpen(true);
    }
  };

  const handleConfirmCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId || isSubmittingOrder) return;

    setIsSubmittingOrder(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSessionId,
          customer_name: orderForm.customerName,
          phone: orderForm.phone,
          address: orderForm.address,
          order_type: orderForm.orderType,
          package_name: orderForm.packageName,
          price_text: orderForm.priceText,
          deposit_status: orderForm.depositStatus,
          delivery_time: orderForm.deliveryTime,
          notes: orderForm.notes,
        }),
      });

      if (res.ok) {
        setIsCreateOrderOpen(false);
        await fetchActiveSessionDetail(activeSessionId);
        await fetchSessions();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi tạo đơn hàng');
      }
    } catch (err) {
      console.error('Lỗi tạo đơn hàng:', err);
      alert('Không thể tạo đơn hàng, vui lòng thử lại.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesStreamRef.current) {
      messagesStreamRef.current.scrollTo({
        top: messagesStreamRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // 1. Tải danh sách phiên
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        const list: Session[] = data.sessions || [];
        setSessions(list);

        const hasUrgent = list.some((s) => s.status === 'needs_human');
        setIsAlarmActive(hasUrgent);

        if (!activeSessionId && list.length > 0) {
          setActiveSessionId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách phiên:', err);
    }
  };

  // 2. Tải chi tiết phiên đang chọn
  const fetchActiveSessionDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/sessions/${encodeURIComponent(id)}`);
      if (res.ok) {
        const detail: Session = await res.json();
        setActiveSession(detail);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết phiên:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
      if (activeSessionId) {
        fetchActiveSessionDetail(activeSessionId);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeSessionId]);

  useEffect(() => {
    if (activeSessionId) {
      fetchActiveSessionDetail(activeSessionId);
      prevMsgCountRef.current = 0;
      setTimeout(() => scrollToBottom(false), 60);
    }
  }, [activeSessionId]);

  useEffect(() => {
    const currentMsgCount = activeSession?.messages?.length || 0;
    if (currentMsgCount > 0 && currentMsgCount !== prevMsgCountRef.current) {
      prevMsgCountRef.current = currentMsgCount;
      scrollToBottom(true);
    }
  }, [activeSession?.messages]);

  const handleMuteAlarm = async () => {
    try {
      await fetch('/api/admin/stop-alarm', { method: 'POST' });
      setIsAlarmActive(false);
    } catch (err) {
      console.error('Lỗi tắt chuông:', err);
    }
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSessionId || !replyText.trim() || isSending) return;

    const text = replyText.trim();
    setIsSending(true);

    const sellerName = currentUser?.full_title || (currentUser?.display_name ? `${currentUser.display_name} (Sauna Alpaca Huế)` : 'Đức (Chuyên viên Sauna Alpaca Huế)');
    const sellerId = currentUser?.id || '';

    try {
      const res = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSessionId,
          text,
          seller_name: sellerName,
          seller_id: sellerId,
        }),
      });

      if (res.ok) {
        setReplyText('');
        setIsAlarmActive(false);
        await fetchActiveSessionDetail(activeSessionId);
        await fetchSessions();
        setTimeout(() => scrollToBottom(true), 80);
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn người bán:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveSession = async () => {
    if (!activeSessionId) return;
    try {
      await fetch(`/api/admin/sessions/${encodeURIComponent(activeSessionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      await fetchActiveSessionDetail(activeSessionId);
      await fetchSessions();
    } catch (err) {
      console.error('Lỗi cập nhật phiên:', err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filterTab === 'needs_human') return s.status === 'needs_human';
    if (filterTab === 'has_phone') return Boolean(s.phone);
    if (filterTab === 'resolved') return s.status === 'resolved';
    return true;
  });

  const urgentCount = sessions.filter((s) => s.status === 'needs_human').length;

  return (
    <div className={styles.adminContainer}>
      {!hideHeader && (
        <header className={styles.topNavbar}>
          <div className={styles.brandGroup}>
            <span className={styles.brandLogo}>
              <Image
                src="/images/logo-emblem.png"
                alt="Sauna Alpaca Logo"
                width={28}
                height={28}
                className={styles.brandLogoImg}
              />
            </span>
            <div>
              <div className={styles.brandTitle}>Sauna Alpaca — Bàn Làm Việc Chuyên Viên</div>
              <div className={styles.brandSubtitle}>Hệ thống tiếp quản Chatbot AI & Tiếp nhận khách hàng (TP. Huế)</div>
            </div>
          </div>
          <div className={styles.navActions}>
            <div className={styles.statusIndicator}>
              <span className={styles.pulsingDot}></span>
              <span>Hệ thống AI Cục Bộ: Trực tuyến 24/7</span>
            </div>
          </div>
        </header>
      )}

      {/* Dải cảnh báo chuông reo */}
      {isAlarmActive && (
        <div className={styles.alarmBanner}>
          <div className={styles.alarmText}>
            <span className={styles.alarmBellIcon}>🔔</span>
            <span>
              CẢNH BÁO: Có {urgentCount} khách hàng đang yêu cầu gặp chuyên viên / chốt đơn cọc máy! Chuông báo thức đang reo...
            </span>
          </div>
          <button type="button" onClick={handleMuteAlarm} className={styles.btnMuteAlarm}>
            🔕 TẮT CHUÔNG BÁO THỨC (15s)
          </button>
        </div>
      )}

      {/* Khung làm việc 2 cột */}
      <div className={styles.deskMain}>
        {/* Cột trái: Danh sách phiên */}
        <aside className={styles.sessionsPanel}>
          <div className={styles.sessionsHeader}>
            <div className={styles.sessionsTitleRow}>
              <span className={styles.sessionsTitle}>Cuộc trò chuyện</span>
              <span className={styles.sessionCountBadge}>{sessions.length} phiên</span>
            </div>

            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.filterBtn} ${filterTab === 'all' ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterTab('all')}
              >
                Tất cả ({sessions.length})
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filterTab === 'needs_human' ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterTab('needs_human')}
              >
                Cần gấp 🚨 ({urgentCount})
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filterTab === 'has_phone' ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterTab('has_phone')}
              >
                Có SĐT 📞 ({sessions.filter((s) => s.phone).length})
              </button>
              <button
                type="button"
                className={`${styles.filterBtn} ${filterTab === 'resolved' ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterTab('resolved')}
              >
                Đã xong ✅
              </button>
            </div>
          </div>

          <div className={styles.sessionsList}>
            {filteredSessions.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                Chưa có cuộc trò chuyện nào trong mục này.
              </div>
            ) : (
              filteredSessions.map((s) => {
                const lastMsg = s.messages[s.messages.length - 1];
                return (
                  <div
                    key={s.id}
                    className={`${styles.sessionCard} ${activeSessionId === s.id ? styles.sessionCardActive : ''}`}
                    onClick={() => setActiveSessionId(s.id)}
                  >
                    <div className={styles.cardTopRow}>
                      <span className={styles.customerName}>{s.customer_name}</span>
                      <span className={styles.cardTime}>
                        {s.last_activity ? s.last_activity.split(' ')[1]?.substring(0, 5) : ''}
                      </span>
                    </div>

                    {s.phone && (
                      <span className={styles.phonePill}>
                        📞 {s.phone}
                      </span>
                    )}

                    <div className={styles.cardSnippet}>
                      {lastMsg ? `${lastMsg.sender === 'user' ? 'Khách: ' : lastMsg.sender === 'seller' ? 'Bạn: ' : 'Bot: '}${cleanSpecialistMessageText(lastMsg.text)}` : 'Chưa có tin nhắn'}
                    </div>

                    <div>
                      {s.status === 'needs_human' && (
                        <span className={`${styles.statusPill} ${styles.statusUrgent}`}>
                          🚨 Cần hỗ trợ gấp
                        </span>
                      )}
                      {s.status === 'human_taken' && (
                        <span className={`${styles.statusPill} ${styles.statusTaken}`}>
                          👨‍💼 Đã tiếp quản
                        </span>
                      )}
                      {s.status === 'bot' && (
                        <span className={`${styles.statusPill} ${styles.statusBot}`}>
                          🤖 Bot đang trả lời
                        </span>
                      )}
                      {s.status === 'resolved' && (
                        <span className={`${styles.statusPill} ${styles.statusResolved}`}>
                          ✅ Đã hoàn tất
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Cột phải: Chi tiết chat */}
        <section className={styles.chatDetailPanel}>
          {!activeSession ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Chọn một cuộc trò chuyện để xem chi tiết</h3>
              <p>Bạn có thể theo dõi khách đang hỏi gì và trực tiếp gõ trả lời khách ngay tại đây.</p>
            </div>
          ) : (
            <>
              <div className={styles.chatDetailHeader}>
                <div className={styles.chatDetailUser}>
                  <div className={styles.chatDetailName}>
                    {activeSession.customer_name}
                    {activeSession.phone && (
                      <span style={{ marginLeft: '10px', color: '#1D4ED8', fontSize: '0.95rem' }}>
                        (📞 {activeSession.phone})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Phiên: <code>{activeSession.id}</code> | Bắt đầu: {activeSession.created_at}
                  </div>
                </div>

                <div className={styles.chatDetailActions}>
                  {currentUser && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        color: '#166534',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                      title={`Đang phản hồi với danh nghĩa: ${currentUser.display_name}`}
                    >
                      <span>{currentUser.avatar || '👨‍⚕️'}</span>
                      <span>{currentUser.display_name}</span>
                    </div>
                  )}

                  {!activeSession.order ? (
                    <button
                      type="button"
                      onClick={handleOpenOrder}
                      className={styles.btnCreateOrder}
                      title="Tạo đơn mua hoặc thuê máy xông cho khách hàng này"
                    >
                      📝 Tạo đơn hàng
                    </button>
                  ) : (
                    <div className={styles.orderActiveBadge} title={`Mã đơn hàng: ${activeSession.order.order_id}`}>
                      <span>📦 Mã đơn: <strong>{activeSession.order.order_id}</strong></span>
                    </div>
                  )}

                  {activeSession.phone && (
                    <>
                      <a
                        href={`tel:${activeSession.phone}`}
                        className={styles.btnActionCall}
                        title="Gọi điện trực tiếp cho khách"
                      >
                        📞 Gọi {activeSession.phone}
                      </a>
                      <a
                        href={`https://zalo.me/${activeSession.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.btnActionZalo}
                        title="Nhắn tin Zalo với khách"
                      >
                        💬 Nhắn Zalo
                      </a>
                    </>
                  )}
                  {activeSession.status !== 'resolved' ? (
                    <button
                      type="button"
                      onClick={handleResolveSession}
                      className={styles.btnResolve}
                      title="Đánh dấu đã hoàn tất tư vấn"
                    >
                      ✅ Đánh dấu hoàn tất
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600 }}>
                      ✓ Đã giải quyết
                    </span>
                  )}
                </div>
              </div>

              {/* Lịch sử tin nhắn */}
              <div ref={messagesStreamRef} className={styles.messagesStream}>
                {activeSession.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.msgRow} ${
                      m.sender === 'user' ? styles.msgUser : m.sender === 'seller' ? styles.msgSeller : styles.msgBot
                    }`}
                  >
                    <div
                      className={`${styles.msgAuthor} ${
                        m.sender === 'user'
                          ? styles.msgAuthorUser
                          : m.sender === 'seller'
                          ? styles.msgAuthorSeller
                          : styles.msgAuthorBot
                      }`}
                    >
                      {m.sender === 'user' && '👤 Khách hàng'}
                      {m.sender === 'bot' && '🤖 Trợ lý AI tự động'}
                      {m.sender === 'seller' && `🌿 ${m.seller_name || 'Bạn (Chuyên viên)'}`}
                    </div>
                    <div
                      className={`${styles.bubble} ${
                        m.sender === 'user'
                          ? styles.bubbleUser
                          : m.sender === 'seller'
                          ? styles.bubbleSeller
                          : styles.bubbleBot
                      }`}
                    >
                      {cleanSpecialistMessageText(m.text)}
                      <div className={styles.msgTime}>{m.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vùng nhập phản hồi của Chuyên viên */}
              <div className={styles.replyBoxContainer}>
                {/* Câu trả lời mẫu */}
                <div className={styles.snippetsRow}>
                  {dynamicSnippets.map((snip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={styles.snippetChip}
                      onClick={() => setReplyText(snip)}
                      title="Bấm để chọn câu trả lời nhanh"
                    >
                      {snip.length > 45 ? `${snip.substring(0, 45)}...` : snip}
                    </button>
                  ))}
                </div>

                {/* Form gõ tin nhắn gửi cho khách */}
                <form onSubmit={handleSendReply} className={styles.replyInputForm}>
                  <input
                    type="text"
                    className={styles.replyInput}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung tư vấn gửi trực tiếp cho khách hàng (Enter để gửi)..."
                    disabled={isSending}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className={styles.btnSendReply}
                    disabled={isSending || !replyText.trim()}
                  >
                    {isSending ? 'Đang gửi...' : 'Gửi phản hồi 🚀'}
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modal tạo đơn nội bộ nếu không dùng onOpenCreateOrder */}
      {isCreateOrderOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateOrderOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>📝 Tạo Đơn Hàng Mới Cho Khách</h3>
                <p className={styles.modalSubtitle}>
                  Đơn hàng sẽ được lưu vào hệ thống và kích hoạt thanh tiến độ giao hàng trên máy khách
                </p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsCreateOrderOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCreateOrder} className={styles.orderForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Chọn Gói Thuê hoặc Mua Thiết Bị:</label>
                <div className={styles.packagesGrid}>
                  {PACKAGE_OPTIONS.map((pkg) => (
                    <div
                      key={pkg.type}
                      className={`${styles.packageOptionCard} ${
                        orderForm.orderType === pkg.type ? styles.packageOptionCardActive : ''
                      }`}
                      onClick={() =>
                        setOrderForm({
                          ...orderForm,
                          orderType: pkg.type,
                          packageName: pkg.name,
                          priceText: pkg.price,
                        })
                      }
                    >
                      <div className={styles.pkgBadge}>{pkg.badge}</div>
                      <div className={styles.pkgName}>{pkg.name}</div>
                      <div className={styles.pkgPrice}>{pkg.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ & Tên khách hàng:</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    placeholder="VD: Anh Nam, Bác Hải..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số điện thoại nhận hàng:</label>
                  <input
                    type="tel"
                    required
                    className={styles.formInput}
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    placeholder="VD: 0912.345.678"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Địa chỉ giao hàng & Lắp đặt tận nhà tại Huế:</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  placeholder="VD: 64 Lê Thánh Tôn, P. Phú Xuân, TP. Huế"
                />
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thời gian giao dự kiến:</label>
                  <select
                    className={styles.formSelect}
                    value={orderForm.deliveryTime}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryTime: e.target.value })}
                  >
                    <option value="Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)">Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)</option>
                    <option value="Sáng mai (8h00 - 11h30)">Sáng mai (8h00 - 11h30)</option>
                    <option value="Chiều mai (14h00 - 17h30)">Chiều mai (14h00 - 17h30)</option>
                    <option value="Theo hẹn riêng với gia đình">Theo hẹn riêng với gia đình</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tình trạng thanh toán / cọc:</label>
                  <select
                    className={styles.formSelect}
                    value={orderForm.depositStatus}
                    onChange={(e) => setOrderForm({ ...orderForm, depositStatus: e.target.value })}
                  >
                    <option value="Chưa thanh toán (Thu tiền khi giao máy)">Chưa thanh toán (Thu tiền khi giao máy)</option>
                    <option value="Đã cọc 500.000đ (Chuyển khoản)">Đã cọc 500.000đ (Chuyển khoản)</option>
                    <option value="Đã thanh toán đủ 100%">Đã thanh toán đủ 100%</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ghi chú cho kỹ thuật viên giao lắp:</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  placeholder="VD: Lắp đặt tại phòng khách tầng 1, mang thêm dây nguồn kéo dài..."
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancelModal}
                  onClick={() => setIsCreateOrderOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={styles.btnSubmitOrder}
                  disabled={isSubmittingOrder}
                >
                  {isSubmittingOrder ? 'Đang tạo đơn...' : '✅ Hoàn tất & Tạo đơn hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
