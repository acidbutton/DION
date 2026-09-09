import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../layout/AppShell/AppShell';
import { ComingSoon } from '../layout/ComingSoon/ComingSoon';
import { MailPage } from '../features/mail/MailPage';
import { WhiteboardsPage } from '../features/whiteboards/WhiteboardsPage';

const placeholders: Record<string, string> = {
  home: 'Главная',
  calendar: 'Календарь',
  chats: 'Чаты',
  contacts: 'Адресная книга',
  video: 'Видео',
  files: 'Файлы',
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/mail" replace /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'whiteboards', element: <WhiteboardsPage /> },
      ...Object.entries(placeholders).map(([path, title]) => ({
        path,
        element: <ComingSoon title={title} />,
      })),
      { path: '*', element: <Navigate to="/mail" replace /> },
    ],
  },
]);
