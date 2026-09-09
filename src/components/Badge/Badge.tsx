import styles from './Badge.module.css';

export interface BadgeProps {
  count: number;
  max?: number;
  tone?: 'brand' | 'neutral';
}

export function Badge({ count, max = 99, tone = 'brand' }: BadgeProps) {
  if (count <= 0) return null;
  const label = count > max ? `${max}+` : String(count);

  return <span className={[styles.badge, styles[tone]].join(' ')}>{label}</span>;
}
