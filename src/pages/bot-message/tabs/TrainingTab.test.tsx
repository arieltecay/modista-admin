import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { instruction } from '@/test/fixtures/botMessage';

const service = vi.hoisted(() => ({
  getInstructions: vi.fn(),
  createInstruction: vi.fn(),
  updateInstruction: vi.fn(),
  deleteInstruction: vi.fn(),
}));
vi.mock('@/services/bot-instruction/botInstructionService', () => ({ botInstructionService: service }));

const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/components/shared/Toast', () => ({ notify }));

vi.mock('@/components/shared/GlobalModal', () => import('@/test/mocks/globalModal'));

import TrainingTab from './TrainingTab';

const save = () => screen.getByRole('button', { name: 'Guardar regla' });
const rule = () => screen.getByRole('article', { name: instruction.title });

const fillNewInstruction = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Nombre de la regla'), 'Horarios');
  await user.type(screen.getByLabelText('Lo que sabe Mila'), 'Atendemos de 9 a 18.');
};

const renderLoaded = async () => {
  const user = userEvent.setup();
  render(<TrainingTab />);
  await screen.findByRole('article', { name: instruction.title });
  return user;
};

describe('TrainingTab (Respuestas automáticas)', () => {
  beforeEach(() => {
    service.getInstructions.mockReset().mockResolvedValue([instruction]);
    service.createInstruction.mockReset().mockResolvedValue({});
    service.updateInstruction.mockReset().mockResolvedValue({});
    service.deleteInstruction.mockReset().mockResolvedValue({});
    notify.success.mockReset();
    notify.error.mockReset();
  });

  it('explains how Mila answers on each channel', async () => {
    await renderLoaded();

    const items = screen.getAllByRole('listitem').map(item => item.textContent ?? '');
    expect(items).toContainEqual(expect.stringMatching(/WhatsApp usa todas las reglas activas, las FAQ y los cursos/));
    expect(items).toContainEqual(expect.stringMatching(/Instagram responde solo cuando el mensaje contiene una frase/));
  });

  it('shows where each rule answers, what triggers it and that Mila writes from it', async () => {
    await renderLoaded();

    const card = rule();
    expect(within(card).getByText('Activa')).toBeInTheDocument();
    expect(within(card).getByText('WhatsApp')).toBeInTheDocument();
    expect(within(card).getByText('Instagram · mensajes directos')).toBeInTheDocument();
    expect(within(card).queryByText(/Instagram · comentarios/)).not.toBeInTheDocument();
    expect(within(card).getByText('camisa')).toBeInTheDocument();
    expect(within(card).getByText(/Mila redacta con este texto; no lo envía tal cual/)).toBeInTheDocument();
  });

  it('tells a fixed Instagram reply apart from a rule Mila writes from', async () => {
    service.getInstructions.mockResolvedValue([
      instruction,
      { ...instruction, _id: 'i2', title: 'Precios', instagramResponseMode: 'fixed', instagramFixedResponse: 'El precio está en la web', instagramEnrollmentLookup: true },
    ]);
    await renderLoaded();

    const fixed = screen.getByRole('article', { name: 'Precios' });
    expect(within(fixed).getByText('Respuesta fija en Instagram')).toBeInTheDocument();
    expect(within(fixed).getByText('El precio está en la web')).toBeInTheDocument();
    expect(within(fixed).getByText(/Se envía tal cual, sin Gemini/)).toBeInTheDocument();
    expect(within(fixed).getByText('Puede consultar inscripciones por Instagram.')).toBeInTheDocument();
    expect(within(rule()).queryByText('Respuesta fija en Instagram')).not.toBeInTheDocument();
    expect(within(rule()).getByText(/Mila redacta con este texto; no lo envía tal cual/)).toBeInTheDocument();
  });

  it('creates a rule with the current payload and reloads the list', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Nueva regla' }));
    await fillNewInstruction(user);
    await user.click(save());

    await waitFor(() =>
      expect(service.createInstruction).toHaveBeenCalledWith({
        title: 'Horarios',
        content: 'Atendemos de 9 a 18.',
        order: 0,
        isActive: true,
        instagramAutoReply: false,
        instagramKeywords: [],
        instagramEnrollmentLookup: false,
        instagramCommentReply: false,
        instagramResponseMode: 'gemini',
        instagramFixedResponse: '',
      }),
    );
    expect(service.getInstructions).toHaveBeenCalledTimes(2);
    expect(notify.success).toHaveBeenCalledWith('Nueva instrucción creada');
  });

  it('updates the edited rule by id with every field', async () => {
    const user = await renderLoaded();

    await user.click(within(rule()).getByRole('button', { name: `Editar regla ${instruction.title}` }));
    await user.click(save());

    const { _id, ...fields } = instruction;
    await waitFor(() => expect(service.updateInstruction).toHaveBeenCalledWith(_id, { ...fields, instagramResponseMode: 'gemini', instagramFixedResponse: '' }));
    expect(notify.success).toHaveBeenCalledWith('Instrucción actualizada');
  });

  it('does not send NaN as order when the order field is emptied', async () => {
    const user = await renderLoaded();

    await user.click(within(rule()).getByRole('button', { name: `Editar regla ${instruction.title}` }));
    await user.clear(screen.getByLabelText('Orden'));
    await user.click(save());

    await waitFor(() => expect(service.updateInstruction).toHaveBeenCalledWith('i1', expect.objectContaining({ order: 0 })));
  });

  it('shows an error and keeps the form open when saving fails', async () => {
    service.createInstruction.mockRejectedValue(new Error('Instrucción inválida'));
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Nueva regla' }));
    await fillNewInstruction(user);
    await user.click(save());

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al guardar la instrucción'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('deletes only after confirming in a dialog', async () => {
    const user = await renderLoaded();

    await user.click(within(rule()).getByRole('button', { name: `Eliminar regla ${instruction.title}` }));
    expect(service.deleteInstruction).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    expect(service.deleteInstruction).not.toHaveBeenCalled();

    await user.click(within(rule()).getByRole('button', { name: `Eliminar regla ${instruction.title}` }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(service.deleteInstruction).toHaveBeenCalledWith('i1'));
    expect(notify.success).toHaveBeenCalledWith('Sección eliminada');
  });

  it('shows an error when deleting fails', async () => {
    service.deleteInstruction.mockRejectedValue(new Error('500'));
    const user = await renderLoaded();

    await user.click(within(rule()).getByRole('button', { name: `Eliminar regla ${instruction.title}` }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al eliminar'));
  });

  it('tells a failed load apart from an empty list, and retries', async () => {
    service.getInstructions.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce([]);
    const user = userEvent.setup();
    render(<TrainingTab />);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las respuestas automáticas.');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Todavía no hay reglas.')).toBeInTheDocument();
  });

  it('shows the valid rules even if the API sends a broken row', async () => {
    service.getInstructions.mockResolvedValue([null, { _id: '2', title: 'Precios', content: 'x', order: 2, instagramKeywords: 'precio' }, instruction]);
    render(<TrainingTab />);

    expect(await screen.findByRole('article', { name: 'Precios' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: instruction.title })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
