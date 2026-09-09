export interface CalendarDef {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type ReminderMinutes = 0 | 5 | 15 | 30 | 60 | 1440;

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  location?: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  attendees?: string[];
  organizer?: string;
  recurrence: EventRecurrence;
  reminderMinutes: ReminderMinutes;
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';

export interface EventDraft {
  id?: string;
  calendarId: string;
  title: string;
  location: string;
  description: string;
  start: Date;
  end: Date;
  allDay: boolean;
  attendees: string;
  recurrence: EventRecurrence;
  reminderMinutes: ReminderMinutes;
}
