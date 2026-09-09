import type { MailAccount } from '../types';

export const ACCOUNTS: MailAccount[] = [
  {
    id: 'primary',
    email: null,
    counts: { inbox: 3, drafts: 23, spam: 99 },
    customFolders: [
      { id: 'projects', name: 'Проекты' },
      {
        id: 'personal',
        name: 'Личное',
        children: [
          { id: 'finance', name: 'Финансы' },
          { id: 'subscriptions', name: 'Подписки' },
          { id: 'newsletters', name: 'Рассылки' },
        ],
      },
    ],
  },
  {
    id: 'krasnoperekopskii',
    email: 'krasnoperekopskii_vasilii@supervimpelcom.com',
    counts: { inbox: 76, drafts: 3, spam: 23 },
    customFolders: [],
  },
];
