import { ArrowDownAZ, ListFilter, Paperclip, RefreshCw } from 'lucide-react';
import { Avatar, Checkbox, IconButton } from '../../../components';
import type { MailMessage } from '../types';
import { formatTime, groupMessagesByDate } from '../utils/date';
import styles from './MailList.module.css';

export interface MailListProps {
  messages: MailMessage[];
  selectedIds: Set<string>;
  activeMessageId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenMessage: (id: string) => void;
  onRefresh: () => void;
}

export function MailList({
  messages,
  selectedIds,
  activeMessageId,
  onToggleSelect,
  onToggleSelectAll,
  onOpenMessage,
  onRefresh,
}: MailListProps) {
  const allSelected = messages.length > 0 && messages.every((message) => selectedIds.has(message.id));
  const groups = groupMessagesByDate(messages);

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Checkbox label="Выделить" checked={allSelected} onChange={onToggleSelectAll} id="select-all-mail" />
        </div>
        <div className={styles.headerRight}>
          <IconButton icon={<ArrowDownAZ size={16} />} aria-label="Сортировать" size="s" />
          <IconButton icon={<ListFilter size={16} />} aria-label="Фильтр" size="s" />
          <IconButton icon={<RefreshCw size={16} />} aria-label="Обновить" size="s" onClick={onRefresh} />
        </div>
      </div>

      <div className={styles.list} role="list">
        {groups.length === 0 && (
          <div className={styles.empty}>
            <p>Писем не найдено</p>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.label}>
            <div className={styles.groupLabel}>{group.label}</div>
            {group.items.map((message) => (
              <MailListItem
                key={message.id}
                message={message}
                selected={selectedIds.has(message.id)}
                active={activeMessageId === message.id}
                onToggleSelect={() => onToggleSelect(message.id)}
                onOpen={() => onOpenMessage(message.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MailListItem({
  message,
  selected,
  active,
  onToggleSelect,
  onOpen,
}: {
  message: MailMessage;
  selected: boolean;
  active: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}) {
  const classes = [
    styles.item,
    active ? styles.active : '',
    message.unread ? styles.unread : '',
    selected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="listitem"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen();
      }}
    >
      <span className={styles.leftSlot} onClick={(event) => event.stopPropagation()}>
        <Avatar name={message.senderName} size={40} className={styles.leftAvatar} />
        <span className={styles.leftCheckbox}>
          <Checkbox
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Выделить письмо от ${message.senderName}`}
          />
        </span>
      </span>
      <div className={styles.content}>
        <div className={styles.titleRow}>
          {message.online && <span className={styles.onlineDot} aria-hidden />}
          <span className={styles.subject}>{message.subject}</span>
        </div>
        <p className={styles.sender}>{message.senderName}</p>
        <p className={styles.preview}>{message.preview}</p>
      </div>
      <div className={styles.meta}>
        <span className={styles.time}>{formatTime(message.date)}</span>
        <div className={styles.metaIcons}>
          {Boolean(message.attachmentsCount) && <Paperclip size={14} className={styles.metaIcon} />}
          {Boolean(message.threadCount) && <span className={styles.threadBadge}>{message.threadCount}</span>}
        </div>
      </div>
    </div>
  );
}
