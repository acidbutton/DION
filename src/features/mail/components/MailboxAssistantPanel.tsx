import { useEffect, useMemo, useState } from 'react';
import {
  ArrowsClockwise as RefreshCw,
  CalendarCheck as CalendarClock,
  Clock,
  ListChecks,
  Sparkle as Sparkles,
  Warning as AlertTriangle,
  X,
} from '@phosphor-icons/react';
import { Avatar, IconButton } from '../../../components';
import type { MailMessage } from '../types';
import { analyzeMailbox } from '../utils/aiAssistant';
import { formatTime } from '../utils/date';
import styles from './MailboxAssistantPanel.module.css';

export interface MailboxAssistantPanelProps {
  messages: MailMessage[];
  onClose: () => void;
  onSelectMessage: (message: MailMessage) => void;
}

export function MailboxAssistantPanel({ messages, onClose, onSelectMessage }: MailboxAssistantPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Цифровой помощник"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Sparkles size={18} className={styles.headerIcon} />
            <h2 className={styles.title}>Цифровой помощник</h2>
          </div>
          <div className={styles.headerActions}>
            <IconButton icon={<RefreshCw size={16} />} aria-label="Обновить анализ" onClick={() => setRefreshKey((v) => v + 1)} />
            <IconButton icon={<X size={16} />} aria-label="Закрыть" onClick={onClose} />
          </div>
        </div>

        <p className={styles.subtitle}>Обзор входящих и активных писем текущего ящика</p>

        <AssistantBody key={refreshKey} messages={messages} onSelectMessage={onSelectMessage} />
      </div>
    </div>
  );
}

const THINKING_DELAY_MS = 600;

function AssistantBody({
  messages,
  onSelectMessage,
}: {
  messages: MailMessage[];
  onSelectMessage: (message: MailMessage) => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), THINKING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const overview = useMemo(() => analyzeMailbox(messages), [messages]);

  const highlighted = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ message: MailMessage; tag: string }> = [];
    for (const message of overview.escalations) {
      if (seen.has(message.id)) continue;
      seen.add(message.id);
      list.push({ message, tag: 'Эскалация' });
    }
    for (const message of overview.awaitingReply) {
      if (seen.has(message.id)) continue;
      seen.add(message.id);
      list.push({ message, tag: 'Ожидает ответа' });
    }
    return list.slice(0, 5);
  }, [overview]);

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={styles.loadingTile} />
        ))}
      </div>
    );
  }

  const tiles = [
    { id: 'awaiting', label: 'Ожидают ответа', value: overview.awaitingReply.length, icon: <Clock size={18} />, tone: 'awaiting' as const },
    { id: 'escalations', label: 'Эскалации', value: overview.escalations.length, icon: <AlertTriangle size={18} />, tone: 'escalations' as const },
    { id: 'tasks', label: 'Задачи', value: overview.tasks.length, icon: <ListChecks size={18} />, tone: 'tasks' as const },
    { id: 'meetings', label: 'Встречи', value: overview.meetings.length, icon: <CalendarClock size={18} />, tone: 'meetings' as const },
  ];

  return (
    <>
      <div className={styles.tiles}>
        {tiles.map((tile) => (
          <div key={tile.id} className={[styles.tile, styles[`tile_${tile.tone}`]].join(' ')}>
            <div className={styles.tileIcon}>{tile.icon}</div>
            <div className={styles.tileValue}>{tile.value}</div>
            <div className={styles.tileLabel}>{tile.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.highlightSection}>
        <h3 className={styles.highlightTitle}>Требуют внимания</h3>
        {highlighted.length === 0 ? (
          <p className={styles.emptyText}>Ничего срочного — можно выдохнуть.</p>
        ) : (
          <ul className={styles.highlightList}>
            {highlighted.map(({ message, tag }) => (
              <li key={message.id}>
                <button type="button" className={styles.highlightItem} onClick={() => onSelectMessage(message)}>
                  <Avatar name={message.senderName} size={32} />
                  <div className={styles.highlightBody}>
                    <div className={styles.highlightTopRow}>
                      <span className={styles.highlightSender}>{message.senderName}</span>
                      <span className={styles.highlightTime}>{formatTime(message.date)}</span>
                    </div>
                    <span className={styles.highlightSubject}>{message.subject}</span>
                    <span className={[styles.highlightTag, tag === 'Эскалация' ? styles.tagEscalation : styles.tagAwaiting].join(' ')}>
                      {tag}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
