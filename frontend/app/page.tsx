'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, clearCache, Message } from '@/lib/api';
import { TopBar } from '@/components/top-bar';
import { ChatMessage } from '@/components/chat-message';
import { MessageInput } from '@/components/message-input';
import { WelcomeSection } from '@/components/welcome-section';

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [modelTier, setModelTier] = useState<'lite' | 'standard' | null>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingStageRef = useRef<NodeJS.Timeout>();
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate loading stages
  useEffect(() => {
    if (isLoading) {
      const stages = [
        'Searching the web...',
        'Reading sources...',
        'Writing answer...',
      ];
      let stageIndex = 0;

      const updateStage = () => {
        const stage = document.getElementById('loading-stage');
        if (stage) {
          stage.textContent = stages[stageIndex];
        }
        stageIndex = (stageIndex + 1) % stages.length;
        loadingStageRef.current = setTimeout(updateStage, 2000);
      };

      loadingStageRef.current = setTimeout(updateStage, 2000);

      return () => {
        if (loadingStageRef.current) {
          clearTimeout(loadingStageRef.current);
        }
      };
    }
  }, [isLoading]);

  const handleSendMessage = async (question: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      type: 'assistant',
      timestamp: Date.now(),
      loading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(question, modelTier, conversationId);

      if (!conversationId) {
      setConversationId(response.conversation_id);
    }

      setMessages((prev) => {
        const updated = [...prev];
        const loadingIndex = updated.findIndex((m) => m.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            id: `assistant-${Date.now()}`,
            type: 'assistant',
            answer: response.answer,
            sources: response.sources,
            keywords_used: response.keywords_used,
            timestamp: Date.now(),
          };
        }
        return updated;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Replace loading message with error
      setMessages((prev) => {
        const updated = [...prev];
        const loadingIndex = updated.findIndex((m) => m.id === loadingMessage.id);
        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            id: `error-${Date.now()}`,
            type: 'assistant',
            error:
              errorMessage === 'Failed to send chat message'
                ? "Couldn't reach the assistant — is the backend running?"
                : errorMessage,
            timestamp: Date.now(),
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const result = await clearCache();
      console.log(`Cleared ${result.cleared_entries} cache entries`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCitationClick = (sourceIndex: number) => {
    // Find the source card in the DOM and highlight it
    setTimeout(() => {
      const sourceCards = document.querySelectorAll('[data-source-card]');
      if (sourceCards[sourceIndex]) {
        sourceCards[sourceIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        sourceCards[sourceIndex].classList.add('highlight-flash');
        setTimeout(() => {
          sourceCards[sourceIndex].classList.remove('highlight-flash');
        }, 1000);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar
        modelTier={modelTier}
        onModelTierChange={setModelTier}
        onNewChat={handleNewChat}
        onClearCache={handleClearCache}
        isClearing={isClearing}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4">
          {messages.length === 0 ? (
            <WelcomeSection onSuggestedQuestion={handleSendMessage} />
          ) : (
            <div className="py-8">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onCitationClick={handleCitationClick}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput
        onSubmit={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask a question about news, politics, stocks, laws, or current events..."
      />
    </div>
  );
}
