import type { CSSProperties } from 'react';
import { CALENDARS } from '../data/calendars';
import type { CalendarEvent } from '../types';
import { formatTime, formatWeekdayShort, isSameDay } from '../utils/date';
import { layoutDayEvents } from '../utils/layout';
import styles from './WeekView.module.css';

export interface WeekViewProps {
  days: Date[];
  events: CalendarEvent[];
  onOpenEvent: (event: CalendarEvent) => void;
  onCreateAt: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_HEIGHT = 48;

function calendarColor(calendarId: string): string {
  return CALENDARS.find((calendar) => calendar.id === calendarId)?.color ?? '#0062ff';
}

export function WeekView({ days, events, onOpenEvent, onCreateAt }: WeekViewProps) {
  const today = new Date();
  const allDayEvents = events.filter((event) => event.allDay);
  const timedEvents = events.filter((event) => !event.allDay);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow} style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
        <div className={styles.headerGutter} />
        {days.map((day) => (
          <div key={day.toISOString()} className={styles.headerCell}>
            <span className={styles.headerWeekday}>{formatWeekdayShort(day)}</span>
            <span className={[styles.headerDate, isSameDay(day, today) ? styles.headerDateToday : ''].join(' ')}>
              {day.getDate()}
            </span>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className={styles.allDayRow} style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div className={styles.headerGutter}>весь день</div>
          {days.map((day) => (
            <div key={day.toISOString()} className={styles.allDayCell}>
              {allDayEvents
                .filter((event) => isSameDay(event.start, day))
                .map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={styles.allDayChip}
                    style={{ '--chip-color': calendarColor(event.calendarId) } as CSSProperties}
                    onClick={() => onOpenEvent(event)}
                  >
                    {event.title}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}

      <div className={styles.scrollArea}>
        <div className={styles.timeGrid} style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div className={styles.gutterColumn}>
            {HOURS.map((hour) => (
              <div key={hour} className={styles.hourLabel} style={{ height: HOUR_HEIGHT }}>
                {hour > 0 && `${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayEvents = timedEvents.filter((event) => isSameDay(event.start, day));
            const positioned = layoutDayEvents(dayEvents);
            return (
              <div key={day.toISOString()} className={styles.dayColumn} style={{ height: HOUR_HEIGHT * 24 }}>
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    className={styles.hourSlot}
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onCreateAt(slotDate);
                    }}
                  />
                ))}
                {positioned.map(({ event, column, columnCount }) => {
                  const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
                  const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
                  const top = (startMinutes / 60) * HOUR_HEIGHT;
                  const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 20);
                  const width = 100 / columnCount;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={styles.timedChip}
                      style={{
                        '--chip-color': calendarColor(event.calendarId),
                        top,
                        height,
                        left: `${column * width}%`,
                        width: `calc(${width}% - 2px)`,
                      } as CSSProperties}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onOpenEvent(event);
                      }}
                    >
                      <span className={styles.timedTitle}>{event.title}</span>
                      <span className={styles.timedTime}>{formatTime(event.start)}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
