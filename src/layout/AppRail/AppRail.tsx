import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar } from '../../components';
import { railItems } from './railConfig';
import styles from './AppRail.module.css';

const CURRENT_USER = 'Василий Краснопёрекопский';

export function AppRail() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <nav className={styles.railCollapsed} aria-label="Основная навигация (свёрнуто)">
        <button type="button" className={styles.expandButton} aria-label="Развернуть панель" onClick={() => setCollapsed(false)}>
          <ChevronRight size={13} />
        </button>
      </nav>
    );
  }

  return (
    <nav className={styles.rail} aria-label="Основная навигация">
      <div className={styles.top}>
        <div className={styles.logoRow}>
          <div className={styles.logo} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 6.5L12 2L22 6.5V9L12 4.5L4 8.2V17L12 21L20 17V11L22 10V18L12 22.5L2 18V6.5Z" fill="#14151A" />
              <path d="M8 9.3L12 7.5L16 9.3V15L12 16.8L8 15V9.3Z" fill="#14151A" />
            </svg>
          </div>
          <button type="button" className={styles.collapseButton} aria-label="Свернуть панель" onClick={() => setCollapsed(true)}>
            <ChevronLeft size={13} />
          </button>
        </div>
        <ul className={styles.items}>
          {railItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                className={({ isActive }) => [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')}
                title={item.label}
                aria-label={item.label}
              >
                {item.icon}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.bottom}>
        <Avatar name={CURRENT_USER} size={32} />
      </div>
    </nav>
  );
}
