import { useCallback, useEffect, useMemo, useState } from 'react';
import { List as MenuIcon } from '@phosphor-icons/react';
import { IconButton, Modal, ResizeHandle, ToastProvider, useToast } from '../../components';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { MailNavSidebar } from './components/MailNavSidebar';
import { MailList, type MoveTarget } from './components/MailList';
import { MailReadingPane } from './components/MailReadingPane';
import { MailboxAssistantPanel } from './components/MailboxAssistantPanel';
import { ComposeModal } from './components/ComposeModal';
import { ACCOUNTS } from './data/accounts';
import { MESSAGES } from './data/messages';
import { EMPTY_DRAFT, type ComposeDraft, type CustomFolder, type FilterKey, type MailAttachment, type MailMessage, type ReadingPanePosition, type SortKey, type SystemFolderId } from './types';
import { badgeCount, countUnreadByFolder } from './utils/counts';
import styles from './MailPage.module.css';

interface SelectedFolder {
  accountId: string;
  folderId: string;
}

type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward';

const MOBILE_QUERY = '(max-width: 760px)';
const LIST_WIDTH_MIN = 280;
const LIST_WIDTH_MAX = 560;
const INITIAL_UNREAD = countUnreadByFolder(MESSAGES);

const SYSTEM_FOLDER_LABELS: Record<SystemFolderId, string> = {
  inbox: 'Входящие',
  sent: 'Отправленные',
  outbox: 'Исходящие',
  drafts: 'Черновики',
  spam: 'Спам',
  trash: 'Корзина',
};

function flattenFolders(folders: CustomFolder[]): CustomFolder[] {
  return folders.flatMap((folder) => [folder, ...(folder.children ? flattenFolders(folder.children) : [])]);
}

export function MailPage() {
  return (
    <ToastProvider>
      <MailPageContent />
    </ToastProvider>
  );
}

function MailPageContent() {
  const { showToast } = useToast();
  const isCompact = useMediaQuery(MOBILE_QUERY);

  const [messages, setMessages] = useState<MailMessage[]>(MESSAGES);
  const [selectedFolder, setSelectedFolder] = useState<SelectedFolder>({
    accountId: ACCOUNTS[0].id,
    folderId: 'inbox',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMessageId, setActiveMessageId] = useState<string | null>('m1');
  const [compose, setCompose] = useState<{ mode: ComposeMode; draft: ComposeDraft } | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('date-desc');
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [listWidth, setListWidth] = useState(360);
  const [readingPanePosition, setReadingPanePosition] = useState<ReadingPanePosition>('right');
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(() => new Set(['primary:inbox']));
  const [assistantOpen, setAssistantOpen] = useState(false);

  const [mobilePane, setMobilePane] = useState<'list' | 'reading'>('list');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const liveUnread = useMemo(() => countUnreadByFolder(messages), [messages]);
  const getBadgeCount = useCallback(
    (accountId: string, folderId: SystemFolderId) => {
      const account = ACCOUNTS.find((a) => a.id === accountId);
      if (!account) return 0;
      return badgeCount(account.counts, folderId, accountId, liveUnread, INITIAL_UNREAD);
    },
    [liveUnread],
  );

  const folderMessages = useMemo(
    () =>
      messages.filter(
        (message) => message.accountId === selectedFolder.accountId && message.folderId === selectedFolder.folderId,
      ),
    [messages, selectedFolder],
  );

  const filteredMessages = useMemo(() => {
    switch (filterKey) {
      case 'unread':
        return folderMessages.filter((m) => m.unread);
      case 'flagged':
        return folderMessages.filter((m) => m.flagged);
      case 'attachments':
        return folderMessages.filter((m) => Boolean(m.attachments?.length));
      default:
        return folderMessages;
    }
  }, [folderMessages, filterKey]);

  const visibleMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return filteredMessages;
    return filteredMessages.filter(
      (message) =>
        message.subject.toLowerCase().includes(query) ||
        message.senderName.toLowerCase().includes(query) ||
        message.preview.toLowerCase().includes(query),
    );
  }, [filteredMessages, searchQuery]);

  const activeMessage = messages.find((message) => message.id === activeMessageId) ?? null;
  const isTrashFolder = selectedFolder.folderId === 'trash';
  const isOutboxFolder = selectedFolder.folderId === 'outbox';

  const moveTargets: MoveTarget[] = useMemo(() => {
    const account = ACCOUNTS.find((a) => a.id === selectedFolder.accountId);
    if (!account) return [];
    const targets: MoveTarget[] = [];
    (Object.keys(SYSTEM_FOLDER_LABELS) as SystemFolderId[]).forEach((id) => {
      if (id !== selectedFolder.folderId && id !== 'trash' && id !== 'outbox') {
        targets.push({ folderId: id, label: SYSTEM_FOLDER_LABELS[id] });
      }
    });
    for (const folder of flattenFolders(account.customFolders)) {
      if (folder.id !== selectedFolder.folderId) targets.push({ folderId: folder.id, label: folder.name });
    }
    return targets;
  }, [selectedFolder]);

  const assistantScopeMessages = useMemo(
    () => messages.filter((m) => m.accountId === selectedFolder.accountId && m.folderId !== 'trash' && m.folderId !== 'spam'),
    [messages, selectedFolder.accountId],
  );

  const handleMoveToFolder = useCallback(
    (ids: string[], folderId: string) => {
      const movedFrom = new Map<string, string>();
      setMessages((prev) =>
        prev.map((m) => {
          if (!ids.includes(m.id)) return m;
          movedFrom.set(m.id, m.folderId);
          return { ...m, folderId, previousFolderId: folderId === 'trash' ? m.folderId : m.previousFolderId };
        }),
      );
      setSelectedIds(new Set());
      setActiveMessageId((current) => (current && ids.includes(current) ? null : current));

      const label = folderId === 'trash' ? 'в корзину' : `в «${moveTargets.find((t) => t.folderId === folderId)?.label ?? folderId}»`;
      showToast(`${ids.length > 1 ? `Писем перемещено: ${ids.length}` : 'Письмо перемещено'} ${label}.`, {
        label: 'Отменить',
        onAction: () => {
          setMessages((prev) => prev.map((m) => (movedFrom.has(m.id) ? { ...m, folderId: movedFrom.get(m.id)! } : m)));
        },
      });
    },
    [moveTargets, showToast],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (isTyping || compose) return;

      if (event.key === 'Escape') {
        if (assistantOpen) setAssistantOpen(false);
        else if (mobileNavOpen) setMobileNavOpen(false);
        else if (selectedIds.size > 0) setSelectedIds(new Set());
        return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && !isTrashFolder) {
        const ids = selectedIds.size > 0 ? Array.from(selectedIds) : activeMessageId ? [activeMessageId] : [];
        if (ids.length > 0) {
          event.preventDefault();
          handleMoveToFolder(ids, 'trash');
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, activeMessageId, isTrashFolder, assistantOpen, mobileNavOpen, compose, handleMoveToFolder]);

  function handleSelectFolder(selection: SelectedFolder) {
    setSelectedFolder(selection);
    setSelectedIds(new Set());
    setFilterKey('all');
    const firstInFolder = messages.find(
      (message) => message.accountId === selection.accountId && message.folderId === selection.folderId,
    );
    setActiveMessageId(firstInFolder?.id ?? null);
    setMobileNavOpen(false);
    setMobilePane('list');
  }

  function handleOpenMessage(id: string) {
    setActiveMessageId(id);
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, unread: false } : message)));
    if (isCompact) setMobilePane('reading');
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleSelectAll() {
    setSelectedIds((prev) => {
      const allSelected = visibleMessages.length > 0 && visibleMessages.every((message) => prev.has(message.id));
      return allSelected ? new Set() : new Set(visibleMessages.map((message) => message.id));
    });
  }

  function handleClearSelection() {
    setSelectedIds(new Set());
  }

  function handleRefresh() {
    setSelectedIds(new Set());
    showToast('Список писем обновлён.');
  }

  function handleToggleFlag(ids: string[]) {
    setMessages((prev) => {
      const shouldFlag = ids.some((id) => !prev.find((m) => m.id === id)?.flagged);
      return prev.map((m) => (ids.includes(m.id) ? { ...m, flagged: shouldFlag } : m));
    });
  }

  function handleMarkRead(ids: string[], unread: boolean) {
    setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, unread } : m)));
  }

  function handleToggleCategory(ids: string[], categoryId: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (!ids.includes(m.id)) return m;
        const has = m.categoryIds?.includes(categoryId);
        const categoryIds = has ? m.categoryIds!.filter((id) => id !== categoryId) : [...(m.categoryIds ?? []), categoryId];
        return { ...m, categoryIds };
      }),
    );
  }

  function handleRestore(ids: string[]) {
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, folderId: m.previousFolderId ?? 'inbox', previousFolderId: undefined } : m)),
    );
    setSelectedIds(new Set());
    showToast(ids.length > 1 ? `Писем восстановлено: ${ids.length}.` : 'Письмо восстановлено.');
  }

  function handleDeleteForever(ids: string[]) {
    setMessages((prev) => prev.filter((m) => !ids.includes(m.id)));
    setSelectedIds(new Set());
    if (ids.includes(activeMessageId ?? '')) setActiveMessageId(null);
    showToast(ids.length > 1 ? `Писем удалено безвозвратно: ${ids.length}.` : 'Письмо удалено безвозвратно.');
  }

  function handleToggleFavorite(accountId: string, folderId: string) {
    const key = `${accountId}:${folderId}`;
    setFavoriteKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleAttachmentClick(attachment: MailAttachment) {
    showToast(`«${attachment.name}»: скачивание вложений недоступно в этом прототипе.`);
  }

  function handleCompose() {
    setCompose({ mode: 'new', draft: EMPTY_DRAFT });
    setMobileNavOpen(false);
  }

  function handleReply(message: MailMessage, mode: 'reply' | 'replyAll' | 'forward') {
    const to = mode === 'forward' ? [] : mode === 'replyAll' ? message.recipients : [message.senderName];
    const subjectPrefix = mode === 'forward' ? 'Fwd' : 'Re';
    const quotedBody =
      mode === 'forward'
        ? `<p></p><p>---------- Пересланное сообщение ----------</p><p>${message.bodyHtml ?? message.body}</p>`
        : '';
    setCompose({
      mode,
      draft: { ...EMPTY_DRAFT, to, subject: `${subjectPrefix}: ${message.subject}`, bodyHtml: quotedBody },
    });
  }

  function handleQuickReply(message: MailMessage, text: string) {
    setCompose({
      mode: 'reply',
      draft: { ...EMPTY_DRAFT, to: [message.senderName], subject: `Re: ${message.subject}`, bodyHtml: `<p>${text}</p>` },
    });
  }

  function buildMessageFromDraft(draft: ComposeDraft, folderId: string): MailMessage {
    const plainText = draft.bodyHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      id: `msg-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      accountId: selectedFolder.accountId,
      folderId,
      senderName: 'Я',
      senderEmail: 'me@dion.vc',
      subject: draft.subject || '(Без темы)',
      preview: plainText.slice(0, 140),
      body: plainText,
      bodyHtml: draft.bodyHtml,
      recipients: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      date: new Date(),
      unread: false,
      attachments: draft.attachments,
      importance: draft.importance,
      scheduledAt: draft.scheduledAt ?? undefined,
    };
  }

  function handleSend(draft: ComposeDraft) {
    if (draft.scheduledAt) {
      const message = buildMessageFromDraft(draft, 'outbox');
      setMessages((prev) => [message, ...prev]);
      setCompose(null);
      showToast(
        `Письмо запланировано на ${draft.scheduledAt.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.`,
      );
      return;
    }
    const message = buildMessageFromDraft(draft, 'sent');
    setMessages((prev) => [message, ...prev]);
    setCompose(null);
    showToast('Письмо отправлено.');
  }

  function handleSaveDraft(draft: ComposeDraft) {
    const message = buildMessageFromDraft(draft, 'drafts');
    setMessages((prev) => [message, ...prev]);
    showToast('Письмо сохранено в черновиках.');
  }

  function handleSendOutboxNow(ids: string[]) {
    setMessages((prev) => prev.map((m) => (ids.includes(m.id) ? { ...m, folderId: 'sent', scheduledAt: undefined } : m)));
    setSelectedIds(new Set());
    showToast(ids.length > 1 ? `Писем отправлено: ${ids.length}.` : 'Письмо отправлено.');
  }

  function handleAssistantSelectMessage(message: MailMessage) {
    setSelectedFolder({ accountId: message.accountId, folderId: message.folderId });
    setActiveMessageId(message.id);
    setAssistantOpen(false);
    if (isCompact) setMobilePane('reading');
  }

  function handleListResize(deltaPx: number) {
    setListWidth((prev) => Math.min(LIST_WIDTH_MAX, Math.max(LIST_WIDTH_MIN, prev + deltaPx)));
  }

  function renderReadingPane(hideHeader = false) {
    return (
      <MailReadingPane
        message={activeMessage}
        onReply={handleReply}
        onQuickReply={handleQuickReply}
        onToggleFlag={handleToggleFlag}
        onMarkRead={handleMarkRead}
        onToggleCategory={handleToggleCategory}
        onMoveToFolder={handleMoveToFolder}
        onDeleteForever={handleDeleteForever}
        onRestore={handleRestore}
        isTrashFolder={isTrashFolder}
        isOutboxFolder={isOutboxFolder}
        onSendNow={handleSendOutboxNow}
        moveTargets={moveTargets}
        onAttachmentClick={handleAttachmentClick}
        onBack={isCompact ? () => setMobilePane('list') : undefined}
        hideHeader={hideHeader}
      />
    );
  }
  const readingPaneNode = renderReadingPane();

  const listNode = (
    <MailList
      messages={visibleMessages}
      selectedIds={selectedIds}
      activeMessageId={activeMessageId}
      onToggleSelect={handleToggleSelect}
      onToggleSelectAll={handleToggleSelectAll}
      onClearSelection={handleClearSelection}
      onOpenMessage={handleOpenMessage}
      onRefresh={handleRefresh}
      sortKey={sortKey}
      onSortKeyChange={setSortKey}
      filterKey={filterKey}
      onFilterKeyChange={setFilterKey}
      onToggleFlag={handleToggleFlag}
      onReply={handleReply}
      onMarkRead={handleMarkRead}
      onMoveToFolder={handleMoveToFolder}
      onDeleteForever={handleDeleteForever}
      onRestore={handleRestore}
      isTrashFolder={isTrashFolder}
      isOutboxFolder={isOutboxFolder}
      onSendNow={handleSendOutboxNow}
      moveTargets={moveTargets}
      onOpenAssistant={() => setAssistantOpen(true)}
      readingPanePosition={readingPanePosition}
      onChangeReadingPanePosition={setReadingPanePosition}
      onToggleCategory={handleToggleCategory}
    />
  );

  function renderNav(collapsed: boolean) {
    return (
      <MailNavSidebar
        accounts={ACCOUNTS}
        selected={selectedFolder}
        onSelectFolder={handleSelectFolder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCompose={handleCompose}
        collapsed={collapsed}
        onToggleCollapsed={() => setNavCollapsed((v) => !v)}
        getBadgeCount={getBadgeCount}
        favoriteKeys={favoriteKeys}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  }

  if (isCompact) {
    return (
      <div className={styles.pageMobile}>
        <div className={styles.mobileHeader}>
          <IconButton icon={<MenuIcon size={18} />} aria-label="Открыть папки" onClick={() => setMobileNavOpen(true)} />
          <span className={styles.mobileTitle}>{SYSTEM_FOLDER_LABELS[selectedFolder.folderId as SystemFolderId] ?? 'Почта'}</span>
        </div>

        <div className={styles.mobileBody}>
          {mobilePane === 'list' ? listNode : readingPaneNode}
        </div>

        {mobileNavOpen && (
          <div className={styles.mobileDrawerOverlay} onMouseDown={() => setMobileNavOpen(false)}>
            <div className={styles.mobileDrawer} onMouseDown={(e) => e.stopPropagation()}>
              {renderNav(false)}
            </div>
          </div>
        )}

        {assistantOpen && (
          <MailboxAssistantPanel
            messages={assistantScopeMessages}
            onClose={() => setAssistantOpen(false)}
            onSelectMessage={handleAssistantSelectMessage}
          />
        )}

        {compose && <ComposeModal initial={compose.draft} onClose={() => setCompose(null)} onSend={handleSend} onSaveDraft={handleSaveDraft} />}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {renderNav(navCollapsed)}
      <div className={styles.workArea}>
        {readingPanePosition === 'bottom' ? (
          <div className={styles.stackedArea}>
            <div className={styles.stackedList}>{listNode}</div>
            <div className={styles.stackedReading}>{readingPaneNode}</div>
          </div>
        ) : (
          <>
            <div className={styles.listColumn} style={{ width: listWidth }}>
              {listNode}
            </div>
            <ResizeHandle onResize={handleListResize} aria-label="Изменить ширину списка писем" />
            {readingPanePosition === 'right' && readingPaneNode}
            {readingPanePosition === 'hidden' && (
              <div className={styles.hiddenPaneNotice}>
                <p>Панель чтения скрыта. Щёлкните письмо в списке, чтобы открыть его в отдельном окне.</p>
              </div>
            )}
          </>
        )}
      </div>

      {assistantOpen && (
        <MailboxAssistantPanel
          messages={assistantScopeMessages}
          onClose={() => setAssistantOpen(false)}
          onSelectMessage={handleAssistantSelectMessage}
        />
      )}

      {compose && <ComposeModal initial={compose.draft} onClose={() => setCompose(null)} onSend={handleSend} onSaveDraft={handleSaveDraft} />}

      {readingPanePosition === 'hidden' && activeMessage && (
        <Modal title={activeMessage.subject} onClose={() => setActiveMessageId(null)} width={720}>
          {renderReadingPane(true)}
        </Modal>
      )}
    </div>
  );
}
