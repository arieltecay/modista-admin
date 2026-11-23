import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chats, instagramChat, messages, WHATSAPP_ID } from '@/test/fixtures/botMessage';

// Edge cases of the inbox found by the PR 2 review (polling visibility, IME, scroll, search).

const chat = vi.hoisted(() => ({
  getChats: vi.fn(),
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteMessage: vi.fn(),
  clearChat: vi.fn(),
}));
vi.mock('@/services/chatService', () => chat);
vi.mock('@/services/faq/faqService', () => ({ faqService: { createFAQ: vi.fn() } }));
const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/components/shared/Toast', () => ({ notify }));
vi.mock('@/context/NotificationContext', () => ({ useNotifications: () => ({ refreshUnreadCount: vi.fn() }) }));
vi.mock('@/components/shared/GlobalModal', () => import('@/test/mocks/globalModal'));
vi.mock('./tabs/TrainingTab', () => ({ default: () => <p>training-tab</p> }));
vi.mock('./tabs/TemplatesTab', () => ({ default: () => <p>templates-tab</p> }));
vi.mock('./tabs/EnrollmentTab', () => ({ default: () => <p>enrollment-tab</p> }));

import BotMessagePage from './BotMessagePage';

const composer = () => screen.getByLabelText('Respuesta manual');
const row = (id: string) => screen.queryByRole('button', { name: new RegExp(id.replace('+', '\\+')) });
const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('BotMessagePage edge cases', () => {
  const scroll = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView = scroll;
    scroll.mockReset();
    chat.getChats.mockReset().mockResolvedValue(chats);
    chat.getMessages.mockReset().mockResolvedValue(messages);
    chat.sendMessage.mockReset().mockResolvedValue({});
    chat.markAllAsRead.mockReset().mockResolvedValue({});
    notify.success.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('pauses polling while the browser tab is hidden and refreshes when it comes back', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<BotMessagePage />);
    await act(async () => {});
    expect(chat.getChats).toHaveBeenCalledTimes(1);

    act(() => setVisibility('hidden'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });
    expect(chat.getChats).toHaveBeenCalledTimes(1);

    await act(async () => setVisibility('visible'));
    expect(chat.getChats).toHaveBeenCalledTimes(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(chat.getChats).toHaveBeenCalledTimes(3);
  });

  it('does not send when Enter only confirms a word being composed (IME, predictive keyboards)', async () => {
    const user = userEvent.setup();
    render(<BotMessagePage />);
    await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
    await user.type(composer(), 'hola');

    fireEvent.keyDown(composer(), { key: 'Enter', isComposing: true });

    expect(chat.sendMessage).not.toHaveBeenCalled();
  });

  it('keeps Instagram replies blocked while it is not yet known whether the person wrote a DM', async () => {
    chat.getMessages.mockReturnValue(new Promise(() => undefined));
    const user = userEvent.setup();
    render(<BotMessagePage />);

    await user.click(await screen.findByRole('button', { name: new RegExp(instagramChat._id.platform_id) }));

    expect(composer()).toBeDisabled();
  });

  it('does not jump to the latest message while typing or when the list refreshes', async () => {
    const user = userEvent.setup();
    render(<BotMessagePage />);
    await user.click(await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) }));
    await screen.findByText('Te escribimos por privado');
    const scrollsAfterOpening = scroll.mock.calls.length;

    await user.type(composer(), 'escribiendo');

    expect(scroll).toHaveBeenCalledTimes(scrollsAfterOpening);
  });

  it('searches by id and ignores case, together with the channel filter', async () => {
    const user = userEvent.setup();
    render(<BotMessagePage />);
    await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });

    await user.type(screen.getByLabelText('Buscar conversación'), `+${WHATSAPP_ID.slice(0, 5)}`);
    expect(row(`+${WHATSAPP_ID}`)).toBeInTheDocument();
    expect(row(instagramChat._id.platform_id)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Buscar conversación'));
    await user.type(screen.getByLabelText('Buscar conversación'), 'PRECIO');
    await user.click(screen.getByRole('button', { name: 'WhatsApp' }));
    expect(screen.getByText('No hay conversaciones con este filtro.')).toBeInTheDocument();
  });

  it('keeps the generic message when the server does not report how many were marked', async () => {
    const user = userEvent.setup();
    render(<BotMessagePage />);
    await screen.findByRole('button', { name: new RegExp(`\\+${WHATSAPP_ID}`) });

    await user.click(screen.getByRole('button', { name: 'Marcar todo como leído' }));

    await waitFor(() => expect(notify.success).toHaveBeenCalledWith('Todos los mensajes marcados como leídos'));
  });
});
