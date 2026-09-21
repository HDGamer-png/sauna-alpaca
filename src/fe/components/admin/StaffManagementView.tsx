'use client';

import React, { useState, useEffect } from 'react';
import styles from './StaffManagementView.module.css';
import { AdminUser, AdminShift } from '@/shared/lib/adminStaff';

const AVATAR_PRESETS = ['👨‍⚕️', '👩‍⚕️', '👨‍🔧', '👩‍💼', '👨‍💼', '🌿', '🏥', '⭐'];

interface StaffManagementViewProps {
  currentUser: AdminUser;
}

export function StaffManagementView({ currentUser }: StaffManagementViewProps) {
  // Dữ liệu Ca trực (Attendance & Shifts)
  const [shifts, setShifts] = useState<AdminShift[]>([]);
  const [activeShifts, setActiveShifts] = useState<AdminShift[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [shiftFilter, setShiftFilter] = useState<'all' | 'active'>('all');

  // Dữ liệu Danh sách Nhân viên
  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Modal Thêm / Sửa Nhân viên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    full_title: '',
    avatar: '👨‍⚕️',
    phone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải danh sách ca trực
  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/admin/shifts');
      if (res.ok) {
        const data = await res.json();
        setShifts(data.shifts || []);
        setActiveShifts(data.active_shifts || []);
      }
    } catch (err) {
      console.error('Lỗi nạp ca trực:', err);
    }
  };

  // Tải danh sách nhân sự
  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error('Lỗi nạp danh sách nhân sự:', err);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchStaff();
    // Tự động làm mới mỗi 4 giây để giám sát giờ vào/giờ ra và thời lượng thời gian thực
    const timer = setInterval(() => {
      fetchShifts();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Cưỡng chế kết thúc ca trực
  const handleForceEndShift = async (shiftId: string, staffName: string) => {
    if (!confirm(`Bạn có chắc muốn kết thúc ca trực của "${staffName}" ngay bây giờ?`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/shifts/force-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_id: shiftId }),
      });
      if (res.ok) {
        await fetchShifts();
      } else {
        alert('Lỗi kết thúc ca trực');
      }
    } catch (err) {
      console.error('Lỗi cưỡng chế kết thúc ca:', err);
    }
  };

  // Mở modal tạo nhân viên mới
  const handleOpenCreateModal = () => {
    setEditingStaffId(null);
    setFormData({
      username: '',
      password: 'sauna@123',
      display_name: '',
      full_title: '',
      avatar: '👨‍⚕️',
      phone: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa nhân viên
  const handleOpenEditModal = (staff: AdminUser) => {
    setEditingStaffId(staff.id);
    setFormData({
      username: staff.username,
      password: '', // Để trống nếu không muốn đổi
      display_name: staff.display_name,
      full_title: staff.full_title,
      avatar: staff.avatar || '👨‍⚕️',
      phone: staff.phone || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Xóa tài khoản nhân viên
  const handleDeleteStaff = async (staffId: string, displayName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${displayName}" không? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: staffId }),
      });
      if (res.ok) {
        await fetchStaff();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Lỗi khi xóa nhân viên');
      }
    } catch (err) {
      console.error('Lỗi xóa nhân viên:', err);
    }
  };

  // Lưu tạo mới hoặc sửa nhân viên
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.display_name.trim()) {
      setFormError('Vui lòng nhập Họ tên nhân viên');
      return;
    }

    if (!editingStaffId) {
      // Tạo mới cần username & password
      if (!formData.username.trim()) {
        setFormError('Vui lòng nhập Tên đăng nhập');
        return;
      }
      if (!formData.password.trim()) {
        setFormError('Vui lòng nhập Mật khẩu khởi tạo');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (editingStaffId) {
        // Cập nhật
        const payload: Record<string, string> = {
          id: editingStaffId,
          display_name: formData.display_name.trim(),
          full_title: formData.full_title.trim() || `${formData.display_name.trim()} — Chuyên viên tư vấn`,
          avatar: formData.avatar,
          phone: formData.phone.trim(),
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await fetch('/api/admin/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setIsModalOpen(false);
          await fetchStaff();
        } else {
          const err = await res.json().catch(() => ({}));
          setFormError(err.error || 'Lỗi cập nhật nhân viên');
        }
      } else {
        // Tạo mới
        const res = await fetch('/api/admin/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password.trim(),
            display_name: formData.display_name.trim(),
            full_title: formData.full_title.trim() || `${formData.display_name.trim()} — Chuyên viên tư vấn`,
            avatar: formData.avatar,
            phone: formData.phone.trim(),
          }),
        });

        if (res.ok) {
          setIsModalOpen(false);
          await fetchStaff();
        } else {
          const err = await res.json().catch(() => ({}));
          setFormError(err.error || 'Lỗi tạo nhân viên');
        }
      }
    } catch (err) {
      console.error('Lỗi lưu thông tin nhân sự:', err);
      setFormError('Không thể kết nối máy chủ nhân sự');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc ca trực
  const displayedShifts = shiftFilter === 'active' ? shifts.filter((s) => s.status === 'active') : shifts;
  const staffMembersOnly = staffList.filter((s) => s.role === 'staff');

  return (
    <div className={styles.container}>
      {/* ──── BANNER CHỦ QUẢN TRỊ ──── */}
      <section className={styles.topBanner}>
        <div>
          <h1 className={styles.bannerTitle}>
            <span>👑 Quản Trị Nhân Sự & Giám Sát Ca Trực</span>
            <span className={styles.bannerBadge}>Dành Riêng Cho Chủ Cửa Hàng</span>
          </h1>
          <p className={styles.bannerDesc}>
            Xin chào <strong>{currentUser.display_name}</strong>. Tại đây bạn có toàn quyền quản lý 3 tài
            khoản nhân viên trực ca, giám sát thời gian thực giờ vào — giờ ra của từng chuyên viên và theo
            dõi năng suất tư vấn khách hàng.
          </p>
        </div>
        <div className={styles.bannerActions}>
          <button type="button" className={styles.btnPrimary} onClick={handleOpenCreateModal}>
            <span>➕</span>
            <span>Tạo Thêm Nhân Viên Mới</span>
          </button>
        </div>
      </section>

      {/* ──── THẺ THỐNG KÊ NHANH ──── */}
      <section className={styles.metricsGrid}>
        <div className={`${styles.metricCard} ${activeShifts.length > 0 ? styles.metricCardActive : ''}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Đang Trực Ca Ngay Bây Giờ</span>
            <span className={styles.metricIcon}>🟢</span>
          </div>
          <div className={styles.metricValue}>
            {activeShifts.length > 0 ? (
              <span>{activeShifts.map((s) => s.staff_name).join(', ')}</span>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Chưa có nhân viên online</span>
            )}
          </div>
          <span className={styles.metricSubtext}>
            {activeShifts.length > 0 ? `Đang trực tuyến: ${activeShifts.length} nhân viên` : 'Đang chờ ca tiếp theo'}
          </span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Tổng Nhân Viên Trực Ca</span>
            <span className={styles.metricIcon}>👥</span>
          </div>
          <div className={styles.metricValue}>{staffMembersOnly.length} Nhân sự</div>
          <span className={styles.metricSubtext}>Quản lý phân quyền trực page</span>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Tổng Số Ca Đã Ghi Nhận</span>
            <span className={styles.metricIcon}>⏱️</span>
          </div>
          <div className={styles.metricValue}>{shifts.length} Ca làm việc</div>
          <span className={styles.metricSubtext}>Tự động Check-in & Check-out</span>
        </div>
      </section>

      {/* ──── KHỐI 1: BẢNG GIÁM SÁT GIỜ VÀO - GIỜ RA (SHIFT LOGS) ──── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <span>⏱️ Bảng Giám Sát Giờ Vào — Giờ Ra (Chấm Công Tự Động)</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Hệ thống tự động ghi nhận thời điểm Check-in khi nhân viên đăng nhập và Check-out khi kết thúc
              ca hoặc bàn giao trực.
            </p>
          </div>
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={`${styles.filterBtn} ${shiftFilter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setShiftFilter('all')}
            >
              Tất Cả Ca ({shifts.length})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${shiftFilter === 'active' ? styles.filterBtnActive : ''}`}
              onClick={() => setShiftFilter('active')}
            >
              🟢 Đang Trực Ca ({activeShifts.length})
            </button>
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.shiftTable}>
            <thead>
              <tr>
                <th>Nhân Viên Trực Ca</th>
                <th>Chức Vụ</th>
                <th>Giờ Vào (Check-in)</th>
                <th>Giờ Ra (Check-out)</th>
                <th>Thời Lượng Trực</th>
                <th>Tin Tư Vấn</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedShifts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Chưa có lịch sử ca trực nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                displayedShifts.map((shift) => {
                  const isActive = shift.status === 'active';
                  return (
                    <tr
                      key={shift.shift_id}
                      className={isActive ? styles.shiftTableRowActive : undefined}
                    >
                      <td>
                        <div className={styles.staffCell}>
                          <div className={styles.staffAvatarMini}>{shift.staff_avatar || '👨‍⚕️'}</div>
                          <div>
                            <div className={styles.staffNameBold}>{shift.staff_name}</div>
                            <div className={styles.staffUsernameMuted}>Mã: {shift.shift_id.split('_').slice(-1)[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>{shift.staff_role}</span>
                      </td>
                      <td>
                        <div className={styles.timeText}>
                          <span>{shift.check_in_time.split(' ')[1]}</span>
                          <span className={styles.timeSub}>{shift.check_in_time.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td>
                        {shift.check_out_time ? (
                          <div className={styles.timeText}>
                            <span>{shift.check_out_time.split(' ')[1]}</span>
                            <span className={styles.timeSub}>{shift.check_out_time.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                            🟢 Đang trong ca
                          </span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: isActive ? '#15803d' : '#1e293b' }}>
                          {shift.duration_text}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            background: shift.replies_count > 0 ? '#e0f2fe' : '#f1f5f9',
                            color: shift.replies_count > 0 ? '#0369a1' : '#64748b',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                          }}
                        >
                          💬 {shift.replies_count} tin
                        </span>
                      </td>
                      <td>
                        {isActive ? (
                          <span className={styles.badgeActive}>
                            <span>●</span>
                            <span>Đang Trực Ca</span>
                          </span>
                        ) : (
                          <span className={styles.badgeDone}>
                            <span>✓</span>
                            <span>Đã Kết Thúc</span>
                          </span>
                        )}
                      </td>
                      <td>
                        {isActive ? (
                          <button
                            type="button"
                            className={styles.btnForceEnd}
                            onClick={() => handleForceEndShift(shift.shift_id, shift.staff_name)}
                            title="Kết thúc ca trực ngay lập tức nếu nhân viên quên đăng xuất"
                          >
                            🛑 Kết thúc ca
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>— Hoàn tất —</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ──── KHỐI 2: QUẢN LÝ 3 TÀI KHOẢN NHÂN VIÊN (STAFF ACCOUNTS) ──── */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <span>👥 Danh Sách Tài Khoản Nhân Viên Trực Page ({staffMembersOnly.length})</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Chủ cửa hàng có thể thêm mới, đổi chức danh, đặt lại mật khẩu hoặc phân công nhiệm vụ cho
              từng nhân viên.
            </p>
          </div>
          <button type="button" className={styles.btnPrimary} onClick={handleOpenCreateModal}>
            <span>➕</span>
            <span>Thêm Nhân Viên</span>
          </button>
        </div>

        <div className={styles.staffGrid}>
          {staffMembersOnly.map((staff) => (
            <div key={staff.id} className={styles.staffAccountCard}>
              <div className={styles.staffAccountHeader}>
                <div className={styles.avatarLarge}>{staff.avatar || '👨‍⚕️'}</div>
                <div className={styles.staffDetails}>
                  <h3 className={styles.staffDisplayName}>{staff.display_name}</h3>
                  <p className={styles.staffFullTitle}>{staff.full_title}</p>
                </div>
              </div>

              <div className={styles.staffMetaRow}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Tên đăng nhập:</span>
                  <span className={styles.metaValue}>@{staff.username}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Số điện thoại:</span>
                  <span className={styles.metaValue}>{staff.phone || 'Chưa cung cấp'}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Trạng thái:</span>
                  <span className={styles.metaValue} style={{ color: '#166534' }}>
                    ● Đang hoạt động
                  </span>
                </div>
              </div>

              <div className={styles.staffCardActions}>
                <button
                  type="button"
                  className={styles.btnEdit}
                  onClick={() => handleOpenEditModal(staff)}
                >
                  <span>✏️</span>
                  <span>Chỉnh sửa / Đổi mật khẩu</span>
                </button>
                <button
                  type="button"
                  className={styles.btnDelete}
                  onClick={() => handleDeleteStaff(staff.id, staff.display_name)}
                  title="Xóa tài khoản nhân viên này"
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──── MODAL THÊM / SỬA NHÂN VIÊN ──── */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingStaffId ? '✏️ Chỉnh Sửa Tài Khoản Nhân Viên' : '➕ Tạo Tài Khoản Nhân Viên Mới'}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStaff}>
              <div className={styles.modalBody}>
                {formError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                    }}
                  >
                    ⚠️ {formError}
                  </div>
                )}

                {/* Chọn Avatar */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Biểu Tượng Đại Diện:</label>
                  <div className={styles.avatarPicker}>
                    {AVATAR_PRESETS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        className={`${styles.avatarOption} ${formData.avatar === av ? styles.avatarOptionSelected : ''}`}
                        onClick={() => setFormData({ ...formData, avatar: av })}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Họ tên */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Họ và Tên Nhân Viên:</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="VD: Bác sĩ Đức, Dược sĩ Mai, KTV Hoàng..."
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    required
                  />
                </div>

                {/* Chức danh đầy đủ */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Chức Danh Hiển Thị Khách Hàng:</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="VD: Bác sĩ YHCT — Tư vấn phác đồ và trải nghiệm 0Đ"
                    value={formData.full_title}
                    onChange={(e) => setFormData({ ...formData, full_title: e.target.value })}
                  />
                </div>

                {/* SĐT */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số Điện Thoại Nội Bộ:</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="VD: 0905111222"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Tên đăng nhập */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên Đăng Nhập (Username):</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="VD: admin_duc, admin_mai..."
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!!editingStaffId} // Không cho sửa username khi edit
                    required
                  />
                </div>

                {/* Mật khẩu */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {editingStaffId ? 'Mật Khẩu Mới (Bỏ trống nếu giữ nguyên):' : 'Mật Khẩu Khởi Tạo:'}
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={editingStaffId ? 'Nhập mật khẩu mới nếu muốn đổi...' : 'VD: sauna@123'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingStaffId}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className={styles.btnSave} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : editingStaffId ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
