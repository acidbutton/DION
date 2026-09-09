import type { MailMessage, SystemFolderId } from '../types';

type CountMap = Record<string, number>;

function keyOf(accountId: string, folderId: string): string {
  return `${accountId}:${folderId}`;
}

export function countUnreadByFolder(messages: MailMessage[]): CountMap {
  const map: CountMap = {};
  for (const message of messages) {
    if (!message.unread) continue;
    const key = keyOf(message.accountId, message.folderId);
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

/**
 * Sidebar badges combine the account's baseline count (matching the Figma mock —
 * representing the wider mailbox we don't fully simulate) with how the count of the
 * currently-mocked messages has moved since first load, so read/move/delete actions
 * are reflected without collapsing the badge down to an unrealistic tiny number.
 */
export function badgeCount(
  baseline: Partial<Record<SystemFolderId, number>>,
  folderId: SystemFolderId,
  accountId: string,
  liveUnread: CountMap,
  initialUnread: CountMap,
): number {
  const base = baseline[folderId] ?? 0;
  const key = keyOf(accountId, folderId);
  const delta = (liveUnread[key] ?? 0) - (initialUnread[key] ?? 0);
  return Math.max(0, base + delta);
}
