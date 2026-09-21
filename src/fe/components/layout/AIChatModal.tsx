'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIChatModal.module.css';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'seller';
  text: string;
  timestamp: string;
  sellerName?: string;
  escalated?: boolean;
  priority?: string;
  alertType?: string;
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
  order_type: string;
  package_name: string;
  price_text: string;
  deposit_status: string;
  delivery_time: string;
  current_step: number;
  steps: DeliveryStep[];
  notes?: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIChatResponse {
  reply: string;
  sessionId?: string;
  escalated?: boolean;
  priority?: string;
  alert_type?: string;
}

// Các câu hỏi gợi ý nhanh
const QUICK_QUESTIONS = [
  'Hồng ngoại xa hỗ trợ gì cho bệnh thận?',
  'Chính sách thuê theo tháng tại Huế?',
  'Người lớn tuổi nên xông ở nhiệt độ nào?',
  'Thời gian lắp đặt tại nhà mất bao lâu?',
];

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý Sức Khỏe AI của Sauna Alpaca 🌿.\n\nTôi có thể giải đáp cho bạn về công nghệ hồng ngoại xa, cơ sở y khoa cho bệnh nhân suy thận, giảm đau xương khớp, hoặc tư vấn các gói thuê/mua tại Huế.\n\nBạn cần hỗ trợ câu hỏi nào dưới đây?',
      timestamp: 'Vừa xong',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<{ phone: string; name?: string; concern?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo hoặc khôi phục session_id từ sessionStorage (100% logic máy khách)
  useEffect(() => {
    let sid = typeof window !== 'undefined' ? sessionStorage.getItem('sauna_alpaca_sid') : null;
    if (!sid) {
      sid = `sess_${Date.now()}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sauna_alpaca_sid', sid);
      }
    }
    setSessionId(sid);
  }, []);

  // Đọc thông tin khách hàng nếu đã đăng nhập SĐT
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('sauna_alpaca_customer');
      if (raw) {
        setCustomerProfile(JSON.parse(raw));
      } else {
        setCustomerProfile(null);
      }
    } catch {
      setCustomerProfile(null);
    }
  }, [isOpen]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  // Đồng bộ tin nhắn phản hồi từ chuyên viên & tiến độ đơn hàng thời gian thực
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const pollSellerReplies = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          const serverMsgs = data.messages || [];

          // Cập nhật thông tin đơn hàng nếu có
          if (data.order) {
            setActiveOrder(data.order);
          }

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newSellerMsgs = serverMsgs
              .filter((sm: { sender: string; id: string }) => sm.sender === 'seller' && !existingIds.has(sm.id))
              .map((sm: { id: string; text: string; timestamp?: string; seller_name?: string }) => ({
                id: sm.id,
                sender: 'seller' as const,
                sellerName: sm.seller_name || 'Đức (Chuyên viên)',
                text: sm.text,
                timestamp: sm.timestamp || 'Vừa xong',
              }));

            if (newSellerMsgs.length > 0) {
              return [...prev, ...newSellerMsgs];
            }
            return prev;
          });
        }
      } catch {
        // Bỏ qua lỗi polling mạng nhẹ
      }
    };

    pollSellerReplies();
    const interval = setInterval(pollSellerReplies, 2500);
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  /**
   * Gọi API /api/chat kết nối sang Python AI Engine độc lập (Port 8000)
   */
  const handleAILogic = async (userText: string): Promise<AIChatResponse> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          sessionId,
          customerPhone: customerProfile?.phone,
          customerName: customerProfile?.name,
          history: messages.map((m) => ({ role: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        sessionStorage.setItem('sauna_alpaca_sid', data.sessionId);
      }
      return data;
    } catch (err) {
      console.error('Lỗi khi gọi API chat:', err);
      return {
        reply: 'Rất tiếc, đã có gián đoạn kết nối. Bạn vui lòng thử lại hoặc gọi trực tiếp hotline 0385.927.274 nhé!',
        escalated: false,
      };
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // 1. Thêm tin nhắn của người dùng
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 2. Gọi hàm logic AI
      const data = await handleAILogic(text);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        escalated: data.escalated,
        priority: data.priority,
        alertType: data.alert_type,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Rất tiếc, đã có gián đoạn kết nối. Bạn vui lòng thử lại hoặc gọi trực tiếp hotline 0385.927.274 nhé!',
          timestamp: timeStr,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    const newSid = `sess_${Date.now()}`;
    setSessionId(newSid);
    sessionStorage.setItem('sauna_alpaca_sid', newSid);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ thêm thông tin nào về máy xông hơi Sauna Alpaca?',
        timestamp: 'Vừa xong',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatWindow} role="dialog" aria-label="Cửa sổ Chat Trợ lý AI">
      {/* ──── Header ──── */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderLeft}>
          <div className={styles.chatAvatar}>🤖</div>
          <div className={styles.chatTitleGroup}>
            <span className={styles.chatTitle}>Trợ lý Sức Khỏe AI</span>
            <span className={styles.chatStatus}>
              <span className={styles.chatStatusDot}></span> Trực tuyến 24/7
            </span>
          </div>
        </div>
        <div className={styles.chatHeaderActions}>
          <button
            type="button"
            className={styles.chatActionBtn}
            onClick={handleReset}
            title="Làm mới cuộc trò chuyện"
            aria-label="Làm mới"
          >
            🔄
          </button>
          <button
            type="button"
            className={styles.chatActionBtn}
            onClick={onClose}
            title="Đóng cửa sổ chat"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ──── Nội dung tin nhắn ──── */}
      <div className={styles.chatBody}>
        {/* Banner Nhận diện khách hàng / Gợi ý đăng nhập SĐT */}
        {customerProfile ? (
          <div className={styles.customerIdentifiedBadge}>
            <span>🌿</span>
            <span>Khách hàng: <strong>{customerProfile.name && customerProfile.name !== 'Quý khách' ? customerProfile.name : customerProfile.phone}</strong> ({customerProfile.phone})</span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.customerPromptAuthBtn}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-customer-auth'));
            }}
          >
            <span>🎋</span>
            <span>Cần hỗ trợ & tạo đơn? <strong>Đăng nhập bằng SĐT</strong></span>
            <span>→</span>
          </button>
        )}

        {/* ──── Thẻ Đơn Hàng & Tiến Độ Giao Hàng Thời Gian Thực ──── */}
        {activeOrder && (
          <div className={styles.orderTrackerCard}>
            <div className={styles.orderTrackerHeader}>
              <div className={styles.orderTrackerBadge}>
                <span className={styles.orderTruckIcon}>🚚</span>
                <span>TIẾN ĐỘ ĐƠN HÀNG: <strong>#{activeOrder.order_id}</strong></span>
              </div>
              <span className={styles.orderTrackerStepCount}>
                Bước {activeOrder.current_step}/4
              </span>
            </div>

            <div className={styles.orderInfoSummary}>
              <div className={styles.orderPackageTitle}>🌿 {activeOrder.package_name}</div>
              <div className={styles.orderMetaRow}>
                <span>💰 {activeOrder.price_text}</span>
                <span>📍 {activeOrder.address}</span>
              </div>
            </div>

            {/* Thanh Stepper 4 bước giao hàng */}
            <div className={styles.customerStepper}>
              {activeOrder.steps.map((st) => (
                <div
                  key={st.step}
                  className={`${styles.customerStepItem} ${
                    st.step === activeOrder.current_step
                      ? styles.customerStepActive
                      : st.step < activeOrder.current_step
                      ? styles.customerStepDone
                      : styles.customerStepPending
                  }`}
                >
                  <div className={styles.customerStepDot}>
                    {st.done ? '✓' : st.step}
                  </div>
                  <div className={styles.customerStepLabel}>
                    <span className={styles.customerStepTitle}>{st.title}</span>
                    {st.timestamp && (
                      <span className={styles.customerStepTimestamp}>{st.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.orderDeliveryFooter}>
              <span>⏰ Dự kiến: <strong>{activeOrder.delivery_time}</strong></span>
              <a href="tel:0385927274" className={styles.btnCallTech}>
                📞 Kỹ thuật viên: 0385.927.274
              </a>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageRow} ${
              msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAssistant
            }`}
          >
            {msg.sender !== 'user' && (
              <div className={styles.messageAvatar}>
                {msg.sender === 'seller' ? '👨‍💼' : '🌿'}
              </div>
            )}
            <div
              className={`${styles.messageBubble} ${
                msg.sender === 'user'
                  ? styles.bubbleUser
                  : msg.sender === 'seller'
                  ? styles.bubbleSeller
                  : styles.bubbleAssistant
              }`}
            >
              {msg.sender === 'seller' && (
                <div className={styles.sellerBadgeHeader}>
                  🌿 {msg.sellerName || 'Chuyên viên tư vấn Sauna Alpaca'}
                </div>
              )}

              <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

              {/* Khung liên hệ nhanh khi có tín hiệu ưu tiên / khẩn cấp */}
              {msg.escalated && (
                <div className={styles.escalationBox}>
                  <div className={styles.escalationBadge}>
                    🔔 Tín hiệu đã chuyển tới chuyên viên tư vấn tại Huế!
                  </div>
                  <div className={styles.escalationActions}>
                    <a
                      href="tel:0385927274"
                      className={styles.escalationBtnCall}
                      title="Gọi ngay Hotline tư vấn"
                    >
                      📞 0385.927.274
                    </a>
                    <a
                      href="https://zalo.me/0385927274"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.escalationBtnZalo}
                      title="Nhắn tin Zalo với chuyên viên"
                    >
                      💬 Nhắn Zalo
                    </a>
                  </div>
                </div>
              )}

              <div className={styles.messageTime}>{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {/* Đang gõ (Typing Indicator) */}
        {isTyping && (
          <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
            <div className={styles.messageAvatar}>🌿</div>
            <div className={styles.typingIndicator}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        )}

        {/* Gợi ý câu hỏi nhanh khi mới vào */}
        {messages.length <= 2 && (
          <div className={styles.quickSuggestions}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Gợi ý câu hỏi phổ biến:
            </span>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.quickSuggestionBtn}
                onClick={() => handleSendMessage(q)}
              >
                💬 {q}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ──── Khung nhập tin nhắn ──── */}
      <form
        className={styles.chatFooter}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className={styles.chatInput}
          placeholder="Hỏi trợ lý AI về sản phẩm..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
        />
        <button
          type="submit"
          className={styles.chatSendBtn}
          disabled={!inputText.trim() || isTyping}
          aria-label="Gửi tin nhắn"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
