import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Menu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onSelect: () => void;
}

export interface MenuProps {
  items: MenuItem[];
  onClose: () => void;
  align?: 'left' | 'right';
}

export function Menu({ items, onClose, align = 'right' }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div ref={ref} className={[styles.menu, align === 'left' ? styles.left : styles.right].join(' ')} role="menu">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          className={[styles.item, item.destructive ? styles.destructive : ''].filter(Boolean).join(' ')}
          onClick={() => {
            item.onSelect();
            onClose();
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
