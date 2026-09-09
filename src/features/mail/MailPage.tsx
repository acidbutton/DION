import { useMemo, useState } from 'react';
import { MailNavSidebar } from './components/MailNavSidebar';
import { MailList } from './components/MailList';
import { MailReadingPane } from './components/MailReadingPane';
import { ComposeModal, type ComposeDraft } from './components/ComposeModal';
import { ACCOUNTS } from './data/accounts';
import { MESSAGES } from './data/messages';
import type { MailMessage } from './types';
import styles from './MailPage.module.css';

interface SelectedFolder {
  accountId: string;
  folderId: string;
}

type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward';

export function MailPage() {
  const [messages, setMessages] = useState<MailMessage[]>(MESSAGES);
  const [selectedFolder, setSelectedFolder] = useState<SelectedFolder>({
    accountId: ACCOUNTS[0].id,
    folderId: 'inbox',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMessageId, setActiveMessageId] = useState<string | null>('m1');
  const [compose, setCompose] = useState<{ mode: ComposeMode; draft: ComposeDraft } | null>(null);

  const folderMessages = useMemo(
    () =>
      messages.filter(
        (message) => message.accountId === selectedFolder.accountId && message.folderId === selectedFolder.folderId,
      ),
    [messages, selectedFolder],
  );

  const visibleMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return folderMessages;
    return folderMessages.filter(
      (message) =>
        message.subject.toLowerCase().includes(query) ||
        message.senderName.toLowerCase().includes(query) ||
        message.preview.toLowerCase().includes(query),
    );
  }, [folderMessages, searchQuery]);

  const activeMessage = messages.find((message) => message.id === activeMessageId) ?? null;

  function handleSelectFolder(selection: SelectedFolder) {
    setSelectedFolder(selection);
    setSelectedIds(new Set());
    const firstInFolder = messages.find(
      (message) => message.accountId === selection.accountId && message.folderId === selection.folderId,
    );
    setActiveMessageId(firstInFolder?.id ?? null);
  }

  function handleOpenMessage(id: string) {
    setActiveMessageId(id);
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, unread: false } : message)));
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
      if (allSelected) return new Set();
      return new Set(visibleMessages.map((message) => message.id));
    });
  }

  function handleRefresh() {
    setSelectedIds(new Set());
  }

  function handleCompose() {
    setCompose({ mode: 'new', draft: { to: '', subject: '', body: '' } });
  }

  function handleReply(message: MailMessage, mode: 'reply' | 'replyAll' | 'forward') {
    const to = mode === 'forward' ? '' : mode === 'replyAll' ? message.recipients.join(', ') : message.senderName;
    const subjectPrefix = mode === 'forward' ? 'Fwd' : 'Re';
    setCompose({
      mode,
      draft: {
        to,
        subject: `${subjectPrefix}: ${message.subject}`,
        body: mode === 'forward' ? `\n\n---\n${message.body}` : '',
      },
    });
  }

  function handleSend(draft: ComposeDraft) {
    const newMessage: MailMessage = {
      id: `sent-${Date.now()}`,
      accountId: selectedFolder.accountId,
      folderId: 'sent',
      senderName: 'Я',
      senderEmail: 'me@dion.vc',
      subject: draft.subject || '(Без темы)',
      preview: draft.body.slice(0, 120),
      body: draft.body,
      recipients: draft.to.split(',').map((value) => value.trim()).filter(Boolean),
      date: new Date(),
      unread: false,
    };
    setMessages((prev) => [newMessage, ...prev]);
    setCompose(null);
  }

  return (
    <div className={styles.page}>
      <MailNavSidebar
        accounts={ACCOUNTS}
        selected={selectedFolder}
        onSelectFolder={handleSelectFolder}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCompose={handleCompose}
      />
      <div className={styles.workArea}>
        <MailList
          messages={visibleMessages}
          selectedIds={selectedIds}
          activeMessageId={activeMessageId}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenMessage={handleOpenMessage}
          onRefresh={handleRefresh}
        />
        <MailReadingPane message={activeMessage} onReply={handleReply} />
      </div>

      {compose && (
        <ComposeModal initial={compose.draft} onClose={() => setCompose(null)} onSend={handleSend} />
      )}
    </div>
  );
}
