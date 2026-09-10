import { useState } from 'react';
import {
  ArrowsClockwise as RefreshCw,
  ArrowCounterClockwise as RotateCcw,
  ArrowSquareIn as FolderInput,
  Envelope as MailGlyph,
  EnvelopeOpen as MailOpen,
  Flag,
  FunnelSimple as ListFilter,
  Paperclip,
  PaperPlaneTilt as Send,
  SidebarSimple as PanelRight,
  SortAscending as ArrowDownAZ,
  Sparkle as Sparkles,
  Tag,
  Trash as Trash2,
} from '@phosphor-icons/react';
import { Avatar, Checkbox, IconButton, Menu, type MenuItem } from '../../../components';
import { CATEGORIES } from '../data/categories';
import type { FilterKey, MailMessage, ReadingPanePosition, SortKey } from '../types';
import { formatTime, groupMessagesByDate } from '../utils/date';
import styles from './MailList.module.css';

export interface MoveTarget {
  folderId: string;
  label: string;
}

export interface MailListProps {
  messages: MailMessage[];
  selectedIds: Set<string>;
  activeMessageId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onOpenMessage: (id: string) => void;
  onRefresh: () => void;
  sortKey: SortKey;
  onSortKeyChange: (key: SortKey) => void;
  filterKey: FilterKey;
  onFilterKeyChange: (key: FilterKey) => void;
  onToggleFlag: (ids: string[]) => void;
  onReply: (message: MailMessage, mode: 'reply' | 'replyAll' | 'forward') => void;
  onMarkRead: (ids: string[], read: boolean) => void;
  onMoveToFolder: (ids: string[], folderId: string) => void;
  onDeleteForever: (ids: string[]) => void;
  onRestore: (ids: string[]) => void;
  onSendNow: (ids: string[]) => void;
  isTrashFolder: boolean;
  isOutboxFolder: boolean;
  moveTargets: MoveTarget[];
  onOpenAssistant: () => void;
  readingPanePosition: ReadingPanePosition;
  onChangeReadingPanePosition: (position: ReadingPanePosition) => void;
  onToggleCategory: (ids: string[], categoryId: string) => void;
}

const SORT_LABELS: Record<SortKey, string> = {
  'date-desc': 'Дата (сначала новые)',
  'date-asc': 'Дата (сначала старые)',
  'sender-asc': 'Отправитель (А-Я)',
  'subject-asc': 'Тема (А-Я)',
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'Все письма',
  unread: 'Непрочитанные',
  flagged: 'С флажком',
  attachments: 'С вложениями',
};

const READING_PANE_LABELS: Record<ReadingPanePosition, string> = {
  right: 'Справа',
  bottom: 'Снизу',
  hidden: 'Отдельным окном',
};

function sortMessages(messages: MailMessage[], sortKey: SortKey): MailMessage[] {
  const sorted = [...messages];
  switch (sortKey) {
    case 'date-asc':
      return sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
    case 'sender-asc':
      return sorted.sort((a, b) => a.senderName.localeCompare(b.senderName, 'ru'));
    case 'subject-asc':
      return sorted.sort((a, b) => a.subject.localeCompare(b.subject, 'ru'));
    case 'date-desc':
    default:
      return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}

export function MailList({
  messages,
  selectedIds,
  activeMessageId,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onOpenMessage,
  onRefresh,
  sortKey,
  onSortKeyChange,
  filterKey,
  onFilterKeyChange,
  onToggleFlag,
  onReply,
  onMarkRead,
  onMoveToFolder,
  onDeleteForever,
  onRestore,
  onSendNow,
  isTrashFolder,
  isOutboxFolder,
  moveTargets,
  onOpenAssistant,
  readingPanePosition,
  onChangeReadingPanePosition,
  onToggleCategory,
}: MailListProps) {
  const [openMenu, setOpenMenu] = useState<'sort' | 'filter' | 'view' | null>(null);
  const [contextMenu, setContextMenu] = useState<{ message: MailMessage; x: number; y: number } | null>(null);

  const allSelected = messages.length > 0 && messages.every((message) => selectedIds.has(message.id));
  const selectedCount = selectedIds.size;
  const sorted = sortMessages(messages, sortKey);
  const groups = sortKey === 'date-desc' ? groupMessagesByDate(sorted) : [{ label: '', items: sorted }];

  function buildContextMenuItems(message: MailMessage): MenuItem[] {
    const ids = [message.id];
    const items: MenuItem[] = [];
    if (isOutboxFolder) {
      items.push({ id: 'send-now', label: 'Отправить сейчас', icon: <Send size={14} />, onSelect: () => onSendNow(ids) });
    }
    items.push(
      { id: 'reply', label: 'Ответить', onSelect: () => onReply(message, 'reply') },
      { id: 'replyAll', label: 'Ответить всем', onSelect: () => onReply(message, 'replyAll') },
      { id: 'forward', label: 'Переслать', onSelect: () => onReply(message, 'forward') },
      {
        id: 'read',
        label: message.unread ? 'Пометить как прочитанное' : 'Пометить как непрочитанное',
        onSelect: () => onMarkRead(ids, !message.unread),
      },
      {
        id: 'flag',
        label: message.flagged ? 'Снять флажок' : 'Отметить флажком',
        onSelect: () => onToggleFlag(ids),
      },
      ...CATEGORIES.map((category) => ({
        id: `cat-${category.id}`,
        label: category.name,
        selected: message.categoryIds?.includes(category.id),
        icon: <span className={styles.categoryDot} style={{ backgroundColor: category.color }} aria-hidden />,
        onSelect: () => onToggleCategory(ids, category.id),
      })),
    );

    if (isTrashFolder) {
      items.push(
        { id: 'restore', label: 'Восстановить', icon: <RotateCcw size={14} />, onSelect: () => onRestore(ids) },
        { id: 'delete-forever', label: 'Удалить навсегда', destructive: true, icon: <Trash2 size={14} />, onSelect: () => onDeleteForever(ids) },
      );
    } else {
      for (const target of moveTargets) {
        items.push({
          id: `move-${target.folderId}`,
          label: `Переместить в «${target.label}»`,
          icon: <FolderInput size={14} />,
          onSelect: () => onMoveToFolder(ids, target.folderId),
        });
      }
      items.push({ id: 'delete', label: 'Удалить', destructive: true, icon: <Trash2 size={14} />, onSelect: () => onMoveToFolder(ids, 'trash') });
    }

    return items;
  }

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        {selectedCount > 0 ? (
          <BulkBar
            count={selectedCount}
            isTrashFolder={isTrashFolder}
            moveTargets={moveTargets}
            onClear={onClearSelection}
            onMarkRead={() => onMarkRead(Array.from(selectedIds), false)}
            onMarkUnread={() => onMarkRead(Array.from(selectedIds), true)}
            onFlag={() => onToggleFlag(Array.from(selectedIds))}
            onMoveToFolder={(folderId) => onMoveToFolder(Array.from(selectedIds), folderId)}
            onDelete={() => onMoveToFolder(Array.from(selectedIds), 'trash')}
            onRestore={() => onRestore(Array.from(selectedIds))}
            onDeleteForever={() => onDeleteForever(Array.from(selectedIds))}
          />
        ) : (
          <>
            <div className={styles.headerLeft}>
              <Checkbox label="Выделить" checked={allSelected} onChange={onToggleSelectAll} id="select-all-mail" />
            </div>
            <div className={styles.headerRight}>
              <div className={styles.menuAnchor}>
                <IconButton
                  icon={<ArrowDownAZ size={16} />}
                  aria-label="Сортировать"
                  size="s"
                  active={openMenu === 'sort'}
                  onClick={() => setOpenMenu((prev) => (prev === 'sort' ? null : 'sort'))}
                />
                {openMenu === 'sort' && (
                  <Menu
                    onClose={() => setOpenMenu(null)}
                    items={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
                      id: key,
                      label: SORT_LABELS[key],
                      selected: sortKey === key,
                      onSelect: () => onSortKeyChange(key),
                    }))}
                  />
                )}
              </div>
              <div className={styles.menuAnchor}>
                <IconButton
                  icon={<ListFilter size={16} />}
                  aria-label="Фильтр"
                  size="s"
                  active={openMenu === 'filter' || filterKey !== 'all'}
                  onClick={() => setOpenMenu((prev) => (prev === 'filter' ? null : 'filter'))}
                />
                {openMenu === 'filter' && (
                  <Menu
                    onClose={() => setOpenMenu(null)}
                    items={(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => ({
                      id: key,
                      label: FILTER_LABELS[key],
                      selected: filterKey === key,
                      onSelect: () => onFilterKeyChange(key),
                    }))}
                  />
                )}
              </div>
              <div className={styles.menuAnchor}>
                <IconButton
                  icon={<PanelRight size={16} />}
                  aria-label="Расположение панели чтения"
                  size="s"
                  active={openMenu === 'view'}
                  onClick={() => setOpenMenu((prev) => (prev === 'view' ? null : 'view'))}
                />
                {openMenu === 'view' && (
                  <Menu
                    onClose={() => setOpenMenu(null)}
                    items={(Object.keys(READING_PANE_LABELS) as ReadingPanePosition[]).map((key) => ({
                      id: key,
                      label: READING_PANE_LABELS[key],
                      selected: readingPanePosition === key,
                      onSelect: () => onChangeReadingPanePosition(key),
                    }))}
                  />
                )}
              </div>
              <IconButton icon={<Sparkles size={16} />} aria-label="Цифровой помощник по почте" size="s" onClick={onOpenAssistant} />
              <IconButton icon={<RefreshCw size={16} />} aria-label="Обновить" size="s" onClick={onRefresh} />
            </div>
          </>
        )}
      </div>

      <div className={styles.list} role="list">
        {groups.every((group) => group.items.length === 0) && (
          <div className={styles.empty}>
            <p>Писем не найдено</p>
          </div>
        )}
        {groups.map((group) => (
          <div key={group.label || 'flat'}>
            {group.label && <div className={styles.groupLabel}>{group.label}</div>}
            {group.items.map((message) => (
              <MailListItem
                key={message.id}
                message={message}
                selected={selectedIds.has(message.id)}
                active={activeMessageId === message.id}
                onToggleSelect={() => onToggleSelect(message.id)}
                onOpen={() => onOpenMessage(message.id)}
                onToggleFlag={() => onToggleFlag([message.id])}
                onContextMenu={(x, y) => setContextMenu({ message, x, y })}
              />
            ))}
          </div>
        ))}
      </div>

      {contextMenu && (
        <Menu
          position={{
            x: Math.min(contextMenu.x, window.innerWidth - 232),
            y: Math.min(contextMenu.y, window.innerHeight - 24),
          }}
          onClose={() => setContextMenu(null)}
          items={buildContextMenuItems(contextMenu.message)}
        />
      )}
    </div>
  );
}

function BulkBar({
  count,
  isTrashFolder,
  moveTargets,
  onClear,
  onMarkRead,
  onMarkUnread,
  onFlag,
  onMoveToFolder,
  onDelete,
  onRestore,
  onDeleteForever,
}: {
  count: number;
  isTrashFolder: boolean;
  moveTargets: MoveTarget[];
  onClear: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onFlag: () => void;
  onMoveToFolder: (folderId: string) => void;
  onDelete: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
}) {
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);

  return (
    <div className={styles.bulkBar}>
      <div className={styles.headerLeft}>
        <Checkbox checked label="" onChange={onClear} aria-label="Снять выделение" />
        <span className={styles.bulkCount}>Выбрано: {count}</span>
      </div>
      <div className={styles.headerRight}>
        <IconButton icon={<MailOpen size={16} />} aria-label="Пометить как прочитанные" size="s" onClick={onMarkRead} />
        <IconButton icon={<MailGlyph size={16} />} aria-label="Пометить как непрочитанные" size="s" onClick={onMarkUnread} />
        <IconButton icon={<Flag size={16} />} aria-label="Отметить флажком" size="s" onClick={onFlag} />
        {!isTrashFolder && (
          <div className={styles.menuAnchor}>
            <IconButton
              icon={<FolderInput size={16} />}
              aria-label="Переместить в папку"
              size="s"
              onClick={() => setMoveMenuOpen((v) => !v)}
            />
            {moveMenuOpen && (
              <Menu
                onClose={() => setMoveMenuOpen(false)}
                items={moveTargets.map((target) => ({
                  id: target.folderId,
                  label: target.label,
                  onSelect: () => onMoveToFolder(target.folderId),
                }))}
              />
            )}
          </div>
        )}
        {isTrashFolder ? (
          <>
            <IconButton icon={<RotateCcw size={16} />} aria-label="Восстановить" size="s" onClick={onRestore} />
            <IconButton icon={<Trash2 size={16} />} aria-label="Удалить навсегда" size="s" onClick={onDeleteForever} />
          </>
        ) : (
          <IconButton icon={<Trash2 size={16} />} aria-label="Удалить" size="s" onClick={onDelete} />
        )}
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
  onToggleFlag,
  onContextMenu,
}: {
  message: MailMessage;
  selected: boolean;
  active: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onToggleFlag: () => void;
  onContextMenu: (x: number, y: number) => void;
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
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu(event.clientX, event.clientY);
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
          {message.unread ? (
            <span className={styles.unreadDot} aria-hidden />
          ) : (
            message.online && <span className={styles.onlineDot} aria-hidden />
          )}
          <span className={styles.subject}>{message.subject}</span>
        </div>
        <p className={styles.sender}>{message.senderName}</p>
        <p className={styles.preview}>{message.preview}</p>
      </div>
      <div className={styles.meta}>
        <div className={styles.metaTop}>
          <button
            type="button"
            className={[styles.flagButton, message.flagged ? styles.flagButtonActive : ''].filter(Boolean).join(' ')}
            aria-label={message.flagged ? 'Снять флажок' : 'Отметить флажком'}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFlag();
            }}
          >
            <Flag size={13} fill={message.flagged ? 'currentColor' : 'none'} />
          </button>
          <span className={styles.time}>{formatTime(message.date)}</span>
        </div>
        <div className={styles.metaIcons}>
          {Boolean(message.categoryIds?.length) && <Tag size={12} className={styles.metaIcon} />}
          {Boolean(message.attachments?.length) && <Paperclip size={14} className={styles.metaIcon} />}
          {Boolean(message.threadCount) && <span className={styles.threadBadge}>{message.threadCount}</span>}
        </div>
      </div>
    </div>
  );
}
