import { useRef } from 'react';
import styles from './ResizeHandle.module.css';

export interface ResizeHandleProps {
  orientation?: 'vertical';
  onResize: (deltaPx: number) => void;
  'aria-label': string;
}

/** Thin drag handle for resizing an adjacent panel by width. */
export function ResizeHandle({ onResize, ...rest }: ResizeHandleProps) {
  const lastX = useRef(0);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    lastX.current = event.clientX;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    function handleMove(moveEvent: PointerEvent) {
      const delta = moveEvent.clientX - lastX.current;
      lastX.current = moveEvent.clientX;
      onResize(delta);
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowLeft') onResize(-16);
    if (event.key === 'ArrowRight') onResize(16);
  }

  return (
    <div
      className={styles.handle}
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <div className={styles.grip} />
    </div>
  );
}
