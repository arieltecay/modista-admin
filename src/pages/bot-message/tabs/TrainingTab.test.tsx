import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

import TrainingTab from './TrainingTab';

const save = () => screen.getByRole('button', { name: 'Guardar Instrucción' });

const fillNewInstruction = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('Ej: Mensaje de Bienvenida'), 'Horarios');
  await user.type(screen.getByPlaceholderText('Escribe aquí las instrucciones específicas para esta sección...'), 'Atendemos de 9 a 18.');
};

const renderLoaded = async () => {
  const user = userEvent.setup();
  render(<TrainingTab />);
  await screen.findByText(instruction.title);
  return user;
};

describe('TrainingTab', () => {
  beforeEach(() => {
    service.getInstructions.mockReset().mockResolvedValue([instruction]);
    service.createInstruction.mockReset().mockResolvedValue({});
    service.updateInstruction.mockReset().mockResolvedValue({});
    service.deleteInstruction.mockReset().mockResolvedValue({});
    notify.success.mockReset();
    notify.error.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists the instructions returned by the service', async () => {
    await renderLoaded();

    expect(screen.getByText('Instrucciones de Mila AI (1)')).toBeInTheDocument();
  });

  it('creates an instruction with the current payload and reloads the list', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: /nuevo bloque/i }));
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
      }),
    );
    expect(service.getInstructions).toHaveBeenCalledTimes(2);
    expect(notify.success).toHaveBeenCalledWith('Nueva instrucción creada');
  });

  it('updates the edited instruction by id with every field', async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(save());

    const { _id, ...fields } = instruction;
    await waitFor(() => expect(service.updateInstruction).toHaveBeenCalledWith(_id, fields));
    expect(notify.success).toHaveBeenCalledWith('Instrucción actualizada');
  });

  it('shows an error and keeps the form open when saving fails', async () => {
    service.createInstruction.mockRejectedValue(new Error('Instrucción inválida'));
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: /nuevo bloque/i }));
    await fillNewInstruction(user);
    await user.click(save());

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al guardar la instrucción'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('deletes only after confirming', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(service.deleteInstruction).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(service.deleteInstruction).toHaveBeenCalledWith('i1'));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(notify.success).toHaveBeenCalledWith('Sección eliminada');
  });

  it('shows an error when deleting fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    service.deleteInstruction.mockRejectedValue(new Error('500'));
    const user = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(notify.error).toHaveBeenCalledWith('Error al eliminar'));
  });

  // Known defects, fixed by the redesign PR.
  it.todo('tells a failed instruction load apart from an empty list');
  it.todo('does not send NaN as order when the order field is emptied');
});
