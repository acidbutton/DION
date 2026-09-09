import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '../../../components';
import type { MailMessage } from '../types';
import { analyzeMessage } from '../utils/aiAssistant';
import styles from './AssistantPanel.module.css';

export interface AssistantTriggerProps {
  open: boolean;
  onToggle: () => void;
}

/** The "Цифровой помощник" button — tinted purple to read as the AI entry point. */
export function AssistantTrigger({ open, onToggle }: AssistantTriggerProps) {
  return (
    <Button
      variant="secondary"
      className={styles.trigger}
      leadingIcon={<Sparkles size={16} />}
      trailingIcon={open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      onClick={onToggle}
      aria-expanded={open}
    >
      Цифровой помощник
    </Button>
  );
}

export interface AssistantCardProps {
  message: MailMessage;
  onQuickReply: (text: string) => void;
}

const THINKING_DELAY_MS = 700;

/** The expandable analysis card — mounted by the parent only while open, so the
 * "thinking" delay simulates fresh each time via a plain initial-state + timeout
 * (no setState synchronously inside an effect). */
export function AssistantCard({ message, onQuickReply }: AssistantCardProps) {
  const [loading, setLoading] = useState(true);
  const [doneItems, setDoneItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), THINKING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const insight = analyzeMessage(message);

  return (
    <div className={styles.card}>
      {loading ? (
        <div className={styles.loading} role="status" aria-label="Помощник анализирует письмо">
          <span className={styles.loadingBar} style={{ width: '70%' }} />
          <span className={styles.loadingBar} style={{ width: '90%' }} />
          <span className={styles.loadingBar} style={{ width: '55%' }} />
        </div>
      ) : (
        <>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Суть письма</h3>
            <p className={styles.sectionText}>{insight.summary}</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Что от вас ждут</h3>
            <p className={styles.sectionText}>{insight.expectation}</p>
          </section>

          {insight.actionItems.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Поручения</h3>
              <ul className={styles.checklist}>
                {insight.actionItems.map((item, index) => {
                  const done = doneItems.has(index);
                  return (
                    <li key={index}>
                      <button
                        type="button"
                        className={styles.checkItem}
                        aria-pressed={done}
                        onClick={() =>
                          setDoneItems((prev) => {
                            const next = new Set(prev);
                            if (next.has(index)) next.delete(index);
                            else next.add(index);
                            return next;
                          })
                        }
                      >
                        <span className={[styles.checkbox, done ? styles.checkboxDone : ''].join(' ')}>
                          {done && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span className={[styles.checkText, done ? styles.checkTextDone : ''].join(' ')}>{item}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Быстрые ответы</h3>
            <div className={styles.quickReplies}>
              {insight.quickReplies.map((reply) => (
                <button key={reply} type="button" className={styles.quickReply} onClick={() => onQuickReply(reply)}>
                  {reply}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
