/**
 * Servicio de Notificaciones Push Simuladas
 * Maneja el envío y seguimiento de notificaciones SOE
 */

import { AlertService } from '../components/ui/alerts';

// =============================================
// INTERFACES
// =============================================

export interface NotificationSOE {
  id: string;
  tipo: 'APROBACION_PENDIENTE' | 'APROBACION_APROBADA' | 'APROBACION_RECHAZADA' | 'SISTEMA_CREADO';
  titulo: string;
  mensaje: string;
  destinatario: {
    id: number;
    nombre: string;
    email: string;
    rol: 'SPONSOR' | 'OWNER' | 'EJECUTOR';
  };
  solicitudId: number;
  entidadTipo: string;
  entidadNombre: string;
  fechaEnvio: string;
  leida: boolean;
  accionRequerida?: {
    tipo: 'APROBAR_RECHAZAR' | 'INFORMATIVA';
    url?: string;
  };
  metadata?: any;
}

export interface NotificationCallback {
  (notification: NotificationSOE): void;
}

// =============================================
// SERVICIO DE NOTIFICACIONES
// =============================================

class NotificationService {
  private notifications: NotificationSOE[] = [];
  private subscribers: NotificationCallback[] = [];
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    // Inicializar sonido de notificación (opcional)
    try {
      this.notificationSound = new Audio('/notification-sound.mp3');
      this.notificationSound.volume = 0.5;
    } catch (error) {
      console.warn('No se pudo cargar el sonido de notificación');
    }
  }

  // =============================================
  // MÉTODOS PRINCIPALES
  // =============================================

  /**
   * Enviar notificación de aprobación pendiente
   */
  async sendApprovalRequest(
    destinatario: { id: number; nombre: string; email: string; rol: 'SPONSOR' | 'OWNER' },
    solicitudId: number,
    entidadTipo: string,
    entidadNombre: string,
    tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR'
  ): Promise<NotificationSOE> {
    const notification: NotificationSOE = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: 'APROBACION_PENDIENTE',
      titulo: `Aprobación Requerida - ${tipoOperacion} ${entidadTipo}`,
      mensaje: `Solicitud de ${tipoOperacion.toLowerCase()} para "${entidadNombre}" requiere su aprobación como ${destinatario.rol}.`,
      destinatario,
      solicitudId,
      entidadTipo,
      entidadNombre,
      fechaEnvio: new Date().toISOString(),
      leida: false,
      accionRequerida: {
        tipo: 'APROBAR_RECHAZAR',
        url: `/aprobaciones/${solicitudId}`
      },
      metadata: {
        tipoOperacion,
        prioridad: 'ALTA'
      }
    };

    // Agregar a la lista de notificaciones
    this.notifications.push(notification);

    // Simular envío con delay
    await this.simulateNetworkDelay();

    // Notificar a suscriptores
    this.notifySubscribers(notification);

    // Mostrar notificación push simulada
    this.showPushNotification(notification);



    return notification;
  }

  /**
   * Enviar notificación de aprobación procesada
   */
  async sendApprovalResponse(
    solicitudId: number,
    aprobadorNombre: string,
    aprobadorRol: 'SPONSOR' | 'OWNER',
    aprobado: boolean,
    ejecutorId: number,
    ejecutorNombre: string,
    entidadNombre: string
  ): Promise<NotificationSOE> {
    const notification: NotificationSOE = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: aprobado ? 'APROBACION_APROBADA' : 'APROBACION_RECHAZADA',
      titulo: `${aprobado ? 'Aprobado' : 'Rechazado'} por ${aprobadorRol}`,
      mensaje: `${aprobadorNombre} (${aprobadorRol}) ha ${aprobado ? 'aprobado' : 'rechazado'} la solicitud para "${entidadNombre}".`,
      destinatario: {
        id: ejecutorId,
        nombre: ejecutorNombre,
        email: `${ejecutorNombre.toLowerCase().replace(' ', '.')}@empresa.com`,
        rol: 'EJECUTOR'
      },
      solicitudId,
      entidadTipo: 'SISTEMA',
      entidadNombre,
      fechaEnvio: new Date().toISOString(),
      leida: false,
      accionRequerida: {
        tipo: 'INFORMATIVA',
        url: `/solicitudes/${solicitudId}`
      },
      metadata: {
        aprobadorNombre,
        aprobadorRol,
        aprobado
      }
    };

    this.notifications.push(notification);
    await this.simulateNetworkDelay();
    this.notifySubscribers(notification);
    this.showPushNotification(notification);



    return notification;
  }

  /**
   * Enviar notificación de sistema creado
   */
  async sendSystemCreated(
    ejecutorId: number,
    ejecutorNombre: string,
    entidadNombre: string
  ): Promise<NotificationSOE> {
    const notification: NotificationSOE = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: 'SISTEMA_CREADO',
      titulo: 'Sistema Creado Exitosamente',
      mensaje: `El sistema "${entidadNombre}" ha sido creado y está disponible para su uso.`,
      destinatario: {
        id: ejecutorId,
        nombre: ejecutorNombre,
        email: `${ejecutorNombre.toLowerCase().replace(' ', '.')}@empresa.com`,
        rol: 'EJECUTOR'
      },
      solicitudId: 0,
      entidadTipo: 'SISTEMA',
      entidadNombre,
      fechaEnvio: new Date().toISOString(),
      leida: false,
      accionRequerida: {
        tipo: 'INFORMATIVA',
        url: `/sistemas`
      }
    };

    this.notifications.push(notification);
    await this.simulateNetworkDelay();
    this.notifySubscribers(notification);
    this.showPushNotification(notification);

    return notification;
  }

  // =============================================
  // MÉTODOS DE GESTIÓN
  // =============================================

  /**
   * Obtener todas las notificaciones
   */
  getAllNotifications(): NotificationSOE[] {
    return [...this.notifications].sort((a, b) => 
      new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
    );
  }

  /**
   * Obtener notificaciones por usuario
   */
  getNotificationsByUser(userId: number): NotificationSOE[] {
    return this.notifications
      .filter(n => n.destinatario.id === userId)
      .sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
  }

  /**
   * Obtener notificaciones no leídas por usuario
   */
  getUnreadNotificationsByUser(userId: number): NotificationSOE[] {
    return this.getNotificationsByUser(userId).filter(n => !n.leida);
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.leida = true;
      return true;
    }
    return false;
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  markAllAsReadByUser(userId: number): number {
    const userNotifications = this.notifications.filter(
      n => n.destinatario.id === userId && !n.leida
    );
    
    userNotifications.forEach(n => n.leida = true);
    return userNotifications.length;
  }

  /**
   * Suscribirse a notificaciones en tiempo real
   */
  subscribe(callback: NotificationCallback): () => void {
    this.subscribers.push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Limpiar todas las notificaciones (para testing)
   */
  clearAll(): void {
    this.notifications = [];
  }

  // =============================================
  // MÉTODOS PRIVADOS
  // =============================================

  private async simulateNetworkDelay(): Promise<void> {
    // Simular delay de red entre 500ms y 1.5s
    const delay = Math.random() * 1000 + 500;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private notifySubscribers(notification: NotificationSOE): void {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {

      }
    });
  }

  private showPushNotification(notification: NotificationSOE): void {
    // Reproducir sonido si está disponible
    if (this.notificationSound) {
      this.notificationSound.play().catch(() => {
        // Ignorar errores de sonido
      });
    }

    // Mostrar notificación usando nuestro AlertService
    const icon = notification.tipo === 'APROBACION_PENDIENTE' ? '🔔' : 
                 notification.tipo === 'APROBACION_APROBADA' ? '✅' : 
                 notification.tipo === 'APROBACION_RECHAZADA' ? '❌' : '📝';

    AlertService.info(
      `${icon} ${notification.titulo}`
    );

    // Si el navegador soporta notificaciones nativas, también mostrarlas
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.titulo, {
        body: notification.mensaje,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.accionRequerida?.tipo === 'APROBAR_RECHAZAR'
      });
    }
  }

  /**
   * Solicitar permisos de notificación del navegador
   */
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

// Instancia singleton
export const notificationService = new NotificationService();

// Funciones de conveniencia
export const sendApprovalNotification = notificationService.sendApprovalRequest.bind(notificationService);
export const sendApprovalResponse = notificationService.sendApprovalResponse.bind(notificationService);
export const sendSystemCreated = notificationService.sendSystemCreated.bind(notificationService);
export const getNotifications = notificationService.getAllNotifications.bind(notificationService);
export const getUnreadCount = (userId: number) => notificationService.getUnreadNotificationsByUser(userId).length;