import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { template, templates } from '@/test/fixtures/botMessage';

const chat = vi.hoisted(() => ({
  getTemplates: vi.fn(),
  createTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  sendTestTemplate: vi.fn(),
}));
vi.mock('@/services/chatService', () => chat);

const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/components/shared/Toast', () => ({ notify }));

import TemplatesTab from './TemplatesTab';

// TEMP selectors: cards have no landmark and the delete button has no accessible name yet.
// The redesign PR replaces both with accessible names.
const card = (name: string) => {
  const found = screen.getByText(name).closest('.group');
  if (!(found instanceof HTMLElement)) throw new Error(`No card for template "${name}"`);
  return found;
};
const deleteButtonOf = (name: string) => within(card(name)).getAllByRole('button').slice(-1)[0];

const renderLoaded = async () => {
  const user = userEvent.setup();
  render(<TemplatesTab />);
  await screen.findByText('aviso_aprobado');
  return user;
};

describe('TemplatesTab', () => {
  beforeEach(() => {
    chat.getTemplates.mockReset().mockResolvedValue(templates);
    chat.createTemplate.mockReset().mockResolvedValue({});
    chat.deleteTemplate.mockReset().mockResolvedValue({});
    chat.sendTestTemplate.mockReset().mockResolvedValue({});
    notify.success.mockReset();
    notify.error.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the Meta status of every template', async () => {
    await renderLoaded();

    expect(within(card('aviso_aprobado')).getByTitle('APPROVED')).toBeInTheDocument();
    expect(within(card('aviso_pendiente')).getByTitle('PENDING')).toBeInTheDocument();
    expect(within(card('aviso_rechazado')).getByTitle('REJECTED')).toBeInTheDocument();
  });

  it('offers a test send only for approved templates', async () => {
    await renderLoaded();

    expect(within(card('aviso_aprobado')).getByRole('button', { name: 'Enviar prueba' })).toBeInTheDocument();
    expect(within(card('aviso_pendiente')).queryByRole('button', { name: 'Enviar prueba' })).not.toBeInTheDocument();
    expect(within(card('aviso_rechazado')).queryByRole('button', { name: 'Enviar prueba' })).not.toBeInTheDocument();
  });

  it('does not send a test when no phone number is given', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null);
    const user = await renderLoaded();

    await user.click(within(card('aviso_aprobado')).getByRole('button', { name: 'Enviar prueba' }));

    expect(chat.sendTestTemplate).not.toHaveBeenCalled();
  });

  it('sends a test with the current payload when a number is given', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('5491100000000');
    const user = await renderLoaded();

    await user.click(within(card('aviso_aprobado')).getByRole('button', { name: 'Enviar prueba' }));

    await waitFor(() =>
      expect(chat.sendTestTemplate).toHaveBeenCalledWith({ to: '5491100000000', templateName: 'aviso_aprobado', languageCode: 'es_AR', components: [] }),
    );
    expect(notify.success).toHaveBeenCalledWith('¡Prueba enviada con éxito!');
  });

  it('fills the sample variables of the payment confirmation template', async () => {
    chat.getTemplates.mockResolvedValue([template('confirmacion_pago_utilidad', 'APPROVED'), ...templates]);
    vi.spyOn(window, 'prompt').mockReturnValue('5491100000000');
    const user = await renderLoaded();

    await user.click(within(card('confirmacion_pago_utilidad')).getByRole('button', { name: 'Enviar prueba' }));

    await waitFor(() => expect(chat.sendTestTemplate).toHaveBeenCalled());
    const [{ components }] = chat.sendTestTemplate.mock.calls[0];
    expect(components[0].parameters.map((p: { parameter_name: string }) => p.parameter_name)).toEqual([
      'nombre_alumno',
      'nombre_curso',
      'cvu',
      'alias',
    ]);
  });

  it('shows an error when the test send fails', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('5491100000000');
    chat.sendTestTemplate.mockRejectedValue(new Error('500'));
    const user = await renderLoaded();

    await user.click(within(card('aviso_aprobado')).getByRole('button', { name: 'Enviar prueba' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al enviar la prueba'));
  });

  it('creates a template with a normalized name and a single BODY component', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: /crear plantilla/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('ej: confirmacion_pago'), 'Aviso Nuevo');
    await user.type(within(dialog).getByPlaceholderText(/tu curso/i), 'Hola');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar a Meta' }));

    await waitFor(() =>
      expect(chat.createTemplate).toHaveBeenCalledWith({
        name: 'aviso_nuevo',
        category: 'UTILITY',
        language: 'es_AR',
        components: [{ type: 'BODY', text: 'Hola' }],
      }),
    );
    expect(notify.success).toHaveBeenCalledWith('Plantilla enviada a revisión en Meta.');
  });

  it("shows Meta's error message when creating fails", async () => {
    chat.createTemplate.mockRejectedValue(new Error('Nombre duplicado'));
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: /crear plantilla/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('ej: confirmacion_pago'), 'aviso');
    await user.type(within(dialog).getByPlaceholderText(/tu curso/i), 'Hola');
    await user.click(within(dialog).getByRole('button', { name: 'Enviar a Meta' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Nombre duplicado'));
  });

  it('deletes a template by name only after confirming', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const user = await renderLoaded();

    await user.click(deleteButtonOf('aviso_pendiente'));
    expect(chat.deleteTemplate).not.toHaveBeenCalled();

    await user.click(deleteButtonOf('aviso_pendiente'));
    await waitFor(() => expect(chat.deleteTemplate).toHaveBeenCalledWith('aviso_pendiente'));
  });

  it('shows an error when deleting fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    chat.deleteTemplate.mockRejectedValue(new Error('500'));
    const user = await renderLoaded();

    await user.click(deleteButtonOf('aviso_pendiente'));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al eliminar la plantilla'));
  });

  it.todo('tells a failed template load apart from an account with no templates');
});
