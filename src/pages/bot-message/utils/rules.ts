import type { BotInstruction } from '../types';
import { asId, asText, isRecord } from './guards';

const asKeywords = (value: unknown) => [...new Set(Array.isArray(value) ? value.filter((k): k is string => typeof k === 'string' && k.trim() !== '') : [])];

/** Keeps only well-formed instructions, with the optional Instagram fields defaulted like the API does. */
export const toInstructions = (data: unknown): BotInstruction[] =>
  Array.isArray(data)
    ? data.filter(isRecord).flatMap(row => {
        const id = asId(row._id);
        if (!id) return [];
        return [{
          _id: id,
          title: asText(row.title),
          content: asText(row.content),
          order: typeof row.order === 'number' ? row.order : 0,
          isActive: row.isActive !== false,
          instagramAutoReply: row.instagramAutoReply === true,
          instagramKeywords: asKeywords(row.instagramKeywords),
          instagramEnrollmentLookup: row.instagramEnrollmentLookup === true,
          instagramCommentReply: row.instagramCommentReply === true,
          instagramResponseMode: row.instagramResponseMode === 'fixed' ? 'fixed' as const : 'gemini' as const,
          instagramFixedResponse: asText(row.instagramFixedResponse),
          whatsappFixedReplyEnabled: row.whatsappFixedReplyEnabled === true,
          whatsappKeywords: asKeywords(row.whatsappKeywords),
          whatsappFixedResponse: asText(row.whatsappFixedResponse),
        }];
      })
    : [];
