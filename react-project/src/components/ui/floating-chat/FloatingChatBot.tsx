import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Send, Minimize2, Trash2, Paperclip, FileX } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../alerts/AlertService';
import styles from './FloatingChatBot.module.css';
import { sendClaudeMessages, askClaudeAboutPdf } from '@/services/ClaudeService';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FloatingChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingChatBot: React.FC<FloatingChatBotProps> = ({ isOpen, onToggle }) => {
  const { colors, theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Respuestas automáticas del asistente
  const botResponses = [
    "Puedo ayudarte con información sobre gestión organizacional, procesos y estructuras.",
    "¿Tienes alguna pregunta específica sobre el organigrama o las unidades organizacionales?",
    "Estoy aquí para asistirte con cualquier duda sobre el sistema de gestión de procesos.",
    "¿Necesitas ayuda navegando por alguna sección en particular?",
    "Puedo explicarte cómo usar las diferentes funcionalidades del sistema.",
    "¿Hay algo específico que te gustaría aprender sobre la gestión organizacional?",
    "Estoy disponible 24/7 para resolver tus consultas.",
    "¿Quieres que te explique cómo crear o editar unidades organizacionales?"
  ];

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus en input cuando se abre el chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);



  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    // Limpiar input inmediatamente para mejor UX
    setInputText('');
    
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Construir historial para Claude
    const claudeMessages = [...messages, userMessage].map(m => ({
      role: m.isUser ? 'user' as const : 'assistant' as const,
      content: m.text
    }));

    const systemPrompt = 'Eres Claude (Sonnet 4.0), un asistente experto en gestión por procesos. Responde en español con precisión, brevedad y pasos accionables. Si falta contexto, pídelo claramente.';

    try {
      let text = '';
      if (pdfBase64) {
        const res = await askClaudeAboutPdf(pdfBase64, messageText, {
          system: systemPrompt,
          model: 'claude-sonnet-4-0',
          maxTokens: 800
        });
        text = res?.text || '';
        if (text) {
          clearPdf();
        }
      } else {
        const res = await sendClaudeMessages(claudeMessages, {
          system: systemPrompt,
          model: 'claude-sonnet-4-0',
          maxTokens: 800
        });
        text = res?.text || '';
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: text || 'No he podido generar una respuesta en este momento.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const msg = err instanceof Error
        ? err.message
        : (typeof err === 'string' ? err : (err?.error || err?.detail || 'Error desconocido'));
      setLastError(msg);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Hubo un error consultando a Claude: ${msg}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handlers de carga y gestión de PDF (deben vivir dentro del componente)
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      AlertService.error('Por favor selecciona un archivo PDF.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setPdfBase64(base64);
      setPdfName(file.name);
      setMessages(prev => [...prev, {
        id: (Date.now() + Math.random()).toString(),
        text: `Adjunto preparado: ${file.name}. Tus próximas preguntas usarán este documento.`,
        isUser: false,
        timestamp: new Date()
      }]);
      AlertService.success('PDF cargado. Ahora puedes hacer preguntas sobre el documento.');
    };
    reader.onerror = () => {
      AlertService.error('No se pudo leer el archivo PDF.');
    };
    reader.readAsDataURL(file);
  };

  const clearPdf = () => {
    setPdfBase64(null);
    setPdfName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearChat = async () => {
    const confirmClear = await AlertService.confirm(
      '¿Estás seguro de que quieres limpiar el chat? Esta acción no se puede deshacer.',
      {
        title: 'Confirmar limpieza',
        confirmText: 'Limpiar',
        cancelText: 'Cancelar'
      }
    );
    
    if (confirmClear) {
      setMessages([
        {
          id: '1',
          text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
          isUser: false,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
      AlertService.success('Chat limpiado exitosamente');
    }
  };

  if (!isOpen) {
    return (
      <div className={styles.floatingButton} onClick={onToggle}>
        <img 
          src="/images/asistente/asistente01.png" 
          alt="Asistente Virtual"
          className={styles.assistantImage}
        />
        <div className={styles.pulseAnimation} />
      </div>
    );
  }

  return (
    <div 
      className={`${styles.chatContainer} ${isMinimized ? styles.minimized : ''}`}
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }}
    >
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <img 
            src={isTyping ? "/images/asistente/asistente-02.gif" : "/images/asistente/asistente01.png"}
            alt="Asistente Virtual"
            className={styles.headerAvatar}
          />
          <div className={styles.headerInfo}>
            <h4 className={styles.assistantName}>
              Asistente Virtual
            </h4>
            <span className={styles.onlineStatus}>
              <div className={styles.onlineIndicator} />
              En línea
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {/* Botón para subir PDF */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            className={styles.headerButton}
            onClick={handleUploadClick}
            title={pdfName ? `Documento cargado: ${pdfName}` : 'Subir PDF'}
          >
            <Paperclip size={16} />
          </button>
          <button 
            className={styles.headerButton}
            onClick={handleClearChat}
            title="Limpiar chat"
          >
            <Trash2 size={16} />
          </button>
          <button 
            className={styles.headerButton}
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            <Minimize2 size={16} />
          </button>
          <button 
            className={styles.headerButton}
            onClick={onToggle}
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <div className={styles.chatBody}>
          {/* Messages */}
          <div 
            className={styles.messagesContainer}
            style={{ 
              backgroundColor: colors.background,
              // 🔧 Scrollbar dinámico usando custom properties
              '--scrollbar-thumb-color': theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              '--scrollbar-thumb-hover-color': theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              // 🔧 Variables CSS para elementos internos del chat
              '--color-background': colors.background,
              '--color-text': colors.text,
              '--color-border': colors.border
            } as React.CSSProperties & { 
              '--scrollbar-thumb-color': string;
              '--scrollbar-thumb-hover-color': string;
              '--color-background': string;
              '--color-text': string;
              '--color-border': string;
            }}
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles.messageWrapper} ${message.isUser ? styles.userMessage : styles.botMessage}`}
              >
                {!message.isUser && (
                  <img 
                    src="/images/asistente/asistente01.png"
                    alt="Asistente"
                    className={styles.messageAvatar}
                    style={{
                      borderColor: colors.border // 🔧 Borde dinámico para avatar
                    }}
                  />
                )}
                <div 
                  className={styles.messageBubble}
                  style={{
                    borderColor: colors.border, // 🔧 Solo borde dinámico, colores manejados por CSS
                    // 🔧 Variables CSS para elementos internos
                    '--color-surface': colors.surface,
                    '--color-text': colors.text,
                    '--color-text-secondary': colors.textSecondary
                  } as React.CSSProperties & {
                    '--color-surface': string;
                    '--color-text': string;
                    '--color-text-secondary': string;
                  }}
                >
                  {message.isUser ? (
                    <p className={styles.messageText}>{message.text}</p>
                  ) : (
                    <div className={styles.messageText}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
                <img 
                  src="/images/asistente/asistente-02.gif"
                  alt="Escribiendo..."
                  className={styles.messageAvatar}
                  style={{
                    borderColor: colors.border // 🔧 Borde dinámico para avatar
                  }}
                />
                <div 
                  className={styles.typingIndicator}
                  style={{ 
                    backgroundColor: colors.surface,
                    borderColor: colors.border 
                  }}
                >
                  <div className={styles.typingDots}>
                    <span style={{ backgroundColor: colors.textSecondary }}></span>
                    <span style={{ backgroundColor: colors.textSecondary }}></span>
                    <span style={{ backgroundColor: colors.textSecondary }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div 
            className={styles.inputArea}
            style={{ 
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              // 🔧 Variables CSS para elementos hijos del input
              '--color-background': colors.background,
              '--color-text': colors.text,
              '--color-border': colors.border
            } as React.CSSProperties & {
              '--color-background': string;
              '--color-text': string;
              '--color-border': string;
            }}
          >
            {pdfName && (
              <div className={styles.pdfBadge} style={{ borderColor: colors.border }}>
                <span>{pdfName}</span>
                <button className={styles.clearPdfButton} onClick={clearPdf} title="Quitar PDF">
                  <FileX size={14} />
                </button>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className={styles.messageInput}
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                // 🔧 Placeholder dinámico usando CSS custom property
                '--placeholder-color': colors.textSecondary
              } as React.CSSProperties & { '--placeholder-color': string }}
              onFocus={(e) => {
                // 🔧 Focus dinámico usando color primary del tema
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${colors.primary}20`; // 20 para 0.125 opacity
              }}
              onBlur={(e) => {
                // 🔧 Restaurar color original al perder foco
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className={styles.sendButton}
              style={{ 
                opacity: inputText.trim() ? 1 : 0.5,
                cursor: inputText.trim() ? 'pointer' : 'not-allowed'
              }}
              data-testid="chat-send-button"
              onMouseEnter={(e) => {
                if (inputText.trim()) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Send size={16} color="#ffffff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};