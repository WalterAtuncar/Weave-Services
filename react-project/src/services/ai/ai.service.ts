import { AnthropicService } from './anthropic.service';
import type { AIProvider, AIApiOptions, AnthropicApiOptions, AnthropicModelType, ChatMessage, ChatSession } from './types';

/**
 * Fachada de servicios de IA. Actualmente soporta Anthropic Claude.
 */
export class AIService {
  private static instance: AIService;
  private anthropicService: AnthropicService;

  private constructor() {
    this.anthropicService = AnthropicService.getInstance();
    this.checkAnthropicInitialization();
  }

  private checkAnthropicInitialization(): void {
    if (!this.anthropicService.isClientReady()) {
      const error = this.anthropicService.getInitializationError();
      console.warn(`Servicio Anthropic no inicializado. Motivo: ${error || 'Desconocido'}`);
      setTimeout(() => {
        if (this.anthropicService.reinitializeClient()) {
          console.log('¡Reinicialización de Anthropic exitosa!');
        } else {
          console.error('La reinicialización de Anthropic falló.');
        }
      }, 2000);
    } else {
      console.log('Servicio Anthropic inicializado correctamente');
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /** Envía un mensaje a la IA seleccionada */
  public async sendMessage(
    prompt: string,
    provider: AIProvider = 'anthropic',
    model?: string,
    options: Partial<AIApiOptions> = {}
  ): Promise<string> {
    switch (provider) {
      case 'anthropic':
        return this.sendAnthropicMessage(prompt, model, options);
      default:
        throw new Error(`Proveedor desconocido: ${provider}`);
    }
  }

  private async sendAnthropicMessage(
    prompt: string,
    model?: string,
    options: Partial<AIApiOptions> = {}
  ): Promise<string> {
    if (!this.anthropicService.isClientReady()) {
      if (this.anthropicService.reinitializeClient()) {
        console.log('Anthropic reinicializado correctamente');
      } else {
        const error = this.anthropicService.getInitializationError();
        throw new Error(`Anthropic no está inicializado correctamente. ${error ? `Motivo: ${error}` : ''}`);
      }
    }

    const anthropicOptions: Partial<AnthropicApiOptions> = {
      model: (model as AnthropicModelType) || 'claude-sonnet-4-5',
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature,
      system: options.system,
    };

    return this.anthropicService.sendMessage(prompt, anthropicOptions);
  }

  /** Utilidades de sesión y mensajes (opcionales) */
  public generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public createChatMessage(
    role: 'user' | 'assistant',
    content: string,
    provider?: AIProvider,
    model?: string
  ): ChatMessage {
    return {
      id: this.generateMessageId(),
      role,
      content,
      timestamp: new Date(),
      provider,
      model,
    };
  }

  public createChatSession(
    title: string,
    provider: AIProvider = 'anthropic',
    model: string = 'claude-sonnet-4-5'
  ): ChatSession {
    return {
      id: this.generateSessionId(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      provider,
      model,
    };
  }
}

export const aiService = AIService.getInstance();