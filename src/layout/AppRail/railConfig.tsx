import type { ReactNode } from 'react';
import {
  CalendarIcon,
  ChatsIcon,
  ContactsIcon,
  FilesIcon,
  HomeIcon,
  MailIcon,
  VideoIcon,
  WhiteboardIcon,
  type DionIconProps,
} from './dionIcons';

export interface RailItem {
  id: string;
  label: string;
  to: string;
  Icon: (props: DionIconProps) => ReactNode;
}

export const railItems: RailItem[] = [
  { id: 'home', label: 'Главная', to: '/home', Icon: HomeIcon },
  { id: 'calendar', label: 'Календарь', to: '/calendar', Icon: CalendarIcon },
  { id: 'mail', label: 'Почта', to: '/mail', Icon: MailIcon },
  { id: 'chats', label: 'Чаты', to: '/chats', Icon: ChatsIcon },
  { id: 'contacts', label: 'Адресная книга', to: '/contacts', Icon: ContactsIcon },
  { id: 'whiteboards', label: 'Доски', to: '/whiteboards', Icon: WhiteboardIcon },
  { id: 'video', label: 'Видео', to: '/video', Icon: VideoIcon },
  { id: 'files', label: 'Файлы', to: '/files', Icon: FilesIcon },
];
