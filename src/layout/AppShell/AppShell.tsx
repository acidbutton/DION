import { Outlet } from 'react-router-dom';
import { AppRail } from '../AppRail/AppRail';
import styles from './AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <AppRail />
      <div className={styles.workspace}>
        <Outlet />
      </div>
    </div>
  );
}
