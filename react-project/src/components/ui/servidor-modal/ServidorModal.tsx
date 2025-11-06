import React, { useState } from 'react';
import { Plus, Edit, Server } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { ServidorForm } from '../servidor-form';
import { AlertService } from '../alerts/AlertService';
import { Servidor, CreateServidorDto, UpdateServidorDto } from '../../../models/Servidores';
import { useServidores } from '../../../hooks/useServidores';
import { useAuth } from '../../../hooks/useAuth';

export interface ServidorModalProps {
  /** Controla si el modal está abierto */
  open: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Servidor a editar (null/undefined para crear nuevo) */
  servidor?: Servidor | null;
  /** Función llamada después de crear/actualizar exitosamente */
  onSuccess?: (servidor: Servidor) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
  /** Modo de solo lectura - todos los campos deshabilitados */
  readonly?: boolean;
}

export const ServidorModal: React.FC<ServidorModalProps> = ({
  open,
  onClose,
  servidor = null,
  onSuccess,
  onError,
  readonly = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!servidor;
  
  // Hooks para obtener datos de autenticación y funciones CRUD
  const { organizationInfo } = useAuth();
  const { crearServidor, actualizarServidor } = useServidores();

  // Manejar envío del formulario
  const handleSubmit = async (data: CreateServidorDto | UpdateServidorDto) => {
    // En modo readonly, no procesar ninguna acción
    if (readonly) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      let resultado: Servidor | null;

      if (isEditing) {
        resultado = await actualizarServidor(data as UpdateServidorDto);
      } else {
        resultado = await crearServidor(data as CreateServidorDto);
      }

      if (resultado) {
        // Notificar éxito
        if (onSuccess) {
          onSuccess(resultado);
        }

        // Cerrar modal
        onClose();
      } else {
        // Fallback defensivo si no llegó resultado ni se lanzó error del servicio
        throw {
          response: {
            data: {
              message: 'No se pudo procesar la solicitud',
              errors: ['No se pudo procesar la solicitud']
            }
          }
        };
      }

    } catch (error: any) {
      console.error('Error al procesar servidor:', error);
      
      // Priorizar mensajes del backend: errors[0] > message
      const backend = error?.response?.data;
      const errorMessage = backend?.errors?.[0]
        || backend?.message
        || (error instanceof Error ? error.message : 'Error inesperado al procesar la solicitud');

      // Notificar error al contenedor, si desea reaccionar (sin toasts aquí para evitar duplicados)
      if (onError) {
        onError(errorMessage);
      }
      // La notificación visual se maneja en los hooks (useServidores.handleError) o por el interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    if (isSubmitting) {
      // Preguntar si realmente quiere cancelar mientras está enviando
      AlertService.confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.',
        {
          confirmText: 'Sí, cancelar',
          cancelText: 'Continuar editando'
        }
      ).then((confirmed) => {
        if (confirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  // Título dinámico del modal
  const getModalTitle = () => {
    if (readonly) {
      return `Ver Detalles: ${servidor!.nombreServidor}`;
    }
    if (isEditing) {
      return `Editar Servidor: ${servidor!.nombreServidor}`;
    }
    return 'Crear Nuevo Servidor';
  };

  // Icon dinámico del modal
  const getModalIcon = () => {
    if (readonly) return <Server size={20} />;
    return isEditing ? <Edit size={20} /> : <Plus size={20} />;
  };

  // Descripción del modal
  const getModalDescription = () => {
    if (readonly) {
      return 'Información detallada del servidor en modo de solo lectura';
    }
    if (isEditing) {
      return 'Modifica los campos necesarios y guarda los cambios';
    }
    return 'Completa los campos para crear el nuevo servidor';
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleCancel}
      title={getModalTitle()}
      size="l"
      hideFooter={true}
    >
      <ServidorForm
        servidor={servidor}
        organizacionId={organizationInfo?.id || 1}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        readonly={readonly}
        compact={true}
      />
    </Modal>
  );
};

export default ServidorModal;