import React, { useState, useEffect } from 'react';
import { Plus, Edit, Database } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { SystemForm, SystemFormWithModules } from '../system-form';
import { CRUDConfirmationModal } from '../crud-confirmation-modal';
import { ApprovalTracker } from '../approval-tracker';
import { AlertService } from '../alerts/AlertService';
import { Sistema, SistemaModulo, CreateSistemaDto, UpdateSistemaDto } from '../../../models/Sistemas';
import { useSistemas } from '../../../hooks/useSistemas';
import { sistemasService } from '../../../services/sistemas.service';
import { sistemaServidorService } from '../../../services/sistema-servidor.service';
import { CreateSistemaRequest, UpdateSistemaRequest } from '../../../services/types/sistemas.types';
import { notificationService } from '../../../services/notification.service';

export interface SystemModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Sistema a editar (null/undefined para crear nuevo) */
  sistema?: Sistema | null;
  /** ID de la organización */
  organizacionId: number;
  /** Rol de gobernanza del usuario */
  gobernanzaRol?: { rolGobernanzaCodigo: string } | null;
  /** Función llamada después de crear/actualizar exitosamente */
  onSuccess?: (sistema: Sistema) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
  /** Función llamada para ver la gobernanza del sistema */
  onGovernance?: (sistema: Sistema) => void;
}

export const SystemModal: React.FC<SystemModalProps> = ({
  isOpen,
  onClose,
  sistema = null,
  organizacionId,
  gobernanzaRol,
  onSuccess,
  onError,
  onGovernance
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [sistemaData, setSistemaData] = useState<Sistema | null>(sistema);
  const [showCRUDConfirmation, setShowCRUDConfirmation] = useState(false);
  const [showApprovalTracker, setShowApprovalTracker] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateSistemaDto | UpdateSistemaDto | null>(null);
  const [pendingModulos, setPendingModulos] = useState<SistemaModulo[]>([]);
  const [currentSolicitudId, setCurrentSolicitudId] = useState<number | null>(null);
  const isEditing = !!sistema;
  
  // Hook para operaciones CRUD de sistemas
  const { getSistemaById, createSistema: createSistemaApi, updateSistema: updateSistemaApi } = useSistemas();

  // Cargar datos del sistema cuando es edición
  useEffect(() => {
    const loadSistemaData = async () => {
      if (isEditing && sistema && isOpen) {
        setIsLoadingData(true);
        try {
          const sistemaCompleto = await getSistemaById(sistema.sistemaId);
          setSistemaData(sistemaCompleto);
        } catch (error) {
          console.error('❌ Error cargando datos del sistema:', error);
          // El error ya se muestra via AlertService desde el hook
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setSistemaData(sistema);
      }
    };

    loadSistemaData();
  }, [isEditing, sistema?.sistemaId, isOpen]); // Removida getSistemaById para evitar loop

  // Función para crear sistema usando API real
  const handleCreateSistema = async (data: CreateSistemaDto): Promise<Sistema> => {
    // ✅ VALIDACIÓN: Asegurar que tipoSistema y familiaSistema tengan valores válidos
    const tipoSistemaId = data.tipoSistema && data.tipoSistema > 0 ? data.tipoSistema : 1;
    const familiaSistemaId = data.familiaSistema && data.familiaSistema > 0 ? data.familiaSistema : 1;



    const request: CreateSistemaRequest = {
      organizacionId: data.organizacionId,
      codigoSistema: data.codigoSistema || undefined,
      nombreSistema: data.nombreSistema,
      funcionPrincipal: data.funcionPrincipal || undefined,
      sistemaDepende: data.sistemaDepende || undefined,
      tipoSistemaId: tipoSistemaId,
      familiaSistemaId: familiaSistemaId,
      estado: data.estado, // ✅ AGREGADO: Enviar el estado al backend
      tieneGobernanzaPropia: data.tieneGobernanzaPropia, // ✅ AGREGADO: Enviar tieneGobernanzaPropia al backend
      servidorIds: data.servidorIds || [],
      modulos: pendingModulos.map(modulo => ({
        nombreModulo: modulo.nombreModulo,
        funcionModulo: modulo.funcionModulo,
        estado: modulo.estado || 1 // Por defecto Activo
      }))
    };



    const response = await sistemasService.createSistema(request);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear sistema');
    }
    return response.data as unknown as Sistema;
  };

  // Función para actualizar sistema usando API real
  const handleUpdateSistema = async (data: UpdateSistemaDto): Promise<Sistema> => {


    if (!sistemaData) {
      throw new Error('No hay datos del sistema para actualizar');
    }

    // Obtener servidores actuales del sistema desde el backend
    let servidoresActualesList: number[] = [];
    try {
      const servidoresResponse = await sistemaServidorService.getServidoresBySistema(data.sistemaId);
      if (servidoresResponse.success && servidoresResponse.data) {
        servidoresActualesList = servidoresResponse.data.map(ss => ss.servidorId);
      }
    } catch (error) {
      console.error('❌ Error obteniendo servidores actuales:', error);
      // Continuar con lista vacía si hay error
    }

    // Lógica de comparación de servidores
    const servidoresNuevosList = data.servidorIds || [];
    
    // Servidores a eliminar: están en actuales pero NO en nuevos
    const servidoresToDelete = servidoresActualesList.filter(
      servidorId => !servidoresNuevosList.includes(servidorId)
    );
    
    // Servidores a insertar: están en nuevos pero NO en actuales
    const servidoresToInsert = servidoresNuevosList.filter(
      servidorId => !servidoresActualesList.includes(servidorId)
    );





    // Asegurar que tipoSistemaId y familiaSistemaId no sean 0 o undefined
    const tipoSistemaId = data.tipoSistema && data.tipoSistema > 0 ? data.tipoSistema : 1;
    const familiaSistemaId = data.familiaSistema && data.familiaSistema > 0 ? data.familiaSistema : 1;



    const request: UpdateSistemaRequest = {
      sistemaId: data.sistemaId,
      organizacionId: data.organizacionId,
      codigoSistema: data.codigoSistema || undefined,
      nombreSistema: data.nombreSistema,
      funcionPrincipal: data.funcionPrincipal || undefined,
      sistemaDepende: data.sistemaDepende || undefined,
      tipoSistemaId: tipoSistemaId,
      familiaSistemaId: familiaSistemaId,
      estado: data.estado, // ✅ AGREGADO: Enviar el estado al backend
      tieneGobernanzaPropia: data.tieneGobernanzaPropia, // ✅ AGREGADO: Enviar tieneGobernanzaPropia al backend
      gobernanzaId: data.gobernanzaId || undefined, // ✅ AGREGADO: Enviar gobernanzaId al backend
      servidoresToDelete,
      servidoresToInsert
    };



    const response = await sistemasService.updateSistema(request);
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar sistema');
    }

    // Recargar datos actualizados
    const sistemaActualizado = await getSistemaById(data.sistemaId);
    return sistemaActualizado!;
  };

  // Interceptar envío del formulario para mostrar confirmación CRUD
  const handleSubmit = async (data: CreateSistemaDto | UpdateSistemaDto, modulos: SistemaModulo[] = []) => {
    // Guardar datos del formulario y módulos para usar después de la confirmación
    setPendingFormData(data);
    setPendingModulos(modulos);
    
    // Mostrar modal de confirmación CRUD
    setShowCRUDConfirmation(true);
  };

  // Manejar confirmación CRUD (Borrador o Notificar)
  const handleCRUDConfirmation = async (action: 'BORRADOR' | 'NOTIFICAR') => {
    if (!pendingFormData) {
      return;
    }

    setShowCRUDConfirmation(false);
    setIsSubmitting(true);

    const actionText = action === 'BORRADOR' ? 'Guardando borrador' : 'Procesando solicitud';
    const loadingToastId = AlertService.loading(`${actionText}...`);

    try {
      // 🔧 NUEVA LÓGICA: Determinar estado basado en la acción seleccionada
      const isBorrador = action === 'BORRADOR';
      const operation = isEditing ? 'UPDATE' : 'CREATE';

      // ✅ CORREGIDO: Siempre enviar -4 cuando el usuario elige BORRADOR, sin depender del rol
      const estado: number = isBorrador ? -4 : -3;

      // Agregar el estado al formulario
      const formDataWithEstado = {
        ...pendingFormData,
        estado: estado
      };

      // Ejecutar la operación real (crear o actualizar)
      let resultado: Sistema;
      if (isEditing) {
        resultado = await handleUpdateSistema(formDataWithEstado as UpdateSistemaDto);
      } else {
        resultado = await handleCreateSistema(formDataWithEstado as CreateSistemaDto);
      }

      if (action === 'BORRADOR') {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `Sistema ${isEditing ? 'actualizado' : 'creado'} como borrador exitosamente`,
          3000
        );
      } else {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `Sistema ${isEditing ? 'actualizado' : 'creado'} y enviado a aprobación exitosamente`,
          4000
        );
      }

      if (onSuccess) {
        onSuccess(resultado);
      }
      
      onClose();

      // Limpiar datos pendientes
      setPendingFormData(null);
      setPendingModulos([]);

    } catch (error) {
      console.error('Error al procesar confirmación CRUD:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error inesperado al procesar la solicitud';

      AlertService.updateLoading(
        loadingToastId,
        'error',
        `Error: ${errorMessage}`,
        5000
      );

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar confirmación CRUD
  const handleCRUDCancel = () => {
    setShowCRUDConfirmation(false);
    setPendingFormData(null);
    setPendingModulos([]);
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
    if (isEditing && sistemaData) {
      return `Editar Sistema: ${sistemaData.nombreSistema}`;
    } else if (isEditing) {
      return 'Editar Sistema';
    }
    return 'Crear Nuevo Sistema';
  };

  // Icon dinámico del modal
  const getModalIcon = () => {
    return isEditing ? <Edit size={20} /> : <Plus size={20} />;
  };

  return (
    <>
      {/* Modal principal del sistema */}
      <Modal
        isOpen={isOpen && !showCRUDConfirmation && !showApprovalTracker}
        onClose={handleCancel}
        title={getModalTitle()}
        size="l"
        hideFooter={true} // El SystemForm maneja sus propios botones
        forcedClose={true}
        closeOnEscape={!isSubmitting}
        className="system-modal"
      >
        {isLoadingData ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div>Cargando datos del sistema...</div>
          </div>
        ) : isEditing ? (
          <SystemFormWithModules
            sistema={sistemaData}
            onSubmit={(sistemaData, modulos) => handleSubmit(sistemaData, modulos)}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            disabled={false}
            showActions={true}
            compact={true}
            showModules={true}
            modulesReadOnly={false}
            onGovernance={onGovernance}
          />
        ) : (
          <SystemFormWithModules
            sistema={sistemaData}
            onSubmit={(sistemaData, modulos) => handleSubmit(sistemaData, modulos)}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            disabled={false}
            showActions={true}
            compact={true}
            showModules={true}
            modulesReadOnly={false}
            onGovernance={onGovernance}
          />
        )}
      </Modal>

      {/* Modal de confirmación CRUD */}

      <CRUDConfirmationModal
        isOpen={showCRUDConfirmation}
        tipoOperacion={isEditing ? 'EDITAR' : 'CREAR'}
        entidadNombre={pendingFormData?.nombreSistema || 'Nuevo Sistema'}
        entidadTipo="Sistema"
        datosEntidad={pendingFormData ? {
          'Nombre Sistema': pendingFormData.nombreSistema,
          'Descripción': pendingFormData.funcionPrincipal || 'Sin descripción',
          'Tipo Sistema': pendingFormData.tipoSistema || 'Por definir',
          'Familia Sistema': pendingFormData.familiaSistema || 'Por definir',
          'URL': pendingFormData.url || 'No especificada',
          'Estado': 'Pendiente de ' + (isEditing ? 'actualización' : 'creación')
        } : {}}
        onClose={handleCRUDCancel}
        onConfirm={handleCRUDConfirmation}
        onCancel={handleCRUDCancel}
        hasGobernanzaId={sistema?.gobernanzaId ? sistema.gobernanzaId > 0 : false}
      />

      {/* Modal de seguimiento de aprobación */}
      <Modal
        isOpen={showApprovalTracker}
        onClose={() => {
          setShowApprovalTracker(false);
          setCurrentSolicitudId(null);
          onClose();
        }}
        title="Seguimiento de Aprobación"
        size="l"
        hideFooter={true}
        className="approval-tracker-modal"
      >
        {sistema && (
          <ApprovalTracker
            sistemaId={sistema.sistemaId}
            showDetailed={true}
            onApprovalAction={(sistemaId, accion, comentarios) => {
              // Aquí se manejaría la aprobación/rechazo
              AlertService.info(`Acción "${accion}" registrada para sistema #${sistemaId}`);
            }}
          />
        )}
      </Modal>
    </>
  );
};