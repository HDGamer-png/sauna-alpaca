'use client';

import { useEffect, useRef } from 'react';
import './ScrollElevationEffect.module.css';

/**
 * ScrollElevationEffect
 * Hiệu ứng lật bài không gian 3D (25 độ) mượt mà 2 chiều khi cuộn trang (lướt lên & lướt xuống).
 * Không hiển thị giao diện thừa (No UI, No Floating Buttons, No Overlays).
 * Giữ nguyên 100% bố cục, màu sắc và nội dung gốc của trang web.
 */
export function ScrollElevationEffect() {
  const lastScrollYRef = useRef<number>(0);
  const scrollDirectionRef = useRef<'down' | 'up'>('down');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 1. Theo dõi hướng cuộn: lướt xuống hay lướt lên
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollYRef.current) {
        scrollDirectionRef.current = 'down';
      } else if (currentY < lastScrollYRef.current) {
        scrollDirectionRef.current = 'up';
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 2. Tìm toàn bộ các khối thẻ nguyên vẹn & khối tiêu đề
    // Tuyệt đối không chọn các phần tử con bên trong thẻ
    const candidateSelectors = [
      '.section__title',
      '.section__subtitle',
      '[class*="heroBadge"]',
      '[class*="heroTitle"]',
      '[class*="heroDescription"]',
      '[class*="heroDemoWrapper"]',
      '[class*="heroCtas"]',
      '[class*="heroTrust"]',
      // Chỉ lấy thẻ cha nguyên khối
      '[class*="benefitsGrid"] > *',
      '[class*="productGrid"] > *',
      '[class*="processGrid"] > *',
      '[class*="testimonialGrid"] > *',
      '[class*="researchVisual"]',
      '[class*="researchItem"]',
      '[class*="galleryOverviewWrapper"]',
      'main .card',
      '[class*="faqItem"]',
      '[class*="ctaTitle"]',
      '[class*="ctaDescription"]',
      '[class*="ctaButtons"]',
    ];

    const rawElements: HTMLElement[] = [];
    candidateSelectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        if (el.closest('header') || el.closest('nav')) return;
        if (!rawElements.includes(el)) {
          rawElements.push(el);
        }
      });
    });

    // LỌC CHẶT CHẼ: Bỏ qua mọi phần tử con nằm trong một thẻ khác đã được chọn
    const elements = rawElements.filter((el) => {
      const hasAncestorInList = rawElements.some((other) => other !== el && other.contains(el));
      const parentCard = el.parentElement?.closest('.card');
      if (hasAncestorInList || parentCard) return false;
      return true;
    });

    // 3. Gán class nhận diện và độ trễ so le (Stagger)
    elements.forEach((el) => {
      el.classList.add('sauna-float-item');

      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(el);
        if (index >= 0) {
          el.classList.add(`sauna-stagger-${(index % 5) + 1}`);
        }
      }
    });

    // 4. IntersectionObserver bắt chuyển động 2 chiều (Lướt lên & Lướt xuống)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const rect = target.getBoundingClientRect();
          const isScrollingDown = scrollDirectionRef.current === 'down';

          if (entry.isIntersecting) {
            // Khi phần tử lướt vào tầm mắt
            if (isScrollingDown) {
              target.classList.remove('sauna-from-top');
            } else {
              target.classList.add('sauna-from-top');
            }
            target.classList.add('sauna-in-view');
          } else {
            // Khi ra ngoài tầm nhìn (cả trên và dưới), reset để khi cuộn ngược lại thì hiệu ứng tiếp tục lật nổi lên mượt mà!
            if (rect.top > window.innerHeight + 40 || rect.bottom < -40) {
              target.classList.remove('sauna-in-view');
            }
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '20px 0px -20px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    // 5. Kích hoạt ngay lập tức cho các phần tử đang nằm trong màn hình ban đầu
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('sauna-in-view');
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      elements.forEach((el) => {
        el.classList.remove('sauna-float-item', 'sauna-in-view', 'sauna-from-top');
      });
    };
  }, []);

  // Không hiển thị bất kỳ nút bấm hay giao diện thừa nào
  return null;
}
