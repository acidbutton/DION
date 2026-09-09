import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './NavigationItem.module.css';

export interface NavigationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  indent?: 0 | 1 | 2;
  trailing?: ReactNode;
}

export function NavigationItem({
  icon,
  label,
  active = false,
  indent = 0,
  trailing,
  className,
  ...rest
}: NavigationItemProps) {
  const classes = [styles.item, active ? styles.active : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={indent ? { paddingLeft: 8 + indent * 16 } : undefined}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {trailing}
    </button>
  );
}
