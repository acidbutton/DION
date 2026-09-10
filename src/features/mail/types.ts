export type SystemFolderId = 'inbox' | 'sent' | 'drafts' | 'outbox' | 'spam' | 'trash';

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
  body: string;
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

export type Importance = 'high' | 'normal' | 'low';

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
  /** Rich-text HTML body, set only for messages composed in the rich editor. */
  bodyHtml?: string;
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  date: Date;
  unread: boolean;
  flagged?: boolean;
  categoryIds?: string[];
  online?: boolean;
  attachments?: MailAttachment[];
  threadCount?: number;
  thread?: ThreadMessage[];
  importance?: Importance;
  /** Set while the message sits in Outbox waiting for its scheduled send time. */
  scheduledAt?: Date;
}

export type SortKey = 'date-desc' | 'date-asc' | 'sender-asc' | 'subject-asc';
export type FilterKey = 'all' | 'unread' | 'flagged' | 'attachments';
export type ReadingPanePosition = 'right' | 'bottom' | 'hidden';

export interface ComposeDraft {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string;
  attachments: MailAttachment[];
  importance: Importance;
  scheduledAt: Date | null;
}

export const EMPTY_DRAFT: ComposeDraft = {
  to: [],
  cc: [],
  bcc: [],
  subject: '',
  bodyHtml: '',
  attachments: [],
  importance: 'normal',
  scheduledAt: null,
};

export interface Contact {
  id: string;
  name: string;
  email: string;
}

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
