'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingCTA } from './FloatingCTA';
import { TawkChat } from './TawkChat';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/admin') || pathname?.startsWith('/nhanvien');

  if (isPortal) {
    // Không hiển thị Header, Footer, FloatingCTA của khách trên cổng nghiệp vụ /admin và /nhanvien
    return <div id="portal-root" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>{children}</div>;
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <FloatingCTA />
      <TawkChat />
    </>
  );
}
