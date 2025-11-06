import { Anthropic, ClientOptions } from '@anthropic-ai/sdk';
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages';
import type { AnthropicApiOptions, AnthropicAttachment } from './types';
import { environment } from '../../environments';

/**
 * Servicio para interactuar con la API de Anthropic Claude
 * Implementa un cliente con autenticación y métodos para enviar mensajes
 * Diferencia clave: la API key se obtiene directamente del environment (sin cifrado)
 */
export class AnthropicService {
  private static instance: AnthropicService;
  private client: Anthropic | null = null;
  private apiKey: string = '';
  private initError: string | null = null;

  /** Normaliza nombres de modelo y mapea aliases no soportados a uno válido */
  private normalizeModelName(model: string): string {
    const m = (model || '').trim();
    if (!m) return 'claude-sonnet-4-5';
    const lower = m.toLowerCase();
    // Mapear variantes de "claude 4 / sonnet 4" al alias recomendado
    if (lower.includes('claude-4') || lower.includes('sonnet-4')) {
      return 'claude-sonnet-4-5';
    }
    // Mapear sufijos -latest conocidos al alias estable
    if (lower.endsWith('-latest')) {
      return 'claude-sonnet-4-5';
    }
    return m;
  }

  /**
   * Constructor privado para implementar patrón Singleton
   */
  private constructor() {
    try {
      this.initClient();
    } catch (error) {
      console.error('Error crítico en constructor de AnthropicService:', error);
      this.initError = error instanceof Error ? error.message : 'Error desconocido';
    }
  }

  /** Obtener instancia única */
  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  /** Inicializa el cliente con la API key del environment */
  private initClient(): void {
    try {
      // Obtención directa de clave desde environment, con alternativas en import.meta.env y localStorage
      const envKey = environment?.anthropicApiKey;
      const metaEnv = (import.meta as any)?.env || {};
      const viteKey = metaEnv.VITE_ANTHROPIC_API_KEY || metaEnv.VITE_CLAUDE_API_KEY || metaEnv.ANTHROPIC_API_KEY || metaEnv.CLAUDE_API_KEY;
      const lsKey = typeof window !== 'undefined' ? window.localStorage.getItem('anthropic_api_key') : null;
      this.apiKey = envKey || viteKey || lsKey || '';

      if (!this.apiKey) {
        this.initError = 'La clave API de Anthropic no está definida en environment/import.meta.env/localStorage';
        console.error(this.initError);
        this.client = null;
        return;
      }

      if (this.apiKey.length < 10) {
        this.initError = `La clave API parece inválida (longitud: ${this.apiKey.length})`;
        console.error(this.initError);
        this.client = null;
        return;
      }

      const clientOptions: ClientOptions = {
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true,
      };

      this.client = new Anthropic(clientOptions);
      this.initError = null;
    } catch (error) {
      this.initError = `Error al inicializar Anthropic: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      console.error(this.initError, error);
      this.client = null;
    }
  }

  /** Reintenta inicialización */
  public reinitializeClient(): boolean {
    try {
      this.initClient();
      return this.isClientReady();
    } catch (error) {
      console.error('Error al reinicializar el cliente:', error);
      return false;
    }
  }

  /** Envía un mensaje simple a Anthropic Claude */
  public async sendMessage(prompt: string, options: Partial<AnthropicApiOptions> = {}): Promise<string> {
    const model = this.normalizeModelName(options.model || 'claude-sonnet-4-5');
    const maxTokens = options.max_tokens || 1024;
    const temperature = options.temperature;
    const system = options.system;

    // Intento 1: SDK (preferido)
    if (this.client) {
      try {
        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages: [
            { role: 'user', content: prompt }
          ]
        });

        const assistantMessage = response.content.find(c => c.type === 'text');
        if (assistantMessage && 'text' in assistantMessage) return (assistantMessage as any).text;
        throw new Error('No se recibió respuesta textual del asistente');
      } catch (error) {
        console.warn('Fallo SDK Anthropic, intentando fetch directo (posible CORS):', error);
      }
    }

    // Intento 2: Fetch directo con headers requeridos para navegador
    try {
      if (!this.apiKey) throw new Error('No hay API key configurada');
      const body: any = {
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'user', content: [{ type: 'text', text: prompt }] }
        ]
      };
      if (typeof temperature === 'number') body.temperature = temperature;
      if (typeof system === 'string') body.system = system;

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        } as any,
        body: JSON.stringify(body),
        mode: 'cors',
      });

      if (!resp.ok) {
        let errData: any = {};
        try { errData = await resp.json(); } catch {}
        const msg = errData?.error?.message || resp.statusText;
        throw new Error(msg || 'Respuesta no OK de Anthropic');
      }

      const data = await resp.json();
      const textBlock = Array.isArray(data?.content) ? data.content.find((c: any) => c.type === 'text') : null;
      const text = textBlock?.text || data?.output_text || '';
      if (!text) throw new Error('Sin texto en la respuesta de Anthropic');
      return text;
    } catch (error) {
      console.error('Error al comunicarse con Anthropic (fetch directo):', error);
      throw new Error(`Error al comunicarse con Anthropic: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /** Envía un mensaje con adjuntos (imágenes/PDF) usando Files API cuando aplica */
  public async sendMessageWithAttachments(
    prompt: string,
    attachments: AnthropicAttachment[],
    options: Partial<AnthropicApiOptions> = {}
  ): Promise<string> {
    const model = this.normalizeModelName(options.model || 'claude-sonnet-4-5');
    const maxTokens = options.max_tokens || 1024;
    const temperature = options.temperature;
    const system = options.system;

    const apiCompatibleContents: ContentBlockParam[] = [];

    // Procesar adjuntos
    for (const attachment of attachments) {
      if (attachment.fileId) {
        if (attachment.type === 'image') {
          apiCompatibleContents.push({ type: 'image', source: { type: 'file', file_id: attachment.fileId } });
        } else if (attachment.type === 'pdf') {
          apiCompatibleContents.push({ type: 'document', source: { type: 'file', file_id: attachment.fileId } });
        }
      } else if (attachment.fileUrl) {
        if (attachment.type === 'image') {
          apiCompatibleContents.push({ type: 'image', source: { type: 'url', url: attachment.fileUrl } });
        } else if (attachment.type === 'pdf') {
          apiCompatibleContents.push({ type: 'document', source: { type: 'url', url: attachment.fileUrl } });
        }
      } else if (attachment.file) {
        const fileId = await this.uploadFile(attachment.file);
        if (attachment.type === 'image') {
          apiCompatibleContents.push({ type: 'image', source: { type: 'file', file_id: fileId } });
        } else if (attachment.type === 'pdf') {
          apiCompatibleContents.push({ type: 'document', source: { type: 'file', file_id: fileId } });
        }
      }
    }

    // Texto del mensaje
    apiCompatibleContents.push({ type: 'text', text: prompt });

    // Intento 1: SDK
    if (this.client) {
      try {
        const needsFilesAPI = attachments.some(att => att.type === 'pdf' || att.fileId || att.file);
        const requestOptions: unknown = needsFilesAPI ? { headers: { 'anthropic-beta': 'files-api-2025-04-14' } } : undefined;

        const response = await this.client.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages: [
            { role: 'user', content: apiCompatibleContents }
          ]
        }, requestOptions);

        const assistantMessage = response.content.find(c => c.type === 'text');
        if (assistantMessage && 'text' in assistantMessage) return (assistantMessage as any).text;
        throw new Error('No se recibió respuesta textual del asistente');
      } catch (error) {
        console.warn('Fallo SDK con adjuntos, intentando fetch directo (posible CORS):', error);
      }
    }

    // Intento 2: Fetch directo
    try {
      if (!this.apiKey) throw new Error('No hay API key configurada');
      const needsFilesAPI = attachments.some(att => att.type === 'pdf' || att.fileId || att.file);
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };
      if (needsFilesAPI) headers['anthropic-beta'] = 'files-api-2025-04-14';

      const body: any = {
        model,
        max_tokens: maxTokens,
        messages: [
          { role: 'user', content: apiCompatibleContents }
        ]
      };
      if (typeof temperature === 'number') body.temperature = temperature;
      if (typeof system === 'string') body.system = system;

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: headers as any,
        body: JSON.stringify(body),
        mode: 'cors',
      });

      if (!resp.ok) {
        let errData: any = {};
        try { errData = await resp.json(); } catch {}
        const msg = errData?.error?.message || resp.statusText;
        throw new Error(msg || 'Respuesta no OK de Anthropic');
      }

      const data = await resp.json();
      const textBlock = Array.isArray(data?.content) ? data.content.find((c: any) => c.type === 'text') : null;
      const text = textBlock?.text || data?.output_text || '';
      if (!text) throw new Error('Sin texto en la respuesta de Anthropic');
      return text;
    } catch (error) {
      console.error('Error al comunicarse con Anthropic (fetch directo, adjuntos):', error);
      throw new Error(`Error al comunicarse con Anthropic: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /** Sube un archivo a Anthropic (Files API beta) y devuelve su file_id */
  public async uploadFile(file: File | Blob): Promise<string> {
    if (!this.apiKey) throw new Error('No hay API key configurada para subir archivos');

    try {
      const fileName = file instanceof File ? file.name : `file_${Date.now()}`;
      const formData = new FormData();
      formData.append('file', file, fileName);

      const response = await fetch('https://api.anthropic.com/v1/files', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'files-api-2025-04-14',
        } as any,
        body: formData,
      });

      if (!response.ok) {
        let errorData: any = {};
        try { errorData = await response.json(); } catch {}
        throw new Error(`Error al subir archivo: ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error al subir archivo a Anthropic:', error);
      throw new Error(`Error al subir archivo a Anthropic: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /** Modelos que soportan adjuntos */
  public supportsAttachments(model?: string): boolean {
    const pdfSupportedModels = [
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
      'claude-sonnet-4',
      'claude-opus-4',
    ];
    const imageSupportedModels = [
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku',
    ].concat(pdfSupportedModels);

    const modelToCheck = this.normalizeModelName(model || 'claude-sonnet-4-5');
    return imageSupportedModels.some(m => modelToCheck.includes(m));
  }

  /** Estado del cliente */
  public isClientReady(): boolean {
    return this.client !== null;
  }

  /** Error de inicialización */
  public getInitializationError(): string | null {
    return this.initError;
  }
}