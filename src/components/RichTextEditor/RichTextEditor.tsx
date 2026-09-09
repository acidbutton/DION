import { useEffect, useRef, useState } from 'react';
import {
  TextAlignCenter as AlignCenter,
  TextAlignLeft as AlignLeft,
  TextAlignRight as AlignRight,
  TextB as Bold,
  Eraser,
  TextItalic as Italic,
  LinkSimple as LinkIcon,
  ListBullets as List,
  ListNumbers as ListOrdered,
  Paperclip,
  TextUnderline as Underline,
} from '@phosphor-icons/react';
import { IconButton } from '../IconButton/IconButton';
import styles from './RichTextEditor.module.css';

export interface RichTextEditorProps {
  initialHtml?: string;
  onChange: (html: string) => void;
  onAttachClick?: () => void;
  placeholder?: string;
}

const FONT_SIZES: Array<{ label: string; execValue: string }> = [
  { label: 'Мелкий', execValue: '2' },
  { label: 'Обычный', execValue: '3' },
  { label: 'Крупный', execValue: '5' },
];

const TEXT_COLORS = ['#292a2e', '#0062ff', '#f94c4c', '#3f8f4f', '#e0862e', '#7a5cff'];

/** Lightweight rich-text editor over a contentEditable div using the browser's
 * built-in execCommand formatting — no heavyweight editor dependency needed
 * for the level of formatting a mail compose window realistically needs. */
export function RichTextEditor({ initialHtml, onChange, onAttachClick, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialHtml);

  // Seed content only once on mount. The contentEditable DOM node is the
  // source of truth after that — re-applying `initialHtml` on every render
  // (it mirrors the live onChange output) would reset the caret to the
  // start of the element on each keystroke, making typed text appear
  // reversed.
  useEffect(() => {
    if (editorRef.current && initialHtml) editorRef.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }

  function handleInput() {
    const html = editorRef.current?.innerHTML ?? '';
    setIsEmpty(editorRef.current?.textContent?.trim().length === 0);
    onChange(html);
  }

  function handleLink() {
    const url = window.prompt('Введите адрес ссылки (https://…)');
    if (url) exec('createLink', url);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="toolbar" aria-label="Форматирование текста">
        <IconButton icon={<Bold size={16} />} aria-label="Жирный" size="s" onClick={() => exec('bold')} />
        <IconButton icon={<Italic size={16} />} aria-label="Курсив" size="s" onClick={() => exec('italic')} />
        <IconButton icon={<Underline size={16} />} aria-label="Подчёркнутый" size="s" onClick={() => exec('underline')} />

        <span className={styles.divider} />

        <div className={styles.menuAnchor}>
          <button type="button" className={styles.sizeButton} onClick={() => setSizeMenuOpen((v) => !v)}>
            Размер
          </button>
          {sizeMenuOpen && (
            <div className={styles.popover} role="menu">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.execValue}
                  type="button"
                  className={styles.popoverItem}
                  onClick={() => {
                    exec('fontSize', size.execValue);
                    setSizeMenuOpen(false);
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.menuAnchor}>
          <button
            type="button"
            className={styles.colorButton}
            aria-label="Цвет текста"
            onClick={() => setColorMenuOpen((v) => !v)}
          >
            <span className={styles.colorSwatch} />
          </button>
          {colorMenuOpen && (
            <div className={styles.popover} role="menu">
              <div className={styles.colorGrid}>
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={styles.colorOption}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                    onClick={() => {
                      exec('foreColor', color);
                      setColorMenuOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <span className={styles.divider} />

        <IconButton icon={<List size={16} />} aria-label="Маркированный список" size="s" onClick={() => exec('insertUnorderedList')} />
        <IconButton icon={<ListOrdered size={16} />} aria-label="Нумерованный список" size="s" onClick={() => exec('insertOrderedList')} />

        <span className={styles.divider} />

        <IconButton icon={<AlignLeft size={16} />} aria-label="По левому краю" size="s" onClick={() => exec('justifyLeft')} />
        <IconButton icon={<AlignCenter size={16} />} aria-label="По центру" size="s" onClick={() => exec('justifyCenter')} />
        <IconButton icon={<AlignRight size={16} />} aria-label="По правому краю" size="s" onClick={() => exec('justifyRight')} />

        <span className={styles.divider} />

        <IconButton icon={<LinkIcon size={16} />} aria-label="Вставить ссылку" size="s" onClick={handleLink} />
        <IconButton icon={<Eraser size={16} />} aria-label="Очистить форматирование" size="s" onClick={() => exec('removeFormat')} />

        {onAttachClick && (
          <>
            <span className={styles.spacer} />
            <IconButton icon={<Paperclip size={16} />} aria-label="Прикрепить файл" size="s" onClick={onAttachClick} />
          </>
        )}
      </div>

      <div className={styles.editorArea}>
        {isEmpty && placeholder && <span className={styles.placeholder}>{placeholder}</span>}
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          role="textbox"
          aria-multiline="true"
          aria-label="Текст письма"
        />
      </div>
    </div>
  );
}
