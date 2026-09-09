import { useState } from 'react';
import {
  Bell,
  CalendarBlank as CalendarDays,
  CaretDown as ChevronDown,
  MapPin,
  Repeat,
  Trash as Trash2,
  Users,
} from '@phosphor-icons/react';
import { Button, Checkbox, IconButton, Menu, Modal, type MenuItem } from '../../../components';
import { CALENDARS } from '../data/calendars';
import type { EventDraft, EventRecurrence, ReminderMinutes } from '../types';
import { fromDateAndTimeInputs, toDateInputValue, toTimeInputValue } from '../utils/date';
import styles from './EventModal.module.css';

export interface EventModalProps {
  draft: EventDraft;
  isEditing: boolean;
  onClose: () => void;
  onSave: (draft: EventDraft) => void;
  onDelete?: () => void;
}

const RECURRENCE_LABELS: Record<EventRecurrence, string> = {
  none: 'Не повторяется',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

const REMINDER_LABELS: Record<ReminderMinutes, string> = {
  0: 'Без напоминания',
  5: 'За 5 минут',
  15: 'За 15 минут',
  30: 'За 30 минут',
  60: 'За 1 час',
  1440: 'За 1 день',
};

export function EventModal({ draft: initial, isEditing, onClose, onSave, onDelete }: EventModalProps) {
  const [draft, setDraft] = useState<EventDraft>(initial);
  const [touched, setTouched] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [recurrenceMenuOpen, setRecurrenceMenuOpen] = useState(false);
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false);

  const titleIsValid = draft.title.trim().length > 0;
  const rangeIsValid = draft.end.getTime() >= draft.start.getTime();
  const selectedCalendar = CALENDARS.find((calendar) => calendar.id === draft.calendarId) ?? CALENDARS[0];

  function updateDraft(patch: Partial<EventDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    setTouched(true);
    if (!titleIsValid || !rangeIsValid) return;
    onSave(draft);
  }

  function handleStartDateChange(value: string) {
    const start = fromDateAndTimeInputs(value, toTimeInputValue(draft.start));
    const duration = draft.end.getTime() - draft.start.getTime();
    updateDraft({ start, end: new Date(start.getTime() + Math.max(duration, 30 * 60000)) });
  }

  function handleStartTimeChange(value: string) {
    const start = fromDateAndTimeInputs(toDateInputValue(draft.start), value);
    const duration = draft.end.getTime() - draft.start.getTime();
    updateDraft({ start, end: new Date(start.getTime() + Math.max(duration, 15 * 60000)) });
  }

  function handleEndDateChange(value: string) {
    updateDraft({ end: fromDateAndTimeInputs(value, toTimeInputValue(draft.end)) });
  }

  function handleEndTimeChange(value: string) {
    updateDraft({ end: fromDateAndTimeInputs(toDateInputValue(draft.end), value) });
  }

  const calendarItems: MenuItem[] = CALENDARS.map((calendar) => ({
    id: calendar.id,
    label: calendar.name,
    icon: <span className={styles.calendarDot} style={{ backgroundColor: calendar.color }} aria-hidden />,
    selected: draft.calendarId === calendar.id,
    onSelect: () => updateDraft({ calendarId: calendar.id }),
  }));

  const recurrenceItems: MenuItem[] = (Object.keys(RECURRENCE_LABELS) as EventRecurrence[]).map((key) => ({
    id: key,
    label: RECURRENCE_LABELS[key],
    selected: draft.recurrence === key,
    onSelect: () => updateDraft({ recurrence: key }),
  }));

  const reminderItems: MenuItem[] = (Object.keys(REMINDER_LABELS).map(Number) as ReminderMinutes[]).map((key) => ({
    id: String(key),
    label: REMINDER_LABELS[key],
    selected: draft.reminderMinutes === key,
    onSelect: () => updateDraft({ reminderMinutes: key }),
  }));

  return (
    <Modal
      title={isEditing ? 'Событие' : 'Новое событие'}
      onClose={onClose}
      width={520}
      footer={
        <div className={styles.footer}>
          {isEditing && onDelete && (
            <IconButton icon={<Trash2 size={16} />} aria-label="Удалить событие" onClick={onDelete} />
          )}
          <span className={styles.footerSpacer} />
          <Button onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      }
    >
      <div className={styles.form}>
        <input
          className={[styles.titleInput, touched && !titleIsValid ? styles.inputError : ''].join(' ')}
          value={draft.title}
          onChange={(event) => updateDraft({ title: event.target.value })}
          placeholder="Добавить заголовок"
          autoFocus
        />
        {touched && !titleIsValid && <span className={styles.error}>Укажите название события</span>}

        <div className={styles.row}>
          <CalendarDays size={16} className={styles.rowIcon} />
          <div className={styles.dateFields}>
            <div className={styles.dateTimeGroup}>
              <input
                type="date"
                className={styles.dateInput}
                value={toDateInputValue(draft.start)}
                onChange={(event) => handleStartDateChange(event.target.value)}
              />
              {!draft.allDay && (
                <input
                  type="time"
                  className={styles.timeInput}
                  value={toTimeInputValue(draft.start)}
                  onChange={(event) => handleStartTimeChange(event.target.value)}
                />
              )}
            </div>
            <span className={styles.dateSeparator}>—</span>
            <div className={styles.dateTimeGroup}>
              <input
                type="date"
                className={styles.dateInput}
                value={toDateInputValue(draft.end)}
                onChange={(event) => handleEndDateChange(event.target.value)}
              />
              {!draft.allDay && (
                <input
                  type="time"
                  className={styles.timeInput}
                  value={toTimeInputValue(draft.end)}
                  onChange={(event) => handleEndTimeChange(event.target.value)}
                />
              )}
            </div>
          </div>
        </div>
        {touched && !rangeIsValid && <span className={styles.error}>Окончание должно быть позже начала</span>}

        <div className={styles.row}>
          <span className={styles.rowIconSpacer} />
          <Checkbox label="Весь день" checked={draft.allDay} onChange={(event) => updateDraft({ allDay: event.target.checked })} />
        </div>

        <div className={styles.row}>
          <Repeat size={16} className={styles.rowIcon} />
          <div className={styles.menuAnchor}>
            <button type="button" className={styles.pickerButton} onClick={() => setRecurrenceMenuOpen((v) => !v)}>
              {RECURRENCE_LABELS[draft.recurrence]}
              <ChevronDown size={14} />
            </button>
            {recurrenceMenuOpen && <Menu align="left" onClose={() => setRecurrenceMenuOpen(false)} items={recurrenceItems} />}
          </div>
        </div>

        <div className={styles.row}>
          <MapPin size={16} className={styles.rowIcon} />
          <input
            className={styles.inlineInput}
            value={draft.location}
            onChange={(event) => updateDraft({ location: event.target.value })}
            placeholder="Место или ссылка на встречу"
          />
        </div>

        <div className={styles.row}>
          <Users size={16} className={styles.rowIcon} />
          <input
            className={styles.inlineInput}
            value={draft.attendees}
            onChange={(event) => updateDraft({ attendees: event.target.value })}
            placeholder="Участники через запятую"
          />
        </div>

        <div className={styles.row}>
          <Bell size={16} className={styles.rowIcon} />
          <div className={styles.menuAnchor}>
            <button type="button" className={styles.pickerButton} onClick={() => setReminderMenuOpen((v) => !v)}>
              {REMINDER_LABELS[draft.reminderMinutes]}
              <ChevronDown size={14} />
            </button>
            {reminderMenuOpen && <Menu align="left" onClose={() => setReminderMenuOpen(false)} items={reminderItems} />}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.rowIconSpacer} />
          <div className={styles.menuAnchor}>
            <button type="button" className={styles.pickerButton} onClick={() => setCalendarMenuOpen((v) => !v)}>
              <span className={styles.calendarDot} style={{ backgroundColor: selectedCalendar.color }} aria-hidden />
              {selectedCalendar.name}
              <ChevronDown size={14} />
            </button>
            {calendarMenuOpen && <Menu align="left" onClose={() => setCalendarMenuOpen(false)} items={calendarItems} />}
          </div>
        </div>

        <textarea
          className={styles.description}
          value={draft.description}
          onChange={(event) => updateDraft({ description: event.target.value })}
          placeholder="Описание"
          rows={4}
        />
      </div>
    </Modal>
  );
}
