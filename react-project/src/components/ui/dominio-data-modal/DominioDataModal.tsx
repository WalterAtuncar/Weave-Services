import React, { useState, useEffect } from 'react';
import { Plus, Edit, Database } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { FormDominioData } from '../dominio-data-form';
import { CRUDConfirmationModal } from '../crud-confirmation-modal';
import { AlertService } from '../alerts/AlertService';
import {
  DominioData,
  CreateDominioDataFormDto,
  UpdateDominioDataFormDto
} from '../../../models/DominiosData';
import { DominiosDataService } from '../../../services/dominios-data.service';
import { GobernanzaDto } from '../../../services/types/gobernanza.types';

export interface DominioDataModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** DominioData a editar (null/undefined para crear nuevo) */
  dominioData?: DominioData | null;
  /** ID de la organización */
  organizacionId: number;
  /** Función llamada después de crear/actualizar exitosamente */
  onSuccess?: (dominioData: DominioData) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
  /** Función llamada para ver la gobernanza del dominio */
  onGovernance?: (dominio: DominioData, gobernanza?: GobernanzaDto | any) => void;
  /** Función llamada cuando cambia la gobernanza */
  onGobernanzaChange?: (gobernanzaId: number) => void;
}

export const DominioDataModal: React.FC<DominioDataModalProps> = ({
  isOpen,
  onClose,
  dominioData = null,
  organizacionId,
  onSuccess,
  onError,
  onGovernance,
  onGobernanzaChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dominioDataCompleto, setDominioDataCompleto] = useState<DominioData | null>(dominioData);
  const [showCRUDConfirmation, setShowCRUDConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateDominioDataFormDto | UpdateDominioDataFormDto | null>(null);
  const isEditing = !!dominioData;
  
  // Servicio para operaciones CRUD de dominios de datos
  const dominiosDataService = new DominiosDataService();

  // Cargar datos completos del dominio cuando es edición
  useEffect(() => {
    const loadDominioDataCompleto = async () => {
      if (isEditing && dominioData && isOpen) {
        setIsLoadingData(true);
        try {
          const response = await dominiosDataService.getDominioDataCompleto({ dominioId: dominioData.dominioId });
          if (response.success && response.data) {
            setDominioDataCompleto(response.data);
          } else {
            console.error('❌ Error cargando datos del dominio:', response.message);
            AlertService.error('Error al cargar los datos del dominio');
          }
        } catch (error) {
          console.error('❌ Error cargando datos del dominio:', error);
          AlertService.error('Error al cargar los datos del dominio');
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setDominioDataCompleto(dominioData);
      }
    };

    loadDominioDataCompleto();
  }, [isEditing, dominioData?.dominioId, isOpen]);

  // Función para crear dominio de datos
  const handleCreateDominioData = async (data: CreateDominioDataFormDto & { estado?: number }): Promise<DominioData> => {
    try {
      const response = await dominiosDataService.createDominioData({
        nombreDominio: data.nombreDominio,
        codigoDominio: data.codigoDominio,
        descripcion: data.descripcionDominio,
        tipoDominioId: data.tipoDominioId,
        dominioParentId: 0, // Por defecto
        estado: data.estado !== undefined ? data.estado.toString() : 'Activo', // Usar estado del SEO o por defecto
        propietarioNegocio: '', // Por defecto
        stewardData: '', // Por defecto
        politicasGobierno: '', // Por defecto
        organizacionId: data.organizacionId,
        gobernanzaId: data.gobernanzaId
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear el dominio de datos');
      }
    } catch (error) {
      console.error('❌ Error creando dominio de datos:', error);
      throw error;
    }
  };

  // Función para actualizar dominio de datos
  const handleUpdateDominioData = async (data: UpdateDominioDataFormDto & { estado?: number }): Promise<DominioData> => {
    try {
      const response = await dominiosDataService.updateDominioData({
        dominioId: data.id,
        nombreDominio: data.nombreDominio,
        codigoDominio: data.codigoDominio,
        descripcionDominio: data.descripcionDominio,
        tipoDominioId: data.tipoDominioId,
        dominioParentId: dominioDataCompleto?.dominioParentId || 0,
        estado: data.estado !== undefined ? data.estado.toString() : (dominioDataCompleto?.estado || 'Activo'), // Usar estado del SEO o mantener el actual
        propietarioNegocio: dominioDataCompleto?.propietarioNegocio || '',
        stewardData: dominioDataCompleto?.stewardData || '',
        politicasGobierno: dominioDataCompleto?.politicasGobierno || '',
        organizacionId: data.organizacionId,
        gobernanzaId: data.gobernanzaId
      });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar el dominio de datos');
      }
    } catch (error) {
      console.error('❌ Error actualizando dominio de datos:', error);
      throw error;
    }
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (formData: CreateDominioDataFormDto | UpdateDominioDataFormDto) => {
    setPendingFormData(formData);
    setShowCRUDConfirmation(true);
  };

  // Confirmar operación CRUD con opciones de SEO
  const handleConfirmCRUD = async (action: 'BORRADOR' | 'NOTIFICAR') => {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    setShowCRUDConfirmation(false);

    const actionText = action === 'BORRADOR' ? 'Guardando borrador' : 'Procesando solicitud';
    const loadingToastId = AlertService.loading(`${actionText}...`);

    try {
      // Determinar estado basado en la acción seleccionada
      const isBorrador = action === 'BORRADOR';
      const estado: number = isBorrador ? -4 : -3; // -4 = Borrador, -3 = Pendiente aprobación

      // Agregar el estado al formulario
      const formDataWithEstado = {
        ...pendingFormData,
        estado: estado
      };

      let resultado: DominioData;

      if (isEditing) {
        resultado = await handleUpdateDominioData(formDataWithEstado as UpdateDominioDataFormDto);
      } else {
        resultado = await handleCreateDominioData(formDataWithEstado as CreateDominioDataFormDto);
      }

      if (action === 'BORRADOR') {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `Dominio de datos ${isEditing ? 'actualizado' : 'creado'} como borrador exitosamente`,
          3000
        );
      } else {
        AlertService.updateLoading(
          loadingToastId,
          'success',
          `Dominio de datos ${isEditing ? 'actualizado' : 'creado'} y enviado a aprobación exitosamente`,
          3000
        );
      }

      // Notificar éxito
      onSuccess?.(resultado);
      handleClose();
    } catch (error: any) {
      console.error('❌ Error en operación CRUD:', error);
      const errorMessage = error?.message || 
        (isEditing ? 'Error al actualizar el dominio de datos' : 'Error al crear el dominio de datos');
      AlertService.updateLoading(loadingToastId, 'error', errorMessage, 5000);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
      setPendingFormData(null);
    }
  };

  // Cancelar operación CRUD
  const handleCancelCRUD = () => {
    setShowCRUDConfirmation(false);
    setPendingFormData(null);
  };

  // Cerrar modal principal
  const handleClose = () => {
    onClose();
  };

  // Manejar click en Guardar del Modal (dispara submit del formulario interno)
  const handleModalSave = () => {
    const form = document.querySelector('form[data-form="dominio-data"]') as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
    }
  };

  // Manejar click en Cancelar del Modal
  const handleFormCancel = () => {
    handleClose();
  };

  const saveButtonText = dominioData ? 'Actualizar' : 'Guardar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={dominioData ? 'Editar Dominio de Datos' : 'Nuevo Dominio de Datos'}
      size="l"
      onSave={handleModalSave}
      onCancel={handleFormCancel}
      saveButtonText={saveButtonText}
      cancelButtonText="Cancelar"
      saveDisabled={isSubmitting || isLoadingData}
      cancelDisabled={isSubmitting}
    >
      <FormDominioData
        dominioData={dominioDataCompleto}
        onSubmit={handleFormSubmit}
        onCancel={handleClose}
        isLoading={isLoadingData}
        disabled={isSubmitting}
        compact
        organizacionId={organizacionId}
        onGovernance={onGovernance}
        onGobernanzaChange={onGobernanzaChange}
      />

      {/* Modal de confirmación CRUD */}
      <CRUDConfirmationModal
        isOpen={showCRUDConfirmation}
        tipoOperacion={isEditing ? 'EDITAR' : 'CREAR'}
        entidadNombre={pendingFormData?.nombreDominio || 'Nuevo Dominio de Datos'}
        entidadTipo="Dominio de Datos"
        datosEntidad={pendingFormData ? {
          'Nombre Dominio': pendingFormData.nombreDominio,
          'Código Dominio': pendingFormData.codigoDominio,
          'Descripción': pendingFormData.descripcionDominio || 'Sin descripción',
          'Tipo Dominio': pendingFormData.tipoDominioId ? `ID: ${pendingFormData.tipoDominioId}` : 'Por definir',
          'Organización': `ID: ${pendingFormData.organizacionId}`,
          'Estado': 'Pendiente de ' + (isEditing ? 'actualización' : 'creación')
        } : {}}
        onClose={handleCancelCRUD}
        onConfirm={handleConfirmCRUD}
        onCancel={handleCancelCRUD}
      />
    </Modal>
  );
};

export default DominioDataModal;