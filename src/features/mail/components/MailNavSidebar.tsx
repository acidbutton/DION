import { useState } from 'react';
import {
  AlertTriangle,
  AtSign,
  ChevronDown,
  Folder,
  FolderClosed,
  Mail as MailIcon,
  Search,
  Send,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { Badge, IconButton, Input, NavigationItem, TextButton } from '../../../components';
import type { CustomFolder, MailAccount, SystemFolderId } from '../types';
import styles from './MailNavSidebar.module.css';

const SYSTEM_FOLDERS: Array<{ id: SystemFolderId; label: string; icon: React.ReactNode }> = [
  { id: 'inbox', label: 'Входящие', icon: <MailIcon size={16} /> },
  { id: 'sent', label: 'Отправленные', icon: <Send size={16} /> },
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
}

export function MailNavSidebar({
  accounts,
  selected,
  onSelectFolder,
  searchQuery,
  onSearchChange,
  onCompose,
}: MailNavSidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Навигация почты">
      <div className={styles.searchBlock}>
        <div className={styles.searchRow}>
          <Input
            leadingIcon={<Search size={20} />}
            placeholder="Поиск по почте"
            aria-label="Поиск по почте"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <IconButton icon={<SquarePen size={16} />} aria-label="Написать в новом окне" variant="subtle" />
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

      <div className={styles.scrollArea}>
        <ul className={styles.folderList}>
          {SYSTEM_FOLDERS.map((folder) => (
            <li key={folder.id}>
              <NavigationItem
                icon={folder.icon}
                label={folder.label}
                active={selected.accountId === accounts[0].id && selected.folderId === folder.id}
                onClick={() => onSelectFolder({ accountId: accounts[0].id, folderId: folder.id })}
                trailing={
                  <Badge
                    count={accounts[0].counts[folder.id] ?? 0}
                    tone={folder.id === 'inbox' ? 'brand' : 'neutral'}
                  />
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
            folders={accounts[0].customFolders}
            accountId={accounts[0].id}
            selected={selected}
            onSelectFolder={onSelectFolder}
          />
        </div>

        {accounts.slice(1).map((account) => (
          <AccountSection
            key={account.id}
            account={account}
            selected={selected}
            onSelectFolder={onSelectFolder}
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
  depth = 1,
}: {
  folders: CustomFolder[];
  accountId: string;
  selected: SelectedFolder;
  onSelectFolder: (selection: SelectedFolder) => void;
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
            />
            {hasChildren && isOpen && (
              <FolderTree
                folders={folder.children!}
                accountId={accountId}
                selected={selected}
                onSelectFolder={onSelectFolder}
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
}: {
  account: MailAccount;
  selected: SelectedFolder;
  onSelectFolder: (selection: SelectedFolder) => void;
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
              trailing={
                <Badge count={account.counts[folder.id] ?? 0} tone={folder.id === 'inbox' ? 'brand' : 'neutral'} />
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
