import Link from 'next/link';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'outlineLight' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: never;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Button — Component nút bấm đa dạng.
 * Min touch target 48px cho người lớn tuổi.
 * Tự động render <Link> nếu có href, <button> nếu không.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render as Link if href is provided
  if ('href' in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLink;

    // External link
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return (
        <a href={href} className={classNames} {...linkProps}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </a>
      );
    }

    // Internal link
    return (
      <Link href={href} className={classNames} {...linkProps}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </Link>
    );
  }

  // Render as button
  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classNames} {...buttonProps}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
