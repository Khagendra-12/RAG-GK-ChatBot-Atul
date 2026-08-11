'use client';

import { Send } from 'lucide-react';
import { useRef, useState } from 'react';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSubmit,
  disabled = false,
  placeholder = 'Ask a question...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSubmit(message.trim());
      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for IME composition to avoid submitting during CJK input
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex gap-3">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 min-h-10 max-h-30 px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
