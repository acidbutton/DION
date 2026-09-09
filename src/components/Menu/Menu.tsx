import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Menu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  selected?: boolean;
  onSelect: () => void;
}

export interface MenuProps {
  items: MenuItem[];
  onClose: () => void;
  align?: 'left' | 'right';
  /** Fixed viewport coordinates — used for right-click context menus. Overrides `align`. */
  position?: { x: number; y: number };
}

export function Menu({ items, onClose, align = 'right', position }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('contextmenu', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('contextmenu', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const style = position
    ? { position: 'fixed' as const, left: position.x, top: position.y }
    : undefined;
  const anchorClass = position ? '' : align === 'left' ? styles.left : styles.right;

  return (
    <div ref={ref} className={[styles.menu, anchorClass].filter(Boolean).join(' ')} style={style} role="menu">
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
          <span className={styles.itemLabel}>{item.label}</span>
          {item.selected && <span className={styles.checkmark} aria-hidden>✓</span>}
        </button>
      ))}
    </div>
  );
}
