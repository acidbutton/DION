import { useState } from 'react';
import { Modal, Button } from '../../../components';
import styles from './ComposeModal.module.css';

export interface ComposeDraft {
  to: string;
  subject: string;
  body: string;
}

export interface ComposeModalProps {
  initial: ComposeDraft;
  onClose: () => void;
  onSend: (draft: ComposeDraft) => void;
}

export function ComposeModal({ initial, onClose, onSend }: ComposeModalProps) {
  const [draft, setDraft] = useState<ComposeDraft>(initial);
  const [touched, setTouched] = useState(false);

  const toIsValid = draft.to.trim().length > 0;

  function handleSend() {
    setTouched(true);
    if (!toIsValid) return;
    onSend(draft);
  }

  return (
    <Modal
      title="Новое письмо"
      onClose={onClose}
      width={640}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSend}>
            Отправить
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="compose-to">
            Кому
          </label>
          <input
            id="compose-to"
            className={[styles.input, touched && !toIsValid ? styles.inputError : ''].join(' ')}
            value={draft.to}
            onChange={(event) => setDraft((prev) => ({ ...prev, to: event.target.value }))}
            placeholder="Введите имя или email"
          />
          {touched && !toIsValid && <span className={styles.error}>Укажите хотя бы одного получателя</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="compose-subject">
            Тема
          </label>
          <input
            id="compose-subject"
            className={styles.input}
            value={draft.subject}
            onChange={(event) => setDraft((prev) => ({ ...prev, subject: event.target.value }))}
            placeholder="Тема письма"
          />
        </div>
        <div className={styles.field}>
          <textarea
            className={styles.textarea}
            value={draft.body}
            onChange={(event) => setDraft((prev) => ({ ...prev, body: event.target.value }))}
            placeholder="Текст письма"
            rows={10}
          />
        </div>
      </div>
    </Modal>
  );
}
