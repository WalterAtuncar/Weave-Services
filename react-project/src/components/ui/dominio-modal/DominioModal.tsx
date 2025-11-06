import React, { useState, useEffect } from 'react';
import { Plus, Edit, Database } from 'lucide-react';
import { Modal } from '../modal/Modal';
import { DominioForm } from '../dominio-form';
import { SimpleCRUDConfirmationModal } from '../crud-confirmation-modal';
import { AlertService } from '../alerts/AlertService';
import { DominioData, CreateDominioDataDto, UpdateDominioDataDto } from '../../../models/DominiosData';
import { useDominiosData } from '../../../hooks/useDominiosData';

export interface DominioModalProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Dominio a editar (null/undefined para crear nuevo) */
  dominio?: DominioData | null;
  /** ID de la organización */
  organizacionId: number;
  /** Función llamada después de crear/actualizar exitosamente */
  onSuccess?: (dominio: DominioData) => void;
  /** Función llamada si hay error */
  onError?: (error: string) => void;
}

export const DominioModal: React.FC<DominioModalProps> = ({
  isOpen,
  onClose,
  dominio = null,
  organizacionId,
  onSuccess,
  onError
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dominioData, setDominioData] = useState<DominioData | null>(dominio);
  const [showCRUDConfirmation, setShowCRUDConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateDominioDataDto | UpdateDominioDataDto | null>(null);
  const isEditing = !!dominio;
  
  // Hook para operaciones CRUD de dominios
  const { getDominioById, createDominio, updateDominio } = useDominiosData();

  // Cargar datos del dominio cuando es edición
  useEffect(() => {
    const loadDominioData = async () => {
      if (isEditing && dominio && isOpen) {
        setIsLoadingData(true);
        try {
          const dominioCompleto = await getDominioById(dominio.dominioId);
          setDominioData(dominioCompleto);
        } catch (error) {
          console.error('❌ Error cargando datos del dominio:', error);
          AlertService.error('Error al cargar los datos del dominio');
        } finally {
          setIsLoadingData(false);
        }
      } else {
        setDominioData(dominio);
      }
    };

    loadDominioData();
  }, [isEditing, dominio?.dominioId, isOpen, getDominioById]);

  // Función para crear dominio
  const handleCreateDominio = async (data: CreateDominioDataDto): Promise<DominioData | null> => {
    try {
      return await createDominio(data);
    } catch (error) {
      console.error('❌ Error creando dominio:', error);
      throw error;
    }
  };

  // Función para actualizar dominio
  const handleUpdateDominio = async (data: UpdateDominioDataDto): Promise<DominioData | null> => {
    try {
      return await updateDominio(data);
    } catch (error) {
      console.error('❌ Error actualizando dominio:', error);
      throw error;
    }
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (formData: CreateDominioDataDto | UpdateDominioDataDto) => {
    setPendingFormData(formData);
    setShowCRUDConfirmation(true);
  };

  // Confirmar operación CRUD
  const handleConfirmCRUD = async () => {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    setShowCRUDConfirmation(false);

    try {
      let resultado: DominioData | null;

      if (isEditing) {
        resultado = await handleUpdateDominio(pendingFormData as UpdateDominioDataDto);
        AlertService.success('Dominio actualizado exitosamente');
      } else {
        resultado = await handleCreateDominio(pendingFormData as CreateDominioDataDto);
        AlertService.success('Dominio creado exitosamente');
      }

      if (!resultado) {
        throw new Error('No se pudo obtener el resultado de la operación');
      }

      // Notificar éxito
      onSuccess?.(resultado);
      handleClose();
    } catch (error: any) {
      console.error('❌ Error en operación CRUD:', error);
      const errorMessage = error?.message || 
        (isEditing ? 'Error al actualizar el dominio' : 'Error al crear el dominio');
      AlertService.error(errorMessage);
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

  // Cerrar modal
  const handleClose = () => {
    if (isSubmitting) return;
    
    setDominioData(null);
    setPendingFormData(null);
    setShowCRUDConfirmation(false);
    onClose();
  };

  // Cancelar formulario
  const handleFormCancel = () => {
    handleClose();
  };

  // Título del modal
  const modalTitle = isEditing 
    ? `Editar Dominio: ${dominioData?.nombre || dominio?.nombre || ''}` 
    : 'Crear Nuevo Dominio';

  // Icono del modal
  const modalIcon = isEditing ? Edit : Plus;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
        icon={modalIcon}
        size="lg"
        loading={isLoadingData}
        className="dominio-modal"
      >
        {!isLoadingData && (
          <DominioForm
            dominio={dominioData}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            organizacionId={organizacionId}
          />
        )}
      </Modal>

      {/* Modal de confirmación CRUD */}
      <SimpleCRUDConfirmationModal
        isOpen={showCRUDConfirmation}
        onClose={handleCancelCRUD}
        onConfirm={handleConfirmCRUD}
        operation={isEditing ? 'update' : 'create'}
        entityName="dominio"
        entityDisplayName={pendingFormData?.nombre || ''}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default DominioModal;