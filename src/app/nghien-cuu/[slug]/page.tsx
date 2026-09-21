import { notFound } from 'next/navigation';
import { Card } from '@/fe/components/ui/Card';
import { Button } from '@/fe/components/ui/Button';
import { RESEARCH_DATA } from '@/fe/data/research';
import { MEDICAL_DISCLAIMER } from '@/shared/lib/constants';
import styles from '../../content.module.css';
import pStyles from '../../san-pham/product.module.css';

export function generateStaticParams() {
  return RESEARCH_DATA.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = RESEARCH_DATA.find((a) => a.slug === params.slug);
  if (!article) return { title: 'Không tìm thấy' };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function ResearchDetailPage({ params }: { params: { slug: string } }) {
  const article = RESEARCH_DATA.find((a) => a.slug === params.slug);
  if (!article) notFound();

  return (
    <>
      <div className={pStyles.pageHeader}>
        <div className="container">
          <h1 className={pStyles.pageTitle}>{article.title}</h1>
          <p className={pStyles.pageSubtitle}>
            {article.source} — {article.publishedDate}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container container--narrow">
          <Card variant="elevated" padding="spacious">
            <div
              style={{ lineHeight: 1.8, fontSize: 'var(--fs-body)' }}
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/## /g, '<h2 style="margin-top:2rem;margin-bottom:0.5rem;color:var(--color-primary-dark)">')
                  .replace(/### /g, '<h3 style="margin-top:1.5rem;margin-bottom:0.5rem">')
                  .replace(/\n- \*\*/g, '\n<li><strong>')
                  .replace(/\*\*\./g, '</strong>.')
                  .replace(/\*\*/g, '</strong>')
                  .replace(/> \*\*/g, '<blockquote style="border-left:3px solid var(--color-trust);padding:1rem;margin:1.5rem 0;background:var(--color-trust-50);border-radius:0 8px 8px 0"><strong>')
                  .replace(/\n\n/g, '</p><p style="margin-bottom:1rem">')
              }}
            />
          </Card>

          <div className={styles.disclaimer}>
            <p>⚕️ {MEDICAL_DISCLAIMER}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <Button variant="outline" href="/nghien-cuu">
              ← Xem tất cả nghiên cứu
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
