import { Archive, ArrowLeft, MoreVertical, Pencil, Phone, Search, Send, Trash2 } from 'lucide-react';
import {
  AppBar,
  Badge,
  BadgeAnchor,
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetTrigger,
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  ExtendedFAB,
  IconButton,
  SearchBar,
  TextField,
} from 'm3you';
import { useMemo, useState } from 'react';
import { usePortalProps } from '@/components/showcase/surface';

/**
 * Messages — a thread list that filters and searches, and a conversation view
 * with a working composer.
 *
 * Sending a message updates real state, so the demo is a small app rather than
 * a static mock-up.
 */

type Message = { id: number; from: 'me' | 'them'; text: string };
type Thread = {
  id: number;
  name: string;
  time: string;
  unread: boolean;
  archived: boolean;
  messages: Message[];
};

const INITIAL_THREADS: Thread[] = [
  {
    id: 1,
    name: 'Dilnoza',
    time: '09:41',
    unread: true,
    archived: false,
    messages: [
      { id: 1, from: 'them', text: 'Are we still on for lunch?' },
      { id: 2, from: 'me', text: 'Yes — 1pm at the usual place' },
      { id: 3, from: 'them', text: 'Perfect, see you there 🙂' },
    ],
  },
  {
    id: 2,
    name: 'Design team',
    time: '08:12',
    unread: true,
    archived: false,
    messages: [
      { id: 1, from: 'them', text: 'Pushed the new shape tokens to the branch' },
      { id: 2, from: 'me', text: 'Nice. Do the button groups morph correctly now?' },
      { id: 3, from: 'them', text: 'They do — spring curve looks much better' },
    ],
  },
  {
    id: 3,
    name: 'Bekzod',
    time: 'Yesterday',
    unread: false,
    archived: false,
    messages: [
      { id: 1, from: 'them', text: 'Thanks for the review!' },
      { id: 2, from: 'me', text: 'Any time' },
    ],
  },
  {
    id: 4,
    name: 'Delivery',
    time: 'Mon',
    unread: false,
    archived: true,
    messages: [{ id: 1, from: 'them', text: 'Your parcel has been delivered.' }],
  },
];

const FILTERS = ['All', 'Unread', 'Archived'] as const;

export function MessagesApp() {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  const visible = useMemo(() => {
    return threads.filter((thread) => {
      if (filter === 'Unread' && !thread.unread) return false;
      if (filter === 'Archived' && !thread.archived) return false;
      if (filter === 'All' && thread.archived) return false;
      if (!query) return true;
      const haystack = `${thread.name} ${thread.messages.map((message) => message.text).join(' ')}`;
      return haystack.toLowerCase().includes(query.toLowerCase());
    });
  }, [threads, filter, query]);

  const open = threads.find((thread) => thread.id === openId) ?? null;

  if (open) {
    return (
      <Conversation
        thread={open}
        onBack={() => setOpenId(null)}
        onSend={(text) =>
          setThreads((current) =>
            current.map((thread) =>
              thread.id === open.id
                ? { ...thread, messages: [...thread.messages, { id: Date.now(), from: 'me', text }] }
                : thread,
            ),
          )
        }
        onDelete={() => {
          setThreads((current) => current.filter((thread) => thread.id !== open.id));
          setOpenId(null);
        }}
      />
    );
  }

  const unreadCount = threads.filter((thread) => thread.unread && !thread.archived).length;

  return (
    <div className="app">
      <AppBar
        headline="Messages"
        trailingIcons={
          <BadgeAnchor badge={<Badge count={unreadCount} visible={unreadCount > 0} />}>
            <IconButton variant="standard" aria-label="Archived">
              <Archive size={20} aria-hidden="true" />
            </IconButton>
          </BadgeAnchor>
        }
      />

      <div style={{ padding: '0 1rem' }}>
        <SearchBar placeholder="Search messages" value={query} onValueChange={setQuery} />
      </div>

      <div className="msg__filters">
        {FILTERS.map((option) => (
          <Chip key={option} type="filter" selected={filter === option} onClick={() => setFilter(option)}>
            {option}
          </Chip>
        ))}
      </div>

      <div className="app__body">
        {visible.length === 0 ? (
          <div className="app__empty">
            <Search size={28} aria-hidden="true" />
            <span>No conversations match.</span>
          </div>
        ) : (
          visible.map((thread) => (
            <button
              type="button"
              className="msg__thread"
              key={thread.id}
              data-unread={thread.unread}
              onClick={() => {
                setOpenId(thread.id);
                setThreads((current) =>
                  current.map((item) => (item.id === thread.id ? { ...item, unread: false } : item)),
                );
              }}
            >
              <span className="msg__avatar">{thread.name.charAt(0)}</span>
              <span className="msg__thread-main">
                <span className="msg__thread-head">
                  <span className="msg__thread-name">{thread.name}</span>
                  <span className="msg__thread-time">{thread.time}</span>
                </span>
                <p className="msg__thread-preview">{thread.messages.at(-1)?.text}</p>
              </span>
              {thread.unread ? <Badge /> : null}
            </button>
          ))
        )}
      </div>

      <div className="app__fab">
        <ComposeSheet />
      </div>
    </div>
  );
}

/**
 * A real bottom sheet, portalled into the phone frame via `portalProps`.
 * Without that it would render at the page root and cover the whole document.
 */
function ComposeSheet() {
  const portal = usePortalProps();

  return (
    <BottomSheet>
      <BottomSheetTrigger render={<ExtendedFAB icon={<Pencil size={20} aria-hidden="true" />} label="Compose" />} />
      <BottomSheetContent {...portal}>
        <BottomSheetBody>
          <div style={{ display: 'grid', gap: '0.75rem', padding: '0 1.5rem 2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 400 }}>New message</h2>
            <p style={{ margin: 0, opacity: 0.75 }}>Pick someone to start a conversation with.</p>
            {['Dilnoza', 'Design team', 'Bekzod'].map((name) => (
              <BottomSheetClose
                key={name}
                render={
                  <button type="button" className="msg__thread">
                    <span className="msg__avatar">{name.charAt(0)}</span>
                    <span className="msg__thread-name">{name}</span>
                  </button>
                }
              />
            ))}
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function Conversation({
  thread,
  onBack,
  onSend,
  onDelete,
}: {
  thread: Thread;
  onBack: () => void;
  onSend: (text: string) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [confirming, setConfirming] = useState(false);
  const portal = usePortalProps();

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="app">
      <AppBar
        headline={thread.name}
        leadingIcon={
          <IconButton variant="standard" onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} aria-hidden="true" />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" aria-label="Call">
              <Phone size={20} aria-hidden="true" />
            </IconButton>
            <IconButton variant="standard" aria-label="Delete conversation" onClick={() => setConfirming(true)}>
              <MoreVertical size={20} aria-hidden="true" />
            </IconButton>
          </>
        }
      />

      <div className="app__body">
        <div className="msg__conversation">
          {thread.messages.map((message) => (
            <div className="msg__bubble" data-from={message.from} key={message.id}>
              {message.text}
            </div>
          ))}
        </div>
      </div>

      <div className="msg__composer">
        <TextField
          variant="outlined"
          label="Message"
          value={draft}
          onValueChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send();
          }}
        />
        <IconButton variant="filled" onClick={send} aria-label="Send">
          <Send size={20} aria-hidden="true" />
        </IconButton>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent {...portal}>
          <DialogTitle>Delete conversation?</DialogTitle>
          <DialogBody>
            <DialogDescription>
              The messages with {thread.name} will be removed from this device. This cannot be undone.
            </DialogDescription>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="filled" onClick={onDelete}>
              <Trash2 size={18} aria-hidden="true" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
