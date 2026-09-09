const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const MONTHS_NOMINATIVE = [
  'Января',
  'Февраля',
  'Марта',
  'Апреля',
  'Мая',
  'Июня',
  'Июля',
  'Августа',
  'Сентября',
  'Октября',
  'Ноября',
  'Декабря',
];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function formatFullDate(date: Date): string {
  const day = date.getDate();
  return `${day} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()} г. в ${formatTime(date)}`;
}

/** Groups messages into the same date-label buckets used by the Figma reference. */
export function getDateGroupLabel(date: Date, now = new Date()): string {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return 'Сегодня';
  if (isSameDay(date, yesterday)) return 'Вчера';
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getDate()} ${MONTHS_NOMINATIVE[date.getMonth()]}`;
  }
  return `${date.getDate()} ${MONTHS_NOMINATIVE[date.getMonth()]} ${date.getFullYear()}`;
}

export function groupMessagesByDate<T extends { date: Date }>(items: T[]): Array<{ label: string; items: T[] }> {
  const sorted = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
  const groups: Array<{ label: string; items: T[] }> = [];

  for (const item of sorted) {
    const label = getDateGroupLabel(item.date);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  return groups;
}
