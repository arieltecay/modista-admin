import { asId, asText, isRecord } from '../../utils/guards';
import type { ChatSummary, Platform } from './types';

const isPlatform = (value: unknown): value is Platform => value === 'whatsapp' || value === 'instagram';

/** Keeps only well-formed conversations, once each: a broken row must not blank the whole panel. */
export const toChatSummaries = (data: unknown): ChatSummary[] => {
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  return data.flatMap(row => {
    if (!isRecord(row) || !isRecord(row._id) || !isPlatform(row._id.platform)) return [];
    const platform = row._id.platform;
    const platformId = asId(row._id.platform_id);
    const key = `${platform}:${platformId}`;
    if (!platformId || seen.has(key)) return [];
    seen.add(key);
    const timestamp = asText(row.lastTimestamp);
    return [{
      key,
      platform,
      platformId,
      lastMessage: asText(row.lastMessage),
      unreadCount: typeof row.unreadCount === 'number' ? row.unreadCount : 0,
      lastTimestamp: timestamp && !Number.isNaN(Date.parse(timestamp)) ? timestamp : undefined,
    }];
  });
};

export const readAllMessage = (result: unknown) => {
  const count = isRecord(result) ? result.modifiedCount : undefined;
  if (count === 0) return 'No había mensajes sin leer';
  return typeof count === 'number' ? `${count} mensajes marcados como leídos` : 'Todos los mensajes marcados como leídos';
};
