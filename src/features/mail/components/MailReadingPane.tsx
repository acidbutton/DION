import { useState } from 'react';
import {
  ArrowBendDoubleUpLeft as ReplyAll,
  ArrowBendUpLeft as Reply,
  ArrowBendUpRight as Forward,
  ArrowCounterClockwise as RotateCcw,
  ArrowLeft,
  Calendar,
  CaretDoubleDown as ChevronsDown,
  CaretDoubleUp as ChevronsUp,
  CaretDown as ChevronDown,
  CaretRight as ChevronRight,
  Clock,
  DotsThree as MoreHorizontal,
  EnvelopeOpen as MailOpen,
  File,
  FileText,
  FileXls as FileSpreadsheet,
  Flag,
  Image as ImageIcon,
  Paperclip,
  PaperPlaneTilt as Send,
  Plus,
  Tag,
  Trash as Trash2,
} from '@phosphor-icons/react';
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
  onSendNow: (ids: string[]) => void;
  isTrashFolder: boolean;
  isOutboxFolder: boolean;
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

function formatScheduled(date: Date): string {
  return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
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
  onSendNow,
  isTrashFolder,
  isOutboxFolder,
  moveTargets,
  onAttachmentClick,
  onBack,
  hideHeader,
}: MailReadingPaneProps) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());

  if (!message) {
    return (
      <div className={styles.emptyState}>
        <p>Выберите письмо, чтобы прочитать его</p>
      </div>
    );
  }

  const ids = [message.id];
  const assignedCategories = CATEGORIES.filter((category) => message.categoryIds?.includes(category.id));
  const allThreadExpanded = Boolean(message.thread?.length) && message.thread!.every((entry) => expandedThreadIds.has(entry.id));

  function toggleThreadEntry(id: string) {
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllThread() {
    if (!message?.thread) return;
    setExpandedThreadIds(allThreadExpanded ? new Set() : new Set(message.thread.map((entry) => entry.id)));
  }

  const moreItems: MenuItem[] = [];
  if (isOutboxFolder) {
    moreItems.push({ id: 'send-now', label: 'Отправить сейчас', icon: <Send size={14} />, onSelect: () => onSendNow(ids) });
  }
  moreItems.push({
    id: 'read',
    label: message.unread ? 'Пометить как прочитанное' : 'Пометить как непрочитанное',
    icon: <MailOpen size={14} />,
    onSelect: () => onMarkRead(ids, !message.unread),
  });
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

      {message.scheduledAt && (
        <div className={styles.scheduledBanner}>
          <Clock size={14} />
          <span>Будет отправлено {formatScheduled(message.scheduledAt)}</span>
          <button type="button" className={styles.scheduledBannerAction} onClick={() => onSendNow(ids)}>
            Отправить сейчас
          </button>
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
            {Boolean(message.cc?.length) && (
              <div className={styles.recipientDetails}>
                <span className={styles.toLabel}>Копия:</span>
                <span className={styles.recipients}>{message.cc!.join(', ')}</span>
              </div>
            )}
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
        {message.bodyHtml ? (
          <div className={styles.bodyHtml} dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
        ) : (
          <p className={styles.body}>{message.body}</p>
        )}
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
          <div className={styles.threadHeader}>
            <span className={styles.threadHeaderLabel}>
              Предыдущие сообщения: {message.thread.length}
            </span>
            <button type="button" className={styles.threadToggleAll} onClick={toggleAllThread}>
              {allThreadExpanded ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
              {allThreadExpanded ? 'Свернуть всё' : 'Развернуть всё'}
            </button>
          </div>
          {message.thread.map((entry) => (
            <ThreadRow
              key={entry.id}
              senderName={entry.senderName}
              preview={entry.preview}
              body={entry.body}
              date={entry.date}
              hasAttachment={entry.hasAttachment}
              expanded={expandedThreadIds.has(entry.id)}
              onToggle={() => toggleThreadEntry(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadRow({
  senderName,
  preview,
  body,
  date,
  hasAttachment,
  expanded,
  onToggle,
}: {
  senderName: string;
  preview: string;
  body: string;
  date: string;
  hasAttachment?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.threadEntry}>
      <button type="button" className={styles.threadRow} onClick={onToggle} aria-expanded={expanded}>
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
      {expanded && (
        <div className={styles.threadBody}>
          <p>{body}</p>
        </div>
      )}
    </div>
  );
}
