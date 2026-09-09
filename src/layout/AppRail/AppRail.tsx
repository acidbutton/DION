import { NavLink } from 'react-router-dom';
import { Avatar } from '../../components';
import { railItems } from './railConfig';
import styles from './AppRail.module.css';

const CURRENT_USER = 'Василий Краснопёрекопский';

export function AppRail() {
  return (
    <nav className={styles.rail} aria-label="Основная навигация">
      <div className={styles.top}>
        <div className={styles.logo} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#0062FF" />
            <path d="M6 8L12 5L18 8V16L12 19L6 16V8Z" stroke="#FAFCFF" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
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
