import { useState, type ReactNode } from 'react';
import {
  At as AtSign,
  CaretDoubleLeft as ChevronsLeft,
  CaretDoubleRight as ChevronsRight,
  CaretDown as ChevronDown,
  Clock,
  Envelope as MailIcon,
  Folder,
  FolderSimple as FolderClosed,
  MagnifyingGlass as Search,
  NotePencil as SquarePen,
  PaperPlaneTilt as Send,
  Star,
  Trash as Trash2,
  Warning as AlertTriangle,
} from '@phosphor-icons/react';
import { Badge, IconButton, Input, NavigationItem, TextButton } from '../../../components';
import type { CustomFolder, MailAccount, SystemFolderId } from '../types';
import styles from './MailNavSidebar.module.css';

const SYSTEM_FOLDERS: Array<{ id: SystemFolderId; label: string; icon: ReactNode }> = [
  { id: 'inbox', label: 'Входящие', icon: <MailIcon size={16} /> },
  { id: 'sent', label: 'Отправленные', icon: <Send size={16} /> },
  { id: 'outbox', label: 'Исходящие', icon: <Clock size={16} /> },
  { id: 'drafts', label: 'Черновики', icon: <FolderClosed size={16} /> },
  { id: 'spam', label: 'Спам', icon: <AlertTriangle size={16} /> },
  { id: 'trash', label: 'Корзина', icon: <Trash2 size={16} /> },
];

interface SelectedFolder {
  accountId: string;
  folderId: string;
}

export interface MailNavSidebarProps {
  accounts: MailAccount[];
  selected: SelectedFolder;
  onSelectFolder: (selection: SelectedFolder) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCompose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  getBadgeCount: (accountId: string, folderId: SystemFolderId) => number;
  favoriteKeys: Set<string>;
  onToggleFavorite: (accountId: string, folderId: string) => void;
}

function folderKey(accountId: string, folderId: string): string {
  return `${accountId}:${folderId}`;
}

export function MailNavSidebar({
  accounts,
  selected,
  onSelectFolder,
  searchQuery,
  onSearchChange,
  onCompose,
  collapsed,
  onToggleCollapsed,
  getBadgeCount,
  favoriteKeys,
  onToggleFavorite,
}: MailNavSidebarProps) {
  const primary = accounts[0];

  const favorites = accounts.flatMap((account) => {
    const entries: Array<{ key: string; accountId: string; folderId: string; label: string; icon: ReactNode; badge: number }> = [];
    for (const folder of SYSTEM_FOLDERS) {
      const key = folderKey(account.id, folder.id);
      if (favoriteKeys.has(key)) {
        entries.push({ key, accountId: account.id, folderId: folder.id, label: folder.label, icon: folder.icon, badge: getBadgeCount(account.id, folder.id) });
      }
    }
    return entries;
  });

  if (collapsed) {
    return (
      <aside className={styles.sidebarCollapsed} aria-label="Навигация почты (свёрнуто)">
        <IconButton
          icon={<ChevronsRight size={16} />}
          aria-label="Развернуть панель папок"
          variant="ghost"
          onClick={onToggleCollapsed}
        />
        <IconButton icon={<SquarePen size={16} />} aria-label="Написать письмо" variant="primary" onClick={onCompose} />
        <div className={styles.collapsedList}>
          {SYSTEM_FOLDERS.map((folder) => {
            const count = getBadgeCount(primary.id, folder.id);
            const active = selected.accountId === primary.id && selected.folderId === folder.id;
            return (
              <button
                key={folder.id}
                type="button"
                className={[styles.collapsedItem, active ? styles.collapsedItemActive : ''].filter(Boolean).join(' ')}
                title={`${folder.label}${count ? ` (${count})` : ''}`}
                onClick={() => onSelectFolder({ accountId: primary.id, folderId: folder.id })}
              >
                {folder.icon}
                {count > 0 && <span className={styles.collapsedDot} aria-hidden />}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar} aria-label="Навигация почты">
      <div className={styles.topRow}>
        <div className={styles.searchBlock}>
          <div className={styles.searchRow}>
            <Input
              leadingIcon={<Search size={20} />}
              placeholder="Поиск по почте"
              aria-label="Поиск по почте"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className={styles.composeRow}>
            <button type="button" className={styles.composeButton} onClick={onCompose}>
              Написать письмо
            </button>
            <button type="button" className={styles.composeCaret} aria-label="Другие способы создания письма">
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
        <IconButton
          icon={<ChevronsLeft size={16} />}
          aria-label="Свернуть панель папок"
          variant="ghost"
          onClick={onToggleCollapsed}
          className={styles.collapseToggle}
        />
      </div>

      <div className={styles.scrollArea}>
        {favorites.length > 0 && (
          <div className={styles.favorites}>
            <div className={styles.sectionHeader}>
              <Star size={12} className={styles.sectionIcon} aria-hidden />
              <span className={styles.sectionTitle}>Избранное</span>
            </div>
            <ul className={styles.folderList}>
              {favorites.map((entry) => (
                <li key={entry.key}>
                  <NavigationItem
                    icon={entry.icon}
                    label={entry.label}
                    active={selected.accountId === entry.accountId && selected.folderId === entry.folderId}
                    onClick={() => onSelectFolder({ accountId: entry.accountId, folderId: entry.folderId })}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      onToggleFavorite(entry.accountId, entry.folderId);
                    }}
                    trailing={<Badge count={entry.badge} tone={entry.folderId === 'inbox' ? 'brand' : 'neutral'} />}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className={styles.folderList}>
          {SYSTEM_FOLDERS.map((folder) => (
            <li key={folder.id}>
              <NavigationItem
                icon={folder.icon}
                label={folder.label}
                active={selected.accountId === primary.id && selected.folderId === folder.id}
                onClick={() => onSelectFolder({ accountId: primary.id, folderId: folder.id })}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onToggleFavorite(primary.id, folder.id);
                }}
                title="ПКМ — добавить/убрать из избранного"
                trailing={
                  <Badge count={getBadgeCount(primary.id, folder.id)} tone={folder.id === 'inbox' ? 'brand' : 'neutral'} />
                }
              />
            </li>
          ))}
        </ul>

        <div className={styles.customFolders}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Мои папки</span>
            <TextButton>Создать</TextButton>
          </div>
          <FolderTree
            folders={primary.customFolders}
            accountId={primary.id}
            selected={selected}
            onSelectFolder={onSelectFolder}
            onToggleFavorite={onToggleFavorite}
          />
        </div>

        {accounts.slice(1).map((account) => (
          <AccountSection
            key={account.id}
            account={account}
            selected={selected}
            onSelectFolder={onSelectFolder}
            getBadgeCount={getBadgeCount}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </aside>
  );
}

function FolderTree({
  folders,
  accountId,
  selected,
  onSelectFolder,
  onToggleFavorite,
  depth = 1,
}: {
  folders: CustomFolder[];
  accountId: string;
  selected: SelectedFolder;
  onSelectFolder: (selection: SelectedFolder) => void;
  onToggleFavorite: (accountId: string, folderId: string) => void;
  depth?: number;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <ul className={styles.folderTree}>
      {folders.map((folder) => {
        const hasChildren = Boolean(folder.children?.length);
        const isOpen = !collapsed[folder.id];

        return (
          <li key={folder.id}>
            <NavigationItem
              icon={
                hasChildren ? (
                  <ChevronDown
                    size={16}
                    style={{ transform: isOpen ? undefined : 'rotate(-90deg)', transition: 'transform 0.12s ease' }}
                  />
                ) : (
                  <Folder size={16} />
                )
              }
              label={folder.name}
              indent={(depth - 1) as 0 | 1 | 2}
              active={selected.accountId === accountId && selected.folderId === folder.id}
              onClick={() => {
                if (hasChildren) {
                  setCollapsed((prev) => ({ ...prev, [folder.id]: !prev[folder.id] }));
                } else {
                  onSelectFolder({ accountId, folderId: folder.id });
                }
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                if (!hasChildren) onToggleFavorite(accountId, folder.id);
              }}
            />
            {hasChildren && isOpen && (
              <FolderTree
                folders={folder.children!}
                accountId={accountId}
                selected={selected}
                onSelectFolder={onSelectFolder}
                onToggleFavorite={onToggleFavorite}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function AccountSection({
  account,
  selected,
  onSelectFolder,
  getBadgeCount,
  onToggleFavorite,
}: {
  account: MailAccount;
  selected: SelectedFolder;
  onSelectFolder: (selection: SelectedFolder) => void;
  getBadgeCount: (accountId: string, folderId: SystemFolderId) => number;
  onToggleFavorite: (accountId: string, folderId: string) => void;
}) {
  return (
    <div className={styles.accountSection}>
      <div className={styles.sectionHeader}>
        <AtSign size={16} className={styles.sectionIcon} aria-hidden />
        <span className={styles.sectionTitle} title={account.email ?? undefined}>
          {account.email}
        </span>
      </div>
      <ul className={styles.folderList}>
        {SYSTEM_FOLDERS.map((folder) => (
          <li key={folder.id}>
            <NavigationItem
              icon={folder.icon}
              label={folder.label}
              active={selected.accountId === account.id && selected.folderId === folder.id}
              onClick={() => onSelectFolder({ accountId: account.id, folderId: folder.id })}
              onContextMenu={(event) => {
                event.preventDefault();
                onToggleFavorite(account.id, folder.id);
              }}
              trailing={
                <Badge count={getBadgeCount(account.id, folder.id)} tone={folder.id === 'inbox' ? 'brand' : 'neutral'} />
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
