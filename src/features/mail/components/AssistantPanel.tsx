import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '../../../components';
import type { MailMessage } from '../types';
import { analyzeMessage } from '../utils/aiAssistant';
import styles from './AssistantPanel.module.css';

export interface AssistantPanelProps {
  message: MailMessage;
  onQuickReply: (text: string) => void;
}

const THINKING_DELAY_MS = 700;

export function AssistantPanel({ message, onQuickReply }: AssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doneItems, setDoneItems] = useState<Set<number>>(new Set());

  const insight = analyzeMessage(message);

  function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setTimeout(() => setLoading(false), THINKING_DELAY_MS);
  }

  return (
    <div className={styles.wrapper}>
      <Button
        variant="secondary"
        leadingIcon={<Sparkles size={16} />}
        trailingIcon={open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        onClick={handleToggle}
        aria-expanded={open}
      >
        Цифровой помощник
      </Button>

      {open && (
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
                            <span className={[styles.checkText, done ? styles.checkTextDone : ''].join(' ')}>
                              {item}
                            </span>
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
      )}
    </div>
  );
}
