import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  FileText, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Stepper } from '../stepper/Stepper';
import { StepConfig } from '../stepper/types';
import { 
  StepperSubDominioFormProps, 
  SubDominioFormData, 
  SubDominioFormErrors, 
  ValidationResult,
  FormMode,
  GobernanzaRef,
  StepperSubDominioStep
} from './types';
import Step1ListaSubDominios from './steps/Step1ListaSubDominios';
import Step2FormularioSubDominio from './steps/Step2FormularioSubDominio';
import Step3Governance from './steps/Step3Governance';
import Step4Summary from './steps/Step4Summary';
import styles from './StepperSubDominioForm.module.css';
import { AlertService } from '../alerts';
import { EstadoDominioData } from '../../../models/DominiosData';
import SubDominioDataService, { 
  CreateSubDominioDataRequest, 
  UpdateSubDominioDataRequest 
} from '../../../services/subdominio-data.service';

const StepperSubDominioForm: React.FC<StepperSubDominioFormProps> = ({
  isOpen,
  mode = 'create',
  initialData,
  dominioId,
  organizacionId,
  onClose,
  onSubmit,
  onLoadData,
  isSubmitting = false,
  editingSubDominio = null,
  subDominios = []
}) => {
  const { theme } = useTheme();
  
  // ===== ESTADO DEL FORMULARIO =====
  const [formData, setFormData] = useState<SubDominioFormData>(() => {
    if (editingSubDominio) {
      return {
        subDominioId: (editingSubDominio as any).subDominioId ?? (editingSubDominio as any).id,
        dominioId,
        codigoSubDominio: (editingSubDominio as any).codigoSubDominio || (editingSubDominio as any).codigo || '',
        nombreSubDominio: (editingSubDominio as any).nombreSubDominio || (editingSubDominio as any).nombre || '',
        descripcionSubDominio: (editingSubDominio as any).descripcionSubDominio || (editingSubDominio as any).descripcion || '',
        organizacionId,
        gobernanzaId: (editingSubDominio as any).gobernanzaId,
        tieneGobernanzaPropia: !!(editingSubDominio as any).gobernanzaId,
        estado: (editingSubDominio as any).estado ?? EstadoDominioData.ACTIVO,
        fechaCreacion: (editingSubDominio as any).fechaCreacion,
        fechaActualizacion: (editingSubDominio as any).fechaActualizacion || (editingSubDominio as any).fechaModificacion,
        creadoPor: (editingSubDominio as any).creadoPor,
        actualizadoPor: (editingSubDominio as any).actualizadoPor || (editingSubDominio as any).modificadoPor
      } as SubDominioFormData;
    }
    if (initialData) {
      const i: any = initialData;
      return {
        subDominioId: i.subDominioId,
        dominioId,
        organizacionId,
        codigoSubDominio: i.codigoSubDominio || '',
        nombreSubDominio: i.nombreSubDominio || '',
        descripcionSubDominio: i.descripcionSubDominio || '',
        estado: i.estado ?? EstadoDominioData.ACTIVO,
        gobernanzaId: i.gobernanzaId,
        tieneGobernanzaPropia: !!i.gobernanzaId
      } as SubDominioFormData;
    }
    return {
      dominioId,
      organizacionId,
      codigoSubDominio: '',
      nombreSubDominio: '',
      descripcionSubDominio: '',
      gobernanzaId: undefined,
      tieneGobernanzaPropia: false,
      estado: EstadoDominioData.ACTIVO
    } as SubDominioFormData;
  });

  const [errors, setErrors] = useState<SubDominioFormErrors>({});
  const [currentStep, setCurrentStep] = useState<StepperSubDominioStep>(StepperSubDominioStep.LISTA_SUBDOMINIOS);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);


  const [subDominioService] = useState(() => new SubDominioDataService());

  // ===== GOBERNANZA ORIGINAL PARA VALIDACIONES =====
  const originalGovernanceId = React.useMemo(() => {
    if (mode === 'edit' && editingSubDominio) {
      return (editingSubDominio as any).gobernanzaId;
    }
    return undefined;
  }, [mode, editingSubDominio]);

  // ===== DATOS DE REFERENCIA =====
  const [referenceData, setReferenceData] = useState<{ gobernanzas?: GobernanzaRef[] }>({ gobernanzas: [] });

  // ===== CONFIGURACIÓN DE PASOS =====
  // Siempre mostrar el paso de Gobernanza tanto en create como en edit
  const isEditingSubDominio = !!formData?.subDominioId;
  const hasGovernanceStep = true; // Siempre mostrar el paso de gobierno
  const stepConfigs: StepConfig[] = [
    { id: 'step1', label: 'Lista de Subdominios', icon: Database, description: 'Gestión de subdominios del dominio' },
    { id: 'step2', label: 'Información', icon: FileText, description: 'Datos del subdominio a crear o editar' },
    { id: 'step3', label: 'Gobernanza', icon: Shield, description: 'Configuración de gobierno del subdominio' },
    { id: 'step4', label: 'Resumen', icon: CheckCircle, description: 'Revisión final y confirmación' }
  ];

  // ===== VALIDACIONES POR PASO =====
  const [stepValidations, setStepValidations] = useState({
    step1: true,
    step2: false,
    step3: true,
    overall: false
  });

  // ===== EFECTOS =====
  useEffect(() => {
    if (isOpen) {
      void loadReferenceData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setCurrentStep(StepperSubDominioStep.LISTA_SUBDOMINIOS);
      setLoadError(null);
      if (mode === 'create' && !editingSubDominio) {
        setFormData({
          dominioId,
          organizacionId,
          codigoSubDominio: '',
          nombreSubDominio: '',
          descripcionSubDominio: '',
          gobernanzaId: undefined,
          tieneGobernanzaPropia: false,
          estado: EstadoDominioData.ACTIVO
        } as SubDominioFormData);
      }
    }
  }, [isOpen, mode, editingSubDominio, dominioId, organizacionId]);

  useEffect(() => {
    const val2 = validateStep2(formData);
    const val3 = validateStep3(formData);
    setStepValidations({
      step1: true,
      step2: val2.isValid,
      step3: val3.isValid,
      overall: val2.isValid && val3.isValid
    });
  }, [formData]);

  // ===== FUNCIONES DE VALIDACIÓN =====
  const validateStep2 = (data: SubDominioFormData): ValidationResult => {
    const e: SubDominioFormErrors = {};
    let ok = true;
    if (!data.nombreSubDominio?.trim()) {
      e.nombreSubDominio = 'El nombre es requerido';
      ok = false;
    }
    return { isValid: ok, errors: e } as any;
  };

  const validateStep3 = (_data: SubDominioFormData): ValidationResult => {
    return { isValid: true, errors: {} as any } as any;
  };

  // ===== CARGA DE REFERENCIAS =====
  const loadReferenceData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      let gobernanzas: GobernanzaRef[] | undefined = [];
      if (onLoadData) {
        try {
          const data: any = await onLoadData();
          gobernanzas = data?.gobernanzas || [];
        } catch {
          gobernanzas = [];
        }
      }
      setReferenceData({ gobernanzas: gobernanzas || [] });
    } catch (err) {
      console.error('[Subdominio] Error cargando referencias', err);
      setLoadError('Error al cargar los datos de referencia');
      setReferenceData({ gobernanzas: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // ===== HANDLERS =====
  const handleDataChange = useCallback((newData: Partial<SubDominioFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  const handleErrorChange = useCallback((newErrors: Partial<SubDominioFormErrors>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const handleSubmitForm = async (saveType: 'draft' | 'approval') => {
    if (isSubmittingLocal || isSubmitting) return;
    setIsSubmittingLocal(true);
    
    try {
      // Mapear saveType a valores enteros de estado como en dominios
      const getEstado = (saveType: 'draft' | 'approval'): number => {
        if (saveType === 'draft') return -4;      // Borrador
        if (saveType === 'approval') return -3;   // Enviado a aprobación
        return 1; // Activo por defecto
      };

      const estado = getEstado(saveType);
      const isEditMode = formData.subDominioId !== undefined;
      let result;
      
      if (isEditMode) {
        // Construir payload para actualizar según UpdateSubDominioDataCommand
        const updatePayload: UpdateSubDominioDataRequest = {
          subDominioDataId: formData.subDominioId!,
          dominioDataId: formData.dominioId,
          codigoSubDominio: formData.codigoSubDominio,
          nombreSubDominio: formData.nombreSubDominio,
          descripcionSubDominio: formData.descripcionSubDominio || '',
          tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
          gobernanzaId: formData.gobernanzaId || null,
          estado: estado,
          actualizadoPor: 1 // TODO: Obtener del contexto de usuario
        };
        
        result = await subDominioService.updateSubDominioData(updatePayload);
        
        if (result.success) {
          AlertService.success('Subdominio actualizado exitosamente');
          
          // Actualizar la grilla con el item modificado
          const updatedSubDominio = {
            ...formData,
            subDominioId: formData.subDominioId,
            fechaActualizacion: new Date().toISOString()
          };
          
          // Llamar al callback para actualizar la grilla
          if (onSubmit) {
            await onSubmit(updatedSubDominio, saveType);
          }
        } else {
          throw new Error(result.message || 'Error al actualizar el subdominio');
        }
      } else {
        // Construir payload para crear según CreateSubDominioDataCommand
        const createPayload: CreateSubDominioDataRequest = {
          organizacionId,
          dominioDataId: formData.dominioId,
          codigoSubDominio: formData.codigoSubDominio,
          nombreSubDominio: formData.nombreSubDominio,
          descripcionSubDominio: formData.descripcionSubDominio || '',
          tieneGobernanzaPropia: formData.tieneGobernanzaPropia,
          gobernanzaId: formData.gobernanzaId || null,
          estado: estado,
          creadoPor: 1 // TODO: Obtener del contexto de usuario
        };
        
        result = await subDominioService.createSubDominioData(createPayload);
        
        if (result.success && result.data) {
          AlertService.success('Subdominio creado exitosamente');
          
          // Crear el nuevo item para la grilla
          const newSubDominio = {
            ...formData,
            subDominioId: result.data, // ID retornado por el servicio
            fechaCreacion: new Date().toISOString()
          };
          
          // Llamar al callback para actualizar la grilla
          if (onSubmit) {
            await onSubmit(newSubDominio, saveType);
          }
        } else {
          throw new Error(result.message || 'Error al crear el subdominio');
        }
      }
      
      // Navegar de vuelta al Step 1 en lugar de cerrar el modal
      setCurrentStep(StepperSubDominioStep.LISTA_SUBDOMINIOS);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      AlertService.error(error instanceof Error ? error.message : 'Error al guardar el subdominio');
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handleNewSubDominio = () => {
    setFormData({
      dominioId,
      organizacionId,
      codigoSubDominio: '',
      nombreSubDominio: '',
      descripcionSubDominio: '',
      gobernanzaId: undefined,
      tieneGobernanzaPropia: false,
      estado: EstadoDominioData.ACTIVO
    } as SubDominioFormData);
    setErrors({});
    setCurrentStep(StepperSubDominioStep.FORMULARIO_SUBDOMINIO);
  };

  const handleEditSubDominio = (subdominio: any) => {
    setFormData({
      subDominioId: subdominio.subDominioId ?? subdominio.id,
      dominioId,
      organizacionId,
      codigoSubDominio: subdominio.codigoSubDominio || subdominio.codigo || '',
      nombreSubDominio: subdominio.nombreSubDominio || subdominio.nombre || '',
      descripcionSubDominio: subdominio.descripcionSubDominio || subdominio.descripcion || '',
      gobernanzaId: subdominio.gobernanzaId,
      tieneGobernanzaPropia: !!subdominio.gobernanzaId,
      estado: subdominio.estado ?? EstadoDominioData.ACTIVO,
      fechaCreacion: subdominio.fechaCreacion,
      fechaActualizacion: subdominio.fechaActualizacion || subdominio.fechaModificacion,
      creadoPor: subdominio.creadoPor,
      actualizadoPor: subdominio.actualizadoPor || subdominio.modificadoPor
    } as SubDominioFormData);
    setErrors({});
    setCurrentStep(StepperSubDominioStep.FORMULARIO_SUBDOMINIO);
  };

  // ===== RENDERIZADO DE PASOS =====
  
  const renderCurrentStep = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.loadingIcon} />
          <p>Cargando datos de referencia...</p>
        </div>
      );
    }
    
    if (loadError) {
      return (
        <div className={styles.errorContainer}>
          <AlertCircle className={styles.errorIcon} />
          <p>{loadError}</p>
        </div>
      );
    }
    
    switch (currentStep) {
      case StepperSubDominioStep.LISTA_SUBDOMINIOS:
        return (
          <Step1ListaSubDominios
            formData={formData}
            errors={errors}
            onDataChange={handleDataChange}
            onErrorChange={handleErrorChange}
            subDominios={subDominios}
            onNewSubDominio={handleNewSubDominio}
            onEditSubDominio={handleEditSubDominio}
          />
        );
        
      case StepperSubDominioStep.FORMULARIO_SUBDOMINIO:
        return (
          <Step2FormularioSubDominio
            formData={formData}
            errors={errors}
            onDataChange={handleDataChange}
            onErrorChange={handleErrorChange}
            mode={formData.subDominioId ? FormMode.EDIT : FormMode.CREATE}
          />
        );
        
      case StepperSubDominioStep.GOVERNANCE:
        return (
          <Step3Governance
            formData={formData}
            errors={errors}
            onDataChange={handleDataChange}
            onErrorChange={handleErrorChange}
            gobernanzas={referenceData.gobernanzas || []}
          />
        );
        
      case StepperSubDominioStep.SUMMARY:
        return (
          <Step4Summary
            formData={formData}
            errors={errors}
            onSubmit={handleSubmitForm}
            isSubmitting={isSubmittingLocal || isSubmitting}
            validationResults={stepValidations}
            gobernanzas={referenceData.gobernanzas}
            mode={formData.subDominioId ? FormMode.EDIT : FormMode.CREATE}
            originalGovernanceId={originalGovernanceId}
          />
        );
        
      default:
        return null;
    }
  };
  
  // ===== RENDERIZADO PRINCIPAL =====
  
  console.log('🔧 [STEPPER RENDER] isOpen:', isOpen, 'dominioId:', dominioId, 'organizacionId:', organizacionId);
  
  if (!isOpen) return null;
  
  const stepOrder = hasGovernanceStep
    ? [
        StepperSubDominioStep.LISTA_SUBDOMINIOS,
        StepperSubDominioStep.FORMULARIO_SUBDOMINIO,
        StepperSubDominioStep.GOVERNANCE,
        StepperSubDominioStep.SUMMARY
      ]
    : [
        StepperSubDominioStep.LISTA_SUBDOMINIOS,
        StepperSubDominioStep.FORMULARIO_SUBDOMINIO,
        StepperSubDominioStep.SUMMARY
      ];
  
  const currentStepIndex = stepOrder.indexOf(currentStep);
  
  return (
    <Stepper
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Subdominio' : 'Editar Subdominio'}
      subtitle={`Completa los pasos para ${mode === 'create' ? 'crear' : 'actualizar'} el subdominio`}
      steps={stepConfigs}
      currentStep={currentStepIndex}
      onStepChange={(index) => {
        const order = hasGovernanceStep
          ? [
              StepperSubDominioStep.LISTA_SUBDOMINIOS,
              StepperSubDominioStep.FORMULARIO_SUBDOMINIO,
              StepperSubDominioStep.GOVERNANCE,
              StepperSubDominioStep.SUMMARY
            ]
          : [
              StepperSubDominioStep.LISTA_SUBDOMINIOS,
              StepperSubDominioStep.FORMULARIO_SUBDOMINIO,
              StepperSubDominioStep.SUMMARY
            ];
        setCurrentStep(order[index]);
      }}
      canGoNext={
        !(
          hasGovernanceStep &&
          currentStep === StepperSubDominioStep.GOVERNANCE &&
          typeof (window as any).__step3HasChanges === 'function' &&
          (window as any).__step3HasChanges()
        )
      }
      canGoPrevious={
        !(
          hasGovernanceStep &&
          currentStep === StepperSubDominioStep.GOVERNANCE &&
          typeof (window as any).__step3HasChanges === 'function' &&
          (window as any).__step3HasChanges()
        )
      }
      allowStepClick={false}
      hideNextButton={currentStep === StepperSubDominioStep.LISTA_SUBDOMINIOS}
      onFinish={() => {
        const rawGobId = (formData as any)?.gobernanzaId;
        const hasGovernance = rawGobId !== undefined && rawGobId !== null && Number(rawGobId) > 0;
        // Regla actualizada: tanto en crear como en editar, si hay gobernanza, permitir aprobación
        const canSendForApproval = hasGovernance;
        void handleSubmitForm(canSendForApproval ? 'approval' : 'draft');
      }}
    >
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <span>Cargando datos...</span>
        </div>
      ) : loadError ? (
        <div className={styles.errorContainer}>
          <h3>Error al cargar</h3>
          <p>{loadError}</p>
        </div>
      ) : (
        renderCurrentStep()
      )}
    </Stepper>
  );
};

export default StepperSubDominioForm;