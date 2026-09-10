import styles from './Avatar.module.css';

export type AvatarSize = 20 | 24 | 32 | 40;

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  className?: string;
}

/** Soft/pale badge colors: a pale tint background paired with a readable
 * darker shade of the same hue for the initials text. */
const PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: '#d9e7ff', fg: '#1f5fd9' },
  { bg: '#e6e0ff', fg: '#6b46e5' },
  { bg: '#d3f3ec', fg: '#0e8a72' },
  { bg: '#ffe3d1', fg: '#c2521a' },
  { bg: '#fce0ea', fg: '#b23a63' },
  { bg: '#dcebff', fg: '#2569d6' },
  { bg: '#dff0e1', fg: '#2e7a3d' },
  { bg: '#f1e1fb', fg: '#8a3fd1' },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 32, src, className }: AvatarProps) {
  const { bg, fg } = PALETTE[hashString(name) % PALETTE.length];

  return (
    <span
      className={[styles.avatar, className ?? ''].filter(Boolean).join(' ')}
      style={{ width: size, height: size, backgroundColor: src ? undefined : bg }}
      title={name}
    >
      {src ? (
        <img src={src} alt="" className={styles.image} />
      ) : (
        <span className={styles.initials} style={{ fontSize: size <= 24 ? 10 : size <= 32 ? 13 : 14, color: fg }}>
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}
