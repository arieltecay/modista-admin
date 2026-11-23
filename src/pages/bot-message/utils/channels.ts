const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
};

export const channelLabel = (platform: string) => CHANNEL_LABEL[platform] ?? platform;

/** Full id as the team knows it: WhatsApp numbers with `+`, Instagram ids as they come. */
export const fullChatId = (platform: string, platformId: string) => (platform === 'whatsapp' ? `+${platformId}` : platformId);

/** Shortened id for the list: long ids (real Instagram ids) keep their last 12 characters. */
export const shortChatId = (platform: string, platformId: string) =>
  platformId.length > 15 ? `...${platformId.slice(-12)}` : fullChatId(platform, platformId);

export const formatTime = (iso?: string) =>
  iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '';
