import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../config/apiClient', () => ({ apiClient: api }));

import { botInstructionService } from './botInstructionService';

const data = {
  title: 'Horarios',
  content: 'Atendemos de 9 a 18.',
  order: 0,
  isActive: true,
  instagramAutoReply: false,
  instagramKeywords: [],
  instagramEnrollmentLookup: false,
  instagramCommentReply: false,
  instagramResponseMode: 'fixed' as const,
  instagramFixedResponse: 'Hola 👋\nAtendemos de 9 a 18.',
};

describe('botInstructionService contract', () => {
  beforeEach(() => {
    Object.values(api).forEach(fn => fn.mockReset().mockResolvedValue({}));
  });

  it('lists', async () => {
    await botInstructionService.getInstructions();
    expect(api.get).toHaveBeenCalledWith('/chat/instructions');
  });

  it('creates with the whole form', async () => {
    await botInstructionService.createInstruction(data);
    expect(api.post).toHaveBeenCalledWith('/chat/instructions', data);
  });

  it('updates by id with the whole form', async () => {
    await botInstructionService.updateInstruction('i1', data);
    expect(api.put).toHaveBeenCalledWith('/chat/instructions/i1', data);
  });

  it('deletes by id', async () => {
    await botInstructionService.deleteInstruction('i1');
    expect(api.delete).toHaveBeenCalledWith('/chat/instructions/i1');
  });
});
