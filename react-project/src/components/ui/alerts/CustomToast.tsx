import React from 'react';
import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AlertType, AlertOptions } from './types';

interface CustomToastProps {
  t: any;
  type: AlertType;
  options: AlertOptions;
}

export const CustomToast: React.FC<CustomToastProps> = ({ t, type, options }) => {
  const { theme, colors } = useTheme();

  const getIcon = () => {
    if (options.icon) return options.icon;
    
    const iconProps = { className: 'h-6 w-6' };
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon {...iconProps} style={{ color: '#10B981' }} />;
      case 'error':
        return <XCircleIcon {...iconProps} style={{ color: '#EF4444' }} />;
      case 'info':
        return <InformationCircleIcon {...iconProps} style={{ color: '#3B82F6' }} />;
      case 'warning':
        return <ExclamationTriangleIcon {...iconProps} style={{ color: '#F59E0B' }} />;
      case 'decision':
        return <QuestionMarkCircleIcon {...iconProps} style={{ color: '#8B5CF6' }} />;
      default:
        return <InformationCircleIcon {...iconProps} style={{ color: '#6B7280' }} />;
    }
  };

  const getBackgroundColor = () => {
    if (theme === 'dark') {
      return '#1F2937'; // dark:bg-gray-800
    }
    return '#FFFFFF'; // bg-white
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      case 'info':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      case 'decision':
        return '#8B5CF6';
      default:
        return theme === 'dark' ? '#374151' : '#E5E7EB';
    }
  };

  const handleClose = () => {
    toast.dismiss(t.id);
    if (options.onClose) options.onClose();
  };

  const handleConfirm = () => {
    if (options.onConfirm) options.onConfirm();
    toast.dismiss(t.id);
  };

  const handleCancel = () => {
    if (options.onCancel) options.onCancel();
    toast.dismiss(t.id);
  };

  return (
    <Transition
      show={t.visible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        style={{
          backgroundColor: getBackgroundColor(),
          borderLeft: `4px solid ${getBorderColor()}`,
          color: theme === 'dark' ? colors.text : '#1F2937',
          boxShadow: theme === 'dark' 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
        className="max-w-md w-full p-4 rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5"
      >
        <div className="flex-1 w-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              {options.title && (
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme === 'dark' ? colors.text : '#1F2937' }}
                >
                  {options.title}
                </p>
              )}
              <p 
                className={`text-sm ${options.title ? 'mt-1' : ''}`}
                style={{ 
                  color: theme === 'dark' ? colors.textSecondary : '#6B7280',
                  opacity: 0.9 
                }}
              >
                {options.message}
              </p>
              
              {type === 'decision' && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleConfirm}
                    className="text-sm font-medium px-3 py-1 rounded-md transition-colors"
                    style={{
                      backgroundColor: '#8B5CF6',
                      color: 'white',
                    }}
                  >
                    {options.confirmText || 'Confirmar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-sm font-medium px-3 py-1 rounded-md transition-colors"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      color: theme === 'dark' ? colors.text : '#1F2937',
                    }}
                  >
                    {options.cancelText || 'Cancelar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {(options.closable !== false) && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: theme === 'dark' ? colors.textSecondary : '#9CA3AF'
              }}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </Transition>
  );
}; 