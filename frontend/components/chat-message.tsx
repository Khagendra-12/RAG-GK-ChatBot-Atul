'use client';

import { Message } from '@/lib/api';
import { AnswerText } from './answer-text';
import { SourceCard } from './source-card';
import { GlowBorder } from '@/components/glow-border';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
  onCitationClick: (sourceIndex: number) => void;
}

export function ChatMessage({ message, onCitationClick }: ChatMessageProps) {
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [showSearchTerms, setShowSearchTerms] = useState(false);

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <GlowBorder radius={12} inline>
          <div className="max-w-2xl bg-muted/80 text-foreground border border-border rounded-lg px-4 py-3 text-sm">
            {message.question}
          </div>
        </GlowBorder>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-8">
      <div className="max-w-3xl w-full">
        {message.loading ? (
          <GlowBorder radius={8} className="mb-4 w-full">
            <div className="bg-background-secondary border border-border rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground" id="loading-stage">
                    Searching the web...
                  </span>
                </div>
              </div>
            </div>
          </GlowBorder>
        ) : message.error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-destructive mb-3">{message.error}</p>
            <button className="text-xs font-medium text-destructive hover:underline">
              Retry
            </button>
          </div>
        ) : (
          <>
            <GlowBorder radius={8} className="mb-4 w-full">
              <div className="bg-background-secondary border border-border rounded-lg p-4">
                <AnswerText
                  text={message.answer || ''}
                  onCitationClick={(idx) => {
                    setHighlightedSource(idx);
                    onCitationClick(idx);
                  }}
                />
              </div>
            </GlowBorder>

            {message.keywords_used && (
              <button
                onClick={() => setShowSearchTerms(!showSearchTerms)}
                className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
              >
                <span>Searched for: {showSearchTerms ? '−' : '+'}</span>
                {showSearchTerms && (
                  <span className="ml-1">{message.keywords_used}</span>
                )}
              </button>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  Sources
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {message.sources.length}
                  </span>
                </h4>
                <div className="space-y-2">
                  {message.sources.map((source, idx) => (
                    <SourceCard
                      key={idx}
                      source={source}
                      number={idx + 1}
                      isHighlighted={highlightedSource === idx}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}