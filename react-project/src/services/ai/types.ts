// Tipos mínimos para servicios de IA (Anthropic) en react-project

export type AIProvider = 'anthropic';

export interface AIApiOptions {
  max_tokens: number;
  temperature?: number;
  system?: string;
}

export type AnthropicModelType =
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  | 'claude-3-5-sonnet-20240620'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-sonnet-4-20250514'
  | 'claude-opus-4-20250514';

export interface AnthropicApiOptions {
  model: AnthropicModelType;
  max_tokens: number;
  temperature?: number;
  system?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: AIProvider;
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  provider: AIProvider;
  model: string;
}

export interface AnthropicAttachment {
  file?: File | Blob;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  fileId?: string;
  type: 'image' | 'pdf' | 'text' | 'other';
}