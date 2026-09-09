import { useState } from 'react';
import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Forward,
  MoreHorizontal,
  Paperclip,
  Reply,
  ReplyAll,
  Tag,
} from 'lucide-react';
import { Avatar, Button, IconButton } from '../../../components';
import type { MailMessage } from '../types';
import { formatFullDate } from '../utils/date';
import styles from './MailReadingPane.module.css';

export interface MailReadingPaneProps {
  message: MailMessage | null;
  onReply: (message: MailMessage, mode: 'reply' | 'replyAll' | 'forward') => void;
}

export function MailReadingPane({ message, onReply }: MailReadingPaneProps) {
  if (!message) {
    return (
      <div className={styles.emptyState}>
        <p>Выберите письмо, чтобы прочитать его</p>
      </div>
    );
  }

  return (
    <div className={styles.pane} key={message.id}>
      <div className={styles.header}>
        <h1 className={styles.title}>{message.subject}</h1>
      </div>

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
            <IconButton icon={<ExternalLink size={16} />} aria-label="Открыть в отдельном окне" size="m" />
            <IconButton icon={<Bookmark size={16} />} aria-label="Добавить в закладки" size="m" />
            <IconButton icon={<MoreHorizontal size={16} />} aria-label="Дополнительные действия" size="m" />
          </div>
        </div>
        <div className={styles.marks}>
          <button type="button" className={styles.tagButton}>
            <Tag size={14} />
            Метки
          </button>
        </div>
      </div>

      <div className={styles.message}>
        <p className={styles.body}>{message.body}</p>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" leadingIcon={<Calendar size={16} />}>
          Создать событие
        </Button>
        <Button variant="secondary" leadingIcon={<Forward size={16} />} onClick={() => onReply(message, 'forward')}>
          Переслать
        </Button>
        <Button variant="secondary" leadingIcon={<ReplyAll size={16} />} onClick={() => onReply(message, 'replyAll')}>
          Ответить всем
        </Button>
        <Button variant="primary" leadingIcon={<Reply size={16} />} onClick={() => onReply(message, 'reply')}>
          Ответить
        </Button>
      </div>

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
