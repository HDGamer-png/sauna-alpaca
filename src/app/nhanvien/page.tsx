'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SpecialistChatDesk, Order, DeliveryStep } from '@/fe/components/admin/SpecialistChatDesk';
import { StaffShiftLoginForm } from '@/fe/components/admin/StaffShiftLoginForm';
import { AdminUser, AdminShift, getStoredAdminSession, clearStoredAdminSession } from '@/shared/lib/adminStaff';
import styles from './staffPortal.module.css';
import adminStyles from '@/app/admin/adminPortal.module.css';

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

function StaffPortalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'chat' | 'orders' | 'portal' | null;
  const initialSub = searchParams.get('sub') as 'create' | 'progress' | null;

  // Phiên đăng nhập ca trực của Chuyên viên
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [currentShift, setCurrentShift] = useState<AdminShift | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Tab nghiệp vụ: Mặc định đưa thẳng vào 'chat' (Bàn trực chat) hoặc 'orders' (Tạo đơn)
  const [activeTab, setActiveTab] = useState<'chat' | 'orders' | 'portal'>(initialTab || 'chat');
  const [orderSubTab, setOrderSubTab] = useState<'create' | 'progress'>(initialSub || 'create');

  // Trạng thái chuông báo và phiên chat
  const [urgentCount, setUrgentCount] = useState(0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [totalSessionsCount, setTotalSessionsCount] = useState(0);

  // Quản lý đơn hàng
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stepFilter, setStepFilter] = useState<number>(0);
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

  // Kiểm tra phiên đăng nhập đã lưu trong localStorage
  useEffect(() => {
    const session = getStoredAdminSession();
    if (session && session.user) {
      setCurrentUser(session.user);
      setCurrentShift(session.shift);
    }
    setIsCheckingAuth(false);
  }, []);

  // Tải danh sách phiên để kiểm tra chuông báo
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
      // Bỏ qua lỗi mạng ngầm
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

  // Tắt chuông báo thức 15s
  const handleStopAlarm = async () => {
    try {
      await fetch('/api/admin/stop-alarm', { method: 'POST' });
      setIsAlarmActive(false);
    } catch (err) {
      console.error('Lỗi tắt chuông:', err);
    }
  };

  // Kết thúc ca trực & Check-out
  const handleLogout = async () => {
    if (currentUser?.role === 'staff' && currentShift) {
      if (!confirm('Bạn có chắc chắn muốn kết thúc ca trực và check-out không?')) {
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
      setActiveTab('chat');
    }
  };

  // Bàn giao ca cho nhân viên khác
  const handleSwitchShift = async () => {
    await handleLogout();
  };

  // Tạo đơn hàng mới
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
          notes: `${newOrderForm.notes} [Người lập đơn: ${currentUser?.display_name || 'Chuyên viên'}]`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreateSuccessOrder(data.order);
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
      address: info.address || prev.address,
    }));
    setActiveTab('orders');
    setOrderSubTab('create');
  };

  // Lọc đơn hàng
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      o.order_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStep = stepFilter === 0 || o.current_step === stepFilter;
    return matchSearch && matchStep;
  });

  // Đếm theo từng bước
  const countStep1 = orders.filter((o) => o.current_step === 1).length;
  const countStep2 = orders.filter((o) => o.current_step === 2).length;
  const countStep3 = orders.filter((o) => o.current_step === 3).length;
  const countStep4 = orders.filter((o) => o.current_step === 4).length;

  // Nếu chưa đăng nhập: Hiển thị Mẫu 2 Split-Screen Hiện Đại
  if (!isCheckingAuth && !currentUser) {
    return (
      <StaffShiftLoginForm
        onLoginSuccess={(user, shift) => {
          setCurrentUser(user);
          setCurrentShift(shift);
          setActiveTab('chat'); // Đưa thẳng vào bàn trực chat
        }}
      />
    );
  }

  return (
    <div className={styles.portalContainer}>
      {/* ──── THANH ĐIỀU HƯỚNG TRÊN CÙNG (TOP NAV CHUYÊN VIÊN) ──── */}
      <header className={styles.topNav}>
        <div className={styles.brand} onClick={() => setActiveTab('chat')}>
          <span className={styles.brandIcon}>🌿</span>
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>ALPACA SAUNA</span>
            <span className={styles.brandRole}>Nhân viên trực ca TP. Huế</span>
          </div>
        </div>

        {/* 2 Tab nghiệp vụ chính */}
        <nav className={styles.navTabs} aria-label="Nghiệp vụ trực ca">
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
            📦 Tạo đơn hàng ({orders.length})
          </button>
        </nav>

        {/* Nút hành động phải (Huy hiệu ca trực + Đổi ca + Kết thúc ca) */}
        <div className={styles.navActions}>
          {currentUser && (
            <div className={styles.userBadge}>
              <span className={styles.userAvatar}>{currentUser.avatar || '👨‍⚕️'}</span>
              <span className={styles.userName}>{currentUser.display_name}</span>
              {currentShift && (
                <span
                  className={styles.userShiftTime}
                  title={`Check-in lúc: ${currentShift.check_in_time}`}
                >
                  Ca từ: {currentShift.check_in_time.split(' ')[1]?.substring(0, 5)}
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

          <button
            type="button"
            className={styles.btnSwitchShift}
            onClick={handleSwitchShift}
            title="Đổi nhân viên trực ca tiếp theo"
          >
            🔄 Bàn giao ca
          </button>

          <button
            type="button"
            className={styles.btnLogout}
            onClick={handleLogout}
            title="Kết thúc ca trực và check-out chấm công"
          >
            🚪 Kết thúc ca
          </button>

          <Link href="/" className={styles.btnWebsite} title="Xem website khách hàng">
            🌐 Website
          </Link>
        </div>
      </header>

      {/* ──── NỘI DUNG CHUYÊN MÔN SAU KHI ĐĂNG NHẬP ──── */}
      <div className={styles.mainWorkspace}>
        {/* ──── TAB 1: BÀN TRỰC CHAT HỖ TRỢ KHÁCH HÀNG ──── */}
        {activeTab === 'chat' && (
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SpecialistChatDesk
              hideHeader={true}
              onOpenCreateOrder={handleOpenCreateOrderFromChat}
              currentUser={currentUser}
            />
          </main>
        )}

        {/* ──── TAB 2: TẠO ĐƠN HÀNG & CẬP NHẬT TIẾN ĐỘ GIAO MÁY ──── */}
        {activeTab === 'orders' && (
          <main className={adminStyles.ordersWorkspace}>
            {/* Thanh công cụ 2 nút: Tạo đơn mới & Cập nhật tiến độ */}
            <div className={adminStyles.ordersToolbar}>
              <div className={adminStyles.toolbarTitleGroup}>
                <h1 className={adminStyles.toolbarHeading}>
                  {orderSubTab === 'create' ? '📝 Lập Đơn Hàng Cho Khách Hàng' : '🚚 Cập Nhật Tiến Độ Giao Hàng Tại Huế'}
                </h1>
                <p className={adminStyles.toolbarDesc}>
                  {orderSubTab === 'create'
                    ? 'Nhân viên chọn gói thuê hoặc mua máy, điền thông tin khách hàng và bấm tạo đơn để kỹ thuật viên xuất kho.'
                    : 'Theo dõi 4 bước giao máy trong ngày tại TP. Huế: Tiếp nhận ➔ Khử khuẩn buồng xông ➔ Giao xe ➔ Hoàn tất.'}
                </p>
              </div>

              <div className={adminStyles.toolbarToggle}>
                <button
                  type="button"
                  className={`${adminStyles.toolbarBtn} ${orderSubTab === 'create' ? adminStyles.toolbarBtnActive : ''}`}
                  onClick={() => setOrderSubTab('create')}
                >
                  ➕ 1. Tạo đơn hàng mới
                </button>
                <button
                  type="button"
                  className={`${adminStyles.toolbarBtn} ${orderSubTab === 'progress' ? adminStyles.toolbarBtnActive : ''}`}
                  onClick={() => setOrderSubTab('progress')}
                >
                  🔄 2. Cập nhật tiến độ đơn ({orders.length})
                </button>
              </div>
            </div>

            {/* PHẦN 1: FORM TẠO ĐƠN HÀNG MỚI */}
            {orderSubTab === 'create' && (
              <div className={adminStyles.createOrderSection}>
                {createSuccessOrder && (
                  <div className={adminStyles.successBanner}>
                    <div className={adminStyles.successBannerHeader}>
                      <span>🎉 ĐÃ TẠO ĐƠN HÀNG THÀNH CÔNG!</span>
                      <button
                        type="button"
                        onClick={() => setCreateSuccessOrder(null)}
                        className={adminStyles.btnCloseBanner}
                      >
                        ✕
                      </button>
                    </div>
                    <div className={adminStyles.successDetails}>
                      <span>Mã đơn hàng: <strong>{createSuccessOrder.order_id}</strong></span>
                      <span>Khách hàng: <strong>{createSuccessOrder.customer_name}</strong> ({createSuccessOrder.phone})</span>
                      <span>Gói đăng ký: <strong>{createSuccessOrder.package_name}</strong></span>
                    </div>
                    <div className={adminStyles.successActions}>
                      <button
                        type="button"
                        className={adminStyles.btnGoProgress}
                        onClick={() => {
                          setCreateSuccessOrder(null);
                          setOrderSubTab('progress');
                        }}
                      >
                        🚚 Chuyển sang theo dõi tiến độ giao hàng ngay ➔
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitCreateOrder} className={adminStyles.createOrderForm}>
                  {/* Chọn gói thuê / mua */}
                  <div className={adminStyles.formSection}>
                    <label className={adminStyles.formSectionLabel}>
                      1. Chọn Gói Thuê Hoặc Mua Máy Cho Khách:
                    </label>
                    <div className={adminStyles.packageGrid}>
                      {PACKAGE_OPTIONS.map((pkg) => {
                        const isSelected = newOrderForm.orderType === pkg.type;
                        return (
                          <div
                            key={pkg.type}
                            className={`${adminStyles.packageCard} ${isSelected ? adminStyles.packageCardSelected : ''}`}
                            onClick={() => {
                              setNewOrderForm((prev) => ({
                                ...prev,
                                orderType: pkg.type,
                                packageName: pkg.name,
                                priceText: pkg.price,
                              }));
                            }}
                          >
                            <div className={adminStyles.pkgBadge}>{pkg.badge}</div>
                            <div className={adminStyles.pkgName}>{pkg.name}</div>
                            <div className={adminStyles.pkgPrice}>{pkg.price}</div>
                            <div className={adminStyles.pkgRadio}>
                              {isSelected ? '✓ Đã chọn gói này' : 'Bấm để chọn'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thông tin người nhận hàng */}
                  <div className={adminStyles.formSection}>
                    <label className={adminStyles.formSectionLabel}>
                      2. Thông Tin Khách Hàng Nhận Máy Tại TP. Huế:
                    </label>
                    <div className={adminStyles.inputGrid}>
                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>
                          Họ và Tên Khách Hàng <span className={adminStyles.required}>*</span>
                        </label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          placeholder="VD: Anh Hoàng Minh, Chị Thu Thủy..."
                          value={newOrderForm.customerName}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                          required
                        />
                      </div>

                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>
                          Số Điện Thoại Nhận Hàng <span className={adminStyles.required}>*</span>
                        </label>
                        <input
                          type="tel"
                          className={adminStyles.textInput}
                          placeholder="VD: 0905123456"
                          value={newOrderForm.phone}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className={`${adminStyles.inputGroup} ${adminStyles.inputGroupFull}`}>
                        <label className={adminStyles.inputLabel}>
                          Địa Chỉ Giao Máy & Lắp Đặt Hoàn Thiện
                        </label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          placeholder="VD: 45 Lê Lợi, Phường Phú Nhuận, TP. Huế"
                          value={newOrderForm.address}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, address: e.target.value })}
                        />
                      </div>

                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>Thời Gian Giao Hàng Dự Kiến</label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          value={newOrderForm.deliveryTime}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryTime: e.target.value })}
                        />
                      </div>

                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>Trạng Thái Thu Cọc / Thanh Toán</label>
                        <select
                          className={adminStyles.selectInput}
                          value={newOrderForm.depositStatus}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, depositStatus: e.target.value })}
                        >
                          <option value="Chưa thanh toán (Thu khi giao máy)">
                            Chưa thanh toán (Thu khi giao máy)
                          </option>
                          <option value="Đã cọc 500.000 đ">Đã cọc 500.000 đ (Chuyển khoản)</option>
                          <option value="Đã thanh toán 100%">Đã thanh toán 100%</option>
                          <option value="Trải nghiệm thử 0 đồng">Trải nghiệm thử 0 đồng</option>
                        </select>
                      </div>

                      <div className={`${adminStyles.inputGroup} ${adminStyles.inputGroupFull}`}>
                        <label className={adminStyles.inputLabel}>Ghi Chú Kỹ Thuật Viên Giao Máy</label>
                        <textarea
                          className={adminStyles.textareaInput}
                          rows={2}
                          value={newOrderForm.notes}
                          onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={adminStyles.formActions}>
                    <button
                      type="submit"
                      disabled={isSubmittingNewOrder}
                      className={adminStyles.btnSubmitOrder}
                    >
                      {isSubmittingNewOrder ? '⏳ Đang tạo đơn...' : '🚀 XÁC NHẬN TẠO ĐƠN & GỬI KỸ THUẬT VIÊN'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PHẦN 2: BẢNG CẬP NHẬT TIẾN ĐỘ GIAO HÀNG TẬN NHÀ */}
            {orderSubTab === 'progress' && (
              <div className={adminStyles.progressSection}>
                {/* Thanh thống kê nhanh 4 bước */}
                <div className={adminStyles.stepFilterBar}>
                  <button
                    type="button"
                    className={`${adminStyles.stepFilterBtn} ${stepFilter === 0 ? adminStyles.stepFilterBtnActive : ''}`}
                    onClick={() => setStepFilter(0)}
                  >
                    Tất cả ({orders.length})
                  </button>
                  <button
                    type="button"
                    className={`${adminStyles.stepFilterBtn} ${stepFilter === 1 ? adminStyles.stepFilterBtnActive : ''}`}
                    onClick={() => setStepFilter(1)}
                  >
                    1. Tiếp nhận ({countStep1})
                  </button>
                  <button
                    type="button"
                    className={`${adminStyles.stepFilterBtn} ${stepFilter === 2 ? adminStyles.stepFilterBtnActive : ''}`}
                    onClick={() => setStepFilter(2)}
                  >
                    2. Khử khuẩn ({countStep2})
                  </button>
                  <button
                    type="button"
                    className={`${adminStyles.stepFilterBtn} ${stepFilter === 3 ? adminStyles.stepFilterBtnActive : ''}`}
                    onClick={() => setStepFilter(3)}
                  >
                    3. Đang giao ({countStep3})
                  </button>
                  <button
                    type="button"
                    className={`${adminStyles.stepFilterBtn} ${stepFilter === 4 ? adminStyles.stepFilterBtnActive : ''}`}
                    onClick={() => setStepFilter(4)}
                  >
                    4. Hoàn tất ({countStep4})
                  </button>
                </div>

                {/* Tìm kiếm đơn hàng */}
                <div className={adminStyles.searchBarContainer}>
                  <input
                    type="text"
                    placeholder="🔍 Tìm theo Họ tên khách, SĐT hoặc Mã đơn..."
                    className={adminStyles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className={adminStyles.btnClearSearch}
                    >
                      Xóa tìm kiếm
                    </button>
                  )}
                </div>

                {/* Danh sách thẻ đơn hàng */}
                {isLoadingOrders ? (
                  <div className={adminStyles.loadingOrders}>Đang nạp danh sách đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className={adminStyles.emptyOrders}>
                    <p>Chưa có đơn hàng nào phù hợp với bộ lọc hiện tại.</p>
                    <button
                      type="button"
                      className={adminStyles.btnGoCreateNew}
                      onClick={() => setOrderSubTab('create')}
                    >
                      ➕ Tạo đơn hàng mới ngay
                    </button>
                  </div>
                ) : (
                  <div className={adminStyles.ordersListGrid}>
                    {filteredOrders.map((order) => {
                      return (
                        <div key={order.order_id} className={adminStyles.orderCardItem}>
                          <div className={adminStyles.orderCardHeader}>
                            <div>
                              <span className={adminStyles.orderIdBadge}>{order.order_id}</span>
                              <h3 className={adminStyles.orderCustomerName}>
                                {order.customer_name}{' '}
                                <a href={`tel:${order.phone}`} className={adminStyles.customerPhoneLink}>
                                  📞 {order.phone}
                                </a>
                              </h3>
                              <p className={adminStyles.orderPackageName}>{order.package_name}</p>
                            </div>
                            <div className={adminStyles.orderHeaderRight}>
                              <span className={adminStyles.orderPrice}>{order.price_text}</span>
                              <span className={adminStyles.orderDepositTag}>{order.deposit_status}</span>
                            </div>
                          </div>

                          {/* 4 Bước tiến độ trực quan */}
                          <div className={adminStyles.stepperBox}>
                            <div className={adminStyles.stepperLine}>
                              <div
                                className={adminStyles.stepperProgress}
                                style={{ width: `${((order.current_step - 1) / 3) * 100}%` }}
                              />
                            </div>
                            <div className={adminStyles.stepperPoints}>
                              {order.steps.map((st) => (
                                <div
                                  key={st.step}
                                  className={`${adminStyles.stepperPoint} ${
                                    st.done
                                      ? adminStyles.pointDone
                                      : order.current_step === st.step
                                      ? adminStyles.pointCurrent
                                      : ''
                                  }`}
                                >
                                  <div className={adminStyles.pointCircle}>
                                    {st.done ? '✓' : st.step}
                                  </div>
                                  <div className={adminStyles.pointLabel}>{st.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className={adminStyles.orderCardDetails}>
                            <div className={adminStyles.orderDetailRow}>
                              <span>📍 Địa chỉ:</span>
                              <strong>{order.address}</strong>
                            </div>
                            <div className={adminStyles.orderDetailRow}>
                              <span>🚚 Thời gian:</span>
                              <span>{order.delivery_time}</span>
                            </div>
                            {order.notes && (
                              <div className={adminStyles.orderDetailRow}>
                                <span>📝 Ghi chú:</span>
                                <span className={adminStyles.orderNotesText}>{order.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* Nút hành động nhanh của Chuyên viên */}
                          <div className={adminStyles.orderCardActions}>
                            {order.current_step < 4 ? (
                              <button
                                type="button"
                                className={adminStyles.btnAdvanceStep}
                                onClick={() => handleQuickAdvanceStep(order.order_id, order.current_step)}
                                disabled={isUpdatingOrder}
                              >
                                ➔ Nâng tiến độ sang: <strong>{order.steps[order.current_step]?.title}</strong>
                              </button>
                            ) : (
                              <div className={adminStyles.orderCompletedBadge}>
                                ✨ Đã giao máy & hoàn tất lắp đặt 100%
                              </div>
                            )}

                            <button
                              type="button"
                              className={adminStyles.btnEditOrder}
                              onClick={() => setEditingOrder(order)}
                            >
                              ✏️ Chỉnh sửa chi tiết
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal chỉnh sửa đơn hàng */}
            {editingOrder && (
              <div className={adminStyles.editModalOverlay} onClick={() => setEditingOrder(null)}>
                <div className={adminStyles.editModalCard} onClick={(e) => e.stopPropagation()}>
                  <div className={adminStyles.editModalHeader}>
                    <h3>✏️ Chỉnh Sửa Chi Tiết Đơn Hàng: {editingOrder.order_id}</h3>
                    <button
                      type="button"
                      className={adminStyles.btnCloseEdit}
                      onClick={() => setEditingOrder(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSaveEditOrder} className={adminStyles.editForm}>
                    <div className={adminStyles.editFormGrid}>
                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>Bước Tiến Độ Hiện Tại (1 - 4):</label>
                        <select
                          className={adminStyles.selectInput}
                          value={editingOrder.current_step}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, current_step: Number(e.target.value) })
                          }
                        >
                          <option value={1}>1. Tiếp nhận đơn hàng</option>
                          <option value={2}>2. Khử khuẩn buồng xông & kiểm tra</option>
                          <option value={3}>3. Kỹ thuật viên đang giao máy</option>
                          <option value={4}>4. Đã lắp đặt & bàn giao hoàn tất</option>
                        </select>
                      </div>

                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>Họ Tên Khách Hàng:</label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          value={editingOrder.customer_name}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, customer_name: e.target.value })
                          }
                        />
                      </div>

                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>Số Điện Thoại:</label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          value={editingOrder.phone}
                          onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                        />
                      </div>

                      <div className={adminStyles.inputGroup}>
                        <label className={adminStyles.inputLabel}>Trạng Thái Thanh Toán:</label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          value={editingOrder.deposit_status}
                          onChange={(e) =>
                            setEditingOrder({ ...editingOrder, deposit_status: e.target.value })
                          }
                        />
                      </div>

                      <div className={`${adminStyles.inputGroup} ${adminStyles.inputGroupFull}`}>
                        <label className={adminStyles.inputLabel}>Địa Chỉ Nhận Hàng:</label>
                        <input
                          type="text"
                          className={adminStyles.textInput}
                          value={editingOrder.address}
                          onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                        />
                      </div>

                      <div className={`${adminStyles.inputGroup} ${adminStyles.inputGroupFull}`}>
                        <label className={adminStyles.inputLabel}>Ghi Chú Điều Phối:</label>
                        <textarea
                          rows={2}
                          className={adminStyles.textareaInput}
                          value={editingOrder.notes || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className={adminStyles.editModalActions}>
                      <button
                        type="button"
                        className={adminStyles.btnCancelEdit}
                        onClick={() => setEditingOrder(null)}
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className={adminStyles.btnSaveEdit}
                        disabled={isUpdatingOrder}
                      >
                        {isUpdatingOrder ? 'Đang lưu...' : '💾 Lưu Chi Tiết Đơn Hàng'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Footer cổng chuyên viên */}
      {activeTab !== 'chat' && (
        <footer className={styles.portalFooter}>
          <div className={styles.portalFooterInner}>
            <span>© 2026 Sauna Alpaca Huế — Cổng Nghiệp Vụ Nhân Viên Trực Ca</span>
            <span className={styles.footerDivider}>•</span>
            <span>Hotline Kỹ Thuật: <strong>0385.927.274</strong></span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function StaffPortalPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '40px', color: '#fff', textAlign: 'center', background: '#0f172a' }}>
          Đang tải Cổng Nghiệp Vụ Nhân Viên...
        </div>
      }
    >
      <StaffPortalContent />
    </Suspense>
  );
}
