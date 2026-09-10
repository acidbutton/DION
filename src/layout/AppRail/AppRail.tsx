import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight } from '@phosphor-icons/react';
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
              <path
                d="M7 3H17C17 3 13 7 13 12C13 17 17 21 17 21H7C7 21 11 17 11 12C11 7 7 3 7 3Z"
                fill="var(--color-common-contrast)"
              />
            </svg>
          </div>
          <button type="button" className={styles.collapseButton} aria-label="Свернуть панель" onClick={() => setCollapsed(true)}>
            <ChevronLeft size={13} />
          </button>
        </div>
        <ul className={styles.items}>
          {railItems.map(({ Icon, ...item }) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                className={({ isActive }) => [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')}
                title={item.label}
                aria-label={item.label}
              >
                {({ isActive }) => <Icon size={20} weight={isActive ? 'fill' : 'regular'} />}
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
