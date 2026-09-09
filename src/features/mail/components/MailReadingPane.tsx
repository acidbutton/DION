import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  File,
  FileSpreadsheet,
  FileText,
  Flag,
  Forward,
  Image as ImageIcon,
  MailOpen,
  MoreHorizontal,
  Paperclip,
  Plus,
  Reply,
  ReplyAll,
  RotateCcw,
  Tag,
  Trash2,
} from 'lucide-react';
import { Avatar, Button, IconButton, Menu, type MenuItem } from '../../../components';
import { CATEGORIES } from '../data/categories';
import type { AttachmentKind, MailAttachment, MailMessage } from '../types';
import { formatFullDate } from '../utils/date';
import { AssistantCard, AssistantTrigger } from './AssistantPanel';
import type { MoveTarget } from './MailList';
import styles from './MailReadingPane.module.css';

export interface MailReadingPaneProps {
  message: MailMessage | null;
  onReply: (message: MailMessage, mode: 'reply' | 'replyAll' | 'forward') => void;
  onQuickReply: (message: MailMessage, text: string) => void;
  onToggleFlag: (ids: string[]) => void;
  onMarkRead: (ids: string[], read: boolean) => void;
  onToggleCategory: (ids: string[], categoryId: string) => void;
  onMoveToFolder: (ids: string[], folderId: string) => void;
  onDeleteForever: (ids: string[]) => void;
  onRestore: (ids: string[]) => void;
  isTrashFolder: boolean;
  moveTargets: MoveTarget[];
  onAttachmentClick: (attachment: MailAttachment) => void;
  onBack?: () => void;
  /** Suppress the built-in subject header — used when a host (e.g. Modal) already shows it. */
  hideHeader?: boolean;
}

const ATTACHMENT_ICONS: Record<AttachmentKind, React.ReactNode> = {
  pdf: <FileText size={16} />,
  doc: <FileText size={16} />,
  xls: <FileSpreadsheet size={16} />,
  image: <ImageIcon size={16} />,
  other: <File size={16} />,
};

function formatSize(sizeKb: number): string {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} МБ`;
  return `${sizeKb} КБ`;
}

export function MailReadingPane({
  message,
  onReply,
  onQuickReply,
  onToggleFlag,
  onMarkRead,
  onToggleCategory,
  onMoveToFolder,
  onDeleteForever,
  onRestore,
  isTrashFolder,
  moveTargets,
  onAttachmentClick,
  onBack,
  hideHeader,
}: MailReadingPaneProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  if (!message) {
    return (
      <div className={styles.emptyState}>
        <p>Выберите письмо, чтобы прочитать его</p>
      </div>
    );
  }

  const ids = [message.id];
  const assignedCategories = CATEGORIES.filter((category) => message.categoryIds?.includes(category.id));

  const moreItems: MenuItem[] = [
    {
      id: 'read',
      label: message.unread ? 'Пометить как прочитанное' : 'Пометить как непрочитанное',
      icon: <MailOpen size={14} />,
      onSelect: () => onMarkRead(ids, !message.unread),
    },
  ];
  if (isTrashFolder) {
    moreItems.push(
      { id: 'restore', label: 'Восстановить', icon: <RotateCcw size={14} />, onSelect: () => onRestore(ids) },
      { id: 'delete-forever', label: 'Удалить навсегда', destructive: true, icon: <Trash2 size={14} />, onSelect: () => onDeleteForever(ids) },
    );
  } else {
    for (const target of moveTargets) {
      moreItems.push({
        id: `move-${target.folderId}`,
        label: `Переместить в «${target.label}»`,
        onSelect: () => onMoveToFolder(ids, target.folderId),
      });
    }
    moreItems.push({ id: 'delete', label: 'Удалить', destructive: true, icon: <Trash2 size={14} />, onSelect: () => onMoveToFolder(ids, 'trash') });
  }

  return (
    <div className={styles.pane} key={message.id}>
      {!hideHeader && (
        <div className={styles.header}>
          {onBack && (
            <IconButton icon={<ArrowLeft size={18} />} aria-label="Назад к списку писем" variant="ghost" onClick={onBack} className={styles.backButton} />
          )}
          <h1 className={styles.title}>{message.subject}</h1>
        </div>
      )}

      <div className={styles.rowContainer}>
        <div className={styles.row}>
          <div className={styles.rowInner}>
            <IconButton icon={<ChevronDown size={16} />} aria-label="Свернуть письмо" variant="ghost" size="s" />
            <Avatar name={message.senderName} size={32} />
          </div>
          <div className={styles.titleBlock}>
            <div className={styles.nameDate}>
              <span className={styles.senderName}>{message.senderName}</span>
              <span className={styles.date}>{formatFullDate(message.date)}</span>
            </div>
            <div className={styles.recipientDetails}>
              <span className={styles.toLabel}>Кому:</span>
              <span className={styles.recipients}>{message.recipients.join(', ')}</span>
            </div>
          </div>
          <div className={styles.tagActions}>
            <IconButton
              icon={<Flag size={16} fill={message.flagged ? 'currentColor' : 'none'} />}
              aria-label={message.flagged ? 'Снять флажок' : 'Отметить флажком'}
              size="m"
              active={message.flagged}
              onClick={() => onToggleFlag(ids)}
            />
            <div className={styles.menuAnchor}>
              <IconButton
                icon={<MoreHorizontal size={16} />}
                aria-label="Дополнительные действия"
                size="m"
                active={moreMenuOpen}
                onClick={() => setMoreMenuOpen((v) => !v)}
              />
              {moreMenuOpen && <Menu onClose={() => setMoreMenuOpen(false)} items={moreItems} />}
            </div>
          </div>
        </div>
        <div className={styles.marks}>
          {assignedCategories.map((category) => (
            <span key={category.id} className={styles.categoryChip} style={{ backgroundColor: `${category.color}1a`, color: category.color }}>
              <span className={styles.categoryDot} style={{ backgroundColor: category.color }} aria-hidden />
              {category.name}
            </span>
          ))}
          <div className={styles.menuAnchor}>
            <button type="button" className={styles.tagButton} onClick={() => setCategoryMenuOpen((v) => !v)}>
              {assignedCategories.length > 0 ? <Plus size={14} /> : <Tag size={14} />}
              {assignedCategories.length > 0 ? 'Категория' : 'Метки'}
            </button>
            {categoryMenuOpen && (
              <Menu
                align="left"
                onClose={() => setCategoryMenuOpen(false)}
                items={CATEGORIES.map((category) => ({
                  id: category.id,
                  label: category.name,
                  selected: message.categoryIds?.includes(category.id),
                  icon: <span className={styles.categoryDot} style={{ backgroundColor: category.color }} aria-hidden />,
                  onSelect: () => onToggleCategory(ids, category.id),
                }))}
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.toolRow}>
        <AssistantTrigger open={assistantOpen} onToggle={() => setAssistantOpen((v) => !v)} />
        <div className={styles.actions}>
          <div className={styles.actionsInner}>
            <Button variant="secondary" leadingIcon={<Calendar size={16} />} aria-label="Создать событие" title="Создать событие">
              Создать событие
            </Button>
            <Button
              variant="secondary"
              leadingIcon={<Forward size={16} />}
              aria-label="Переслать"
              title="Переслать"
              onClick={() => onReply(message, 'forward')}
            >
              Переслать
            </Button>
            <Button
              variant="secondary"
              leadingIcon={<ReplyAll size={16} />}
              aria-label="Ответить всем"
              title="Ответить всем"
              onClick={() => onReply(message, 'replyAll')}
            >
              Ответить всем
            </Button>
            <Button
              variant="primary"
              leadingIcon={<Reply size={16} />}
              aria-label="Ответить"
              title="Ответить"
              onClick={() => onReply(message, 'reply')}
            >
              Ответить
            </Button>
          </div>
        </div>
      </div>

      {assistantOpen && <AssistantCard message={message} onQuickReply={(text) => onQuickReply(message, text)} />}

      <div className={styles.message}>
        <p className={styles.body}>{message.body}</p>
      </div>

      {Boolean(message.attachments?.length) && (
        <div className={styles.attachments}>
          {message.attachments!.map((attachment) => (
            <button key={attachment.id} type="button" className={styles.attachmentChip} onClick={() => onAttachmentClick(attachment)}>
              <span className={styles.attachmentIcon}>{ATTACHMENT_ICONS[attachment.kind]}</span>
              <span className={styles.attachmentName}>{attachment.name}</span>
              <span className={styles.attachmentSize}>{formatSize(attachment.sizeKb)}</span>
            </button>
          ))}
        </div>
      )}

      {message.thread && message.thread.length > 0 && (
        <div className={styles.thread}>
          {message.thread.map((entry) => (
            <ThreadRow key={entry.id} senderName={entry.senderName} preview={entry.preview} date={entry.date} hasAttachment={entry.hasAttachment} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadRow({
  senderName,
  preview,
  date,
  hasAttachment,
}: {
  senderName: string;
  preview: string;
  date: string;
  hasAttachment?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button type="button" className={styles.threadRow} onClick={() => setExpanded((value) => !value)}>
      <ChevronRight
        size={16}
        className={styles.threadChevron}
        style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
      />
      <span className={styles.threadDot} aria-hidden />
      <Avatar name={senderName} size={32} />
      <span className={styles.threadSender}>{senderName}</span>
      <span className={styles.threadPreview}>{preview}</span>
      {hasAttachment && <Paperclip size={16} className={styles.threadIcon} />}
      <span className={styles.threadDate}>{date}</span>
    </button>
  );
}
