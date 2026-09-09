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

export type AttachmentKind = 'pdf' | 'doc' | 'xls' | 'image' | 'other';

export interface MailAttachment {
  id: string;
  name: string;
  sizeKb: number;
  kind: AttachmentKind;
}

export interface CategoryDef {
  id: string;
  name: string;
  color: string;
}

export interface MailMessage {
  id: string;
  accountId: string;
  folderId: SystemFolderId | string;
  /** Folder the message lived in before being moved to Trash, so it can be restored. */
  previousFolderId?: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  recipients: string[];
  date: Date;
  unread: boolean;
  flagged?: boolean;
  categoryIds?: string[];
  online?: boolean;
  attachments?: MailAttachment[];
  threadCount?: number;
  thread?: ThreadMessage[];
}

export type SortKey = 'date-desc' | 'date-asc' | 'sender-asc' | 'subject-asc';
export type FilterKey = 'all' | 'unread' | 'flagged' | 'attachments';
export type ReadingPanePosition = 'right' | 'bottom' | 'hidden';

export interface MessageInsight {
  summary: string;
  expectation: string;
  actionItems: string[];
  quickReplies: string[];
  isEscalation: boolean;
  isMeetingRequest: boolean;
  isAwaitingReply: boolean;
  hasTask: boolean;
}
