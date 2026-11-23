import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enrollmentConfig } from '@/test/fixtures/botMessage';

const service = vi.hoisted(() => ({ getConfig: vi.fn(), saveConfig: vi.fn() }));
vi.mock('@/services/bot-enrollment/botEnrollmentService', () => ({ botEnrollmentService: service }));

const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/components/shared/Toast', () => ({ notify }));

import EnrollmentTab from './EnrollmentTab';

describe('EnrollmentTab', () => {
  beforeEach(() => {
    service.getConfig.mockReset().mockResolvedValue(enrollmentConfig);
    service.saveConfig.mockReset().mockResolvedValue({ ...enrollmentConfig, whatsappLookupEnabled: true });
    notify.success.mockReset();
    notify.error.mockReset();
  });

  it('shows the loading state, then the saved configuration', async () => {
    render(<EnrollmentTab />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(await screen.findByLabelText('Responder consultas de inscripción por WhatsApp')).not.toBeChecked();
  });

  it('shows a load error instead of an empty form', async () => {
    service.getConfig.mockRejectedValue(new Error('500'));
    render(<EnrollmentTab />);

    expect(await screen.findByText('No se pudo cargar la configuración de inscripciones.')).toBeInTheDocument();
  });

  it('saves through the service and shows the stored result', async () => {
    const user = userEvent.setup();
    render(<EnrollmentTab />);

    await user.click(await screen.findByLabelText('Responder consultas de inscripción por WhatsApp'));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(service.saveConfig).toHaveBeenCalledWith({ whatsappLookupEnabled: true, templates: {} }));
    expect(notify.success).toHaveBeenCalledWith('Configuración de inscripciones guardada');
    expect(await screen.findByLabelText('Responder consultas de inscripción por WhatsApp')).toBeChecked();
  });

  it('keeps the edits and shows an error when saving fails', async () => {
    service.saveConfig.mockRejectedValue(new Error('500'));
    const user = userEvent.setup();
    render(<EnrollmentTab />);

    await user.click(await screen.findByLabelText('Responder consultas de inscripción por WhatsApp'));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('No se pudo guardar la configuración'));
    expect(screen.getByLabelText('Responder consultas de inscripción por WhatsApp')).toBeChecked();
  });
});
