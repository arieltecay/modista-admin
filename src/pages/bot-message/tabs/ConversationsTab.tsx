import { useMemo, useState } from 'react';
import { faqService } from '../../../services/faq/faqService';
import { notify } from '../../../components/shared/Toast';
import { useNotifications } from '../../../context/NotificationContext';
import FAQModal from '../components/FAQModal';
import { ChatList } from '../components/ChatList';
import { ChatThread } from '../components/ChatThread';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useChatList } from '../hooks/useChatList';
import { useChatThread } from '../hooks/useChatThread';
import { toListEntries, toThreadMessages, matchesFilters } from '../utils/inboxView';
import { channelLabel, fullChatId } from '../utils/channels';
import type { ChannelFilter, ConversationsTabProps, InboxDialog } from './types';

const COMMENT_ONLY_REASON =
  'Esta persona solo comentó una publicación. Instagram no permite responderle a mano hasta que te escriba por mensaje directo.';

/** Inbox: conversation list + open conversation. Stays mounted while hidden so selection and drafts survive tab changes. */
const ConversationsTab = ({ active }: ConversationsTabProps) => {
  const { refreshUnreadCount } = useNotifications();
  const list = useChatList(active, refreshUnreadCount);
  const thread = useChatThread(list.reload);
  const [filter, setFilter] = useState<ChannelFilter>('all');
  const [query, setQuery] = useState('');
  const [showList, setShowList] = useState(true);
  const [dialog, setDialog] = useState<InboxDialog>(null);
  const [busy, setBusy] = useState(false);

  const entries = useMemo(() => toListEntries(list.chats.filter(chat => matchesFilters(chat, filter, query))), [filter, list.chats, query]);
  const threadMessages = useMemo(() => toThreadMessages(thread.messages), [thread.messages]);
  const selected = thread.selected;

  const selectByKey = (key: string) => {
    const chat = list.chats.find(item => item.key === key);
    if (!chat) return;
    thread.select(chat);
    setShowList(false);
  };

  const changeFilter = (next: ChannelFilter) => {
    setFilter(next);
    thread.close();
    setShowList(true);
  };

  /** Runs a dialog action; the dialog closes only when the action worked. */
  const run = async (action: () => Promise<boolean>) => {
    setBusy(true);
    try {
      if (await action()) setDialog(null);
    } finally {
      setBusy(false);
    }
  };

  const saveFaq = async (data: Parameters<typeof faqService.createFAQ>[0]) =>
    run(async () => {
      try {
        await faqService.createFAQ(data);
        notify.success('Mila ha aprendido algo nuevo.');
        return true;
      } catch {
        notify.error('Error al crear la FAQ');
        return false;
      }
    });

  const close = () => setDialog(null);
  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
      <div className={`${showList ? 'block' : 'hidden'} min-h-0 md:block`}>
        <ChatList
          items={entries}
          status={list.status}
          selectedKey={selected?.key ?? null}
          filter={filter}
          query={query}
          markingAllRead={list.markingAllRead}
          filtered={list.chats.length > 0}
          onFilterChange={changeFilter}
          onQueryChange={setQuery}
          onSelect={selectByKey}
          onRetry={list.reload}
          onMarkAllRead={list.markAllAsRead}
        />
      </div>
      <div className={`${showList ? 'hidden' : 'block'} h-[70vh] min-h-0 md:block md:h-full`}>
        <ChatThread
          title={selected ? fullChatId(selected.platform, selected.platformId) : null}
          channel={selected ? channelLabel(selected.platform) : ''}
          messages={threadMessages}
          status={thread.messagesStatus}
          draft={thread.draft}
          sending={thread.sending}
          onDraftChange={thread.setDraft}
          onSend={thread.send}
          onBack={() => setShowList(true)}
          onClear={() => setDialog({ type: 'clear' })}
          onDeleteMessage={id => setDialog({ type: 'delete', id })}
          onSaveAsFaq={question => setDialog({ type: 'faq', question })}
          replyBlockedReason={thread.canReply ? undefined : COMMENT_ONLY_REASON}
        />
      </div>

      <ConfirmDialog
        isOpen={dialog?.type === 'clear'}
        title="Limpiar historial"
        message="Se borran de la base de datos todos los mensajes de esta conversación. No se puede deshacer."
        confirmLabel="Limpiar todo"
        busy={busy}
        onConfirm={() => run(thread.clearHistory)}
        onClose={close}
      />
      <ConfirmDialog
        isOpen={dialog?.type === 'delete'}
        title="Eliminar mensaje"
        message="El mensaje se borra del historial. No se puede deshacer."
        confirmLabel="Eliminar"
        busy={busy}
        onConfirm={() => dialog?.type === 'delete' && run(() => thread.removeMessage(dialog.id))}
        onClose={close}
      />
      <FAQModal isOpen={dialog?.type === 'faq'} onClose={close} onSubmit={saveFaq} initialQuestion={dialog?.type === 'faq' ? dialog.question : ''} loading={busy} />
    </div>
  );
};

export default ConversationsTab;
