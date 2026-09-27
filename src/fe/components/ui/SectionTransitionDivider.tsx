import React from 'react';
import styles from './SectionTransitionDivider.module.css';

interface SectionTransitionDividerProps {
  id?: string;
  fillColor?: string;
  variant?: 'dark-to-dark' | 'green-to-dark' | 'dark-to-cream' | 'cream-to-green';
}

/**
 * Hiệu ứng chuyển cảnh background chính thức: Hào Quang Tia Nhiệt FIR (Far Infrared Amber Beam & Heat Aura)
 * Tỏa ánh sáng vàng hổ phách và nhịp thở nhiệt sinh học 1200K ấm áp giữa các tầng nội dung.
 */
export function SectionTransitionDivider({ id }: SectionTransitionDividerProps) {
  return (
    <div className={styles.seamContainer} data-divider-id={id} aria-hidden="true">
      <div className={styles.infraredAura} />
      <div className={styles.infraredBeam} />
    </div>
  );
}
