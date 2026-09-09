import { CaretLeft as ChevronLeft, CaretRight as ChevronRight } from '@phosphor-icons/react';
import { IconButton } from '../../../components';
import { addMonths, formatMonthYear, getMonthGrid, isSameDay } from '../utils/date';
import styles from './MiniMonth.module.css';

export interface MiniMonthProps {
  displayMonth: Date;
  selectedDate: Date;
  onDisplayMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
}

const WEEKDAY_INITIALS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];

export function MiniMonth({ displayMonth, selectedDate, onDisplayMonthChange, onSelectDate }: MiniMonthProps) {
  const today = new Date();
  const grid = getMonthGrid(displayMonth);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{formatMonthYear(displayMonth)}</span>
        <div className={styles.nav}>
          <IconButton
            size="xs"
            icon={<ChevronLeft size={14} />}
            aria-label="Предыдущий месяц"
            onClick={() => onDisplayMonthChange(addMonths(displayMonth, -1))}
          />
          <IconButton
            size="xs"
            icon={<ChevronRight size={14} />}
            aria-label="Следующий месяц"
            onClick={() => onDisplayMonthChange(addMonths(displayMonth, 1))}
          />
        </div>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAY_INITIALS.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {grid.map((date) => {
          const inMonth = date.getMonth() === displayMonth.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const classes = [
            styles.day,
            inMonth ? '' : styles.outside,
            isToday ? styles.today : '',
            isSelected ? styles.selected : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button key={date.toISOString()} type="button" className={classes} onClick={() => onSelectDate(date)}>
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
