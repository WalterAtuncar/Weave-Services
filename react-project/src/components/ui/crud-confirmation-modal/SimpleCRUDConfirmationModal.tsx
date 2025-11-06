import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { Modal } from '../modal/Modal';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export interface SimpleCRUDConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  operation: 'create' | 'update' | 'delete';
  entityName: string;
  entityDisplayName: string;
  isLoading?: boolean;
}

export const SimpleCRUDConfirmationModal: React.FC<SimpleCRUDConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  operation,
  entityName,
  entityDisplayName,
  isLoading = false
}) => {
  const { colors } = useTheme();

  const getOperationText = () => {
    switch (operation) {
      case 'create':
        return 'crear';
      case 'update':
        return 'actualizar';
      case 'delete':
        return 'eliminar';
      default:
        return 'procesar';
    }
  };

  const getOperationTitle = () => {
    switch (operation) {
      case 'create':
        return `Crear ${entityName}`;
      case 'update':
        return `Actualizar ${entityName}`;
      case 'delete':
        return `Eliminar ${entityName}`;
      default:
        return `Procesar ${entityName}`;
    }
  };

  const getOperationMessage = () => {
    const action = getOperationText();
    return `¿Está seguro de que desea ${action} ${entityDisplayName ? `"${entityDisplayName}"` : `este ${entityName}`}?`;
  };

  const getOperationColor = () => {
    switch (operation) {
      case 'delete':
        return '#ef4444';
      case 'create':
        return '#10b981';
      case 'update':
        return '#f59e0b';
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getOperationTitle()}
      size="medium"
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          {operation === 'delete' ? (
            <AlertTriangle size={24} color={getOperationColor()} />
          ) : (
            <CheckCircle size={24} color={getOperationColor()} />
          )}
          <p style={{ 
            margin: 0, 
            fontSize: '16px',
            color: colors.text,
            lineHeight: '1.5'
          }}>
            {getOperationMessage()}
          </p>
        </div>

        {entityDisplayName && (
          <div style={{
            padding: '16px',
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '14px', 
              color: colors.textSecondary,
              marginBottom: '4px'
            }}>
              {entityName.charAt(0).toUpperCase() + entityName.slice(1)}:
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: colors.text
            }}>
              {entityDisplayName}
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant={operation === 'delete' ? 'destructive' : 'default'}
            onClick={onConfirm}
            loading={isLoading}
            style={{
              backgroundColor: operation !== 'delete' ? getOperationColor() : undefined
            }}
          >
            {operation === 'delete' ? 'Eliminar' : 
             operation === 'create' ? 'Crear' : 'Actualizar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SimpleCRUDConfirmationModal;