import { useEffect, useRef, useState } from 'react';
import {
  ArrowUUpLeft as Undo,
  ArrowUUpRight as Redo,
  CaretDown,
  Highlighter as HighlightIcon,
  Image as ImageIcon,
  TextAlignCenter as AlignCenter,
  TextAlignJustify as AlignJustify,
  TextAlignLeft as AlignLeft,
  TextAlignRight as AlignRight,
  TextB as Bold,
  Eraser,
  TextIndent as Indent,
  TextItalic as Italic,
  LinkSimple as LinkIcon,
  ListBullets as List,
  ListNumbers as ListOrdered,
  Minus as HorizontalRuleIcon,
  TextOutdent as Outdent,
  Paperclip,
  TextStrikethrough as Strikethrough,
  Table as TableIcon,
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
  { label: 'Очень крупный', execValue: '7' },
];

const BLOCK_FORMATS: Array<{ label: string; execValue: string }> = [
  { label: 'Обычный текст', execValue: '<p>' },
  { label: 'Заголовок 1', execValue: '<h1>' },
  { label: 'Заголовок 2', execValue: '<h2>' },
  { label: 'Заголовок 3', execValue: '<h3>' },
  { label: 'Цитата', execValue: '<blockquote>' },
];

const TEXT_COLORS = ['#292a2e', '#0062ff', '#f94c4c', '#3f8f4f', '#e0862e', '#7a5cff'];
const HIGHLIGHT_COLORS = ['transparent', '#fff3b0', '#c6f6d5', '#bee3f8', '#fed7d7', '#e9d8fd'];

const TABLE_HTML =
  '<table style="border-collapse:collapse;width:100%"><tbody>' +
  Array.from({ length: 3 })
    .map(
      () =>
        `<tr>${Array.from({ length: 3 })
          .map(() => '<td style="border:1px solid #c7c7ce;padding:6px 8px;min-width:60px">&nbsp;</td>')
          .join('')}</tr>`,
    )
    .join('') +
  '</tbody></table><p><br></p>';

/** Lightweight rich-text editor over a contentEditable div using the browser's
 * built-in execCommand formatting — no heavyweight editor dependency needed
 * for the level of formatting a mail compose window realistically needs. */
export function RichTextEditor({ initialHtml, onChange, onAttachClick, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
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

  function handleImageFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') exec('insertImage', reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Форматирование текста"
        onMouseDown={(event) => {
          // Toolbar buttons live outside the contentEditable, so a plain
          // click would first blur it and collapse the current text
          // selection — losing exactly the range a format command needs to
          // act on. Blocking the mousedown's default action keeps focus
          // (and the selection) in the editor; the click still fires.
          event.preventDefault();
        }}
      >
        <IconButton icon={<Undo size={16} />} aria-label="Отменить" size="s" onClick={() => exec('undo')} />
        <IconButton icon={<Redo size={16} />} aria-label="Повторить" size="s" onClick={() => exec('redo')} />

        <span className={styles.divider} />

        <div className={styles.menuAnchor}>
          <button type="button" className={styles.dropdownButton} onClick={() => setFormatMenuOpen((v) => !v)}>
            Формат
            <CaretDown size={11} />
          </button>
          {formatMenuOpen && (
            <div className={styles.popover} role="menu">
              {BLOCK_FORMATS.map((format) => (
                <button
                  key={format.execValue}
                  type="button"
                  className={styles.popoverItem}
                  onClick={() => {
                    exec('formatBlock', format.execValue);
                    setFormatMenuOpen(false);
                  }}
                >
                  {format.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.menuAnchor}>
          <button type="button" className={styles.dropdownButton} onClick={() => setSizeMenuOpen((v) => !v)}>
            Размер
            <CaretDown size={11} />
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

        <span className={styles.divider} />

        <IconButton icon={<Bold size={16} />} aria-label="Жирный" size="s" onClick={() => exec('bold')} />
        <IconButton icon={<Italic size={16} />} aria-label="Курсив" size="s" onClick={() => exec('italic')} />
        <IconButton icon={<Underline size={16} />} aria-label="Подчёркнутый" size="s" onClick={() => exec('underline')} />
        <IconButton icon={<Strikethrough size={16} />} aria-label="Зачёркнутый" size="s" onClick={() => exec('strikeThrough')} />

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

        <div className={styles.menuAnchor}>
          <button
            type="button"
            className={styles.colorButton}
            aria-label="Цвет выделения текста"
            onClick={() => setHighlightMenuOpen((v) => !v)}
          >
            <HighlightIcon size={16} />
          </button>
          {highlightMenuOpen && (
            <div className={styles.popover} role="menu">
              <div className={styles.colorGrid}>
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={[styles.colorOption, color === 'transparent' ? styles.colorOptionNone : ''].join(' ')}
                    style={{ backgroundColor: color }}
                    aria-label={color === 'transparent' ? 'Без выделения' : color}
                    onClick={() => {
                      exec('hiliteColor', color);
                      setHighlightMenuOpen(false);
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
        <IconButton icon={<Outdent size={16} />} aria-label="Уменьшить отступ" size="s" onClick={() => exec('outdent')} />
        <IconButton icon={<Indent size={16} />} aria-label="Увеличить отступ" size="s" onClick={() => exec('indent')} />

        <span className={styles.divider} />

        <IconButton icon={<AlignLeft size={16} />} aria-label="По левому краю" size="s" onClick={() => exec('justifyLeft')} />
        <IconButton icon={<AlignCenter size={16} />} aria-label="По центру" size="s" onClick={() => exec('justifyCenter')} />
        <IconButton icon={<AlignRight size={16} />} aria-label="По правому краю" size="s" onClick={() => exec('justifyRight')} />
        <IconButton icon={<AlignJustify size={16} />} aria-label="По ширине" size="s" onClick={() => exec('justifyFull')} />

        <span className={styles.divider} />

        <IconButton icon={<LinkIcon size={16} />} aria-label="Вставить ссылку" size="s" onClick={handleLink} />
        <IconButton
          icon={<ImageIcon size={16} />}
          aria-label="Вставить изображение"
          size="s"
          onClick={() => imageInputRef.current?.click()}
        />
        <IconButton icon={<TableIcon size={16} />} aria-label="Вставить таблицу" size="s" onClick={() => exec('insertHTML', TABLE_HTML)} />
        <IconButton
          icon={<HorizontalRuleIcon size={16} />}
          aria-label="Вставить горизонтальную линию"
          size="s"
          onClick={() => exec('insertHorizontalRule')}
        />
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

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={(event) => {
          handleImageFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </div>
  );
}
