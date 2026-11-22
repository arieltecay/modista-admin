import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import InstructionModal from './InstructionModal';

describe('InstructionModal', () => {
  it('submits the Instagram trigger phrases and enrollment permission', async () => {
    const onSubmit = vi.fn();
    render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false} />);

    await userEvent.type(screen.getByPlaceholderText('Ej: Mensaje de Bienvenida'), 'Curso camisa');
    await userEvent.type(screen.getByPlaceholderText('Escribe aquí las instrucciones específicas para esta sección...'), 'El curso comienza el 23 de noviembre.');
    await userEvent.click(screen.getByLabelText('Permitir que este bloque responda en Instagram'));
    await userEvent.type(screen.getByLabelText('Frases que activan este bloque'), 'camisa, cuellos');
    await userEvent.click(screen.getByLabelText('Permitir consulta de inscripciones en este tema'));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar Instrucción' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      instagramAutoReply: true,
      instagramKeywords: ['camisa', 'cuellos'],
      instagramEnrollmentLookup: true,
    }));
  });

  it('enables public comment replies independently of DMs, sharing the trigger phrases', async () => {
    const onSubmit = vi.fn();
    render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false} />);

    await userEvent.type(screen.getByPlaceholderText('Ej: Mensaje de Bienvenida'), 'Curso camisa');
    await userEvent.type(screen.getByPlaceholderText('Escribe aquí las instrucciones específicas para esta sección...'), 'Empieza el 23.');
    await userEvent.click(screen.getByLabelText('Responder comentarios públicos por mensaje privado'));
    expect(screen.getByRole('button', { name: 'Guardar Instrucción' })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Frases que activan este bloque'), 'camisa');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar Instrucción' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      instagramAutoReply: false,
      instagramCommentReply: true,
      instagramKeywords: ['camisa'],
      instagramEnrollmentLookup: false,
    }));
  });

  it('keeps comment replies off for blocks created before the feature', () => {
    render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false}
      instruction={{ _id: '1', title: 'Viejo', content: 'x', order: 1, isActive: true, instagramAutoReply: true, instagramKeywords: ['camisa'] }} />);
    expect(screen.getByLabelText('Responder comentarios públicos por mensaje privado')).not.toBeChecked();
  });
});
