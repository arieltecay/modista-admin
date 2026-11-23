import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('../config/apiClient', () => ({ apiClient: api }));

import { botEnrollmentService } from './botEnrollmentService';

describe('botEnrollmentService contract', () => {
  beforeEach(() => {
    api.get.mockReset().mockResolvedValue({});
    api.put.mockReset().mockResolvedValue({});
  });

  it('reads the configuration', async () => {
    await botEnrollmentService.getConfig();
    expect(api.get).toHaveBeenCalledWith('/chat/enrollment-config');
  });

  it('replaces the configuration with only the customized texts', async () => {
    const payload = { whatsappLookupEnabled: true, templates: { paid: 'Tu {curso} está pago.' } };
    await botEnrollmentService.saveConfig(payload);
    expect(api.put).toHaveBeenCalledWith('/chat/enrollment-config', payload);
  });
});
