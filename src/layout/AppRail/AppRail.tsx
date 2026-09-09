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
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M4 9L14 3.5L24 9V11.5L14 6L6.5 10.3V17.7L14 22L21.5 17.7V13.5L24 12V19L14 24.5L4 19V9Z" fill="#171821" />
              <path d="M14 10.5L19 13.3V19L14 21.8L9 19V13.3L14 10.5Z" fill="#171821" />
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
