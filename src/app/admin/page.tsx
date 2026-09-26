'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SpecialistChatDesk, Order, DeliveryStep } from '@/fe/components/admin/SpecialistChatDesk';
import { AdminLoginModal } from '@/fe/components/admin/AdminLoginModal';
import { StaffManagementView } from '@/fe/components/admin/StaffManagementView';
import { AdminUser, AdminShift, getStoredAdminSession, clearStoredAdminSession } from '@/shared/lib/adminStaff';
import styles from './adminPortal.module.css';

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

function AdminPortalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'portal' | 'chat' | 'orders' | 'staff' | null;
  const initialSub = searchParams.get('sub') as 'create' | 'progress' | null;

  // Phiên đăng nhập của Chủ hoặc Nhân viên trực ca
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentShift, setCurrentShift] = useState<AdminShift | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Trạng thái tab chính: 'portal' (chọn chức năng), 'chat' (Hỗ trợ khách hàng), 'orders' (Tạo đơn hàng), 'staff' (Quản trị nhân sự)
  const [activeTab, setActiveTab] = useState<'portal' | 'chat' | 'orders' | 'staff'>(initialTab || 'portal');
  
  // Trạng thái mục con của "Tạo đơn hàng": 'create' (Tạo đơn mới) hoặc 'progress' (Cập nhật tiến độ đơn hàng)
  const [orderSubTab, setOrderSubTab] = useState<'create' | 'progress'>(initialSub || 'create');

  // Trạng thái chuông báo và phiên chat
  const [urgentCount, setUrgentCount] = useState(0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [totalSessionsCount, setTotalSessionsCount] = useState(0);

  // Quản lý đơn hàng
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stepFilter, setStepFilter] = useState<number>(0); // 0: Tất cả, 1-4: Các bước
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [createSuccessOrder, setCreateSuccessOrder] = useState<Order | null>(null);

  // Form Tạo đơn mới
  const [isSubmittingNewOrder, setIsSubmittingNewOrder] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    orderType: 'rent_6m' as 'rent_3m' | 'rent_6m' | 'rent_12m' | 'buy',
    packageName: 'Gói thuê 6 tháng — Trị liệu & Tặng thảo dược',
    priceText: '950.000 đ/tháng (Tặng 5 hộp thảo dược thiên nhiên)',
    customerName: '',
    phone: '',
    address: 'TP. Huế (Giao tận nhà miễn phí)',
    deliveryTime: 'Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)',
    depositStatus: 'Chưa thanh toán (Thu khi giao máy)',
    notes: 'Kỹ thuật viên khử khuẩn buồng xông, giao xe và lắp đặt hoàn thiện tận nhà tại TP. Huế.',
  });

  // Tải danh sách phiên để kiểm tra chuông báo và tổng số phiên
  const checkSystemStatus = async () => {
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        const list = data.sessions || [];
        setTotalSessionsCount(list.length);
        const urgent = list.filter((s: { status: string }) => s.status === 'needs_human').length;
        setUrgentCount(urgent);
        setIsAlarmActive(urgent > 0);
      }
    } catch {
      // Bỏ qua lỗi mạng nền
    }
  };

  // Tải danh sách đơn hàng
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    const session = getStoredAdminSession();
    if (session && session.user) {
      setCurrentUser(session.user);
      setCurrentShift(session.shift);
    }
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    checkSystemStatus();
    fetchOrders();
    const interval = setInterval(() => {
      checkSystemStatus();
      if (activeTab === 'orders') {
        fetchOrders();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Đăng xuất và check-out ca trực
  const handleLogout = async () => {
    if (currentUser?.role === 'staff' && currentShift) {
      if (!confirm('Bạn có chắc chắn muốn kết thúc ca trực và đăng xuất không?')) {
        return;
      }
    }
    try {
      if (currentShift) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shift_id: currentShift.shift_id,
            staff_id: currentShift.staff_id,
          }),
        });
      }
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    } finally {
      clearStoredAdminSession();
      setCurrentUser(null);
      setCurrentShift(null);
      setActiveTab('portal');
    }
  };

  // Tắt chuông báo thức
  const handleStopAlarm = async () => {
    try {
      await fetch('/api/admin/stop-alarm', { method: 'POST' });
      setIsAlarmActive(false);
    } catch (err) {
      console.error('Lỗi tắt chuông:', err);
    }
  };

  // Xử lý tạo đơn hàng mới
  const handleSubmitCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingNewOrder) return;

    if (!newOrderForm.customerName.trim() || !newOrderForm.phone.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại nhận hàng!');
      return;
    }

    setIsSubmittingNewOrder(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: newOrderForm.customerName.trim(),
          phone: newOrderForm.phone.trim(),
          address: newOrderForm.address.trim(),
          order_type: newOrderForm.orderType,
          package_name: newOrderForm.packageName,
          price_text: newOrderForm.priceText,
          deposit_status: newOrderForm.depositStatus,
          delivery_time: newOrderForm.deliveryTime,
          notes: newOrderForm.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created = data.order;
        setCreateSuccessOrder(created);
        await fetchOrders();
        // Reset form
        setNewOrderForm({
          orderType: 'rent_6m',
          packageName: 'Gói thuê 6 tháng — Trị liệu & Tặng thảo dược',
          priceText: '950.000 đ/tháng (Tặng 5 hộp thảo dược thiên nhiên)',
          customerName: '',
          phone: '',
          address: 'TP. Huế (Giao tận nhà miễn phí)',
          deliveryTime: 'Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)',
          depositStatus: 'Chưa thanh toán (Thu khi giao máy)',
          notes: 'Kỹ thuật viên khử khuẩn buồng xông, giao xe và lắp đặt hoàn thiện tận nhà tại TP. Huế.',
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Lỗi khi tạo đơn hàng!');
      }
    } catch (err) {
      console.error('Lỗi tạo đơn hàng:', err);
      alert('Không thể kết nối máy chủ tạo đơn hàng.');
    } finally {
      setIsSubmittingNewOrder(false);
    }
  };

  // Nâng bước giao hàng (1 click)
  const handleQuickAdvanceStep = async (orderId: string, currentStep: number) => {
    if (currentStep >= 4 || isUpdatingOrder) return;
    const nextStep = currentStep + 1;
    setIsUpdatingOrder(true);
    try {
      const res = await fetch('/api/admin/orders/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          step: nextStep,
        }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Lỗi cập nhật bước đơn hàng:', err);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Lưu chi tiết chỉnh sửa đơn hàng
  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || isUpdatingOrder) return;

    setIsUpdatingOrder(true);
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: editingOrder.order_id,
          current_step: editingOrder.current_step,
          customer_name: editingOrder.customer_name,
          phone: editingOrder.phone,
          address: editingOrder.address,
          deposit_status: editingOrder.deposit_status,
          delivery_time: editingOrder.delivery_time,
          notes: editingOrder.notes,
        }),
      });

      if (res.ok) {
        setEditingOrder(null);
        await fetchOrders();
      } else {
        alert('Lỗi khi cập nhật chi tiết đơn hàng');
      }
    } catch (err) {
      console.error('Lỗi cập nhật chi tiết:', err);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Mở form tạo đơn với dữ liệu từ phiên chat chuyển sang
  const handleOpenCreateOrderFromChat = (info: { customerName: string; phone: string; address?: string }) => {
    setNewOrderForm((prev) => ({
      ...prev,
      customerName: info.customerName || '',
      phone: info.phone || '',
      address: info.address || 'TP. Huế (Giao tận nhà miễn phí)',
    }));
    setActiveTab('orders');
    setOrderSubTab('create');
  };

  // Lọc danh sách đơn hàng
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.phone.includes(searchTerm) ||
      ord.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStep = stepFilter === 0 || ord.current_step === stepFilter;
    return matchesSearch && matchesStep;
  });

  // Đếm theo từng bước
  const countStep1 = orders.filter((o) => o.current_step === 1).length;
  const countStep2 = orders.filter((o) => o.current_step === 2).length;
  const countStep3 = orders.filter((o) => o.current_step === 3).length;
  const countStep4 = orders.filter((o) => o.current_step === 4).length;

  // Nếu chưa đăng nhập: Hiển thị màn hình khóa bảo mật
  if (!isCheckingAuth && !currentUser) {
    return (
      <AdminLoginModal
        isOpen={true}
        onLoginSuccess={(user, shift) => {
          setCurrentUser(user);
          setCurrentShift(shift);
        }}
      />
    );
  }

  return (
    <div className={styles.portalContainer}>
      {/* ──── THANH ĐIỀU HƯỚNG TRÊN CÙNG (TOP NAV) ──── */}
      <header className={styles.topNav}>
        <div className={styles.brand} onClick={() => setActiveTab('portal')}>
          <span className={styles.brandIcon}>
            <Image
              src="/images/logo-emblem.png"
              alt="Sauna Alpaca Logo"
              width={28}
              height={28}
              className={styles.brandLogoImg}
            />
          </span>
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>ALPACA SAUNA</span>
            <span className={styles.brandRole}>
              {currentUser?.role === 'owner' ? 'Hệ thống Quản trị' : 'Tư vấn & Quản lý đơn'}
            </span>
          </div>
        </div>

        {/* Các nút chuyển đổi chức năng */}
        <nav className={styles.navTabs} aria-label="Các chức năng chuyên viên">
          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'portal' ? styles.navTabBtnActive : ''}`}
            onClick={() => setActiveTab('portal')}
          >
            🏠 Chọn chức năng
          </button>

          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'chat' ? styles.navTabBtnActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Hỗ trợ khách hàng
            {urgentCount > 0 && <span className={styles.tabBadge}>{urgentCount} cần gấp</span>}
          </button>

          <button
            type="button"
            className={`${styles.navTabBtn} ${activeTab === 'orders' ? styles.navTabBtnActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Đơn hàng ({orders.length})
          </button>

          {/* Tab Dành Riêng Cho Chủ Cửa Hàng */}
          {currentUser?.role === 'owner' && (
            <button
              type="button"
              className={`${styles.navTabBtn} ${activeTab === 'staff' ? styles.navTabBtnActive : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              👥 Quản lý Nhân sự
            </button>
          )}
        </nav>

        {/* Nút hành động phải (Huy hiệu nhân viên + Chuông báo + Đăng xuất) */}
        <div className={styles.navActions}>
          {/* Huy hiệu định danh người trực hoặc Chủ */}
          {currentUser && (
            <div
              className={`${styles.userBadge} ${currentUser.role === 'owner' ? styles.userBadgeOwner : ''}`}
              title={currentUser.role === 'owner' ? 'Tài khoản Chủ Cửa Hàng (Admin Tổng)' : `Nhân viên trực ca: ${currentUser.display_name}`}
            >
              <span className={styles.userAvatar}>
                {currentUser.avatar || (currentUser.role === 'owner' ? '👑' : '👨‍⚕️')}
              </span>
              <span className={styles.userName}>
                {currentUser.role === 'owner' ? 'Chủ Shop' : currentUser.display_name}
              </span>
              {currentUser.role === 'owner' && (
                <span className={styles.ownerPill}>Admin Tổng</span>
              )}
              {currentUser.role === 'staff' && currentShift && (
                <span
                  className={styles.userShiftTime}
                  title={`Check-in lúc: ${currentShift.check_in_time}`}
                >
                  Ca: {currentShift.check_in_time.split(' ')[1]?.substring(0, 5)}
                </span>
              )}
            </div>
          )}

          {isAlarmActive && (
            <button
              type="button"
              className={`${styles.alarmBtn} ${styles.alarmBtnRinging}`}
              onClick={handleStopAlarm}
              title="Có khách cần hỗ trợ gấp! Bấm để tắt chuông 15s"
            >
              🔔 Tắt chuông ({urgentCount})
            </button>
          )}

          {currentUser?.role === 'staff' && (
            <button
              type="button"
              className={styles.btnSwitchShift}
              onClick={handleLogout}
              title="Đổi nhân viên trực ca khác"
            >
              <span className={styles.btnIcon}>🔄</span>
              <span className={styles.actionBtnText}>Đổi ca</span>
            </button>
          )}

          <button
            type="button"
            className={styles.btnLogout}
            onClick={handleLogout}
            title={currentUser?.role === 'staff' ? 'Kết thúc ca trực và đăng xuất an toàn' : 'Đăng xuất khỏi hệ thống quản trị'}
            aria-label={currentUser?.role === 'staff' ? 'Kết thúc ca trực' : 'Đăng xuất quản trị'}
          >
            <span className={styles.btnIcon}>🚪</span>
            <span className={styles.actionBtnText}>
              <span className={styles.fullText}>{currentUser?.role === 'staff' ? 'Kết thúc ca' : 'Đăng xuất'}</span>
              <span className={styles.shortText}>{currentUser?.role === 'staff' ? 'Hết ca' : 'Đăng xuất'}</span>
            </span>
          </button>

          <Link
            href="/nhanvien"
            className={styles.btnSwitchShift}
            title="Mở Cổng Nghiệp Vụ Nhân Viên Trực Ca (/nhanvien)"
            aria-label="Cổng Nhân Viên"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.btnIcon}>🌿</span>
            <span className={styles.actionBtnText}>
              <span className={styles.fullText}>Cổng Nhân Viên</span>
              <span className={styles.shortText}>Cổng NV</span>
            </span>
          </Link>

          <Link
            href="/"
            className={styles.btnWebsite}
            title="Quay lại giao diện website khách hàng"
            aria-label="Website Khách Hàng"
          >
            <span className={styles.btnIcon}>🌐</span>
            <span className={styles.actionBtnText}>
              <span className={styles.fullText}>Website</span>
              <span className={styles.shortText}>Web</span>
            </span>
          </Link>
        </div>
      </header>

      {/* ──── VIEW 0: MÀN HÌNH LỰA CHỌN CHỨC NĂNG (KHI MỚI ẤN VÀO CỔNG CHUYÊN VIÊN) ──── */}
      {activeTab === 'portal' && (
        <main className={styles.selectionHub}>
          <div className={styles.hubHeader}>
            <div className={styles.hubBadge}>
              <span>✨</span>
              <span>Cổng Nghiệp Vụ Chuyên Viên Sauna Alpaca TP. Huế</span>
            </div>
            <h1 className={styles.hubTitle}>Chọn Chức Năng Làm Việc</h1>
            <p className={styles.hubSubtitle}>
              Chào mừng bạn đến với trung tâm điều hành chuyên viên. Vui lòng chọn một trong hai chức năng bên dưới để bắt đầu:
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {/* THẺ 1: HỖ TRỢ KHÁCH HÀNG */}
            <div className={styles.featureCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}>💬</div>
                <span className={`${styles.cardTag} ${styles.cardTagChat}`}>Trực tuyến 24/7</span>
              </div>
              <h2 className={styles.cardTitle}>Hỗ Trợ Khách Hàng</h2>
              <p className={styles.cardDesc}>
                Khung chat tiếp nhận tư vấn khách hàng, giải đáp thắc mắc về máy xông hơi hồng ngoại và gói thuê. Hệ thống tự động đổ chuông báo thức 15 giây khi có khách cần gặp chuyên viên hoặc gửi số điện thoại.
              </p>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statDotActive}></span>
                  <span>{totalSessionsCount} cuộc trò chuyện</span>
                </div>
                {urgentCount > 0 ? (
                  <div className={styles.statItem} style={{ color: '#f87171', fontWeight: 700 }}>
                    🚨 {urgentCount} khách cần phản hồi gấp!
                  </div>
                ) : (
                  <div className={styles.statItem} style={{ color: '#34d399' }}>
                    ✓ Sẵn sàng tiếp nhận
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.cardBtnPrimary}
                onClick={() => setActiveTab('chat')}
              >
                💬 Vào Khung Chat Hỗ Trợ
              </button>
            </div>

            {/* THẺ 2: TẠO ĐƠN HÀNG */}
            <div className={styles.featureCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconBox}>📦</div>
                <span className={`${styles.cardTag} ${styles.cardTagOrder}`}>Vận chuyển & Lắp đặt Huế</span>
              </div>
              <h2 className={styles.cardTitle}>Tạo Đơn Hàng</h2>
              <p className={styles.cardDesc}>
                Lập đơn thuê hoặc mua máy xông hơi mới cho khách hàng, điều phối kỹ thuật viên giao xe tận nơi và cập nhật 4 bước giao hàng theo thời gian thực (Tiếp nhận ➔ Khử khuẩn ➔ Giao xe ➔ Hoàn tất).
              </p>
              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statDotActive}></span>
                  <span>{orders.length} đơn hàng trong hệ thống</span>
                </div>
                <div className={styles.statItem} style={{ color: '#fbbf24' }}>
                  🚚 {countStep2 + countStep3} đơn đang xử lý giao
                </div>
              </div>
              
              {/* Hai nút chức năng rõ ràng theo yêu cầu của bạn */}
              <div className={styles.cardSubActions}>
                <button
                  type="button"
                  className={styles.cardBtnCreateNew}
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderSubTab('create');
                  }}
                >
                  ➕ Tạo đơn mới
                </button>
                <button
                  type="button"
                  className={styles.cardBtnProgress}
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderSubTab('progress');
                  }}
                >
                  🔄 Cập nhật tiến độ đơn hàng
                </button>
              </div>
            </div>

            {/* THẺ 3: QUẢN TRỊ NHÂN SỰ & GIÁM SÁT CA TRỰC (DÀNH RIÊNG CHO CHỦ) */}
            {currentUser?.role === 'owner' && (
              <div className={styles.featureCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconBox}>👑</div>
                  <span
                    className={`${styles.cardTag} ${styles.cardTagOrder}`}
                    style={{ background: 'rgba(212, 135, 44, 0.25)', color: '#ffd8a8', borderColor: '#d4872c' }}
                  >
                    Quyền Chủ Quản Lý
                  </span>
                </div>
                <h2 className={styles.cardTitle}>Nhân Sự & Giám Sát Ca Trực</h2>
                <p className={styles.cardDesc}>
                  Quản lý 3 tài khoản nhân viên trực page, theo dõi bảng giờ vào — giờ ra của từng nhân viên theo thời gian thực và quản lý chấm công ca làm việc.
                </p>
                <div className={styles.cardStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statDotActive}></span>
                    <span>Giám sát Check-in & Check-out</span>
                  </div>
                  <div className={styles.statItem} style={{ color: '#34d399' }}>
                    ✓ Quản lý 3 chuyên viên trực
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.cardBtnPrimary}
                  style={{ background: 'linear-gradient(135deg, #d4872c, #b45309)' }}
                  onClick={() => setActiveTab('staff')}
                >
                  👥 Vào Bảng Quản Trị Nhân Sự
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ──── VIEW 1: MỤC HỖ TRỢ KHÁCH HÀNG (KHUNG CHAT) ──── */}
      {activeTab === 'chat' && (
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <SpecialistChatDesk
            hideHeader={true}
            onOpenCreateOrder={handleOpenCreateOrderFromChat}
            currentUser={currentUser}
          />
        </main>
      )}

      {/* ──── VIEW 2: MỤC TẠO ĐƠN HÀNG (CÓ 2 NÚT: TẠO ĐƠN MỚI, CẬP NHẬT TIẾN ĐỘ) ──── */}
      {activeTab === 'orders' && (
        <main className={styles.ordersWorkspace}>
          {/* Thanh công cụ với 2 nút theo yêu cầu */}
          <div className={styles.orderActionsBar}>
            <div className={styles.orderWorkspaceTitle}>
              <span>📦</span>
              <span>QUẢN LÝ & ĐIỀU PHỐI ĐƠN HÀNG SAUNA ALPACA</span>
            </div>

            {/* 2 Nút lựa chọn: Tạo đơn mới & Cập nhật tiến độ đơn hàng */}
            <div className={styles.subButtonsGroup}>
              <button
                type="button"
                className={`${styles.btnSubAction} ${
                  orderSubTab === 'create' ? styles.btnSubActionActive : styles.btnSubActionNormal
                }`}
                onClick={() => setOrderSubTab('create')}
              >
                ➕ Tạo đơn mới
              </button>

              <button
                type="button"
                className={`${styles.btnSubAction} ${
                  orderSubTab === 'progress' ? styles.btnSubActionProgressActive : styles.btnSubActionNormal
                }`}
                onClick={() => setOrderSubTab('progress')}
              >
                🔄 Cập nhật tiến độ đơn hàng ({orders.length})
              </button>
            </div>
          </div>

          {/* Thông báo tạo đơn thành công */}
          {createSuccessOrder && (
            <div className={styles.successBanner}>
              <div className={styles.successBannerInfo}>
                <span className={styles.successBannerIcon}>🎉</span>
                <div className={styles.successBannerText}>
                  Đã tạo thành công đơn hàng <span className={styles.orderIdHighlight}>{createSuccessOrder.order_id}</span> cho khách <strong>{createSuccessOrder.customer_name}</strong> ({createSuccessOrder.phone}).
                </div>
              </div>
              <button
                type="button"
                className={styles.btnGoProgress}
                onClick={() => {
                  setOrderSubTab('progress');
                  setCreateSuccessOrder(null);
                }}
              >
                Xem & Cập nhật tiến độ đơn này ➔
              </button>
            </div>
          )}

          {/* ──── 2A. GIAO DIỆN TẠO ĐƠN MỚI ──── */}
          {orderSubTab === 'create' && (
            <div className={styles.createOrderCard}>
              <div className={styles.formSectionHeader}>
                <h2 className={styles.formSectionTitle}>📝 Lập Đơn Hàng Thuê / Mua Thiết Bị Mới</h2>
                <p className={styles.formSectionSubtitle}>
                  Nhập thông tin khách hàng chốt đơn tại TP. Huế. Sau khi hoàn thành, khách hàng có thể dùng số điện thoại để theo dõi tiến độ giao xe trên web.
                </p>
              </div>

              <form onSubmit={handleSubmitCreateOrder} className={styles.orderFormGrid}>
                {/* Chọn gói thiết bị */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chọn Gói Thiết Bị:</label>
                  <div className={styles.packageSelectorGrid}>
                    {PACKAGE_OPTIONS.map((pkg) => (
                      <div
                        key={pkg.type}
                        className={`${styles.pkgOptionCard} ${
                          newOrderForm.orderType === pkg.type ? styles.pkgOptionCardActive : ''
                        }`}
                        onClick={() =>
                          setNewOrderForm({
                            ...newOrderForm,
                            orderType: pkg.type,
                            packageName: pkg.name,
                            priceText: pkg.price,
                          })
                        }
                      >
                        <div className={styles.pkgOptionBadge}>{pkg.badge}</div>
                        <div className={styles.pkgOptionName}>{pkg.name}</div>
                        <div className={styles.pkgOptionPrice}>{pkg.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thông tin khách */}
                <div className={styles.formRow2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Họ & Tên khách hàng (*):</label>
                    <input
                      type="text"
                      required
                      className={styles.formInput}
                      value={newOrderForm.customerName}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                      placeholder="VD: Anh Nam, Bác Hải, Chị Lan..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số điện thoại nhận máy (*):</label>
                    <input
                      type="tel"
                      required
                      className={styles.formInput}
                      value={newOrderForm.phone}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                      placeholder="VD: 0912.345.678"
                    />
                  </div>
                </div>

                {/* Địa chỉ giao */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Địa chỉ giao hàng & Lắp đặt tận nhà tại Huế (*):</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={newOrderForm.address}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                    placeholder="VD: 64 Lê Thánh Tôn, P. Phú Xuân, TP. Huế"
                  />
                </div>

                {/* Thời gian giao & Tình trạng cọc */}
                <div className={styles.formRow2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lịch hẹn giao dự kiến:</label>
                    <select
                      className={styles.formSelect}
                      value={newOrderForm.deliveryTime}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryTime: e.target.value })}
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
                      value={newOrderForm.depositStatus}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, depositStatus: e.target.value })}
                    >
                      <option value="Chưa thanh toán (Thu tiền khi giao máy)">Chưa thanh toán (Thu tiền khi giao máy)</option>
                      <option value="Đã cọc 500.000đ (Chuyển khoản)">Đã cọc 500.000đ (Chuyển khoản)</option>
                      <option value="Đã thanh toán đủ 100%">Đã thanh toán đủ 100%</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú điều phối */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ghi chú cho kỹ thuật viên giao lắp:</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={newOrderForm.notes}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                    placeholder="VD: Nhà trong ngõ hẹp, lắp tại phòng ngủ tầng 1, mang thêm ổ cắm..."
                  />
                </div>

                {/* Hàng nút bấm gửi form */}
                <div className={styles.formActionsRow}>
                  <button
                    type="button"
                    className={styles.btnResetForm}
                    onClick={() => {
                      setNewOrderForm({
                        orderType: 'rent_6m',
                        packageName: 'Gói thuê 6 tháng — Trị liệu & Tặng thảo dược',
                        priceText: '950.000 đ/tháng (Tặng 5 hộp thảo dược thiên nhiên)',
                        customerName: '',
                        phone: '',
                        address: 'TP. Huế (Giao tận nhà miễn phí)',
                        deliveryTime: 'Giao ngay trong ngày tại TP. Huế (Miễn phí 100%)',
                        depositStatus: 'Chưa thanh toán (Thu khi giao máy)',
                        notes: 'Kỹ thuật viên khử khuẩn buồng xông, giao xe và lắp đặt hoàn thiện tận nhà tại TP. Huế.',
                      });
                    }}
                  >
                    Làm mới form
                  </button>

                  <button
                    type="submit"
                    className={styles.btnSubmitCreate}
                    disabled={isSubmittingNewOrder}
                  >
                    {isSubmittingNewOrder ? 'Đang tạo đơn hàng...' : '✅ Hoàn tất & Lưu đơn hàng'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ──── 2B. GIAO DIỆN CẬP NHẬT TIẾN ĐỘ ĐƠN HÀNG ──── */}
          {orderSubTab === 'progress' && (
            <div className={styles.progressWorkspace}>
              {/* Thẻ thống kê KPI */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Tổng số đơn</span>
                  <span className={styles.kpiValue}>{orders.length}</span>
                </div>
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #60a5fa' }}>
                  <span className={styles.kpiLabel}>B1: Chờ tiếp nhận</span>
                  <span className={styles.kpiValue} style={{ color: '#60a5fa' }}>{countStep1}</span>
                </div>
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #fbbf24' }}>
                  <span className={styles.kpiLabel}>B2: Đang khử khuẩn</span>
                  <span className={styles.kpiValue} style={{ color: '#fbbf24' }}>{countStep2}</span>
                </div>
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #f97316' }}>
                  <span className={styles.kpiLabel}>B3: Đang giao xe</span>
                  <span className={styles.kpiValue} style={{ color: '#f97316' }}>{countStep3}</span>
                </div>
                <div className={styles.kpiCard} style={{ borderLeft: '4px solid #10b981' }}>
                  <span className={styles.kpiLabel}>B4: Đã bàn giao</span>
                  <span className={styles.kpiValue} style={{ color: '#10b981' }}>{countStep4}</span>
                </div>
              </div>

              {/* Thanh lọc & tìm kiếm */}
              <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                  <span>🔍</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã đơn, SĐT, Tên khách..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className={styles.stepFilterPills}>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${stepFilter === 0 ? styles.filterPillActive : ''}`}
                    onClick={() => setStepFilter(0)}
                  >
                    Tất cả ({orders.length})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${stepFilter === 1 ? styles.filterPillActive : ''}`}
                    onClick={() => setStepFilter(1)}
                  >
                    Bước 1: Tiếp nhận ({countStep1})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${stepFilter === 2 ? styles.filterPillActive : ''}`}
                    onClick={() => setStepFilter(2)}
                  >
                    Bước 2: Khử khuẩn ({countStep2})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${stepFilter === 3 ? styles.filterPillActive : ''}`}
                    onClick={() => setStepFilter(3)}
                  >
                    Bước 3: Đang giao xe ({countStep3})
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${stepFilter === 4 ? styles.filterPillActive : ''}`}
                    onClick={() => setStepFilter(4)}
                  >
                    Bước 4: Đã bàn giao ({countStep4})
                  </button>
                </div>
              </div>

              {/* Danh sách thẻ đơn hàng */}
              <div className={styles.ordersList}>
                {isLoadingOrders && orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Đang tải danh sách đơn hàng...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📦</div>
                    <div className={styles.emptyTitle}>Không tìm thấy đơn hàng phù hợp</div>
                    <div className={styles.emptyDesc}>
                      {searchTerm ? 'Thử tìm kiếm với số điện thoại hoặc từ khóa khác' : 'Bấm nút "Tạo đơn mới" ở trên để tạo đơn hàng đầu tiên.'}
                    </div>
                  </div>
                ) : (
                  filteredOrders.map((ord) => {
                    return (
                      <div key={ord.order_id} className={styles.orderItemCard}>
                        {/* Hàng thông tin chính */}
                        <div className={styles.orderCardTop}>
                          <div className={styles.orderMainInfo}>
                            <div className={styles.orderIdRow}>
                              <span className={styles.orderIdText}>{ord.order_id}</span>
                              <span className={styles.orderTypeBadge}>{ord.package_name}</span>
                            </div>
                            <div className={styles.orderCustomerName}>
                              👤 Khách hàng: <strong>{ord.customer_name}</strong>
                            </div>
                            <div className={styles.orderMetaRow}>
                              <div className={styles.orderMetaItem}>
                                <span>📞</span>
                                <a href={`tel:${ord.phone}`} className={styles.orderPhoneLink}>
                                  {ord.phone}
                                </a>
                              </div>
                              <div className={styles.orderMetaItem}>
                                <span>📍</span>
                                <span>{ord.address}</span>
                              </div>
                              <div className={styles.orderMetaItem}>
                                <span>⏰</span>
                                <span>Lịch hẹn: {ord.delivery_time}</span>
                              </div>
                              <div className={styles.orderMetaItem}>
                                <span>💳</span>
                                <span>{ord.deposit_status}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Thanh Stepper 4 bước */}
                        <div className={styles.stepperContainer}>
                          <div className={styles.stepperSteps}>
                            {ord.steps.map((st: DeliveryStep) => {
                              const isDone = st.done;
                              const isActive = st.step === ord.current_step;
                              return (
                                <div key={st.step} className={styles.stepNode}>
                                  <div className={styles.stepNodeHeader}>
                                    <div
                                      className={`${styles.stepCircle} ${
                                        isDone ? styles.stepCircleDone : isActive ? styles.stepCircleActive : ''
                                      }`}
                                    >
                                      {isDone ? '✓' : st.step}
                                    </div>
                                    <div
                                      className={`${styles.stepTitle} ${
                                        isDone ? styles.stepTitleDone : isActive ? styles.stepTitleActive : ''
                                      }`}
                                    >
                                      {st.title}
                                    </div>
                                  </div>
                                  <div className={styles.stepDesc}>{st.desc}</div>
                                  {st.timestamp && <div className={styles.stepTime}>🕒 {st.timestamp}</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Hàng nút hành động cập nhật tiến độ */}
                        <div className={styles.orderCardActions}>
                          <div className={styles.orderNotesText}>
                            {ord.notes ? `📝 Ghi chú: ${ord.notes}` : 'Chưa có ghi chú lắp đặt đặc biệt.'}
                          </div>

                          <div className={styles.orderButtonsCluster}>
                            {ord.current_step < 4 ? (
                              <button
                                type="button"
                                className={styles.btnAdvanceStep}
                                disabled={isUpdatingOrder}
                                onClick={() => handleQuickAdvanceStep(ord.order_id, ord.current_step)}
                                title="Nâng ngay lên bước giao hàng tiếp theo"
                              >
                                <span>Tiến lên Bước {ord.current_step + 1} ⏩</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 700 }}>
                                🎉 Đã hoàn tất & bàn giao
                              </span>
                            )}

                            <button
                              type="button"
                              className={styles.btnEditDetails}
                              onClick={() => setEditingOrder(ord)}
                            >
                              ✏️ Chỉnh sửa chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ──── MODAL CHỈNH SỬA CHI TIẾT ĐƠN HÀNG ──── */}
      {editingOrder && (
        <div className={styles.modalOverlay} onClick={() => setEditingOrder(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>✏️ Cập Nhật Chi Tiết Đơn Hàng [{editingOrder.order_id}]</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setEditingOrder(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className={styles.orderFormGrid}>
              {/* Chọn trực tiếp Bước tiến độ */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tiến độ giao hàng hiện tại (Bước 1 - 4):</label>
                <select
                  className={styles.formSelect}
                  value={editingOrder.current_step}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, current_step: Number(e.target.value) })
                  }
                >
                  <option value={1}>Bước 1: Tiếp nhận đơn hàng</option>
                  <option value={2}>Bước 2: Khử khuẩn ozone & Đóng gói</option>
                  <option value={3}>Bước 3: Kỹ thuật viên đang giao xe tại Huế</option>
                  <option value={4}>Bước 4: Đã lắp đặt & Bàn giao hoàn tất</option>
                </select>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên khách hàng:</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={editingOrder.customer_name}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customer_name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số điện thoại:</label>
                  <input
                    type="tel"
                    required
                    className={styles.formInput}
                    value={editingOrder.phone}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Địa chỉ giao hàng:</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  value={editingOrder.address}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, address: e.target.value })
                  }
                />
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thời gian giao dự kiến:</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editingOrder.delivery_time}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, delivery_time: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tình trạng thanh toán / cọc:</label>
                  <select
                    className={styles.formSelect}
                    value={editingOrder.deposit_status}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, deposit_status: e.target.value })
                    }
                  >
                    <option value="Chưa thanh toán (Thu tiền khi giao máy)">Chưa thanh toán (Thu tiền khi giao máy)</option>
                    <option value="Đã cọc 500.000đ (Chuyển khoản)">Đã cọc 500.000đ (Chuyển khoản)</option>
                    <option value="Đã thanh toán đủ 100%">Đã thanh toán đủ 100%</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ghi chú cho kỹ thuật viên:</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editingOrder.notes || ''}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, notes: e.target.value })
                  }
                />
              </div>

              <div className={styles.formActionsRow}>
                <button
                  type="button"
                  className={styles.btnResetForm}
                  onClick={() => setEditingOrder(null)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={styles.btnSubmitCreate}
                  disabled={isUpdatingOrder}
                >
                  {isUpdatingOrder ? 'Đang lưu...' : '💾 Lưu cập nhật đơn hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──── VIEW 3: QUẢN LÝ NHÂN SỰ & GIÁM SÁT CA TRỰC (DÀNH CHO CHỦ) ──── */}
      {activeTab === 'staff' && currentUser?.role === 'owner' && (
        <main style={{ flex: 1, background: '#f8fafc', overflowY: 'auto' }}>
          <StaffManagementView currentUser={currentUser} />
        </main>
      )}

      {/* ──── FOOTER CỔNG CHUYÊN VIÊN ──── */}
      {activeTab !== 'chat' && (
        <footer className={styles.portalFooter}>
          <div className={styles.portalFooterInner}>
            <span className={styles.portalCopyright}>© 2026 Sauna Alpaca Huế — Cổng Nhân Viên Quản Lý & Điều Phối</span>
            <span className={styles.footerDivider}>•</span>
            <span className={styles.portalHotline}>Hotline Kỹ Thuật: <strong>0385.927.274</strong></span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function AdminPortalPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>Đang tải Cổng Quản Trị & Nhân Viên...</div>}>
      <AdminPortalContent />
    </Suspense>
  );
}
