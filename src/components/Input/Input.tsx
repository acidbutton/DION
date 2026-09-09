import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
}

export function Input({ leadingIcon, trailingSlot, className, ...rest }: InputProps) {
  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
      <input className={styles.input} {...rest} />
      {trailingSlot}
    </div>
  );
}
