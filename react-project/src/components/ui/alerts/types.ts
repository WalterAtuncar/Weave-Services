import { ReactNode } from 'react';

export type AlertType = 'success' | 'error' | 'info' | 'warning' | 'decision';

export interface AlertOptions {
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  persistent?: boolean;
}

export interface ToastData {
  id: string;
  type: AlertType;
  options: AlertOptions;
  timestamp: number;
} 