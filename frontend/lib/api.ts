// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  CLEAR_CACHE: `${API_BASE_URL}/clear-cache`,
  MODELS: `${API_BASE_URL}/models`,
  HEALTH: `${API_BASE_URL}/health`,
} as const;

export interface Source {
  title: string;
  url: string;
  published_date: string | null;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  keywords_used: string | null;
  conversation_id: string;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  question?: string;
  answer?: string;
  sources?: Source[];
  keywords_used?: string | null;
  timestamp: number;
  loading?: boolean;
  error?: string;
}

export interface ConversationSummary {
  conversation_id: string;
  preview: string;
  last_timestamp: number;
  message_count: number;
}

export interface ConversationMessage {
  question: string;
  answer: string;
  sources: Source[];
  keywords_used: string | null;
  timestamp: number;
}

export async function sendChatMessage(
  question: string,
  modelTier: 'lite' | 'standard' | null,
  conversationId: string | null,
): Promise<ChatResponse> {
  const response = await fetch(API_ENDPOINTS.CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, model_tier: modelTier, conversation_id: conversationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to send chat message');
  }

  return response.json();
}


export async function getAvailableModels(): Promise<{ available_tiers: string[] }> {
  const response = await fetch(API_ENDPOINTS.MODELS);

  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(API_ENDPOINTS.HEALTH);

  if (!response.ok) {
    throw new Error('Failed to check health');
  }

  return response.json();
}


export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(API_ENDPOINTS.CONVERSATIONS);
  if (!res.ok) throw new Error('Failed to load chat history');
  return res.json();
}

export async function getConversation(id: string): Promise<ConversationMessage[]> {
  const res = await fetch(`${API_ENDPOINTS.CONVERSATIONS}/${id}`);
  if (!res.ok) throw new Error('Failed to load conversation');
  return res.json();
}

export async function clearCache(): Promise<{ cleared_entries: number }> {
  const response = await fetch(API_ENDPOINTS.CLEAR_CACHE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to clear cache');
  return response.json();
}

