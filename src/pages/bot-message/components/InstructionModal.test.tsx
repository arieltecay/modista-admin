import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import InstructionModal from './InstructionModal';

const fillBasics = async (title: string, content: string) => {
  await userEvent.type(screen.getByLabelText('Nombre de la regla'), title);
  await userEvent.type(screen.getByLabelText('Lo que sabe Mila'), content);
};
const save = () => screen.getByRole('button', { name: 'Guardar regla' });

describe('InstructionModal', () => {
  it('submits the Instagram trigger phrases and enrollment permission', async () => {
    const onSubmit = vi.fn();
    render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false} />);

    await fillBasics('Curso camisa', 'El curso comienza el 23 de noviembre.');
    await userEvent.click(screen.getByLabelText('Permitir que este bloque responda en Instagram'));
    await userEvent.type(screen.getByLabelText('Frases que activan este bloque'), 'camisa, cuellos');
    await userEvent.click(screen.getByLabelText('Permitir consulta de inscripciones en este tema'));
    await userEvent.click(save());

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      instagramAutoReply: true,
      instagramKeywords: ['camisa', 'cuellos'],
      instagramEnrollmentLookup: true,
    }));
  });

  it('enables public comment replies independently of DMs, sharing the trigger phrases', async () => {
    const onSubmit = vi.fn();
    render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false} />);

    await fillBasics('Curso camisa', 'Empieza el 23.');
    await userEvent.click(screen.getByLabelText('Responder comentarios públicos por mensaje privado'));
    expect(save()).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Frases que activan este bloque'), 'camisa');
    await userEvent.click(save());

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

  it('says the text is context for Mila, not a literal reply', () => {
    render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByText(/Mila redacta la respuesta usando este texto/)).toBeInTheDocument();
  });

  describe('Instagram reply mode', () => {
    const legacy = { _id: '1', title: 'Viejo', content: 'Contexto viejo', order: 1, isActive: true, instagramAutoReply: true, instagramKeywords: ['camisa'] };
    const fixedRule = { ...legacy, instagramResponseMode: 'fixed' as const, instagramFixedResponse: 'Hola 👋\nTe paso el link' };
    const geminiOption = () => screen.getByRole('radio', { name: /Mila redacta con Gemini/ });
    const fixedOption = () => screen.getByRole('radio', { name: /Enviar respuesta fija/ });
    const fixedText = () => screen.queryByLabelText('Mensaje que se enviará');

    it('starts in Gemini mode for new and legacy rules, without the fixed message field', () => {
      const { rerender } = render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={legacy} />);
      expect(geminiOption()).toBeChecked();
      expect(fixedText()).not.toBeInTheDocument();

      rerender(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={null} />);
      expect(screen.queryByRole('radio', { name: /Mila redacta con Gemini/ })).not.toBeInTheDocument();
    });

    it('shows the fixed message only in fixed mode and says it is sent as is, without Gemini', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={legacy} />);
      await userEvent.click(fixedOption());
      expect(fixedText()).toBeInTheDocument();
      expect(screen.getByText(/se envía tal cual y no usa Gemini/)).toBeInTheDocument();
    });

    it('blocks saving a fixed rule with an empty message', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={legacy} />);
      await userEvent.click(fixedOption());
      expect(save()).toBeDisabled();
      await userEvent.type(fixedText()!, '   ');
      expect(save()).toBeDisabled();
      await userEvent.type(fixedText()!, 'Hola');
      expect(save()).toBeEnabled();
    });

    it('selects Gemini once Instagram is turned on for a new rule', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} />);
      await userEvent.click(screen.getByLabelText('Permitir que este bloque responda en Instagram'));
      expect(geminiOption()).toBeChecked();
      expect(fixedText()).not.toBeInTheDocument();
    });

    it('counts the 900-character limit on the trimmed text', async () => {
      const { rerender } = render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false}
        instruction={{ ...fixedRule, instagramFixedResponse: `  ${'a'.repeat(900)}  ` }} />);
      expect(save()).toBeEnabled();
      rerender(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false}
        instruction={{ ...fixedRule, instagramFixedResponse: 'a'.repeat(901) }} />);
      expect(save()).toBeDisabled();
      expect(fixedText()).toHaveAttribute('aria-invalid', 'true');
    });

    it('explains why saving is blocked when the fixed message is empty', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={legacy} />);
      await userEvent.click(fixedOption());
      expect(screen.getByText(/Escribí el mensaje para poder guardar/)).toBeInTheDocument();
    });

    it('in Gemini mode, still blocks a kept fixed text the API would reject, and says why', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false}
        instruction={{ ...fixedRule, instagramResponseMode: 'gemini', instagramFixedResponse: 'a'.repeat(901) }} />);
      expect(save()).toBeDisabled();
      expect(screen.getByRole('alert')).toHaveTextContent(/demasiado largo/);
    });

    it('keeps the reply mode visible after turning Instagram off, so the user can unblock saving', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={legacy} />);
      await userEvent.click(fixedOption());
      await userEvent.click(screen.getByLabelText('Permitir que este bloque responda en Instagram'));
      expect(save()).toBeDisabled();
      await userEvent.click(geminiOption());
      expect(save()).toBeEnabled();
    });

    it('blocks a message too long for one Instagram message, counting emojis by size', async () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false}
        instruction={{ ...fixedRule, instagramFixedResponse: '👋'.repeat(300) }} />);
      expect(save()).toBeDisabled();
      expect(screen.getByText(/demasiado largo para Instagram/i)).toBeInTheDocument();
    });

    it('keeps both texts when switching modes and submits the fixed reply apart from the Mila context', async () => {
      const onSubmit = vi.fn();
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false} instruction={legacy} />);

      await userEvent.click(fixedOption());
      await userEvent.type(fixedText()!, 'Respuesta fija');
      await userEvent.click(geminiOption());
      expect(fixedText()).not.toBeInTheDocument();
      await userEvent.click(fixedOption());
      expect(fixedText()).toHaveValue('Respuesta fija');
      expect(screen.getByLabelText('Lo que sabe Mila')).toHaveValue('Contexto viejo');
      await userEvent.click(save());

      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Contexto viejo',
        instagramResponseMode: 'fixed',
        instagramFixedResponse: 'Respuesta fija',
      }));
    });

    it('loads a saved fixed rule with its mode and message', () => {
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} loading={false} instruction={fixedRule} />);
      expect(fixedOption()).toBeChecked();
      expect(fixedText()).toHaveValue('Hola 👋\nTe paso el link');
    });

    it('keeps enrollment lookup in fixed mode and explains which questions each one answers', async () => {
      const onSubmit = vi.fn();
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false}
        instruction={{ ...fixedRule, instagramResponseMode: 'gemini', instagramEnrollmentLookup: true }} />);
      const lookup = () => screen.getByLabelText('Permitir consulta de inscripciones en este tema');
      expect(lookup()).toBeChecked();

      await userEvent.click(fixedOption());
      expect(lookup()).toBeChecked();
      expect(lookup()).toBeEnabled();
      expect(screen.getByText(/preguntas sobre el estado de una inscripción usan la consulta; las demás reciben el mensaje fijo/)).toBeInTheDocument();
      await userEvent.click(save());

      // Both settings are kept apart and saved together.
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        instagramResponseMode: 'fixed',
        instagramFixedResponse: 'Hola 👋\nTe paso el link',
        instagramEnrollmentLookup: true,
      }));
    });

    it('lets a fixed rule turn enrollment lookup on', async () => {
      const onSubmit = vi.fn();
      render(<InstructionModal isOpen onClose={vi.fn()} onSubmit={onSubmit} loading={false} instruction={fixedRule} />);
      await userEvent.click(screen.getByLabelText('Permitir consulta de inscripciones en este tema'));
      await userEvent.click(save());
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ instagramResponseMode: 'fixed', instagramEnrollmentLookup: true }));
    });
  });
});

