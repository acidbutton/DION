import styles from './Avatar.module.css';

export type AvatarSize = 20 | 24 | 32 | 40;

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  src?: string;
  className?: string;
}

const PALETTE = [
  '#0062ff',
  '#7a5cff',
  '#00a389',
  '#e0662e',
  '#c73e6b',
  '#3381ff',
  '#3f8f4f',
  '#a15ce0',
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
  const color = PALETTE[hashString(name) % PALETTE.length];

  return (
    <span
      className={[styles.avatar, className ?? ''].filter(Boolean).join(' ')}
      style={{ width: size, height: size, backgroundColor: src ? undefined : color }}
      title={name}
    >
      {src ? (
        <img src={src} alt="" className={styles.image} />
      ) : (
        <span className={styles.initials} style={{ fontSize: size <= 24 ? 10 : size <= 32 ? 13 : 14 }}>
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}
