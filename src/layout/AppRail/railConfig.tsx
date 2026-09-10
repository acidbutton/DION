import type { Icon } from '@phosphor-icons/react';
import {
  AddressBookTabs as Contact,
  CalendarDots as Calendar,
  ChatCircleDots as MessageSquare,
  Envelope as Mail,
  Folder,
  House as Home,
  Play as Video,
  Presentation,
} from '@phosphor-icons/react';

export interface RailItem {
  id: string;
  label: string;
  to: string;
  Icon: Icon;
}

export const railItems: RailItem[] = [
  { id: 'home', label: 'Главная', to: '/home', Icon: Home },
  { id: 'calendar', label: 'Календарь', to: '/calendar', Icon: Calendar },
  { id: 'mail', label: 'Почта', to: '/mail', Icon: Mail },
  { id: 'chats', label: 'Чаты', to: '/chats', Icon: MessageSquare },
  { id: 'contacts', label: 'Адресная книга', to: '/contacts', Icon: Contact },
  { id: 'whiteboards', label: 'Доски', to: '/whiteboards', Icon: Presentation },
  { id: 'video', label: 'Видео', to: '/video', Icon: Video },
  { id: 'files', label: 'Файлы', to: '/files', Icon: Folder },
];
