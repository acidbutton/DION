import {
  Copy,
  Folder,
  Note as StickyNote,
  Plus,
  SquaresFour as LayoutGrid,
  Trash as Trash2,
} from '@phosphor-icons/react';
import { Button, IconButton, NavigationItem, TextButton } from '../../../components';
import type { BoardFolder } from '../types';
import styles from './BoardsNavSidebar.module.css';

export type BoardsView = 'all' | 'templates' | 'trash';

export interface BoardsNavSidebarProps {
  view: BoardsView;
  onSelectView: (view: BoardsView) => void;
  folders: BoardFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateBoard: () => void;
}

const VIEWS: Array<{ id: BoardsView; label: string; icon: React.ReactNode }> = [
  { id: 'all', label: 'Все доски', icon: <StickyNote size={16} /> },
  { id: 'templates', label: 'Мои шаблоны', icon: <LayoutGrid size={16} /> },
  { id: 'trash', label: 'Корзина', icon: <Trash2 size={16} /> },
];

export function BoardsNavSidebar({
  view,
  onSelectView,
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateBoard,
}: BoardsNavSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Навигация досок">
      <div className={styles.topRow}>
        <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={onCreateBoard} fullWidth>
          Новая доска
        </Button>
        <IconButton icon={<Copy size={16} />} aria-label="Создать из шаблона" variant="subtle" />
      </div>

      <div className={styles.scrollArea}>
        <ul className={styles.list}>
          {VIEWS.map((item) => (
            <li key={item.id}>
              <NavigationItem
                icon={item.icon}
                label={item.label}
                active={view === item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onSelectFolder(null);
                }}
              />
            </li>
          ))}
        </ul>

        <div className={styles.folderSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Мои папки</span>
            <TextButton>Создать</TextButton>
          </div>
          <ul className={styles.list}>
            {folders.map((folder) => (
              <li key={folder.id}>
                <NavigationItem
                  icon={<Folder size={16} />}
                  label={folder.name}
                  active={selectedFolderId === folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
