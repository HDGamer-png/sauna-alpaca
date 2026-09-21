'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, CONTACT_INFO, SITE_CONFIG } from '@/shared/lib/constants';
import { OrderTrackingModal } from './OrderTrackingModal';
import { AIChatModal } from './AIChatModal';
import { CustomerAuthModal, CustomerProfile } from './CustomerAuthModal';
import styles from './Header.module.css';

/**
 * Header — Navigation chính
 * Sticky, glassmorphism, responsive mobile menu.
 * Touch-friendly cho người lớn tuổi.
 */
export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  const toggleSubMenu = (href: string) => {
    setExpandedMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 200);
  };

  // Dọn dẹp timeout khi unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Đóng dropdown tài khoản khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Đồng bộ trạng thái đăng nhập của khách từ localStorage và lắng nghe sự kiện
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sauna_alpaca_customer');
      if (saved) {
        setCustomer(JSON.parse(saved));
      }
    } catch {
      setCustomer(null);
    }

    const handleCustomerChange = (e: Event) => {
      const customEvent = e as CustomEvent<CustomerProfile | null>;
      setCustomer(customEvent.detail);
    };

    const handleOpenAuth = () => {
      setIsAuthOpen(true);
    };

    window.addEventListener('sauna_customer_changed', handleCustomerChange);
    window.addEventListener('open-customer-auth', handleOpenAuth);

    return () => {
      window.removeEventListener('sauna_customer_changed', handleCustomerChange);
      window.removeEventListener('open-customer-auth', handleOpenAuth);
    };
  }, []);

  // Tự động bỏ focus khi chuyển trang để đóng menu sổ xuống
  useEffect(() => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);

  return (
    <>
      <header className={styles.header} id="header">
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} onClick={closeMobile} aria-label="Trang chủ">
          <div className={styles.logoIcon}>🌿</div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>{SITE_CONFIG.name}</span>
            <span className={styles.logoTagline}>Máy xông hơi hồng ngoại xa</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav} aria-label="Menu chính">
          {NAV_LINKS.map((link) =>
            'children' in link ? (
              <div key={link.href} className={styles.navDropdown}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${styles.dropdownTrigger} ${
                    pathname.startsWith(link.href) ? styles.navLinkActive : ''
                  }`}
                  onClick={(e) => {
                    (e.currentTarget as HTMLElement).blur();
                  }}
                >
                  {link.label}
                  <span className={styles.dropdownArrow}>▼</span>
                </Link>
                <div className={styles.dropdownMenu}>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={styles.dropdownLink}
                      onClick={(e) => {
                        (e.currentTarget as HTMLElement).blur();
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  pathname === link.href ? styles.navLinkActive : ''
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop CTA */}
        <div className={styles.headerCta}>
          {/* Hotline SĐT */}
          <a
            href={`tel:${CONTACT_INFO.phoneClean}`}
            className={styles.ctaPhone}
            aria-label={`Gọi ngay ${CONTACT_INFO.phone}`}
          >
            <span className={styles.ctaPhoneIcon}>📞</span>
            <span className={styles.ctaPhoneText}>{CONTACT_INFO.phone}</span>
          </a>

          {/* Menu Dropdown Tài Khoản / Đăng nhập của Khách (đặt sau SĐT, không viền) */}
          <div
            className={styles.userDropdownWrapper}
            ref={userDropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={customer ? styles.ctaCustomerLoggedInBtn : styles.ctaCustomerBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
                setIsUserDropdownOpen((prev) => !prev);
              }}
              aria-label={customer ? `Tài khoản: ${customer.name || customer.phone}` : 'Đăng nhập'}
              aria-expanded={isUserDropdownOpen}
            >
              <span className={styles.ctaCustomerIcon}>{customer ? '🌿' : '👤'}</span>
              <span className={styles.ctaCustomerText}>
                {customer ? (customer.name && customer.name !== 'Quý khách' ? customer.name : customer.phone) : 'Đăng nhập'}
              </span>
              <span className={`${styles.userDropdownArrow} ${isUserDropdownOpen ? styles.userDropdownArrowOpen : ''}`}>
                ▼
              </span>
            </button>

            {/* Menu Dropdown */}
            <div className={`${styles.userDropdownMenu} ${isUserDropdownOpen ? styles.userDropdownMenuOpen : ''}`}>
              {customer ? (
                <>
                  <div className={styles.userDropdownHeader}>
                    <div className={styles.userDropdownAvatar}>🌿</div>
                    <div className={styles.userDropdownInfo}>
                      <div className={styles.userDropdownName}>{customer.name || 'Quý khách'}</div>
                      <div className={styles.userDropdownPhone}>{customer.phone}</div>
                    </div>
                  </div>

                  <div className={styles.userDropdownDivider} />

                  <div className={styles.userDropdownActions}>
                    <button
                      type="button"
                      className={styles.userDropdownItem}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                        setIsUserDropdownOpen(false);
                        setIsOrderTrackingOpen(true);
                      }}
                    >
                      <span className={styles.userDropdownItemIcon}>📦</span>
                      <div className={styles.userDropdownItemContent}>
                        <span className={styles.userDropdownItemTitle}>Đơn hàng của tôi</span>
                        <span className={styles.userDropdownItemSub}>Theo dõi tiến độ đơn hàng</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={styles.userDropdownItem}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                        setIsUserDropdownOpen(false);
                        setIsChatOpen(true);
                      }}
                    >
                      <span className={styles.userDropdownItemIcon}>💬</span>
                      <div className={styles.userDropdownItemContent}>
                        <span className={styles.userDropdownItemTitle}>Hỗ trợ & Tư vấn YHCT</span>
                        <span className={styles.userDropdownItemSub}>Chat cùng chuyên viên bác sĩ</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={styles.userDropdownItem}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                        setIsUserDropdownOpen(false);
                        setIsAuthOpen(true);
                      }}
                    >
                      <span className={styles.userDropdownItemIcon}>🔄</span>
                      <div className={styles.userDropdownItemContent}>
                        <span className={styles.userDropdownItemTitle}>Cập nhật thông tin</span>
                        <span className={styles.userDropdownItemSub}>Đổi SĐT & nhu cầu trị liệu</span>
                      </div>
                    </button>

                    <div className={styles.userDropdownDivider} />

                    <button
                      type="button"
                      className={`${styles.userDropdownItem} ${styles.userDropdownItemLogout}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                        try {
                          localStorage.removeItem('sauna_alpaca_customer');
                        } catch {}
                        setCustomer(null);
                        setIsUserDropdownOpen(false);
                        window.dispatchEvent(new CustomEvent('sauna_customer_changed', { detail: null }));
                      }}
                    >
                      <span className={styles.userDropdownItemIcon}>🚪</span>
                      <div className={styles.userDropdownItemContent}>
                        <span className={styles.userDropdownItemTitle}>Đăng xuất</span>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                /* Menu khi Khách chưa đăng nhập */
                <div className={styles.userDropdownActions}>
                  <button
                    type="button"
                    className={styles.userDropdownItem}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                      setIsUserDropdownOpen(false);
                      setIsAuthOpen(true);
                    }}
                  >
                    <span className={styles.userDropdownItemIcon}>👤</span>
                    <div className={styles.userDropdownItemContent}>
                      <span className={styles.userDropdownItemTitle}>Đăng nhập nhận tư vấn</span>
                      <span className={styles.userDropdownItemSub}>Đăng ký hỗ trợ tận nhà</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={styles.userDropdownItem}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                      setIsUserDropdownOpen(false);
                      setIsOrderTrackingOpen(true);
                    }}
                  >
                    <span className={styles.userDropdownItemIcon}>📦</span>
                    <div className={styles.userDropdownItemContent}>
                      <span className={styles.userDropdownItemTitle}>Tra cứu đơn hàng</span>
                      <span className={styles.userDropdownItemSub}>Xem tiến độ giao buồng xông</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`${styles.menuToggle} ${isMobileOpen ? styles.menuToggleOpen : ''}`}
          onClick={toggleMobile}
          aria-label={isMobileOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMobileOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Backdrop làm mờ nội dung trang web */}
      <div
        className={`${styles.mobileBackdrop} ${isMobileOpen ? styles.mobileBackdropActive : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile Nav Drawer trượt từ phải sang với độ rộng 25% */}
      <nav
        className={`${styles.mobileNav} ${isMobileOpen ? styles.mobileNavOpen : ''}`}
        aria-label="Menu di động"
      >
        <div className={styles.mobileNavList}>
          {NAV_LINKS.map((link) => {
            const hasChildren = 'children' in link && link.children && link.children.length > 0;
            const isExpanded = !!expandedMenus[link.href];
            const isParentActive = pathname.startsWith(link.href);

            return (
              <div key={link.href} className={styles.mobileNavGroup}>
                {hasChildren ? (
                  <button
                    type="button"
                    className={`${styles.mobileNavToggleBtn} ${
                      isParentActive ? styles.mobileNavToggleBtnActive : ''
                    }`}
                    onClick={() => toggleSubMenu(link.href)}
                    aria-expanded={isExpanded}
                  >
                    <span>{link.label}</span>
                    <span
                      className={`${styles.mobileNavArrow} ${
                        isExpanded ? styles.mobileNavArrowExpanded : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`${styles.mobileNavLink} ${
                      pathname === link.href ? styles.mobileNavLinkActive : ''
                    }`}
                    onClick={closeMobile}
                  >
                    {link.label}
                  </Link>
                )}

                {hasChildren && isExpanded && (
                  <div className={styles.mobileSubNav}>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`${styles.mobileSubNavLink} ${
                          pathname === child.href ? styles.mobileSubNavLinkActive : ''
                        }`}
                        onClick={closeMobile}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.mobileNavCtaWrapper}>
          <a
            href={`tel:${CONTACT_INFO.phoneClean}`}
            className={styles.mobileCtaPhone}
            onClick={closeMobile}
            title={`Gọi ngay ${CONTACT_INFO.phone}`}
          >
            <span className={styles.mobileCtaIcon}>📞</span>
            <span className={styles.mobileCtaText}>Hotline: {CONTACT_INFO.phone}</span>
          </a>

          {customer ? (
            <div className={styles.mobileCustomerCard}>
              <div className={styles.mobileCustomerHeader}>
                <span className={styles.mobileCustomerAvatar}>🌿</span>
                <div className={styles.mobileCustomerInfo}>
                  <strong>{customer.name || 'Quý khách'}</strong>
                  <span>{customer.phone}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.mobileCustomerActionBtn}
                onClick={() => {
                  closeMobile();
                  setIsOrderTrackingOpen(true);
                }}
              >
                <span>📦</span>
                <span>Đơn hàng của tôi</span>
              </button>
              <button
                type="button"
                className={styles.mobileCustomerActionBtn}
                onClick={() => {
                  closeMobile();
                  setIsChatOpen(true);
                }}
              >
                <span>💬</span>
                <span>Tư vấn YHCT</span>
              </button>
              <button
                type="button"
                className={styles.mobileCustomerLogoutBtn}
                onClick={() => {
                  try {
                    localStorage.removeItem('sauna_alpaca_customer');
                  } catch {}
                  setCustomer(null);
                  closeMobile();
                  window.dispatchEvent(new CustomEvent('sauna_customer_changed', { detail: null }));
                }}
              >
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className={styles.mobileGuestActions}>
              <button
                type="button"
                className={styles.mobileCtaAuth}
                onClick={() => {
                  closeMobile();
                  setIsAuthOpen(true);
                }}
              >
                <span className={styles.mobileCtaIcon}>👤</span>
                <span className={styles.mobileCtaText}>Đăng nhập</span>
              </button>
              <button
                type="button"
                className={styles.mobileCtaGuestOrder}
                onClick={() => {
                  closeMobile();
                  setIsOrderTrackingOpen(true);
                }}
              >
                <span className={styles.mobileCtaIcon}>📦</span>
                <span className={styles.mobileCtaText}>Tra cứu đơn hàng</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>

    {/* Modal Tra Cứu & Theo Dõi Đơn Hàng cho Khách */}
    <OrderTrackingModal
      isOpen={isOrderTrackingOpen}
      onClose={() => setIsOrderTrackingOpen(false)}
      onOpenChat={() => setIsChatOpen(true)}
    />

    {/* Modal Đăng Nhập / Tiếp Nhận SĐT (Mẫu 2 Split-Card) */}
    <CustomerAuthModal
      isOpen={isAuthOpen}
      onClose={() => setIsAuthOpen(false)}
      onOpenChat={() => setIsChatOpen(true)}
      onOpenOrders={() => setIsOrderTrackingOpen(true)}
      onSuccess={(cust) => setCustomer(cust)}
    />

    {/* Cửa sổ Chat Trợ Lý AI khi khách bấm hỏi từ modal đơn hàng */}
    <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
  </>
);
}
