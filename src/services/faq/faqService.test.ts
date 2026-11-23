import { describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ post: vi.fn().mockResolvedValue({}) }));
vi.mock('../config/apiClient', () => ({ apiClient: api }));

import { faqService } from './faqService';

describe('faqService contract', () => {
  it('creates an FAQ ("Entrenar Mila" in Messages) with the whole form', async () => {
    const data = { question: '¿Precio?', answer: 'Ver la web', category: 'general' as const, status: 'active' as const, order: 0, iconName: 'HelpCircle' };

    await faqService.createFAQ(data);

    expect(api.post).toHaveBeenCalledWith('/faq', data);
  });
});
