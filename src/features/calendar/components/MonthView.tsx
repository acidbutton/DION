import type { CSSProperties } from 'react';
import { CALENDARS } from '../data/calendars';
import type { CalendarEvent } from '../types';
import { formatTime, getMonthGrid, isSameDay } from '../utils/date';
import styles from './MonthView.module.css';

export interface MonthViewProps {
  displayMonth: Date;
  events: CalendarEvent[];
  onOpenEvent: (event: CalendarEvent) => void;
  onCreateAt: (date: Date) => void;
  onOpenDay: (date: Date) => void;
}

const MAX_VISIBLE_PER_DAY = 3;

function calendarColor(calendarId: string): string {
  return CALENDARS.find((calendar) => calendar.id === calendarId)?.color ?? '#0062ff';
}

export function MonthView({ displayMonth, events, onOpenEvent, onCreateAt, onOpenDay }: MonthViewProps) {
  const grid = getMonthGrid(displayMonth);
  const today = new Date();

  return (
    <div className={styles.grid}>
      {grid.map((date) => {
        const dayEvents = events
          .filter((event) => isSameDay(event.start, date))
          .sort((a, b) => (a.allDay === b.allDay ? a.start.getTime() - b.start.getTime() : a.allDay ? -1 : 1));
        const visible = dayEvents.slice(0, MAX_VISIBLE_PER_DAY);
        const overflow = dayEvents.length - visible.length;
        const inMonth = date.getMonth() === displayMonth.getMonth();
        const isToday = isSameDay(date, today);

        return (
          <div
            key={date.toISOString()}
            className={[styles.cell, inMonth ? '' : styles.outside].filter(Boolean).join(' ')}
            onDoubleClick={() => onCreateAt(date)}
          >
            <button
              type="button"
              className={[styles.dayNumber, isToday ? styles.today : ''].filter(Boolean).join(' ')}
              onClick={() => onOpenDay(date)}
            >
              {date.getDate()}
            </button>
            <div className={styles.events}>
              {visible.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className={styles.eventChip}
                  style={{ '--chip-color': calendarColor(event.calendarId) } as CSSProperties}
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onOpenEvent(event);
                  }}
                >
                  {!event.allDay && <span className={styles.eventTime}>{formatTime(event.start)}</span>}
                  <span className={styles.eventTitle}>{event.title}</span>
                </button>
              ))}
              {overflow > 0 && (
                <button type="button" className={styles.overflow} onClick={() => onOpenDay(date)}>
                  ещё {overflow}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
