import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className, id, ...rest }: CheckboxProps) {
  return (
    <label className={[styles.wrapper, className ?? ''].filter(Boolean).join(' ')} htmlFor={id}>
      <span className={styles.box}>
        <input type="checkbox" id={id} className={styles.input} {...rest} />
        <Check size={14} strokeWidth={3} className={styles.check} aria-hidden />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
