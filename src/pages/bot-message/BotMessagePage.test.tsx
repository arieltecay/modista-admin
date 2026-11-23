import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chats, instagramChat, LONG_INSTAGRAM_ID, messages, WHATSAPP_ID, whatsappChat } from '@/test/fixtures/botMessage';

// Characterization tests: they pin the behaviour and the exact service calls of the Messages section.
// The HTTP routes behind each call are pinned in src/services/**/*.test.ts.
// PR 2 (redesign) changed only UI copy and roles here; every service assertion is unchanged.

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

vi.mock('@/components/shared/GlobalModal', () => import('@/test/mocks/globalModal'));

// The other tabs load their own data and have their own tests.
const crashTraining = vi.hoisted(() => ({ value: false }));
vi.mock('./tabs/TrainingTab', () => ({
  default: () => {
    if (crashTraining.value) throw new Error('boom');
    return <p>training-tab</p>;
  },
}));
vi.mock('./tabs/TemplatesTab', () => ({ default: () => <p>templates-tab</p> }));
vi.mock('./tabs/EnrollmentTab', () => ({ default: () => <p>enrollment-tab</p> }));

import BotMessagePage from './BotMessagePage';

const FIRST_MESSAGE = 'Hola, quiero info del curso';
const EMPTY_THREAD = 'Elegí una conversación para ver los mensajes.';
const composer = () => screen.getByLabelText('Respuesta manual');
const button = (name: string | RegExp) => screen.getByRole('button', { name });
const tab = (name: string | RegExp) => screen.getByRole('tab', { name });
const chatButton = (name: string | RegExp) => screen.getByRole('button', { name });
const threadHeading = () => screen.getByRole('heading', { level: 2 });

const openWhatsappChat = async () => {
  const user = userEvent.setup();
  render(<BotMessagePage />);
  await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
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
  let reject: (error: Error) => void = () => undefined;
  const promise = new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};

describe('BotMessagePage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    crashTraining.value = false;
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
    vi.restoreAllMocks();
  });

  describe('layout', () => {
    it('shows the section as accessible tabs with business names', () => {
      render(<BotMessagePage />);

      expect(screen.getByRole('heading', { level: 1, name: 'Mensajes' })).toBeInTheDocument();
      expect(screen.getAllByRole('tab').map(t => t.textContent)).toEqual([
        'Bandeja',
        'Respuestas automáticas',
        'Plantillas de WhatsApp',
        'Inscripciones',
      ]);
      expect(tab('Bandeja')).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to the other tabs', async () => {
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(tab('Respuestas automáticas'));
      expect(screen.getByText('training-tab')).toBeInTheDocument();
      await user.click(tab('Plantillas de WhatsApp'));
      expect(screen.getByText('templates-tab')).toBeInTheDocument();
      await user.click(tab('Inscripciones'));
      expect(screen.getByText('enrollment-tab')).toBeInTheDocument();
    });

    it('keeps the panel usable when a tab crashes', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      crashTraining.value = true;
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(tab('Respuestas automáticas'));

      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo mostrar esta sección');
      await user.click(tab('Bandeja'));
      expect(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) })).toBeInTheDocument();

      crashTraining.value = false;
      await user.click(tab('Respuestas automáticas'));
      expect(screen.getByText('training-tab')).toBeInTheDocument();
    });
  });

  describe('drafts and stale actions', () => {
    it('keeps a separate draft per conversation, so text never moves to another person', async () => {
      const user = await openWhatsappChat();
      await user.type(composer(), 'para whatsapp');

      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await waitFor(() => expect(composer()).toHaveValue(''));

      await user.click(screen.getByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
      await waitFor(() => expect(composer()).toHaveValue('para whatsapp'));
    });

    it('clears the sent draft and leaves the new conversation empty when switching during a send', async () => {
      const pending = deferred();
      chat.sendMessage.mockReturnValue(pending.promise);
      const user = await openWhatsappChat();

      await user.type(composer(), 'hola');
      await user.keyboard('{Enter}');
      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await act(async () => pending.resolve({}));

      expect(composer()).toHaveValue('');
      await user.click(screen.getByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
      await waitFor(() => expect(composer()).toHaveValue(''));
    });

    it('does not empty another conversation when a clear finishes after switching', async () => {
      const pending = deferred();
      chat.clearChat.mockReturnValue(pending.promise);
      chat.getMessages.mockResolvedValueOnce(messages).mockResolvedValueOnce([
        { _id: 'ig1', direction: 'inbound', body: 'Hola desde Instagram', timestamp: '2026-11-22T12:00:00.000Z' },
      ]);
      const user = await openWhatsappChat();

      await user.click(button('Limpiar historial'));
      await confirmInDialog(user, 'Limpiar todo');
      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await screen.findByText('Hola desde Instagram');
      await act(async () => pending.resolve({}));

      expect(screen.getByText('Hola desde Instagram')).toBeInTheDocument();
    });

    it('keeps the confirmation open and blocks Cancel while the action is running', async () => {
      const pending = deferred();
      chat.clearChat.mockReturnValue(pending.promise);
      const user = await openWhatsappChat();

      await user.click(button('Limpiar historial'));
      await confirmInDialog(user, 'Limpiar todo');

      expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' })).toBeDisabled();
      await act(async () => pending.resolve({}));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('applies only the latest list response when an old poll answers late', async () => {
      const slow = deferred();
      chat.getChats.mockReturnValueOnce(slow.promise).mockResolvedValueOnce([{ ...whatsappChat, unreadCount: 0 }]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      // The first poll is still in flight; "mark all read" reloads the list with a newer request.
      await user.click(button('Marcar todo como leído'));
      await waitFor(() => expect(chat.getChats).toHaveBeenCalledTimes(2));
      await act(async () => slow.resolve([{ ...whatsappChat, unreadCount: 7 }]));

      const row = await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });
      expect(row).not.toHaveAccessibleName(expect.stringContaining('7 sin leer'));
    });
  });

  describe('inbox', () => {
    it('lists every conversation with its channel id, last message and unread count', async () => {
      render(<BotMessagePage />);

      const whatsapp = await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });
      expect(whatsapp).toHaveTextContent(FIRST_MESSAGE);
      expect(whatsapp).toHaveTextContent('2');
      expect(whatsapp).toHaveAccessibleName(expect.stringContaining('2 sin leer'));
      expect(chatButton(new RegExp(instagramChat._id.platform_id))).toBeInTheDocument();
      expect(chat.getChats).toHaveBeenCalledWith();
    });

    it('shortens long ids in the list and shows them whole in the conversation', async () => {
      const longChat = { ...instagramChat, _id: { platform: 'instagram', platform_id: LONG_INSTAGRAM_ID } };
      chat.getChats.mockResolvedValue([longChat]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByText(`...${LONG_INSTAGRAM_ID.slice(-12)}`));

      await waitFor(() => expect(threadHeading()).toHaveTextContent(LONG_INSTAGRAM_ID));
    });

    it('highlights only the selected conversation when two channels share the same id', async () => {
      const twin = { ...instagramChat, _id: { platform: 'instagram', platform_id: WHATSAPP_ID } };
      chat.getChats.mockResolvedValue([whatsappChat, twin]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));

      const current = screen.getAllByRole('button').filter(b => b.getAttribute('aria-current') === 'true');
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveAccessibleName(expect.stringContaining('WhatsApp'));
    });

    it('filters by channel on the client, without new requests, and closes the open conversation', async () => {
      const user = await openWhatsappChat();

      await user.click(button('Instagram'));
      expect(screen.queryByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) })).not.toBeInTheDocument();
      expect(chatButton(new RegExp(instagramChat._id.platform_id))).toBeInTheDocument();
      expect(screen.getByText(EMPTY_THREAD)).toBeInTheDocument();

      await user.click(button('WhatsApp'));
      expect(screen.getByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: new RegExp(instagramChat._id.platform_id) })).not.toBeInTheDocument();

      expect(chat.getChats).toHaveBeenCalledTimes(1);
    });

    it('searches the loaded conversations locally, without new requests', async () => {
      const user = userEvent.setup();
      render(<BotMessagePage />);
      await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });

      await user.type(screen.getByLabelText('Buscar conversación'), 'precio');

      expect(chatButton(new RegExp(instagramChat._id.platform_id))).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) })).not.toBeInTheDocument();
      expect(chat.getChats).toHaveBeenCalledTimes(1);
    });

    it('tells a failed chat list load apart from an empty inbox, and retries', async () => {
      chat.getChats.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce([]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las conversaciones.');
      await user.click(button('Reintentar'));

      expect(await screen.findByText('Todavía no hay conversaciones.')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('keeps the panel usable when a chat arrives without _id or lastTimestamp', async () => {
      chat.getChats.mockResolvedValue([{ lastMessage: 'roto' }, { ...whatsappChat, lastTimestamp: undefined }]);
      render(<BotMessagePage />);

      const row = await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });
      expect(row).not.toHaveTextContent('Invalid Date');
      expect(screen.queryByText('roto')).not.toBeInTheDocument();
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

      await user.click(tab('Respuestas automáticas'));
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
      await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
      await user.type(composer(), 'borrador');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10_000);
      });

      expect(chat.getChats).toHaveBeenCalledTimes(2);
      expect(composer()).toHaveValue('borrador');
      expect(threadHeading()).toHaveTextContent(WHATSAPP_ID);
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
      // Anchored so "Marcar todo como leído" (a real action) does not count as a claim.
      const claim = /entregad|delivered|\bread\b|^le[ií]do$|^visto$/i;
      expect(screen.getByText('Cualquier duda avisanos')).toBeInTheDocument();
      expect(screen.queryByText(claim)).not.toBeInTheDocument();
      expect(screen.queryByTitle(claim)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(claim)).not.toBeInTheDocument();
    });

    it('ignores a stale message response after switching to another conversation', async () => {
      const slow = deferred();
      chat.getMessages.mockReturnValueOnce(slow.promise).mockResolvedValueOnce([
        { _id: 'ig1', direction: 'inbound', body: 'Hola desde Instagram', timestamp: '2026-11-22T12:00:00.000Z' },
      ]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await screen.findByText('Hola desde Instagram');
      await act(async () => slow.resolve(messages));

      expect(screen.queryByText('Te escribimos por privado')).not.toBeInTheDocument();
      expect(threadHeading()).toHaveTextContent(instagramChat._id.platform_id);
    });

    it('ignores an older load when returning to the same conversation after switching away', async () => {
      const oldWhatsappLoad = deferred();
      chat.getMessages
        .mockReturnValueOnce(oldWhatsappLoad.promise)
        .mockResolvedValueOnce([
          { _id: 'ig2', direction: 'inbound', body: 'Mensaje de Instagram', timestamp: '2026-11-22T12:01:00.000Z' },
        ])
        .mockResolvedValueOnce([
          { _id: 'wa-new', direction: 'inbound', body: 'Carga reciente de WhatsApp', timestamp: '2026-11-22T12:02:00.000Z' },
        ]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await screen.findByText('Mensaje de Instagram');
      await user.click(chatButton(new RegExp(`\\+${WHATSAPP_ID}`)));
      await screen.findByText('Carga reciente de WhatsApp');

      await act(async () => oldWhatsappLoad.resolve([
        { _id: 'wa-old', direction: 'inbound', body: 'Carga vieja de WhatsApp', timestamp: '2026-11-22T12:00:00.000Z' },
      ]));

      expect(screen.queryByText('Carga vieja de WhatsApp')).not.toBeInTheDocument();
      expect(screen.getByText('Carga reciente de WhatsApp')).toBeInTheDocument();
    });

    it('ignores an older rejected load after returning to the same conversation', async () => {
      const oldWhatsappLoad = deferred();
      chat.getMessages
        .mockReturnValueOnce(oldWhatsappLoad.promise)
        .mockResolvedValueOnce([
          { _id: 'ig3', direction: 'inbound', body: 'Otro mensaje de Instagram', timestamp: '2026-11-22T12:01:00.000Z' },
        ])
        .mockResolvedValueOnce([
          { _id: 'wa-current', direction: 'inbound', body: 'WhatsApp actual', timestamp: '2026-11-22T12:02:00.000Z' },
        ]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await screen.findByText('Otro mensaje de Instagram');
      await user.click(chatButton(new RegExp(`\\+${WHATSAPP_ID}`)));
      await screen.findByText('WhatsApp actual');

      await act(async () => oldWhatsappLoad.reject(new Error('respuesta vieja')));

      expect(screen.getByText('WhatsApp actual')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not restore a message from an old reload after deleting it', async () => {
      const oldReload = deferred();
      chat.getMessages.mockResolvedValueOnce(messages).mockReturnValueOnce(oldReload.promise);
      const user = await openWhatsappChat();

      await user.type(composer(), 'respuesta');
      await user.keyboard('{Enter}');
      await waitFor(() => expect(chat.getMessages).toHaveBeenCalledTimes(2));
      await user.click(within(screen.getByLabelText('Mensajes')).getAllByRole('button', { name: 'Borrar mensaje' })[4]);
      await confirmInDialog(user, 'Eliminar');
      await waitFor(() => expect(chat.deleteMessage).toHaveBeenCalledWith('m5'));

      await act(async () => oldReload.resolve(messages));

      expect(screen.queryByText('Cualquier duda avisanos')).not.toBeInTheDocument();
    });

    it('keeps a cleared conversation empty when an older reload finishes later', async () => {
      const oldReload = deferred();
      chat.getMessages.mockResolvedValueOnce(messages).mockReturnValueOnce(oldReload.promise);
      const user = await openWhatsappChat();

      await user.type(composer(), 'respuesta');
      await user.keyboard('{Enter}');
      await waitFor(() => expect(chat.getMessages).toHaveBeenCalledTimes(2));
      await user.click(button('Limpiar historial'));
      await confirmInDialog(user, 'Limpiar todo');
      await waitFor(() => expect(chat.clearChat).toHaveBeenCalledWith('whatsapp', WHATSAPP_ID));

      await act(async () => oldReload.resolve(messages));

      expect(screen.getByText('Esta conversación no tiene mensajes.')).toBeInTheDocument();
    });

    it('explains why a comment-only Instagram chat cannot be answered by hand', async () => {
      chat.getMessages.mockResolvedValue([messages[1]]);
      const user = userEvent.setup();
      render(<BotMessagePage />);

      await user.click(await screen.findByRole('button', { name: new RegExp(instagramChat._id.platform_id) }));

      expect(await screen.findByText(/solo comentó una publicación/i)).toBeInTheDocument();
      expect(composer()).toBeDisabled();
    });

    it('goes back to the list with a named button', async () => {
      const user = await openWhatsappChat();

      await user.click(button('Volver a conversaciones'));

      expect(screen.getByLabelText('Buscar conversación')).toBeInTheDocument();
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
      expect(button('Enviar')).toBeDisabled();
    });

    it('sends only once while a send is in flight', async () => {
      const pending = deferred();
      chat.sendMessage.mockReturnValue(pending.promise);
      const user = await openWhatsappChat();

      await user.type(composer(), 'hola');
      await user.keyboard('{Enter}{Enter}');
      await user.click(button(/enviando/i));
      await act(async () => pending.resolve({}));

      expect(chat.sendMessage).toHaveBeenCalledTimes(1);
    });

    it('does not reload the previous conversation into the new one when a send finishes after switching', async () => {
      const pending = deferred();
      chat.sendMessage.mockReturnValue(pending.promise);
      const user = await openWhatsappChat();

      await user.type(composer(), 'hola');
      await user.keyboard('{Enter}');
      await user.click(chatButton(new RegExp(instagramChat._id.platform_id)));
      await act(async () => pending.resolve({}));

      expect(chat.getMessages).toHaveBeenCalledTimes(2);
      expect(chat.getMessages).toHaveBeenLastCalledWith('instagram', instagramChat._id.platform_id);
      expect(threadHeading()).toHaveTextContent(instagramChat._id.platform_id);
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
      await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });

      await user.click(button('Marcar todo como leído'));

      await waitFor(() => expect(notify.success).toHaveBeenCalledWith('3 mensajes marcados como leídos'));
      expect(chat.markAllAsRead).toHaveBeenCalledWith();
      expect(chat.getChats).toHaveBeenCalledTimes(2);
      expect(refreshUnreadCount).toHaveBeenCalled();
    });

    it('says nothing was pending when the server reports zero changes', async () => {
      chat.markAllAsRead.mockResolvedValue({ modifiedCount: 0 });
      const user = userEvent.setup();
      render(<BotMessagePage />);
      await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });

      await user.click(button('Marcar todo como leído'));

      await waitFor(() => expect(notify.success).toHaveBeenCalledWith('No había mensajes sin leer'));
    });

    it('deletes a single message only after confirming', async () => {
      const user = await openWhatsappChat();
      expect(screen.getAllByText(FIRST_MESSAGE)).toHaveLength(2); // list preview + bubble

      await user.click(screen.getAllByRole('button', { name: 'Borrar mensaje' })[0]);
      expect(chat.deleteMessage).not.toHaveBeenCalled();
      await confirmInDialog(user, 'Eliminar');

      await waitFor(() => expect(chat.deleteMessage).toHaveBeenCalledWith('m1'));
      await waitFor(() => expect(screen.getAllByText(FIRST_MESSAGE)).toHaveLength(1));
      expect(notify.success).toHaveBeenCalledWith('Mensaje eliminado');
    });

    it('clears the whole history only after confirming, then reloads the list', async () => {
      const user = await openWhatsappChat();

      await user.click(button('Limpiar historial'));
      expect(chat.clearChat).not.toHaveBeenCalled();
      await confirmInDialog(user, 'Limpiar todo');

      await waitFor(() => expect(chat.clearChat).toHaveBeenCalledWith('whatsapp', WHATSAPP_ID));
      expect(notify.success).toHaveBeenCalledWith('Historial limpiado correctamente');
      expect(chat.getChats).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Te escribimos por privado')).not.toBeInTheDocument();
    });

    it('turns an inbound message into an FAQ through the FAQ service', async () => {
      const user = await openWhatsappChat();

      await user.click(screen.getAllByRole('button', { name: 'Guardar como FAQ' })[0]);
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

      if (method === 'markAllAsRead') await user.click(button('Marcar todo como leído'));
      if (method === 'clearChat') {
        await user.click(button('Limpiar historial'));
        await confirmInDialog(user, 'Limpiar todo');
      }
      if (method === 'deleteMessage') {
        await user.click(screen.getAllByRole('button', { name: 'Borrar mensaje' })[0]);
        await confirmInDialog(user, 'Eliminar');
      }

      await waitFor(() => expect(notify.error).toHaveBeenCalledWith(message));
    });
  });
});
