// Nuevo wrapper para usar la estructura AI basada en AnthropicService
import { aiService } from './ai/ai.service';
import { AnthropicService } from './ai/anthropic.service';

export type ClaudeMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ClaudeOptions = {
  model?: string;
  maxTokens?: number;
  system?: string;
};

// Adaptador: usa AIService para enviar el último mensaje del usuario
export async function sendClaudeMessages(messages: ClaudeMessage[], options: ClaudeOptions = {}) {
  const systemPrompt = options.system ?? messages.find(m => m.role === 'system')?.content;
  const model = options.model ?? 'claude-sonnet-4-5';
  const maxTokens = options.maxTokens ?? 1024;

  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const prompt = lastUser?.content ?? messages[messages.length - 1]?.content ?? '';

  const text = await aiService.sendMessage(prompt, 'anthropic', model, { system: systemPrompt, max_tokens: maxTokens });
  return { text, raw: { provider: 'anthropic' } };
}

export async function getClaudeCompletion(prompt: string, options: ClaudeOptions = {}) {
  const system = options.system;
  const model = options.model ?? 'claude-sonnet-4-5';
  const maxTokens = options.maxTokens ?? 1024;
  const text = await aiService.sendMessage(prompt, 'anthropic', model, { system, max_tokens: maxTokens });
  return text;
}

// Conversión base64 a Blob (PDF)
function base64ToBlob(base64: string, mime = 'application/pdf'): Blob {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function askClaudeAboutPdf(pdfBase64: string, question: string, options: ClaudeOptions = {}) {
  const model = options.model ?? 'claude-sonnet-4-5';
  const maxTokens = options.maxTokens ?? 1024;
  const system = options.system;

  const pdfBlob = base64ToBlob(pdfBase64, 'application/pdf');
  const attachments = [{ file: pdfBlob, type: 'pdf' as const }];

  const anthropic = AnthropicService.getInstance();
  const text = await anthropic.sendMessageWithAttachments(question, attachments, { model: model as any, max_tokens: maxTokens, system });
  return { text, raw: { provider: 'anthropic', attachments: true } };
}