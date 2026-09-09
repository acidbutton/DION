import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { Button, IconButton, ToastProvider, useToast } from '../../components';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CalendarNavSidebar } from './components/CalendarNavSidebar';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { EventModal } from './components/EventModal';
import { CALENDARS } from './data/calendars';
import { EVENTS } from './data/events';
import type { CalendarDef, CalendarEvent, CalendarViewMode, EventDraft } from './types';
import { addDays, addMonths, formatMonthYear, formatWeekRange, getWeekDays, startOfDay } from './utils/date';
import styles from './CalendarPage.module.css';

const MOBILE_QUERY = '(max-width: 760px)';

const VIEW_LABELS: Record<CalendarViewMode, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
  agenda: 'Повестка',
};

function emptyDraftAt(date: Date): EventDraft {
  const start = new Date(date);
  const end = new Date(start.getTime() + 30 * 60000);
  return {
    calendarId: CALENDARS[0].id,
    title: '',
    location: '',
    description: '',
    start,
    end,
    allDay: false,
    attendees: '',
    recurrence: 'none',
    reminderMinutes: 15,
  };
}

function draftFromEvent(event: CalendarEvent): EventDraft {
  return {
    id: event.id,
    calendarId: event.calendarId,
    title: event.title,
    location: event.location ?? '',
    description: event.description ?? '',
    start: event.start,
    end: event.end,
    allDay: Boolean(event.allDay),
    attendees: event.attendees?.join(', ') ?? '',
    recurrence: event.recurrence,
    reminderMinutes: event.reminderMinutes,
  };
}

export function CalendarPage() {
  return (
    <ToastProvider>
      <CalendarPageContent />
    </ToastProvider>
  );
}

function CalendarPageContent() {
  const { showToast } = useToast();
  const isCompact = useMediaQuery(MOBILE_QUERY);
  const [calendars, setCalendars] = useState<CalendarDef[]>(CALENDARS);
  const [events, setEvents] = useState<CalendarEvent[]>(EVENTS);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(startOfDay(new Date()));
  const [displayMonth, setDisplayMonth] = useState<Date>(startOfDay(new Date()));
  const [modalDraft, setModalDraft] = useState<EventDraft | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleCalendarIds = useMemo(
    () => new Set(calendars.filter((calendar) => calendar.visible).map((calendar) => calendar.id)),
    [calendars],
  );
  const visibleEvents = useMemo(
    () => events.filter((event) => visibleCalendarIds.has(event.calendarId)),
    [events, visibleCalendarIds],
  );

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const dayList = viewMode === 'day' ? [anchorDate] : weekDays;

  const title =
    viewMode === 'month'
      ? formatMonthYear(displayMonth)
      : viewMode === 'day'
        ? anchorDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        : formatWeekRange(weekDays[0]);

  function goToday() {
    const today = startOfDay(new Date());
    setAnchorDate(today);
    setDisplayMonth(today);
  }

  function goPrev() {
    if (viewMode === 'month') {
      setDisplayMonth((prev) => addMonths(prev, -1));
    } else if (viewMode === 'day') {
      setAnchorDate((prev) => addDays(prev, -1));
    } else {
      setAnchorDate((prev) => addDays(prev, -7));
    }
  }

  function goNext() {
    if (viewMode === 'month') {
      setDisplayMonth((prev) => addMonths(prev, 1));
    } else if (viewMode === 'day') {
      setAnchorDate((prev) => addDays(prev, 1));
    } else {
      setAnchorDate((prev) => addDays(prev, 7));
    }
  }

  function handleSelectDate(date: Date) {
    setAnchorDate(date);
    setDisplayMonth(date);
    if (isCompact) setMobileNavOpen(false);
  }

  function handleOpenDay(date: Date) {
    setAnchorDate(date);
    setViewMode('day');
  }

  function handleToggleCalendar(id: string) {
    setCalendars((prev) => prev.map((calendar) => (calendar.id === id ? { ...calendar, visible: !calendar.visible } : calendar)));
  }

  function handleCreateAt(date: Date) {
    setModalDraft(emptyDraftAt(date));
  }

  function handleOpenEvent(event: CalendarEvent) {
    setModalDraft(draftFromEvent(event));
  }

  function handleSaveDraft(draft: EventDraft) {
    const attendees = draft.attendees
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (draft.id) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === draft.id
            ? {
                ...event,
                calendarId: draft.calendarId,
                title: draft.title.trim(),
                location: draft.location.trim() || undefined,
                description: draft.description.trim() || undefined,
                start: draft.start,
                end: draft.end,
                allDay: draft.allDay,
                attendees: attendees.length ? attendees : undefined,
                recurrence: draft.recurrence,
                reminderMinutes: draft.reminderMinutes,
              }
            : event,
        ),
      );
      showToast('Событие обновлено.');
    } else {
      const event: CalendarEvent = {
        id: `evt-${Date.now()}`,
        calendarId: draft.calendarId,
        title: draft.title.trim(),
        location: draft.location.trim() || undefined,
        description: draft.description.trim() || undefined,
        start: draft.start,
        end: draft.end,
        allDay: draft.allDay,
        attendees: attendees.length ? attendees : undefined,
        organizer: 'Я',
        recurrence: draft.recurrence,
        reminderMinutes: draft.reminderMinutes,
      };
      setEvents((prev) => [...prev, event]);
      showToast('Событие создано.');
    }
    setModalDraft(null);
  }

  function handleDeleteDraft() {
    if (!modalDraft?.id) return;
    const id = modalDraft.id;
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setModalDraft(null);
    showToast('Событие удалено.');
  }

  const sidebar = (
    <CalendarNavSidebar
      displayMonth={displayMonth}
      selectedDate={anchorDate}
      onDisplayMonthChange={setDisplayMonth}
      onSelectDate={handleSelectDate}
      calendars={calendars}
      onToggleCalendar={handleToggleCalendar}
      onCreate={() => {
        handleCreateAt(anchorDate);
        if (isCompact) setMobileNavOpen(false);
      }}
    />
  );

  return (
    <div className={isCompact ? styles.pageMobile : styles.page}>
      {!isCompact && sidebar}

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {isCompact && (
              <IconButton icon={<MenuIcon size={18} />} aria-label="Открыть календари" onClick={() => setMobileNavOpen(true)} />
            )}
            <Button onClick={goToday}>Сегодня</Button>
            <IconButton icon={<ChevronLeft size={16} />} aria-label="Назад" onClick={goPrev} />
            <IconButton icon={<ChevronRight size={16} />} aria-label="Вперёд" onClick={goNext} />
            <span className={styles.title}>{title}</span>
          </div>
          <div className={styles.viewSwitcher}>
            {(Object.keys(VIEW_LABELS) as CalendarViewMode[])
              .filter((mode) => mode !== 'agenda')
              .map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={[styles.viewButton, viewMode === mode ? styles.viewButtonActive : ''].join(' ')}
                  onClick={() => setViewMode(mode)}
                >
                  {VIEW_LABELS[mode]}
                </button>
              ))}
          </div>
        </div>

        <div className={styles.viewArea}>
          {viewMode === 'month' ? (
            <MonthView
              displayMonth={displayMonth}
              events={visibleEvents}
              onOpenEvent={handleOpenEvent}
              onCreateAt={handleCreateAt}
              onOpenDay={handleOpenDay}
            />
          ) : (
            <WeekView days={dayList} events={visibleEvents} onOpenEvent={handleOpenEvent} onCreateAt={handleCreateAt} />
          )}
        </div>
      </div>

      {isCompact && mobileNavOpen && (
        <div className={styles.mobileDrawerOverlay} onMouseDown={() => setMobileNavOpen(false)}>
          <div className={styles.mobileDrawer} onMouseDown={(event) => event.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}

      {modalDraft && (
        <EventModal
          draft={modalDraft}
          isEditing={Boolean(modalDraft.id)}
          onClose={() => setModalDraft(null)}
          onSave={handleSaveDraft}
          onDelete={modalDraft.id ? handleDeleteDraft : undefined}
        />
      )}
    </div>
  );
}
