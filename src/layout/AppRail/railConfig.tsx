import type { ReactNode } from 'react';
import {
  AddressBook as Contact,
  Calendar,
  ChatCircleText as MessageSquare,
  Envelope as Mail,
  Folder,
  House as Home,
  Presentation,
  VideoCamera as Video,
} from '@phosphor-icons/react';

export interface RailItem {
  id: string;
  label: string;
  to: string;
  icon: ReactNode;
}

const ICON_SIZE = 20;

export const railItems: RailItem[] = [
  { id: 'home', label: 'Главная', to: '/home', icon: <Home size={ICON_SIZE} /> },
  { id: 'calendar', label: 'Календарь', to: '/calendar', icon: <Calendar size={ICON_SIZE} /> },
  { id: 'mail', label: 'Почта', to: '/mail', icon: <Mail size={ICON_SIZE} /> },
  { id: 'chats', label: 'Чаты', to: '/chats', icon: <MessageSquare size={ICON_SIZE} /> },
  { id: 'contacts', label: 'Адресная книга', to: '/contacts', icon: <Contact size={ICON_SIZE} /> },
  { id: 'whiteboards', label: 'Доски', to: '/whiteboards', icon: <Presentation size={ICON_SIZE} /> },
  { id: 'video', label: 'Видео', to: '/video', icon: <Video size={ICON_SIZE} /> },
  { id: 'files', label: 'Файлы', to: '/files', icon: <Folder size={ICON_SIZE} /> },
];
