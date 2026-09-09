import { Plus } from '@phosphor-icons/react';
import { Button, Checkbox } from '../../../components';
import type { CalendarDef } from '../types';
import { MiniMonth } from './MiniMonth';
import styles from './CalendarNavSidebar.module.css';

export interface CalendarNavSidebarProps {
  displayMonth: Date;
  selectedDate: Date;
  onDisplayMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
  calendars: CalendarDef[];
  onToggleCalendar: (id: string) => void;
  onCreate: () => void;
}

export function CalendarNavSidebar({
  displayMonth,
  selectedDate,
  onDisplayMonthChange,
  onSelectDate,
  calendars,
  onToggleCalendar,
  onCreate,
}: CalendarNavSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={onCreate} fullWidth>
        Создать событие
      </Button>

      <MiniMonth
        displayMonth={displayMonth}
        selectedDate={selectedDate}
        onDisplayMonthChange={onDisplayMonthChange}
        onSelectDate={onSelectDate}
      />

      <div className={styles.calendarList}>
        <span className={styles.sectionTitle}>Мои календари</span>
        {calendars.map((calendar) => (
          <div key={calendar.id} className={styles.calendarRow}>
            <Checkbox checked={calendar.visible} onChange={() => onToggleCalendar(calendar.id)} />
            <span className={styles.calendarDot} style={{ backgroundColor: calendar.color }} aria-hidden />
            <span className={styles.calendarName}>{calendar.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
