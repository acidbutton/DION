import { useRef, useState, type KeyboardEvent } from 'react';
import { X } from '@phosphor-icons/react';
import { Avatar } from '../../../components';
import { CONTACTS } from '../data/contacts';
import styles from './RecipientInput.module.css';

export interface RecipientInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: boolean;
}

export function RecipientInput({ id, value, onChange, placeholder, error }: RecipientInputProps) {
  const [draftText, setDraftText] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = draftText.trim()
    ? CONTACTS.filter(
        (contact) =>
          !value.includes(contact.name) &&
          (contact.name.toLowerCase().includes(draftText.trim().toLowerCase()) ||
            contact.email.toLowerCase().includes(draftText.trim().toLowerCase())),
      ).slice(0, 6)
    : [];

  function commitDraft() {
    const name = draftText.trim();
    if (!name) return;
    if (!value.includes(name)) onChange([...value, name]);
    setDraftText('');
    setSuggestionsOpen(false);
  }

  function addContact(name: string) {
    if (!value.includes(name)) onChange([...value, name]);
    setDraftText('');
    setSuggestionsOpen(false);
    inputRef.current?.focus();
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitDraft();
    } else if (event.key === 'Backspace' && draftText === '' && value.length > 0) {
      removeAt(value.length - 1);
    } else if (event.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  }

  return (
    <div
      className={[styles.field, error ? styles.fieldError : ''].join(' ')}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((name, index) => (
        <span key={`${name}-${index}`} className={styles.chip}>
          <Avatar name={name} size={20} className={styles.chipAvatar} />
          <span className={styles.chipName}>{name}</span>
          <button
            type="button"
            className={styles.chipRemove}
            aria-label={`Удалить получателя ${name}`}
            onClick={(event) => {
              event.stopPropagation();
              removeAt(index);
            }}
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <div className={styles.inputAnchor}>
        <input
          id={id}
          ref={inputRef}
          className={styles.input}
          value={draftText}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={(event) => {
            setDraftText(event.target.value);
            setSuggestionsOpen(true);
          }}
          onFocus={() => setSuggestionsOpen(true)}
          onBlur={commitDraft}
          onKeyDown={handleKeyDown}
        />
        {suggestionsOpen && suggestions.length > 0 && (
          <div className={styles.suggestions} role="listbox">
            {suggestions.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className={styles.suggestion}
                onMouseDown={(event) => {
                  event.preventDefault();
                  addContact(contact.name);
                }}
              >
                <Avatar name={contact.name} size={24} />
                <span className={styles.suggestionText}>
                  <span className={styles.suggestionName}>{contact.name}</span>
                  <span className={styles.suggestionEmail}>{contact.email}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
