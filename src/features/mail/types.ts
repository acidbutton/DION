export type SystemFolderId = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';

export interface CustomFolder {
  id: string;
  name: string;
  children?: CustomFolder[];
}

export interface MailAccount {
  id: string;
  /** null for the primary account, shown without an email header row */
  email: string | null;
  counts: Partial<Record<SystemFolderId, number>>;
  customFolders: CustomFolder[];
}

export interface ThreadMessage {
  id: string;
  senderName: string;
  preview: string;
  date: string;
  hasAttachment?: boolean;
}

export interface MailMessage {
  id: string;
  accountId: string;
  folderId: SystemFolderId | string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  recipients: string[];
  date: Date;
  unread: boolean;
  online?: boolean;
  attachmentsCount?: number;
  threadCount?: number;
  thread?: ThreadMessage[];
}
