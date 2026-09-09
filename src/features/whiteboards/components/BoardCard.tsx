import { useState } from 'react';
import {
  Copy,
  DotsThreeVertical as MoreVertical,
  PencilSimple as Pencil,
  Trash as Trash2,
} from '@phosphor-icons/react';
import { IconButton, Menu } from '../../../components';
import type { Board } from '../types';
import { formatShortDate } from '../utils/formatDate';
import styles from './BoardCard.module.css';

export interface BoardCardProps {
  board: Board;
  isRenaming: boolean;
  onOpen: (board: Board) => void;
  onStartRename: (board: Board) => void;
  onSubmitRename: (board: Board, title: string) => void;
  onCancelRename: () => void;
  onDuplicate: (board: Board) => void;
  onDelete: (board: Board) => void;
}

const THUMBNAIL_COUNT = 6;

export function BoardCard({
  board,
  isRenaming,
  onOpen,
  onStartRename,
  onSubmitRename,
  onCancelRename,
  onDuplicate,
  onDelete,
}: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.card}>
      <button type="button" className={styles.thumbnailButton} onClick={() => onOpen(board)}>
        <div className={[styles.thumbnail, styles[`thumb${board.thumbnail % THUMBNAIL_COUNT}`]].join(' ')} />
      </button>
      <div className={styles.meta}>
        <div className={styles.metaTop}>
          <span className={styles.ownerTag}>{board.ownerLabel}</span>
          <span className={styles.menuButton}>
            <IconButton
              icon={<MoreVertical size={16} />}
              aria-label={`Действия с доской «${board.title}»`}
              size="s"
              onClick={() => setMenuOpen((value) => !value)}
            />
            {menuOpen && (
              <Menu
                onClose={() => setMenuOpen(false)}
                items={[
                  {
                    id: 'rename',
                    label: 'Переименовать',
                    icon: <Pencil size={14} />,
                    onSelect: () => onStartRename(board),
                  },
                  { id: 'duplicate', label: 'Дублировать', icon: <Copy size={14} />, onSelect: () => onDuplicate(board) },
                  {
                    id: 'delete',
                    label: 'Удалить',
                    icon: <Trash2 size={14} />,
                    destructive: true,
                    onSelect: () => onDelete(board),
                  },
                ]}
              />
            )}
          </span>
        </div>
        {isRenaming ? (
          <RenameInput
            initialValue={board.title}
            onSubmit={(title) => onSubmitRename(board, title.trim() || board.title)}
            onCancel={onCancelRename}
          />
        ) : (
          <button type="button" className={styles.title} onClick={() => onOpen(board)}>
            {board.title}
          </button>
        )}
        <p className={styles.date}>Изменена {formatShortDate(board.modifiedAt)}</p>
      </div>
    </div>
  );
}

function RenameInput({
  initialValue,
  onSubmit,
  onCancel,
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <input
      className={styles.titleInput}
      autoFocus
      onFocus={(event) => event.target.select()}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => onSubmit(value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSubmit(value);
        if (event.key === 'Escape') onCancel();
      }}
    />
  );
}
