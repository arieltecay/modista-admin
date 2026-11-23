import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

vi.mock('@/components/shared/GlobalModal', () => import('@/test/mocks/globalModal'));

import TemplatesTab from './TemplatesTab';

const card = (name: string) => screen.getByRole('article', { name });
const dialog = () => screen.getByRole('dialog');

const renderLoaded = async () => {
  const user = userEvent.setup();
  render(<TemplatesTab />);
  await screen.findByRole('article', { name: 'aviso_aprobado' });
  return user;
};

const sendTestTo = async (user: ReturnType<typeof userEvent.setup>, name: string, phone: string) => {
  await user.click(within(card(name)).getByRole('button', { name: new RegExp(`Enviar prueba de ${name} `) }));
  await user.type(within(dialog()).getByLabelText('Número de WhatsApp (con código de país)'), phone);
  await user.click(within(dialog()).getByRole('button', { name: 'Enviar prueba' }));
};

describe('TemplatesTab (Plantillas de WhatsApp)', () => {
  beforeEach(() => {
    chat.getTemplates.mockReset().mockResolvedValue(templates);
    chat.createTemplate.mockReset().mockResolvedValue({});
    chat.deleteTemplate.mockReset().mockResolvedValue({});
    chat.sendTestTemplate.mockReset().mockResolvedValue({});
    notify.success.mockReset();
    notify.error.mockReset();
  });

  it('shows the Meta status of every template in words', async () => {
    await renderLoaded();

    expect(within(card('aviso_aprobado')).getByText('Aprobada')).toBeInTheDocument();
    expect(within(card('aviso_pendiente')).getByText('En revisión')).toBeInTheDocument();
    expect(within(card('aviso_rechazado')).getByText('Rechazada')).toBeInTheDocument();
  });

  it('does not load images from outside the admin', async () => {
    await renderLoaded();

    const sources = [...document.querySelectorAll('[src], [style], [class*="url("]')].map(
      el => `${el.getAttribute('src') ?? ''} ${el.getAttribute('style') ?? ''} ${el.getAttribute('class') ?? ''}`,
    );
    expect(sources.filter(source => /https?:\/\//.test(source))).toEqual([]);
  });

  it('offers a test send only for approved templates', async () => {
    await renderLoaded();

    expect(within(card('aviso_aprobado')).getByRole('button', { name: /Enviar prueba de aviso_aprobado / })).toBeInTheDocument();
    expect(within(card('aviso_pendiente')).queryByRole('button', { name: /enviar prueba/i })).not.toBeInTheDocument();
    expect(within(card('aviso_rechazado')).queryByRole('button', { name: /enviar prueba/i })).not.toBeInTheDocument();
  });

  it('warns that the test is a real message and does not send without a number', async () => {
    const user = await renderLoaded();

    await user.click(within(card('aviso_aprobado')).getByRole('button', { name: /Enviar prueba de aviso_aprobado / }));

    expect(within(dialog()).getByText(/se envía un mensaje real/i)).toBeInTheDocument();
    expect(within(dialog()).getByRole('button', { name: 'Enviar prueba' })).toBeDisabled();
    expect(chat.sendTestTemplate).not.toHaveBeenCalled();
  });

  it('sends a test with the current payload when a number is given', async () => {
    const user = await renderLoaded();

    await sendTestTo(user, 'aviso_aprobado', '5491100000000');

    await waitFor(() =>
      expect(chat.sendTestTemplate).toHaveBeenCalledWith({ to: '5491100000000', templateName: 'aviso_aprobado', languageCode: 'es_AR', components: [] }),
    );
    expect(notify.success).toHaveBeenCalledWith('¡Prueba enviada con éxito!');
  });

  it('fills the sample variables of the payment confirmation template', async () => {
    chat.getTemplates.mockResolvedValue([template('confirmacion_pago_utilidad', 'APPROVED'), ...templates]);
    const user = await renderLoaded();

    await sendTestTo(user, 'confirmacion_pago_utilidad', '5491100000000');

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
    chat.sendTestTemplate.mockRejectedValue(new Error('500'));
    const user = await renderLoaded();

    await sendTestTo(user, 'aviso_aprobado', '5491100000000');

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al enviar la prueba'));
  });

  it('creates a template with a normalized name and a single BODY component', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Crear plantilla' }));
    await user.type(within(dialog()).getByLabelText(/nombre/i), 'Aviso Nuevo');
    await user.type(within(dialog()).getByLabelText('Contenido del mensaje'), 'Hola');
    await user.click(within(dialog()).getByRole('button', { name: 'Enviar a Meta' }));

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

    await user.click(screen.getByRole('button', { name: 'Crear plantilla' }));
    await user.type(within(dialog()).getByLabelText(/nombre/i), 'aviso');
    await user.type(within(dialog()).getByLabelText('Contenido del mensaje'), 'Hola');
    await user.click(within(dialog()).getByRole('button', { name: 'Enviar a Meta' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Nombre duplicado'));
  });

  it('deletes a template by name only after confirming in a dialog', async () => {
    const user = await renderLoaded();

    await user.click(within(card('aviso_pendiente')).getByRole('button', { name: 'Eliminar plantilla aviso_pendiente' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Cancelar' }));
    expect(chat.deleteTemplate).not.toHaveBeenCalled();

    await user.click(within(card('aviso_pendiente')).getByRole('button', { name: 'Eliminar plantilla aviso_pendiente' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(chat.deleteTemplate).toHaveBeenCalledWith('aviso_pendiente'));
    expect(notify.success).toHaveBeenCalledWith('Plantilla eliminada');
  });

  it('shows an error when deleting fails', async () => {
    chat.deleteTemplate.mockRejectedValue(new Error('500'));
    const user = await renderLoaded();

    await user.click(within(card('aviso_pendiente')).getByRole('button', { name: 'Eliminar plantilla aviso_pendiente' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al eliminar la plantilla'));
  });

  it('tells a failed template load apart from an account with no templates, and retries', async () => {
    chat.getTemplates.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce([]);
    const user = userEvent.setup();
    render(<TemplatesTab />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las plantillas de Meta.');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('No hay plantillas en tu cuenta de Meta.')).toBeInTheDocument();
  });

  it('tests the language of the card clicked when a name exists in two languages', async () => {
    chat.getTemplates.mockResolvedValue([
      { ...template('aviso_aprobado', 'APPROVED'), id: 't-es' },
      { ...template('aviso_aprobado', 'APPROVED'), id: 't-en', language: 'en_US' },
    ]);
    const user = userEvent.setup();
    render(<TemplatesTab />);

    await user.click(await screen.findByRole('button', { name: 'Enviar prueba de aviso_aprobado (en_US)' }));
    await user.type(within(dialog()).getByLabelText('Número de WhatsApp (con código de país)'), '5491100000000');
    await user.click(within(dialog()).getByRole('button', { name: 'Enviar prueba' }));

    await waitFor(() => expect(chat.sendTestTemplate).toHaveBeenCalledWith(expect.objectContaining({ languageCode: 'en_US' })));
  });

  it('sends the test number as digits only and refuses an incomplete one', async () => {
    const user = await renderLoaded();

    await user.click(within(card('aviso_aprobado')).getByRole('button', { name: /Enviar prueba de aviso_aprobado / }));
    const phone = within(dialog()).getByLabelText('Número de WhatsApp (con código de país)');
    await user.type(phone, '54 9 11');
    expect(within(dialog()).getByRole('button', { name: 'Enviar prueba' })).toBeDisabled();

    await user.clear(phone);
    await user.type(phone, ' +54 9 11 0000-0000 ');
    await user.click(within(dialog()).getByRole('button', { name: 'Enviar prueba' }));

    await waitFor(() => expect(chat.sendTestTemplate).toHaveBeenCalledWith(expect.objectContaining({ to: '5491100000000' })));
  });
});
