import type { ButtonHTMLAttributes } from 'react';
import styles from './TextButton.module.css';

export interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  uppercase?: boolean;
}

export function TextButton({ uppercase = true, className, children, ...rest }: TextButtonProps) {
  const classes = [styles.button, uppercase ? styles.uppercase : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
