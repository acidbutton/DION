import { useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Menu, Modal } from '../../components';
import { BoardsNavSidebar, type BoardsView } from './components/BoardsNavSidebar';
import { BoardCard } from './components/BoardCard';
import { BOARDS } from './data/boards';
import { BOARD_FOLDERS } from './data/folders';
import type { Board, BoardOwnership } from './types';
import styles from './WhiteboardsPage.module.css';

const OWNERSHIP_LABELS: Record<'all' | BoardOwnership, string> = {
  all: 'Все доски',
  me: 'Созданные мной',
  shared: 'Общие со мной',
};

let idCounter = 1;

export function WhiteboardsPage() {
  const [boards, setBoards] = useState<Board[]>(BOARDS);
  const [view, setView] = useState<BoardsView>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | BoardOwnership>('me');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [openedBoard, setOpenedBoard] = useState<Board | null>(null);

  const visibleBoards = useMemo(() => {
    if (view === 'trash') return [];
    if (view === 'templates') return [];
    return boards.filter((board) => {
      if (selectedFolderId && board.folderId !== selectedFolderId) return false;
      if (ownershipFilter !== 'all' && board.ownership !== ownershipFilter) return false;
      return true;
    });
  }, [boards, view, selectedFolderId, ownershipFilter]);

  function handleCreateBoard() {
    const id = `new-${idCounter++}`;
    const board: Board = {
      id,
      title: 'Новая доска',
      ownership: 'me',
      ownerLabel: 'Владелец',
      modifiedAt: new Date(),
      thumbnail: idCounter % 6,
      folderId: selectedFolderId ?? undefined,
    };
    setBoards((prev) => [board, ...prev]);
    setView('all');
    setRenamingId(id);
  }

  function handleDuplicate(board: Board) {
    const id = `dup-${idCounter++}`;
    setBoards((prev) => [
      { ...board, id, title: `${board.title} (копия)`, modifiedAt: new Date() },
      ...prev,
    ]);
  }

  function handleDelete(board: Board) {
    setBoards((prev) => prev.filter((item) => item.id !== board.id));
  }

  function handleSubmitRename(board: Board, title: string) {
    setBoards((prev) => prev.map((item) => (item.id === board.id ? { ...item, title, modifiedAt: new Date() } : item)));
    setRenamingId(null);
  }

  return (
    <div className={styles.page}>
      <BoardsNavSidebar
        view={view}
        onSelectView={setView}
        folders={BOARD_FOLDERS}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateBoard={handleCreateBoard}
      />

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.filter}>
            <button type="button" className={styles.filterButton} onClick={() => setFilterMenuOpen((v) => !v)}>
              {OWNERSHIP_LABELS[ownershipFilter]}
            </button>
            {ownershipFilter !== 'all' && (
              <button
                type="button"
                className={styles.filterClear}
                aria-label="Сбросить фильтр"
                onClick={() => setOwnershipFilter('all')}
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              className={styles.filterChevron}
              aria-label="Открыть фильтр"
              onClick={() => setFilterMenuOpen((v) => !v)}
            >
              <ChevronDown size={16} />
            </button>
            {filterMenuOpen && (
              <Menu
                align="left"
                onClose={() => setFilterMenuOpen(false)}
                items={(Object.keys(OWNERSHIP_LABELS) as Array<'all' | BoardOwnership>).map((key) => ({
                  id: key,
                  label: OWNERSHIP_LABELS[key],
                  onSelect: () => setOwnershipFilter(key),
                }))}
              />
            )}
          </div>
        </div>

        <div className={styles.grid}>
          {visibleBoards.length === 0 && (
            <div className={styles.empty}>
              <p>
                {view === 'trash'
                  ? 'Корзина пуста'
                  : view === 'templates'
                    ? 'У вас пока нет шаблонов'
                    : 'Здесь пока нет досок'}
              </p>
            </div>
          )}
          {visibleBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              isRenaming={renamingId === board.id}
              onOpen={setOpenedBoard}
              onStartRename={(b) => setRenamingId(b.id)}
              onSubmitRename={handleSubmitRename}
              onCancelRename={() => setRenamingId(null)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {openedBoard && (
        <Modal title={openedBoard.title} onClose={() => setOpenedBoard(null)} width={480}>
          <p className={styles.boardPreviewText}>
            Открытие холста доски не входит в этот прототип — здесь реализован экран со списком досок, как в
            переданном макете Figma.
          </p>
        </Modal>
      )}
    </div>
  );
}
