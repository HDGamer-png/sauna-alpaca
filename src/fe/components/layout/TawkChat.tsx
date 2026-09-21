'use client';

import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Widget
 * Widget miễn phí 100%, không giới hạn.
 *
 * Để sử dụng:
 * 1. Đăng ký tại https://www.tawk.to
 * 2. Tạo Property → lấy Property ID và Widget ID
 * 3. Thêm vào .env.local:
 *    NEXT_PUBLIC_TAWK_PROPERTY_ID=xxxx
 *    NEXT_PUBLIC_TAWK_WIDGET_ID=default
 */

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || 'default';

  useEffect(() => {
    // Không load nếu chưa cấu hình
    if (!propertyId) {
      console.log('💬 [Tawk.to] Chưa cấu hình NEXT_PUBLIC_TAWK_PROPERTY_ID. Bỏ qua.');
      return;
    }

    // Tránh load trùng
    if (document.getElementById('tawk-script')) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Cấu hình ngôn ngữ tiếng Việt
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: { position: 'br', xOffset: 20, yOffset: 80 },
        mobile: { position: 'br', xOffset: 10, yOffset: 70 },
      },
    };

    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const el = document.getElementById('tawk-script');
      if (el) el.remove();
    };
  }, [propertyId, widgetId]);

  // Không render gì — Tawk.to tự tạo widget
  return null;
}
