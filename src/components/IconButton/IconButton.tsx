import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'ghost' | 'subtle' | 'primary';
export type IconButtonSize = 'm' | 's' | 'xs';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  active?: boolean;
  'aria-label': string;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'm',
  active = false,
  className,
  ...rest
}: IconButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    active ? styles.active : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...rest}>
      {icon}
    </button>
  );
}
