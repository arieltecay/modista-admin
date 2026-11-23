import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chats, instagramChat, LONG_INSTAGRAM_ID, messages, WHATSAPP_ID } from '@/test/fixtures/botMessage';

// Characterization tests: they pin the current behaviour and the exact service calls,
// so the visual redesign can be checked against them without touching the API.
// The HTTP routes behind each call are pinned in src/services/*.test.ts.

const chat = vi.hoisted(() => ({
  getChats: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteMessage: vi.fn(),
  clearChat: vi.fn(),
}));
vi.mock('@/services/chatService', () => chat);

const faq = vi.hoisted(() => ({ createFAQ: vi.fn() }));
vi.mock('@/services/faq/faqService', () => ({ faqService: faq }));

const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/components/shared/Toast', () => ({ notify }));

const refreshUnreadCount = vi.hoisted(() => vi.fn());
vi.mock('@/context/NotificationContext', () => ({ useNotifications: () => ({ refreshUnreadCount }) }));

// The other tabs load their own data and have their own tests.
vi.mock('./tabs/TrainingTab', () => ({ default: () => <p>training-tab</p> }));
vi.mock('./tabs/TemplatesTab', () => ({ default: () => <p>templates-tab</p> }));
vi.mock('./tabs/EnrollmentTab', () => ({ default: () => <p>enrollment-tab</p> }));

import BotMessagePage from './BotMessagePage';

const FIRST_MESSAGE = 'Hola, quiero info del curso';
const EMPTY_PANEL = 'Selecciona un chat para supervisar a Mila AI';
const composer = () => screen.getByPlaceholderText('Escribe una respuesta manual...');
const button = (name: string | RegExp) => screen.getByRole('button', { name });

const openWhatsappChat = async () => {
  const user = userEvent.setup();
  render(<BotMessagePage />);
  await user.click(await screen.findByText(`+${WHATSAPP_ID}`));
  await screen.findByText('Te escribimos por privado');
  return user;
};

const confirmInDialog = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  const dialog = await screen.findByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name }));
};

/** A promise the test resolves by hand, to hold a request in flight. */
const deferred = () => {
  let resolve: (value: unknown) => void = () => undefined;
  const promise = new Promise(done => (resolve = done));
  return { promise, resolve };
};

describe('BotMessagePage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    chat.getChats.mockReset().mockResolvedValue(chats);
    chat.getMessages.mockReset().mockResolvedValue(messages);
    chat.sendMessage.mockReset().mockResolvedValue({});
    chat.markAllAsRead.mockReset().mockResolvedValue({ modifiedCount: 3 });
    chat.deleteMessage.mockReset().mockResolvedValue({});
    chat.clearChat.mockReset().mockResolvedValue({});
    faq.createFAQ.mockReset().mockResolvedValue({});
    notify.success.mockReset();
    notify.error.mockReset();
    refreshUnreadCount.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('inbox', () => {
    it('lists every conversation with its channel id, last message and unread count', async () => {
      render(<BotMessagePage />);

      expect(await screen.findByText(`+${WHATSAPP_ID}`)).toBeInTheDocument();
      expect(screen.getByText(instagramChat._id.platform_id)).toBeInTheDocument();
      expect(screen.getByText(FIRST_MESSAGE)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(chat.getChats).toHaveBeenCalledWith();
    });

    it('shortens long ids in the list and shows them whole in the conversation', async () => {
      const longChat = { ...instagramChat, _id: { platform: 'instagram', platform_id: LONG_INSTAGRAM_ID } };
      chat.getChats.mockResolvedValue([longChat]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByText(`...${LONG_INSTAGRAM_ID.slice(-12)}`));

      expect(await screen.findByText(`Chat con ${LONG_INSTAGRAM_ID}`)).toBeInTheDocument();
    });

    it('filters by channel on the client, without new requests, and closes the open conversation', async () => {
      const user = await openWhatsappChat();

      await user.click(button(/instagram/i));
      expect(screen.queryByText(`+${WHATSAPP_ID}`)).not.toBeInTheDocument();
      expect(screen.getByText(instagramChat._id.platform_id)).toBeInTheDocument();
      expect(screen.getByText(EMPTY_PANEL)).toBeInTheDocument();

      await user.click(button(/whatsapp/i));
      expect(screen.getByText(`+${WHATSAPP_ID}`)).toBeInTheDocument();
      expect(screen.queryByText(instagramChat._id.platform_id)).not.toBeInTheDocument();

      expect(chat.getChats).toHaveBeenCalledTimes(1);
    });
  });

  describe('polling', () => {
    it('refreshes the list every 10 seconds only while the inbox tab is open', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<BotMessagePage />);
      await act(async () => {});
      expect(chat.getChats).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });
      expect(chat.getChats).toHaveBeenCalledTimes(2);

      await user.click(button(/entrenamiento/i));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30_000);
      });
      expect(chat.getChats).toHaveBeenCalledTimes(2);
    });

    it('stops refreshing when the page is left', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const { unmount } = render(<BotMessagePage />);
      await act(async () => {});
      unmount();

      await vi.advanceTimersByTimeAsync(30_000);
      expect(chat.getChats).toHaveBeenCalledTimes(1);
    });

    it('keeps the selected conversation and the draft when the list refreshes', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<BotMessagePage />);
      await user.click(await screen.findByText(`+${WHATSAPP_ID}`));
      await user.type(composer(), 'borrador');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });

      expect(chat.getChats).toHaveBeenCalledTimes(2);
      expect(composer()).toHaveValue('borrador');
      expect(screen.getByText(`Chat con ${WHATSAPP_ID}`)).toBeInTheDocument();
    });
  });

  describe('conversation', () => {
    it('loads the messages of the selected conversation by channel and id', async () => {
      await openWhatsappChat();

      expect(chat.getMessages).toHaveBeenCalledWith('whatsapp', WHATSAPP_ID);
    });

    it('labels comments and failed private replies, and never claims delivered or read', async () => {
      await openWhatsappChat();

      expect(screen.getByText('Comentario público')).toBeInTheDocument();
      expect(screen.getByText('Respuesta privada al comentario · no enviada')).toBeInTheDocument();
      // Outbound fixtures include 'delivered' and 'read': neither text, title nor accessible name may claim it.
      // Anchored so "Marcar todo leído" (a real action) does not count as a claim.
      const claim = /entregad|delivered|\bread\b|^le[ií]do$|^visto$/i;
      expect(screen.getByText('Cualquier duda avisanos')).toBeInTheDocument();
      expect(screen.queryByText(claim)).not.toBeInTheDocument();
      expect(screen.queryByTitle(claim)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(claim)).not.toBeInTheDocument();
    });
  });

  describe('manual reply', () => {
    it('sends the draft as typed, reloads the conversation and clears the field', async () => {
      const user = await openWhatsappChat();

      await user.type(composer(), '  Te paso el link  ');
      await user.keyboard('{Enter}');

      await waitFor(() => expect(composer()).toHaveValue(''));
      expect(chat.sendMessage).toHaveBeenCalledWith('whatsapp', WHATSAPP_ID, '  Te paso el link  ');
      expect(chat.getMessages).toHaveBeenNthCalledWith(2, 'whatsapp', WHATSAPP_ID);
    });

    it('does not send a blank draft', async () => {
      const user = await openWhatsappChat();

      await user.type(composer(), '   ');
      await user.keyboard('{Enter}');

      expect(chat.sendMessage).not.toHaveBeenCalled();
      // TEMP: the send button has no accessible name yet; the redesign PR switches to getByRole.
      expect(composer().closest('form')?.querySelector('[type="submit"]')).toBeDisabled();
    });

    it('sends only once while a send is in flight', async () => {
      const pending = deferred();
      chat.sendMessage.mockReturnValue(pending.promise);
      const user = await openWhatsappChat();

      await user.type(composer(), 'hola');
      await user.keyboard('{Enter}{Enter}');
      await act(async () => pending.resolve({}));

      expect(chat.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('keeps the draft and shows an error when the send fails', async () => {
      chat.sendMessage.mockRejectedValue(new Error('Meta 400'));
      const user = await openWhatsappChat();

      await user.type(composer(), 'Te paso el link');
      await user.keyboard('{Enter}');

      await waitFor(() => expect(notify.error).toHaveBeenCalledWith('No se pudo enviar el mensaje'));
      expect(composer()).toHaveValue('Te paso el link');
    });
  });

  describe('actions', () => {
    it('marks everything as read, reloads the list and the unread badge', async () => {
      const user = userEvent.setup();
      render(<BotMessagePage />);
      await screen.findByText(`+${WHATSAPP_ID}`);

      await user.click(button(/marcar todo leído/i));

      await waitFor(() => expect(notify.success).toHaveBeenCalledWith('3 mensajes marcados como leídos'));
      expect(chat.markAllAsRead).toHaveBeenCalledWith();
      expect(chat.getChats).toHaveBeenCalledTimes(2);
      expect(refreshUnreadCount).toHaveBeenCalled();
    });

    // Current wording when nothing changed (0 is falsy). Misleading, but pinned until it is decided.
    it('says "Todos los" when the server reports zero changes', async () => {
      chat.markAllAsRead.mockResolvedValue({ modifiedCount: 0 });
      const user = userEvent.setup();
      render(<BotMessagePage />);
      await screen.findByText(`+${WHATSAPP_ID}`);

      await user.click(button(/marcar todo leído/i));

      await waitFor(() => expect(notify.success).toHaveBeenCalledWith('Todos los mensajes marcados como leídos'));
    });

    it('deletes a single message only after confirming', async () => {
      const user = await openWhatsappChat();
      expect(screen.getAllByText(FIRST_MESSAGE)).toHaveLength(2); // list preview + bubble

      await user.click(screen.getAllByRole('button', { name: /borrar/i })[0]);
      expect(chat.deleteMessage).not.toHaveBeenCalled();
      await confirmInDialog(user, 'Eliminar');

      await waitFor(() => expect(chat.deleteMessage).toHaveBeenCalledWith('m1'));
      await waitFor(() => expect(screen.getAllByText(FIRST_MESSAGE)).toHaveLength(1));
      expect(notify.success).toHaveBeenCalledWith('Mensaje eliminado');
    });

    it('clears the whole history only after confirming, then reloads the list', async () => {
      const user = await openWhatsappChat();

      await user.click(button(/limpiar chat/i));
      expect(chat.clearChat).not.toHaveBeenCalled();
      await confirmInDialog(user, 'Limpiar Todo');

      await waitFor(() => expect(chat.clearChat).toHaveBeenCalledWith('whatsapp', WHATSAPP_ID));
      expect(notify.success).toHaveBeenCalledWith('Historial limpiado correctamente');
      expect(chat.getChats).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Te escribimos por privado')).not.toBeInTheDocument();
    });

    it('turns an inbound message into an FAQ through the FAQ service', async () => {
      const user = await openWhatsappChat();

      await user.click(screen.getAllByRole('button', { name: /entrenar mila/i })[0]);
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByDisplayValue(FIRST_MESSAGE)).toBeInTheDocument();

      await user.type(within(dialog).getByPlaceholderText('Escribe la respuesta que Mila dará...'), 'Escribinos al link');
      await user.click(within(dialog).getByRole('button', { name: /guardar en faq/i }));

      await waitFor(() =>
        expect(faq.createFAQ).toHaveBeenCalledWith({
          question: FIRST_MESSAGE,
          answer: 'Escribinos al link',
          category: 'general',
          status: 'active',
          order: 0,
          iconName: 'HelpCircle',
        }),
      );
      expect(notify.success).toHaveBeenCalledWith('Mila ha aprendido algo nuevo.');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it.each([
      ['marking as read', 'markAllAsRead', 'Error al marcar mensajes como leídos'],
      ['clearing the history', 'clearChat', 'Error al limpiar el historial'],
      ['deleting a message', 'deleteMessage', 'Error al eliminar el mensaje'],
    ] as const)('shows an error when %s fails', async (_action, method, message) => {
      chat[method].mockRejectedValue(new Error('500'));
      const user = await openWhatsappChat();

      if (method === 'markAllAsRead') await user.click(button(/marcar todo leído/i));
      if (method === 'clearChat') {
        await user.click(button(/limpiar chat/i));
        await confirmInDialog(user, 'Limpiar Todo');
      }
      if (method === 'deleteMessage') {
        await user.click(screen.getAllByRole('button', { name: /borrar/i })[0]);
        await confirmInDialog(user, 'Eliminar');
      }

      await waitFor(() => expect(notify.error).toHaveBeenCalledWith(message));
    });
  });

  it('switches to the other tabs', async () => {
    const user = userEvent.setup();
    render(<BotMessagePage />);

    await user.click(button(/entrenamiento/i));
    expect(screen.getByText('training-tab')).toBeInTheDocument();
    await user.click(button(/plantillas/i));
    expect(screen.getByText('templates-tab')).toBeInTheDocument();
    await user.click(button(/inscripciones/i));
    expect(screen.getByText('enrollment-tab')).toBeInTheDocument();
  });

  // Known defects, fixed by the redesign PR (each one gets a red test there first).
  it.todo('highlights only the selected conversation when two channels share the same id');
  it.todo('tells a failed chat list load apart from an empty inbox');
  it.todo('ignores a stale message response after switching to another conversation');
  it.todo('does not reload the previous conversation into the new one when a send finishes after switching');
  it.todo('keeps the panel usable when a chat arrives without _id or lastTimestamp');
});
