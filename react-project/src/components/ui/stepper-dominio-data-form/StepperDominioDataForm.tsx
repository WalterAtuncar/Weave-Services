import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Database, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Stepper } from '../stepper/Stepper';
import { StepConfig } from '../stepper/types';
import { 
  StepperDominioDataFormProps, 
  DominioDataFormData, 
  DominioDataFormErrors, 
  ValidationResult,
  FormMode,
  TipoDominioData,
  SubDominioDataDto,
  GobernanzaRef
} from './types';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2SubDominios from './steps/Step2SubDominios';
import Step3Governance from './steps/Step3Governance';
import Step4Summary from './steps/Step4Summary';
import { 
  validateStep1, 
  validateStep2, 
  validateStep3, 
  validateAllSteps,
  isStepComplete 
} from './utils/validations';
import { 
  initializeFormData, 
  transformFormDataForSubmission,
  transformBackendDataToFormData 
} from './utils/dataHelpers';
import { ensureFormDataStructure } from './transformationHelper';
import styles from './StepperDominioDataForm.module.css';
import { AlertService } from '../alerts';
import { EstadoDominioData } from '../../../models/DominiosData';
import { DominiosDataService } from '../../../services/dominios-data.service';

// Crear instancia del servicio
const dominiosDataService = new DominiosDataService();

const StepperDominioDataForm: React.FC<StepperDominioDataFormProps> = ({
  isOpen,
  mode = 'create',
  initialData,
  organizacionId,
  onClose,
  onSubmit,
  onLoadData,
  isSubmitting = false,
  editingDominio = null
}) => {
  const { theme } = useTheme();
  
  // ===== ESTADO DEL FORMULARIO =====
  const [formData, setFormData] = useState<DominioDataFormData>(() => {
    console.log('🚀 [STEPPER INIT] Inicializando formData:', {
      editingDominio,
      initialData,
      organizacionId,
      mode
    });
    
    if (editingDominio) {
      console.log('🔄 [STEPPER INIT] Transformando editingDominio con ensureFormDataStructure');
      // Usar el helper de transformación para mapear correctamente las propiedades
      const transformed = ensureFormDataStructure(editingDominio, organizacionId);
      console.log('✅ [STEPPER INIT] Datos transformados:', transformed);
      return transformed;
    }
    
    const fallback = initialData || initializeFormData();
    console.log('📝 [STEPPER INIT] Usando datos por defecto:', fallback);
    return fallback;
  });
  const [errors, setErrors] = useState<DominioDataFormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  
  // ===== GOBERNANZA ORIGINAL PARA VALIDACIONES =====
  const originalGovernanceId = React.useMemo(() => {
    if (mode === FormMode.EDIT && editingDominio) {
      return editingDominio.gobernanzaId;
    }
    return undefined;
  }, [mode, editingDominio]);
  
  // ===== DATOS DE REFERENCIA =====
  const [referenceData, setReferenceData] = useState<{
    tiposDominio: TipoDominioData[];
    gobernanzas?: GobernanzaRef[];
  }>({ 
    tiposDominio: [], 
    gobernanzas: [] 
  });

  // Helper: intentar deducir tipoDominioId desde el objeto de edición cuando no viene numérico
  const tryResolveTipoDominioId = React.useCallback((editing: any, tipos: TipoDominioData[]): number | null => {
    if (!editing || !Array.isArray(tipos) || tipos.length === 0) return null;

    const rawId: any = editing?.tipoDominioId ?? editing?.tipoId ?? editing?.tipo?.id ?? editing?.tipo?.tipoDominioId;
    if (typeof rawId === 'number' && rawId > 0) return rawId;
    if (typeof rawId === 'string' && rawId.trim() !== '' && !isNaN(Number(rawId))) {
      const parsed = Number(rawId);
      if (parsed > 0) return parsed;
    }

    const byCode: string | undefined = editing?.tipoDominioCodigo || editing?.codigoTipoDominio || editing?.tipoCodigo || editing?.codigoTipo;
    const byName: string | undefined = editing?.tipoDominioNombre || editing?.tipoNombre || editing?.tipo || editing?.nombreTipoDominio;

    // match por código (case-insensitive)
    if (byCode) {
      const codeNorm = String(byCode).trim().toLowerCase();
      const found = tipos.find(t => t.codigo?.toLowerCase() === codeNorm);
      if (found) return found.tipoDominioId;
    }

    // match por nombre (case-insensitive)
    if (byName) {
      const nameNorm = String(byName).trim().toLowerCase();
      const found = tipos.find(t => t.nombre?.toLowerCase() === nameNorm);
      if (found) return found.tipoDominioId;
    }

    return null;
  }, []);

  // Cuando los tipos de dominio estén listos y estemos editando, si tipoDominioId aún no está seteado (>0), tratar de resolverlo y setearlo
  useEffect(() => {
    if (!editingDominio) return;
    if (!referenceData.tiposDominio || referenceData.tiposDominio.length === 0) return;

    const current = formData?.tipoDominioId;
    if (typeof current === 'number' && current > 0) return; // ya está seteado

    const resolved = tryResolveTipoDominioId(editingDominio, referenceData.tiposDominio);
    if (resolved && resolved > 0) {
      console.log('[Stepper] Resuelto tipoDominioId desde datos legacy:', { resolved });
      setFormData(prev => ({ ...prev, tipoDominioId: resolved }));
    }
  }, [editingDominio, referenceData.tiposDominio, tryResolveTipoDominioId]);
  
  // ===== CONFIGURACIÓN DE PASOS =====
  // Siempre mostrar el paso de Gobierno tanto en create como en edit
  const hasGovernanceStep = true;
  const stepConfigs: StepConfig[] = [
    { id: 'step1', label: 'Información Básica', icon: FileText, description: 'Datos generales del dominio de datos' },
    { id: 'step2', label: 'Sub Dominios', icon: Database, description: 'Gestión de subdominios del dominio principal' },
    { id: 'step3', label: 'Gobierno', icon: Shield, description: 'Configuración de gobierno del dominio' },
    { id: 'step4', label: 'Resumen', icon: CheckCircle, description: 'Revisión final y confirmación' }
  ];
  
  // ===== VALIDACIONES POR PASO =====
  const [stepValidations, setStepValidations] = useState({
    step1: false,
    step2: false,
    step3: false,
    overall: false
  });
  
  // ===== EFECTOS =====
  
  // Cargar datos de referencia al abrir
  useEffect(() => {
    if (isOpen) {
      loadReferenceData();
    }
  }, [isOpen]);
  
  // Actualizar datos iniciales cuando cambian
  useEffect(() => {
    console.log('🧭 [STEPPER EFFECT] initialData effect disparado:', { hasInitialData: !!initialData, hasEditing: !!editingDominio });
    if (initialData) {
      console.log('🧭 [STEPPER EFFECT] Aplicando initialData al formData');
      setFormData(initialData);
    } else if (!editingDominio) {
      console.log('🧭 [STEPPER EFFECT] Sin initialData y sin editingDominio, inicializando por defecto');
      setFormData(initializeFormData());
    } else {
      console.log('🧭 [STEPPER EFFECT] Se omite inicialización por defecto porque existe editingDominio');
    }
  }, [initialData, editingDominio]);

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 [STEPPER RESET] Modal abierto, reseteando estado:', {
        mode,
        editingDominio: !!editingDominio,
        organizacionId
      });
      
      // Resetear errores y step
      setErrors({});
      setCurrentStep(1);
      setLoadError(null);
      
      // Si es modo create y no hay editingDominio, inicializar formulario limpio
      if (mode === 'create' && !editingDominio) {
        console.log('🆕 [STEPPER RESET] Modo create - inicializando formulario limpio');
        setFormData(initializeFormData());
      }
    }
  }, [isOpen, mode, editingDominio]);

  // Actualizar formData cuando cambia editingDominio
  useEffect(() => {
    console.log('🔄 [STEPPER EFFECT] editingDominio cambió:', {
      editingDominio,
      organizacionId,
      hasEditingDominio: !!editingDominio,
      hasInitialData: !!initialData
    });
    
    if (editingDominio) {
      console.log('🔄 [STEPPER EFFECT] Procesando editingDominio:', editingDominio);
      console.log('🔍 [STEPPER EFFECT] gobernanzaId en editingDominio:', editingDominio.gobernanzaId, typeof editingDominio.gobernanzaId);
      const transformedData = ensureFormDataStructure(editingDominio, organizacionId);
      console.log('✅ [STEPPER EFFECT] Datos transformados para setFormData:', transformedData);
      console.log('🔍 [STEPPER EFFECT] gobernanzaId en datos transformados:', transformedData.gobernanzaId, typeof transformedData.gobernanzaId);
      setFormData(transformedData);
      setCurrentStep(1); // Resetear al primer paso
      console.log('📍 [STEPPER EFFECT] FormData actualizado y step reseteado a 1');
    } else if (!initialData) {
      console.log('📝 [STEPPER EFFECT] No hay editingDominio ni initialData, inicializando por defecto');
      setFormData(initializeFormData());
      setCurrentStep(1);
    }
  }, [editingDominio, organizacionId]);
  
  // Validar pasos cuando cambian los datos
  useEffect(() => {
    const validations = validateAllSteps(formData, { mode, hasGovernanceStep });
    setStepValidations({
      step1: validations.step1,
      step2: validations.step2,
      step3: validations.step3,
      overall: validations.overall
    });
  }, [formData, mode, hasGovernanceStep]);
  
  // ===== FUNCIONES =====
  
  const loadReferenceData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // 1) Obtener gobernanzas si el contenedor las provee
      let gobernanzas: GobernanzaRef[] | undefined = [];
      if (onLoadData) {
        try {
          const data: any = await onLoadData();
          gobernanzas = data?.gobernanzas || [];
        } catch (err) {
          console.warn('[Stepper] onLoadData falló o no devolvió gobernanzas, se continúa con tiposDominio');
        }
      }

      // 2) Obtener tipos de dominio desde el servicio (igual que FormDominioData)
      const service = new DominiosDataService();
      const response = await service.getTiposDominio();

      let tiposDominioMapped: TipoDominioData[] = [];
      if (response?.success && Array.isArray(response.data)) {
        tiposDominioMapped = response.data.map((t: any) => ({
          tipoDominioId: t?.tipoDominioId ?? t?.id ?? 0,
          codigo: t?.tipoDominioCodigo ?? t?.codigo ?? '',
          nombre: t?.tipoDominioNombre ?? t?.nombre ?? '',
          descripcion: t?.tipoDominioDescripcion ?? t?.descripcion ?? ''
        }));
      } else {
        throw new Error('Respuesta inválida al obtener tipos de dominio');
      }

      setReferenceData({
        tiposDominio: tiposDominioMapped,
        gobernanzas: gobernanzas || []
      });
    } catch (error) {
      console.error('Error loading reference data:', error);
      setLoadError('Error al cargar los datos de referencia');
      setReferenceData({ tiposDominio: [], gobernanzas: [] });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDataChange = useCallback((newData: Partial<DominioDataFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);
  
  const handleErrorChange = useCallback((newErrors: Partial<DominioDataFormErrors>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);
  
  const handleNext = useCallback(() => {
    // Bloquear si estamos en Gobernanza con cambios sin guardar (solo si existe ese paso)
    const hasStep3Changes = typeof (window as any).__step3HasChanges === 'function' && (window as any).__step3HasChanges();
    if (hasGovernanceStep && currentStep === 3 && hasStep3Changes) {
      AlertService.warning('Tienes cambios sin guardar en Gobernanza. Debes guardar antes de navegar.');
      return;
    }

    if (currentStep < stepConfigs.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, stepConfigs.length, hasGovernanceStep]);
  
  const handlePrevious = useCallback(() => {
    // Bloquear si estamos en Gobernanza con cambios sin guardar (solo si existe ese paso)
    const hasStep3Changes = typeof (window as any).__step3HasChanges === 'function' && (window as any).__step3HasChanges();
    if (hasGovernanceStep && currentStep === 3 && hasStep3Changes) {
      AlertService.warning('Tienes cambios sin guardar en Gobernanza. Debes guardar antes de navegar.');
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, hasGovernanceStep]);
  
  const handleStepClick = useCallback((stepIndex: number) => {
    const targetStep = stepIndex + 1;

    // Si intentamos salir de Gobernanza con cambios sin guardar, bloquear (solo si existe ese paso)
    const hasStep3Changes = typeof (window as any).__step3HasChanges === 'function' && (window as any).__step3HasChanges();
    if (hasGovernanceStep && currentStep === 3 && targetStep !== 3 && hasStep3Changes) {
      AlertService.warning('Tienes cambios sin guardar en Gobernanza. Debes guardar antes de navegar.');
      return;
    }

    setCurrentStep(targetStep);
  }, [currentStep, hasGovernanceStep]);

  // Helper para obtener organizacionId desde localStorage (fallback)
  const resolveOrganizationId = (): number | null => {
    try {
      const raw = localStorage.getItem('userSession');
      if (!raw) return null;
      const session = JSON.parse(raw);
      const orgId = session?.organizacion?.organizacionId;
      if (typeof orgId === 'number') return orgId;
      if (typeof orgId === 'string') {
        const parsed = Number(orgId);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    } catch {
      return null;
    }
  };
  
  // ===== Baseline de subdominios en modo edición =====
  const originalSubDominiosRef = React.useRef<SubDominioDataDto[] | null>(null);

  // Inicializar baseline desde initialData si está disponible
  useEffect(() => {
    if (mode !== 'edit') return;
    if (originalSubDominiosRef.current) return;
    const init = initialData?.subDominios;
    if (Array.isArray(init) && init.length > 0) {
      originalSubDominiosRef.current = [...init];
    }
  }, [mode, initialData]);

  // Si no hubo initialData, capturar la primera hidratación de Step 2
  useEffect(() => {
    if (mode !== 'edit') return;
    if (originalSubDominiosRef.current) return;
    const curr = formData?.subDominios;
    if (Array.isArray(curr) && curr.length > 0) {
      originalSubDominiosRef.current = [...curr];
    }
  }, [mode, formData?.subDominios]);
  
  const handleSubmit = useCallback(async (saveType: 'draft' | 'approval') => {
    // Para borrador, no necesitamos validación completa
    if (saveType === 'approval' && !stepValidations.overall) {
      return;
    }
    
    try {
      setIsSubmittingLocal(true);
      
      // Obtener organizacionId desde localStorage si no está disponible en props
      let finalOrganizacionId = organizacionId;
      if (!finalOrganizacionId) {
        const localStorageOrgId = resolveOrganizationId();
        if (localStorageOrgId) {
          finalOrganizacionId = localStorageOrgId;
        } else {
          console.error('No se pudo obtener organizacionId ni desde props ni desde localStorage');
          AlertService.error('Error: No se pudo determinar la organización');
          return;
        }
      }
      
      // Crear una copia del formData con el organizacionId correcto
      const formDataWithOrgId = {
        ...formData,
        organizacionId: finalOrganizacionId
      };
      
      const payload = transformFormDataForSubmission(formDataWithOrgId, saveType);
      
      console.log('🚀 [SUBMIT] Payload completo:', payload);
      
      // Determinar si es creación o actualización basado en el modo
      if (mode === 'edit' && editingDominio) {
        // Modo edición: usar directamente el payload transformado que ya tiene la estructura correcta
        const response = await dominiosDataService.updateDominioData(payload);
        
        if (response.success) {
          console.log('Dominio actualizado exitosamente:', response.data);
          // Llamar al callback original para notificar al componente padre
          await onSubmit(payload as any, saveType);
        } else {
          console.error('Error al actualizar dominio:', response.message);
          throw new Error(response.message || 'Error al actualizar el dominio');
        }
      } else {
        // Modo creación: usar directamente el payload transformado que ya tiene la estructura correcta
        const response = await dominiosDataService.createDominioData(payload);
        
        if (response.success) {
          console.log('Dominio creado exitosamente:', response.data);
          // Llamar al callback original para notificar al componente padre
          await onSubmit(payload as any, saveType);
        } else {
          console.error('Error al crear dominio:', response.message);
          throw new Error(response.message || 'Error al crear el dominio');
        }
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
      // Por ejemplo, usando un toast o un estado de error
    } finally {
      setIsSubmittingLocal(false);
    }
  }, [formData, stepValidations.overall, onSubmit, mode, initialData, editingDominio]);
  
  const renderStepContent = () => {
    const commonProps = {
      formData,
      errors,
      onDataChange: handleDataChange,
      onErrorChange: handleErrorChange
    } as any;
    
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            {...commonProps}
            tiposDominio={referenceData.tiposDominio}
          />
        );
      
      case 2:
        return (
          <Step2SubDominios
            {...commonProps}
          />
        );
      
      case 3:
        if (hasGovernanceStep) {
          return (
            <Step3Governance
              {...commonProps}
              gobernanzas={referenceData.gobernanzas}
            />
          );
        }
        // En modo crear sin paso de gobernanza, el paso 3 corresponde al Resumen
        return (
          <Step4Summary
            {...commonProps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmittingLocal}
            validationResults={stepValidations}
            tiposDominio={referenceData.tiposDominio}
            gobernanzas={referenceData.gobernanzas}
            mode={mode}
            originalGovernanceId={originalGovernanceId}
          />
        );
      
      case 4:
        return (
          <Step4Summary
            {...commonProps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmittingLocal}
            validationResults={stepValidations}
            tiposDominio={referenceData.tiposDominio}
            gobernanzas={referenceData.gobernanzas}
            mode={mode}
            originalGovernanceId={originalGovernanceId}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Stepper
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo Dominio de Datos' : 'Editar Dominio de Datos'}
      subtitle={`Completa los pasos para ${mode === 'create' ? 'crear' : 'actualizar'} el dominio de datos`}
      steps={stepConfigs}
      currentStep={currentStep - 1}
      onStepChange={(index) => setCurrentStep(index + 1)}
      canGoNext={(() => {
        const isLast = currentStep === stepConfigs.length;
        const governanceBlocked = (
          hasGovernanceStep &&
          currentStep === 3 &&
          typeof (window as any).__step3HasChanges === 'function' &&
          (window as any).__step3HasChanges()
        );
        if (governanceBlocked) return false;
        if (isLast) return true;
        switch (currentStep) {
          case 1:
            return stepValidations.step1;
          case 2:
            return stepValidations.step2;
          case 3:
            return hasGovernanceStep ? stepValidations.step3 : true;
          default:
            return true;
        }
      })()}
      canGoPrevious={
        currentStep > 1 && !(
          hasGovernanceStep && currentStep === 3 && typeof (window as any).__step3HasChanges === 'function' && (window as any).__step3HasChanges()
        )
      }
      allowStepClick={false}
      className="stepper"
      onFinish={() => {
        // Asegurar que al presionar "Finalizar" se envíe con el estado correcto
        const rawGobId = (formData as any)?.gobernanzaId;
        const hasGovernance = rawGobId !== undefined && rawGobId !== null && Number(rawGobId) > 0;
        // Regla actualizada: tanto en crear como en editar, si hay gobernanza, permitir aprobación
        const canSendForApproval = hasGovernance;
        // No marcamos la función como async para cumplir con la firma onFinish: () => void
        void handleSubmit(canSendForApproval ? 'approval' : 'draft');
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
        renderStepContent()
      )}
    </Stepper>
  );
};

export default StepperDominioDataForm;