import type { Metadata } from 'next';
import { Button } from '@/fe/components/ui/Button';
import { COMPARISON_TABLE } from '@/fe/data/products';
import styles from '../product.module.css';

export const metadata: Metadata = {
  title: 'So Sánh Mua vs Thuê — Sauna Alpaca',
  description:
    'So sánh chi tiết giữa mua và thuê máy xông hơi hồng ngoại xa Sauna Alpaca. Chọn mô hình phù hợp nhất cho bạn.',
};

export default function ComparePage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1 className={styles.pageTitle}>So sánh Mua vs Thuê</h1>
          <p className={styles.pageSubtitle}>
            Phân tích chi tiết hai mô hình để bạn dễ dàng lựa chọn
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.comparisonWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  {COMPARISON_TABLE.headers.map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" href="/san-pham/mua">
              Tìm hiểu Mua →
            </Button>
            <Button variant="accent" size="lg" href="/san-pham/thue">
              Tìm hiểu Thuê →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
