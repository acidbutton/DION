import type { Board } from '../types';

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export const BOARDS: Board[] = [
  { id: 'b1', title: 'Дорожная карта Q3', ownership: 'me', ownerLabel: 'Владелец', modifiedAt: daysAgo(1), thumbnail: 0 },
  { id: 'b2', title: 'Брейншторм — новые продукты', ownership: 'me', ownerLabel: 'Владелец', modifiedAt: daysAgo(2), thumbnail: 1 },
  { id: 'b3', title: 'Архитектура платформы DION', ownership: 'me', ownerLabel: 'Владелец', modifiedAt: daysAgo(3), thumbnail: 2 },
  { id: 'b4', title: 'Ретро спринта 24', ownership: 'shared', ownerLabel: 'Иванов Сергей', modifiedAt: daysAgo(4), thumbnail: 3 },
  { id: 'b5', title: 'Onboarding новых сотрудников', ownership: 'me', ownerLabel: 'Владелец', modifiedAt: daysAgo(5), thumbnail: 4 },
  { id: 'b6', title: 'Карта пользовательских путей', ownership: 'shared', ownerLabel: 'Петрова Анна', modifiedAt: daysAgo(6), thumbnail: 5 },
  { id: 'b7', title: 'Годовое планирование бюджета', ownership: 'me', ownerLabel: 'Владелец', modifiedAt: daysAgo(9), thumbnail: 0 },
  { id: 'b8', title: 'Схема интеграций с ВТБ', ownership: 'me', ownerLabel: 'Владелец', modifiedAt: daysAgo(12), thumbnail: 2 },
  { id: 'b9', title: 'Идеи для конференции DION Day', ownership: 'shared', ownerLabel: 'Лебедев Дмитрий', modifiedAt: daysAgo(20), thumbnail: 3 },
];
