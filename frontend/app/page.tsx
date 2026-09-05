'use client';

import { useState, useRef, useEffect } from 'react';
import {
  sendChatMessage,
  clearCache,
  getConversation,
  getBackendStatus,
  Message,
  ConversationMessage,
} from '@/lib/api';
import { TopBar } from '@/components/top-bar';
import { ChatMessage } from '@/components/chat-message';
import { MessageInput } from '@/components/message-input';
import { HomeScreen } from '@/components/home-screen';
import { ScannerBackground } from '@/components/scanner-background';

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [modelTier, setModelTier] = useState<'lite' | 'standard' | null>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Backend Health & Initialization state
  const [backendReady, setBackendReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Checking backend status...');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingStageRef = useRef<NodeJS.Timeout>();

  // Poll backend health status on startup until the model is warm and ready
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      const health = await getBackendStatus();
      if (!isMounted) return;

      if (health.status === 'ready') {
        setBackendReady(true);
        setStatusMessage('');
      } else {
        setBackendReady(false);
        setStatusMessage(health.message);
        setTimeout(checkStatus, 2000);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      const stages = ['Searching the web...', 'Reading sources...', 'Writing answer...'];
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
    if (!backendReady) return;

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

  const expandConversation = (turns: ConversationMessage[]): Message[] => {
    const expanded: Message[] = [];
    turns.forEach((turn, i) => {
      expanded.push({
        id: `user-${i}-${turn.timestamp}`,
        type: 'user',
        question: turn.question,
        timestamp: turn.timestamp * 1000,
      });
      expanded.push({
        id: `assistant-${i}-${turn.timestamp}`,
        type: 'assistant',
        answer: turn.answer,
        sources: turn.sources,
        keywords_used: turn.keywords_used,
        timestamp: turn.timestamp * 1000,
      });
    });
    return expanded;
  };

  const handleSelectConversation = async (convId: string) => {
    const turns = await getConversation(convId);
    setConversationId(convId);
    setMessages(expandConversation(turns));
  };

  return (
    <div className="flex flex-col h-screen relative">
      <ScannerBackground />

      {/* Backend Startup Overlay */}
      {!backendReady && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Starting AI System</h3>
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          </div>
        </div>
      )}

      <TopBar
        modelTier={modelTier}
        onModelTierChange={setModelTier}
        onNewChat={handleNewChat}
        onClearCache={handleClearCache}
        onSelectConversation={handleSelectConversation}
        isClearing={isClearing}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 h-full">
          {messages.length === 0 ? (
            <HomeScreen
              onSubmit={handleSendMessage}
              onClearCache={handleClearCache}
              isClearing={isClearing}
            />
          ) : (
            <div className="py-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} onCitationClick={handleCitationClick} />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length > 0 && (
        <MessageInput
          onSubmit={handleSendMessage}
          disabled={isLoading || !backendReady}
          placeholder="Ask a question about news, politics, stocks, laws, or current events..."
        />
      )}
    </div>
  );
}