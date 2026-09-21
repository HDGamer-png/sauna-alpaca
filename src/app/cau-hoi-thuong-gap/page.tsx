'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { FAQ_DATA, FAQ_CATEGORIES } from '@/fe/data/faq';
import styles from '../content.module.css';
import pStyles from '../san-pham/product.module.css';

/**
 * FAQ Page — Accordion mở/đóng, filter theo category.
 * Client component do cần useState.
 */
export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const filteredFAQ =
    activeCategory === 'Tất cả'
      ? FAQ_DATA
      : FAQ_DATA.filter((faq) => faq.category === activeCategory);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Câu hỏi thường gặp</h1>
          <p className={pStyles.pageSubtitle}>
            Giải đáp mọi thắc mắc về máy xông hơi hồng ngoại xa Sauna Alpaca
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Category filters */}
          <div className={styles.faqFilters}>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ list */}
          <div className={styles.faqList}>
            {filteredFAQ.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggle(index)}
                  aria-expanded={openIndex === index}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`${styles.faqArrow} ${openIndex === index ? styles.faqArrowOpen : ''}`}
                  >
                    ▼
                  </span>
                </button>
                {openIndex === index && (
                  <div className={styles.faqAnswer}>
                    {faq.category && <span className={styles.faqCategory}>{faq.category}</span>}
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schema Markup — JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_DATA.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}

