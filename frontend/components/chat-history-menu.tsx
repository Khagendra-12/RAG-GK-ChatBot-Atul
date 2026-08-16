'use client';

import { useState } from 'react';
import { getConversations, ConversationSummary } from '@/lib/api';

interface ChatHistoryMenuProps {
  onSelectConversation: (conversationId: string) => void;
}

export function ChatHistoryMenu({ onSelectConversation }: ChatHistoryMenuProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      setLoading(true);
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (e) {
        console.error('Failed to load chat history', e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClick = (id: string) => {
    onSelectConversation(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={handleToggle} className="glow-border px-3 py-2 rounded-lg text-sm text-foreground">
        History
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 w-72 max-h-96 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-50">
          {loading && <div className="p-4 text-sm text-muted-foreground">Loading...</div>}
          {!loading && conversations.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No past chats yet.</div>
          )}
          {conversations.map((c) => (
            <button
              key={c.conversation_id}
              onClick={() => handleClick(c.conversation_id)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border last:border-none"
            >
              <div className="text-sm truncate text-foreground">{c.preview}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(c.last_timestamp * 1000).toLocaleDateString()} · {c.message_count} messages
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}