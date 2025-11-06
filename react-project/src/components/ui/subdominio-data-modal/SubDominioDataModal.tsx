import React, { useState, useEffect } from 'react';
import { Plus, Edit, Database } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { SubDominioDataForm } from '../subdominio-data-form';
import { CRUDConfirmationModal } from '../crud-confirmation-modal';
import { AlertService } from '../alerts/AlertService';
import {
  SubDominioData,
  CreateSubDominioDataDto,
  UpdateSubDominioDataDto
} from '../../../models/DominiosData';
import SubDominioDataService from '../../../services/subdominio-data.service';

export interface SubDominioDataModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** SubDominio a editar (null/undefined para crear nuevo) */
  subDominio?: SubDominioData | null;
  /** ID del dominio padre */
  dominioId: number;
  /** Función llamada después de crear/actualizar exitosamente */
  onSuccess?: (subDominio: SubDominioData) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
  /** Función llamada para ver la gobernanza del subdominio */
  onGovernance?: (subDominio: SubDominioData) => void;
  /** Función llamada cuando cambia la gobernanza seleccionada */
  onGobernanzaChange?: (gobernanzaId: number) => void;
}

export const SubDominioDataModal: React.FC<SubDominioDataModalProps> = ({
  isOpen,
  onClose,
  subDominio,
  dominioId,
  onSuccess,
  onError,
  onGovernance,
  onGobernanzaChange
}) => {
  // Estados
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCRUDConfirmation, setShowCRUDConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateSubDominioDataDto | UpdateSubDominioDataDto | null>(null);
  const [subDominioCompleto, setSubDominioCompleto] = useState<SubDominioData | null>(null);

  // Servicio
  const subDominioService = new SubDominioDataService();

  // Determinar si estamos editando
  const isEditing = !!subDominio;

  // Usar directamente los datos del subdominio pasado como prop
  useEffect(() => {
    if (isOpen) {
      if (isEditing && subDominio) {
        // Usar directamente los datos del row seleccionado
        setSubDominioCompleto(subDominio);
        setIsLoadingData(false);
      } else {
        // Para crear nuevo subdominio
        setSubDominioCompleto(null);
        setIsLoadingData(false);
      }
    }
  }, [isOpen, isEditing, subDominio]);

  // Limpiar estado al cerrar
  const handleClose = () => {
    setSubDominioCompleto(null);
    setPendingFormData(null);
    setShowCRUDConfirmation(false);
    setIsSubmitting(false);
    onClose();
  };

  // Crear nuevo subdominio
  const handleCreateSubDominio = async (data: CreateSubDominioDataDto): Promise<SubDominioData> => {
    const requestData = {
      dominioDataId: data.dominioDataId,
      codigoSubDominio: data.codigoSubDominio,
      nombreSubDominio: data.nombreSubDominio,
      descripcionSubDominio: data.descripcionSubDominio,
      tieneGobernanzaPropia: data.tieneGobernanzaPropia,
      gobernanzaId: data.gobernanzaId,
      estado: data.estado,
      creadoPor: data.creadoPor
    };
    const response = await subDominioService.createSubDominioData(requestData);

    if (!response.success) {
      throw new Error(response.message || 'Error al crear el subdominio');
    }

    // Simular respuesta completa del subdominio creado
    const nuevoSubDominio: SubDominioData = {
      subDominioId: response.data || Date.now(),
      dominioId: data.dominioDataId,
      codigo: data.codigoSubDominio || '',
      nombre: data.nombreSubDominio,
      descripcion: data.descripcionSubDominio,
      categoria: 'datos_tecnicos' as any,
      nivelSensibilidad: 'interno' as any,
      tieneGobernanzaPropia: data.tieneGobernanzaPropia,
      estado: 'activo' as any,
      estadoTexto: 'Activo',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      creadoPor: data.creadoPor,
      actualizadoPor: data.creadoPor,
      registroEliminado: false
    };

    return nuevoSubDominio;
  };

  // Actualizar subdominio existente
  const handleUpdateSubDominio = async (data: UpdateSubDominioDataDto): Promise<SubDominioData> => {
    const updateRequest = {
      subDominioDataId: data.subDominioDataId,
      dominioDataId: data.dominioDataId,
      codigoSubDominio: data.codigoSubDominio,
      nombreSubDominio: data.nombreSubDominio,
      descripcionSubDominio: data.descripcionSubDominio,
      tieneGobernanzaPropia: data.tieneGobernanzaPropia,
      gobernanzaId: data.gobernanzaId,
      estado: data.estado,
      actualizadoPor: data.actualizadoPor
    };
    const response = await subDominioService.updateSubDominioData(updateRequest);

    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar el subdominio');
    }

    // Retornar el subdominio actualizado
    const subDominioActualizado: SubDominioData = {
      ...subDominioCompleto!,
      codigo: data.codigoSubDominio,
      nombre: data.nombreSubDominio,
      descripcion: data.descripcionSubDominio,
      tieneGobernanzaPropia: data.tieneGobernanzaPropia,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: data.actualizadoPor
    };

    return subDominioActualizado;
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (formData: CreateSubDominioDataDto | UpdateSubDominioDataDto) => {
    setPendingFormData(formData);
    setShowCRUDConfirmation(true);
  };

  // Confirmar operación CRUD
  const handleConfirmCRUD = async (action: 'BORRADOR' | 'NOTIFICAR') => {
    if (!pendingFormData) {
      return;
    }

    setIsSubmitting(true);
    setShowCRUDConfirmation(false);

    const actionText = action === 'BORRADOR' ? 'Guardando borrador' : 'Procesando solicitud';
    const loadingToastId = AlertService.loading(`${actionText}...`);

    try {
      // Determinar estado basado en la acción seleccionada
      const isBorrador = action === 'BORRADOR';
      const estado: number = isBorrador ? -4 : -3;

      // Agregar el estado al formulario
      const formDataWithEstado = {
        ...pendingFormData,
        estado: estado
      };

      let resultado: SubDominioData;

      if (isEditing) {
        resultado = await handleUpdateSubDominio(formDataWithEstado as UpdateSubDominioDataDto);
      } else {
        resultado = await handleCreateSubDominio(formDataWithEstado as CreateSubDominioDataDto);
      }

      if (action === 'BORRADOR') {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `Subdominio ${isEditing ? 'actualizado' : 'creado'} como borrador exitosamente`,
          3000
        );
      } else {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `Subdominio ${isEditing ? 'actualizado' : 'creado'} y enviado para aprobación exitosamente`,
          3000
        );
      }

      // Notificar éxito
      onSuccess?.(resultado);
      handleClose();
    } catch (error: any) {
      console.error('❌ Error en operación CRUD:', error);
      const errorMessage = error?.message || 
        (isEditing ? 'Error al actualizar el subdominio' : 'Error al crear el subdominio');
      AlertService.updateLoading(loadingToastId, 'error', errorMessage, 5000);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
      setPendingFormData(null);
    }
  };

  // Cancelar confirmación CRUD
  const handleCancelCRUD = () => {
    setShowCRUDConfirmation(false);
    setPendingFormData(null);
  };

  // Manejar guardado desde el modal
  const handleModalSave = () => {
    // El formulario maneja su propio envío - buscar por tag form dentro del modal
    const form = document.querySelector('form[data-form="subdominio-data"]') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    } else {
      // Fallback: buscar cualquier form en el modal
      const anyForm = document.querySelector('form') as HTMLFormElement;
      if (anyForm) {
        anyForm.requestSubmit();
      }
    }
  };

  // Cancelar formulario
  const handleFormCancel = () => {
    handleClose();
  };

  // Título del modal
  const modalTitle = isEditing ? 'Editar Subdominio' : 'Crear Nuevo Subdominio';
  
  // Icono del modal
  const modalIcon = isEditing ? <Edit size={20} /> : <Plus size={20} />;

  // Texto del botón de guardar
  const saveButtonText = isEditing ? 'Actualizar' : 'Crear';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
        size="l"
        onSave={handleModalSave}
        onCancel={handleFormCancel}
        saveButtonText={saveButtonText}
        cancelButtonText="Cancelar"
        saveDisabled={isSubmitting || isLoadingData}
        cancelDisabled={isSubmitting}
      >
        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando datos...</span>
          </div>
        ) : (
          <SubDominioDataForm
            subDominio={subDominioCompleto}
            dominioId={dominioId}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            showActions={false} // El modal maneja los botones
            onGovernance={onGovernance}
            onGobernanzaChange={onGobernanzaChange}
          />
        )}
      </Modal>

      {/* Modal de confirmación CRUD */}
      <CRUDConfirmationModal
        isOpen={showCRUDConfirmation}
        tipoOperacion={isEditing ? 'EDITAR' : 'CREAR'}
        entidadNombre={pendingFormData?.nombreSubDominio || 'Nuevo Subdominio'}
        entidadTipo="Subdominio de Datos"
        datosEntidad={pendingFormData ? {
          'Nombre Subdominio': pendingFormData.nombreSubDominio,
          'Código Subdominio': pendingFormData.codigoSubDominio || 'Sin código',
          'Descripción': pendingFormData.descripcionSubDominio || 'Sin descripción',
          'Tiene Gobernanza Propia': pendingFormData.tieneGobernanzaPropia ? 'Sí' : 'No',
          'Gobernanza ID': pendingFormData.gobernanzaId ? `ID: ${pendingFormData.gobernanzaId}` : 'Por definir',
          'Estado': 'Pendiente de ' + (isEditing ? 'actualización' : 'creación')
        } : {}}
        onClose={handleCancelCRUD}
        onConfirm={handleConfirmCRUD}
        onCancel={handleCancelCRUD}
        hasGobernanzaId={subDominioCompleto?.gobernanzaId ? subDominioCompleto.gobernanzaId > 0 : false}
      />
    </>
  );
};

export default SubDominioDataModal;