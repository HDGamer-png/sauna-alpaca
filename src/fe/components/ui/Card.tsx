import styles from './Card.module.css';

type CardVariant = 'elevated' | 'outlined' | 'featured';
type CardPadding = 'compact' | 'spacious';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card — Container UI cơ bản.
 * 3 variants: elevated (shadow), outlined (border), featured (primary accent).
 */
export function Card({
  variant = 'elevated',
  padding,
  children,
  className = '',
}: CardProps) {
  const classNames = [
    styles.card,
    styles[variant],
    padding ? styles[padding] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames}>{children}</div>;
}

/* ──── Card Sub-components ──── */
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
}

export function CardIcon({ children }: { children: React.ReactNode }) {
  return <span className={styles.cardIcon}>{children}</span>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className={styles.cardTitle}>{children}</h3>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className={styles.cardDescription}>{children}</p>;
}

export function CardBadge({ children }: { children: React.ReactNode }) {
  return <span className={styles.cardBadge}>{children}</span>;
}
