import { useRef, useState, type ReactNode } from 'react';
import { AlertOctagon, ArrowDown, ChevronDown, Clock, Paperclip, Trash2, X } from 'lucide-react';
import { Button, IconButton, Menu, Modal, RichTextEditor, type MenuItem } from '../../../components';
import type { AttachmentKind, ComposeDraft, Importance, MailAttachment } from '../types';
import styles from './ComposeModal.module.css';

export interface ComposeModalProps {
  initial: ComposeDraft;
  onClose: () => void;
  onSend: (draft: ComposeDraft) => void;
  onSaveDraft: (draft: ComposeDraft) => void;
}

const KIND_BY_EXTENSION: Record<string, AttachmentKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  xls: 'xls',
  xlsx: 'xls',
  csv: 'xls',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
};

function guessKind(fileName: string): AttachmentKind {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return KIND_BY_EXTENSION[ext] ?? 'other';
}

function isEmptyDraft(draft: ComposeDraft): boolean {
  const bodyText = draft.bodyHtml.replace(/<[^>]*>/g, '').trim();
  return !draft.to.trim() && !draft.cc.trim() && !draft.bcc.trim() && !draft.subject.trim() && !bodyText && draft.attachments.length === 0;
}

function addHours(base: Date, hours: number): Date {
  const date = new Date(base);
  date.setHours(date.getHours() + hours);
  return date;
}

function atTime(base: Date, hour: number, minute: number, pushToNextDayIfPast: boolean): Date {
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  if (pushToNextDayIfPast && date.getTime() <= base.getTime()) date.setDate(date.getDate() + 1);
  return date;
}

const IMPORTANCE_META: Record<Importance, { label: string; icon: ReactNode }> = {
  high: { label: 'Высокая важность', icon: <AlertOctagon size={14} /> },
  normal: { label: 'Обычная важность', icon: null },
  low: { label: 'Низкая важность', icon: <ArrowDown size={14} /> },
};

export function ComposeModal({ initial, onClose, onSend, onSaveDraft }: ComposeModalProps) {
  const [draft, setDraft] = useState<ComposeDraft>(initial);
  const [touched, setTouched] = useState(false);
  const [showCc, setShowCc] = useState(Boolean(initial.cc));
  const [showBcc, setShowBcc] = useState(Boolean(initial.bcc));
  const [scheduleMenuOpen, setScheduleMenuOpen] = useState(false);
  const [importanceMenuOpen, setImportanceMenuOpen] = useState(false);
  const [customScheduleOpen, setCustomScheduleOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toIsValid = draft.to.trim().length > 0;

  function updateDraft(patch: Partial<ComposeDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleClose() {
    if (!isEmptyDraft(draft)) onSaveDraft(draft);
    onClose();
  }

  function handleSendNow() {
    setTouched(true);
    if (!toIsValid) return;
    onSend({ ...draft, scheduledAt: null });
  }

  function handleSchedule(date: Date) {
    setTouched(true);
    if (!toIsValid) return;
    onSend({ ...draft, scheduledAt: date });
    setScheduleMenuOpen(false);
    setCustomScheduleOpen(false);
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    const next: MailAttachment[] = Array.from(files).map((file, index) => ({
      id: `att-${Date.now()}-${index}`,
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      kind: guessKind(file.name),
    }));
    updateDraft({ attachments: [...draft.attachments, ...next] });
  }

  function removeAttachment(id: string) {
    updateDraft({ attachments: draft.attachments.filter((a) => a.id !== id) });
  }

  const importanceItems: MenuItem[] = (Object.keys(IMPORTANCE_META) as Importance[]).map((key) => ({
    id: key,
    label: IMPORTANCE_META[key].label,
    icon: IMPORTANCE_META[key].icon,
    selected: draft.importance === key,
    onSelect: () => updateDraft({ importance: key }),
  }));

  const now = new Date();

  return (
    <Modal
      title={draft.scheduledAt ? 'Новое письмо (запланировано)' : 'Новое письмо'}
      onClose={handleClose}
      width={700}
      footer={
        <div className={styles.footer}>
          <div className={styles.sendGroup}>
            <Button variant="primary" onClick={handleSendNow} className={styles.sendButton}>
              Отправить
            </Button>
            <div className={styles.menuAnchor}>
              <button
                type="button"
                className={styles.scheduleCaret}
                aria-label="Запланировать отправку"
                onClick={() => setScheduleMenuOpen((v) => !v)}
              >
                <ChevronDown size={16} />
              </button>
              {scheduleMenuOpen && !customScheduleOpen && (
                <Menu
                  align="left"
                  onClose={() => setScheduleMenuOpen(false)}
                  items={[
                    { id: 'hour', label: 'Через 1 час', icon: <Clock size={14} />, onSelect: () => handleSchedule(addHours(now, 1)) },
                    {
                      id: 'evening',
                      label: 'Сегодня вечером, 18:00',
                      icon: <Clock size={14} />,
                      onSelect: () => handleSchedule(atTime(now, 18, 0, false)),
                    },
                    {
                      id: 'tomorrow',
                      label: 'Завтра утром, 9:00',
                      icon: <Clock size={14} />,
                      onSelect: () => handleSchedule(atTime(now, 9, 0, true)),
                    },
                    { id: 'custom', label: 'Выбрать дату и время…', icon: <Clock size={14} />, onSelect: () => setCustomScheduleOpen(true) },
                  ]}
                />
              )}
              {customScheduleOpen && (
                <div className={styles.customSchedule}>
                  <input
                    type="datetime-local"
                    className={styles.customScheduleInput}
                    min={new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                    onChange={(event) => {
                      if (!event.target.value) return;
                      handleSchedule(new Date(event.target.value));
                    }}
                  />
                  <button type="button" className={styles.customScheduleCancel} onClick={() => setCustomScheduleOpen(false)}>
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>
          {draft.scheduledAt && (
            <span className={styles.scheduleHint}>
              Будет отправлено:{' '}
              {draft.scheduledAt.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className={styles.footerSpacer} />
          <IconButton icon={<Trash2 size={16} />} aria-label="Удалить черновик" onClick={onClose} />
        </div>
      }
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="compose-to">
            Кому
          </label>
          <div className={styles.recipientRow}>
            <input
              id="compose-to"
              className={[styles.input, touched && !toIsValid ? styles.inputError : ''].join(' ')}
              value={draft.to}
              onChange={(event) => updateDraft({ to: event.target.value })}
              placeholder="Введите имя или email"
            />
            <div className={styles.recipientToggles}>
              {!showCc && (
                <button type="button" className={styles.recipientToggle} onClick={() => setShowCc(true)}>
                  Копия
                </button>
              )}
              {!showBcc && (
                <button type="button" className={styles.recipientToggle} onClick={() => setShowBcc(true)}>
                  Скрытая копия
                </button>
              )}
            </div>
          </div>
          {touched && !toIsValid && <span className={styles.error}>Укажите хотя бы одного получателя</span>}
        </div>

        {showCc && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="compose-cc">
              Копия
            </label>
            <input
              id="compose-cc"
              className={styles.input}
              value={draft.cc}
              onChange={(event) => updateDraft({ cc: event.target.value })}
              placeholder="Введите имя или email"
            />
          </div>
        )}

        {showBcc && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="compose-bcc">
              Скрытая копия
            </label>
            <input
              id="compose-bcc"
              className={styles.input}
              value={draft.bcc}
              onChange={(event) => updateDraft({ bcc: event.target.value })}
              placeholder="Введите имя или email"
            />
          </div>
        )}

        <div className={styles.field}>
          <div className={styles.subjectRow}>
            <label className={styles.label} htmlFor="compose-subject">
              Тема
            </label>
            <div className={styles.menuAnchor}>
              <button
                type="button"
                className={[styles.importanceButton, draft.importance !== 'normal' ? styles.importanceButtonActive : ''].join(' ')}
                onClick={() => setImportanceMenuOpen((v) => !v)}
              >
                {IMPORTANCE_META[draft.importance].icon}
                {IMPORTANCE_META[draft.importance].label}
              </button>
              {importanceMenuOpen && <Menu align="right" onClose={() => setImportanceMenuOpen(false)} items={importanceItems} />}
            </div>
          </div>
          <input
            id="compose-subject"
            className={styles.input}
            value={draft.subject}
            onChange={(event) => updateDraft({ subject: event.target.value })}
            placeholder="Тема письма"
          />
        </div>

        <div className={styles.editorField}>
          <RichTextEditor
            initialHtml={draft.bodyHtml}
            onChange={(html) => updateDraft({ bodyHtml: html })}
            onAttachClick={() => fileInputRef.current?.click()}
            placeholder="Текст письма"
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className={styles.hiddenFileInput}
            onChange={(event) => {
              handleFilesSelected(event.target.files);
              event.target.value = '';
            }}
          />
        </div>

        {draft.attachments.length > 0 && (
          <div className={styles.attachments}>
            {draft.attachments.map((attachment) => (
              <span key={attachment.id} className={styles.attachmentChip}>
                <Paperclip size={13} className={styles.attachmentIcon} />
                <span className={styles.attachmentName}>{attachment.name}</span>
                <span className={styles.attachmentSize}>{attachment.sizeKb} КБ</span>
                <button
                  type="button"
                  className={styles.attachmentRemove}
                  aria-label={`Удалить вложение ${attachment.name}`}
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
