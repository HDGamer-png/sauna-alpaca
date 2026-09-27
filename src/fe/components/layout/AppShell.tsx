'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingCTA } from './FloatingCTA';
import { TawkChat } from './TawkChat';
import { ScrollElevationEffect } from './ScrollElevationEffect';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/admin') || pathname?.startsWith('/nhanvien');

  // Khi chuyển route (ví dụ từ trang con về trang chủ), luôn cuộn lên đầu trang
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  // Tự động cuộn lên đầu trang khi tải lại trang (Refresh/Reload) hoặc click vào Logo/Trang chủ
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Tắt tính năng tự động ghi nhớ vị trí cuộn cũ của trình duyệt để luôn bắt đầu từ đầu trang
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Cuộn lên đầu trang ngay lập tức khi tải lại trang
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Đảm bảo cuộn lên đầu cả khi trình duyệt vừa load xong nội dung
    const handleLoad = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('load', handleLoad);

    // Trước khi reload / unload, bảo đảm scrollRestoration là manual
    const handleBeforeUnload = () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 2. Bắt sự kiện click vào bất kỳ Logo hoặc liên kết "Trang chủ" nào trên toàn trang
    const handleGlobalHomeOrLogoClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href === '/' || href === '') {
          if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalHomeOrLogoClick);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleGlobalHomeOrLogoClick);
    };
  }, []);

  if (isPortal) {
    // Không hiển thị Header, Footer, FloatingCTA của khách trên cổng nghiệp vụ /admin và /nhanvien
    return (
      <div
        id="portal-root"
        style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingCTA />
      <TawkChat />
      <ScrollElevationEffect />
    </>
  );
}
