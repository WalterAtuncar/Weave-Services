import React from 'react';
import toast from 'react-hot-toast';
import { AlertType, AlertOptions } from './types';
import { CustomToast } from './CustomToast';

class AlertServiceClass {
  // 🔧 FIX: Cambiar duración por defecto a 5 segundos (5000ms)
  private defaultDuration = 5000;
  private defaultPosition: AlertOptions['position'] = 'top-right';
  
  // 🔧 FIX: Estandarizar duraciones a 5 segundos para todas las alertas no-decisión
  private durationByType: Record<AlertType, number> = {
    success: 5000,    // 🔧 FIX: 5 segundos
    error: 5000,      // 🔧 FIX: 5 segundos  
    warning: 5000,    // 🔧 FIX: 5 segundos
    info: 5000,       // 🔧 FIX: 5 segundos
    decision: Infinity // ✅ Las decisiones no se auto-ocultan
  };

  private showAlert(type: AlertType, options: AlertOptions) {
    // 🔧 FIX: Lógica mejorada para determinar duración
    let duration: number;
    
    if (type === 'decision') {
      // Las decisiones siempre permanecen hasta que el usuario responda
      duration = Infinity;
    } else if (options.persistent) {
      // Si se especifica persistent, respetar esa configuración
      duration = Infinity;
    } else if (options.duration !== undefined) {
      // Si se especifica duración personalizada, usarla
      duration = options.duration;
    } else {
      // Usar duración por defecto del tipo (5 segundos)
      duration = this.durationByType[type];
    }
    
    const toastOptions = {
      duration,
      position: options.position || this.defaultPosition,
    };

    return toast.custom(
      (t) => React.createElement(CustomToast, { t, type, options }),
      toastOptions
    );
  }

  /**
   * Muestra una alerta de éxito
   */
  success(message: string, options?: Omit<AlertOptions, 'message'>) {
    return this.showAlert('success', { ...options, message });
  }

  /**
   * Muestra una alerta de error
   */
  error(message: string, options?: Omit<AlertOptions, 'message'>) {
    return this.showAlert('error', { ...options, message });
  }

  /**
   * Muestra una alerta informativa
   */
  info(message: string, options?: Omit<AlertOptions, 'message'>) {
    return this.showAlert('info', { ...options, message });
  }

  /**
   * Muestra una alerta de advertencia
   */
  warning(message: string, options?: Omit<AlertOptions, 'message'>) {
    return this.showAlert('warning', { ...options, message });
  }

  /**
   * Muestra una alerta de decisión con botones de confirmación y cancelación
   * 🔧 FIX: Las decisiones siempre permanecen activas hasta que el usuario responda
   */
  decision(message: string, options?: Omit<AlertOptions, 'message'>) {
    return this.showAlert('decision', { 
      persistent: true, // ✅ Las decisiones no se auto-ocultan
      ...options, 
      message 
    });
  }

  /**
   * Cierra una alerta específica por ID
   */
  dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  /**
   * Cierra todas las alertas
   */
  dismissAll() {
    toast.dismiss();
  }

  /**
   * Configuración global del servicio
   */
  configure(config: {
    defaultDuration?: number;
    defaultPosition?: AlertOptions['position'];
    durationByType?: Partial<Record<AlertType, number>>;
  }) {
    if (config.defaultDuration !== undefined) {
      this.defaultDuration = config.defaultDuration;
    }
    if (config.defaultPosition !== undefined) {
      this.defaultPosition = config.defaultPosition;
    }
    if (config.durationByType) {
      this.durationByType = { ...this.durationByType, ...config.durationByType };
    }
  }

  /**
   * Promesa de confirmación - Útil para operaciones async
   */
  confirm(
    message: string, 
    options?: Omit<AlertOptions, 'message' | 'onConfirm' | 'onCancel'>
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.decision(message, {
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  /**
   * Alerta de carga con spinner
   * 🔧 FIX: Las alertas de loading deben cerrarse automáticamente después de 5 segundos
   */
  loading(message: string, options?: Omit<AlertOptions, 'message'>) {
    // 🔧 FIX: Usar duración de 5 segundos por defecto para loading
    const duration = options?.duration || 5000;
    
    return toast.loading(message, {
      duration,
      position: options?.position || this.defaultPosition,
      style: {
        background: 'var(--toast-bg, #ffffff)',
        color: 'var(--toast-color, #1f2937)',
        border: '1px solid var(--toast-border, #e5e7eb)',
        borderRadius: '8px',
        fontSize: '14px',
        maxWidth: '400px',
      }
    });
  }

  /**
   * Actualiza una alerta de carga existente
   * 🔧 FIX: Usar duración de 5 segundos por defecto
   */
  updateLoading(toastId: string, type: 'success' | 'error', message: string, duration?: number) {
    // 🔧 FIX: Usar duración de 5 segundos por defecto
    const finalDuration = duration || 5000;
    
    const toastOptions = {
      id: toastId,
      duration: finalDuration,
      position: this.defaultPosition,
    };

    if (type === 'success') {
      return toast.custom(
        (t) => React.createElement(CustomToast, { 
          t, 
          type: 'success', 
          options: { message } 
        }),
        toastOptions
      );
    } else {
      return toast.custom(
        (t) => React.createElement(CustomToast, { 
          t, 
          type: 'error', 
          options: { message } 
        }),
        toastOptions
      );
    }
  }
}

// Exportar instancia singleton
export const AlertService = new AlertServiceClass(); 