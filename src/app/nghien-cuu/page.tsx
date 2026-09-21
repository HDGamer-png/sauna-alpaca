import type { Metadata } from 'next';
import { Card } from '@/fe/components/ui/Card';
import { Button } from '@/fe/components/ui/Button';
import { RESEARCH_DATA } from '@/fe/data/research';
import { MEDICAL_DISCLAIMER } from '@/shared/lib/constants';
import styles from '../content.module.css';
import pStyles from '../san-pham/product.module.css';

export const metadata: Metadata = {
  title: 'Nghiên cứu Y khoa — Hồng Ngoại Xa & Sức Khỏe',
  description:
    'Tổng hợp các nghiên cứu khoa học quốc tế về tác dụng của liệu pháp hồng ngoại xa (FIR) trong hỗ trợ sức khỏe tim mạch, giảm đau và bệnh thận.',
};

export default function ResearchPage() {
  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>Nghiên cứu y khoa</h1>
          <p className={pStyles.pageSubtitle}>
            Cơ sở khoa học vững chắc từ các nghiên cứu lâm sàng quốc tế
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className={styles.researchGrid}>
            {RESEARCH_DATA.map((article) => (
              <Card key={article.id} variant="elevated">
                <div className={styles.articleCard}>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleSource}>{article.source}</span>
                    <span className={styles.articleYear}>{article.publishedDate}</span>
                  </div>
                  <h2 className={styles.articleTitle}>{article.title}</h2>
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>
                  <Button variant="ghost" href={`/nghien-cuu/${article.slug}`}>
                    Đọc chi tiết →
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className={styles.disclaimer}>
            <p>⚕️ {MEDICAL_DISCLAIMER}</p>
          </div>
        </div>
      </section>
    </>
  );
}
