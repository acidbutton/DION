import type { CalendarEvent } from '../types';

export interface PositionedEvent {
  event: CalendarEvent;
  column: number;
  columnCount: number;
}

/**
 * Greedy column assignment so overlapping timed events sit side by side
 * instead of stacking on top of each other. Every event in a day shares the
 * same column count (the day's peak concurrency) — a simplification vs. a
 * full interval-graph packer, acceptable since the mock data rarely has more
 * than two events overlapping at once.
 */
export function layoutDayEvents(events: CalendarEvent[]): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const columns: CalendarEvent[][] = [];

  for (const event of sorted) {
    let placed = false;
    for (const column of columns) {
      const last = column[column.length - 1];
      if (last.end.getTime() <= event.start.getTime()) {
        column.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]);
  }

  const columnCount = Math.max(columns.length, 1);
  return sorted.map((event) => ({
    event,
    column: columns.findIndex((column) => column.includes(event)),
    columnCount,
  }));
}
