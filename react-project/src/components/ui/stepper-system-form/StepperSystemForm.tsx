import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Network, 
  Package,
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Stepper } from '../stepper/Stepper';
import { StepConfig } from '../stepper/types';
import { 
  StepperSystemFormProps, 
  SystemFormData, 
  SystemFormErrors, 
  ValidationResult,
  FormMode,
  TipoSistema,
  FamiliaSistema,
  Sistema,
  Servidor,
  GobernanzaRef
} from './types';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2HierarchyServers from './steps/Step2HierarchyServers';
import Step3Modules from './steps/Step3Modules';
import Step4Governance from './steps/Step4Governance';
import Step5Summary from './steps/Step5Summary';
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
import styles from './StepperSystemForm.module.css';
import { AlertService } from '../alerts';
import { EstadoSistema } from '../../../models/Sistemas';

const StepperSystemForm: React.FC<StepperSystemFormProps> = ({
  isOpen,
  mode = 'create',
  initialData,
  onClose,
  onSubmit,
  onLoadData,
  isSubmitting = false
}) => {
  const { theme } = useTheme();
  
  // ===== ESTADO DEL FORMULARIO =====
  const [formData, setFormData] = useState<SystemFormData>(() => 
    initialData || initializeFormData()
  );
  const [errors, setErrors] = useState<SystemFormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // ===== DATOS DE REFERENCIA =====
  const [referenceData, setReferenceData] = useState<{
    tiposSistema: TipoSistema[];
    familiasSistema?: FamiliaSistema[];
    sistemas: Sistema[];
    servidores: Servidor[];
    gobernanzas?: GobernanzaRef[];
  }>({ 
    tiposSistema: [], 
    familiasSistema: [],
    sistemas: [], 
    servidores: [], 
    gobernanzas: [] 
  });
  
  // ===== CONFIGURACIÓN DE PASOS =====
  const stepConfigs: StepConfig[] = [
    {
      id: 'step1',
      label: 'Información Básica',
      icon: FileText,
      description: 'Datos generales del sistema y descripción funcional'
    },
    {
      id: 'step2',
      label: 'Jerarquía y Servidores',
      icon: Network,
      description: 'Dependencias del sistema y asignación de servidores'
    },
    {
      id: 'step3',
      label: 'Módulos',
      icon: Package,
      description: 'Gestión de módulos que componen el sistema'
    },
    {
      id: 'step4',
      label: 'Gobierno',
      icon: Shield,
      description: 'Configuración de gobierno del sistema'
    },
    {
      id: 'step5',
      label: 'Resumen',
      icon: CheckCircle,
      description: 'Revisión final y confirmación'
    }
  ];
  
  // ===== VALIDACIONES POR PASO =====
  const [stepValidations, setStepValidations] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    overall: false
  });
  
  // ===== EFECTOS =====
  
  // Cargar datos de referencia al abrir
  useEffect(() => {
    if (isOpen && onLoadData) {
      loadReferenceData();
    }
  }, [isOpen]);
  
  // Actualizar datos iniciales cuando cambian
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(initializeFormData());
    }
  }, [initialData]);
  
  // Validar pasos cuando cambian los datos
  useEffect(() => {
    const validations = validateAllSteps(formData);
    const next = {
      step1: validations.step1.isValid,
      step2: validations.step2.isValid,
      step3: validations.step3.isValid,
      step4: validations.step4.isValid,
      overall: validations.overall
    };
    setStepValidations(prev => (
      prev.step1 !== next.step1 ||
      prev.step2 !== next.step2 ||
      prev.step3 !== next.step3 ||
      prev.step4 !== next.step4 ||
      prev.overall !== next.overall
    ) ? next : prev);
  }, [formData]);
  
  // ===== FUNCIONES =====
  
  const loadReferenceData = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const data = await onLoadData!();
      setReferenceData({
        tiposSistema: data.tiposSistema || [],
        familiasSistema: data.familiasSistema || [],
        sistemas: data.sistemas || [],
        servidores: data.servidores || [],
        gobernanzas: data.gobernanzas || []
      });
    } catch (error) {
      console.error('Error loading reference data:', error);
      setLoadError('Error al cargar los datos de referencia');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDataChange = useCallback((newData: Partial<SystemFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);
  
  const handleErrorChange = useCallback((newErrors: Partial<SystemFormErrors>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);
  
  const handleNext = useCallback(() => {
    // Bloquear si estamos en Step 4 con cambios sin guardar
    const hasStep4Changes = typeof (window as any).__step4HasChanges === 'function' && (window as any).__step4HasChanges();
    if (currentStep === 4 && hasStep4Changes) {
      AlertService.warning('Tienes cambios sin guardar en Gobernanza. Debes guardar antes de navegar.');
      return;
    }

    if (currentStep < stepConfigs.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, stepConfigs.length]);
  
  const handlePrevious = useCallback(() => {
    // Bloquear si estamos en Step 4 con cambios sin guardar
    const hasStep4Changes = typeof (window as any).__step4HasChanges === 'function' && (window as any).__step4HasChanges();
    if (currentStep === 4 && hasStep4Changes) {
      AlertService.warning('Tienes cambios sin guardar en Gobernanza. Debes guardar antes de navegar.');
      return;
    }

    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);
  
  const handleStepClick = useCallback((stepIndex: number) => {
    const targetStep = stepIndex + 1;

    // Si intentamos salir del Step 4 con cambios sin guardar, bloquear
    const hasStep4Changes = typeof (window as any).__step4HasChanges === 'function' && (window as any).__step4HasChanges();
    if (currentStep === 4 && targetStep !== 4 && hasStep4Changes) {
      AlertService.warning('Tienes cambios sin guardar en Gobernanza. Debes guardar antes de navegar.');
      return;
    }

    setCurrentStep(targetStep);
  }, [currentStep]);

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
  
  // ===== Baseline de servidores en modo edición =====
  // Se usa para calcular servidoresToInsert/servidoresToDelete correctamente.
  // Preferimos initialData.servidorIds si viene cargado; de lo contrario,
  // tomamos el primer set no vacío que hidrata Step 2 desde el backend.
  const originalServidorIdsRef = React.useRef<Set<number> | null>(null);

  // Inicializar baseline desde initialData si está disponible
  useEffect(() => {
    if (mode !== 'edit') return;
    if (originalServidorIdsRef.current) return;
    const init = initialData?.servidorIds;
    if (Array.isArray(init) && init.length > 0) {
      originalServidorIdsRef.current = new Set<number>(init as number[]);
    }
  }, [mode, initialData]);

  // Si no hubo initialData, capturar la primera hidratación de Step 2
  useEffect(() => {
    if (mode !== 'edit') return;
    if (originalServidorIdsRef.current) return;
    const curr = formData?.servidorIds;
    if (Array.isArray(curr) && curr.length > 0) {
      originalServidorIdsRef.current = new Set<number>(curr as number[]);
    }
  }, [mode, formData?.servidorIds]);
  
  const handleSubmit = useCallback(async (saveType: 'draft' | 'approval') => {
    // Para borrador, no necesitamos validación completa
    if (saveType === 'approval' && !stepValidations.overall) {
      return;
    }
    
    try {
      // Estado según tipo de guardado
      const estado = saveType === 'draft' ? EstadoSistema.Borrador : EstadoSistema.IniciarFlujo;
      const organizacionId = resolveOrganizationId() ?? 1;

      // Base común para CREATE/UPDATE (modelo local Sistema)
      const baseSistema: any = {
        organizacionId,
        codigoSistema: formData.codigoSistema?.trim().toUpperCase(),
        nombreSistema: formData.nombreSistema?.trim(),
        funcionPrincipal: formData.funcionPrincipal?.trim(),
        sistemaDepende: formData.sistemaDepende ?? null,
        tipoSistema: formData.tipoSistema,
        familiaSistema: formData.familiaSistema,
        tieneGobernanzaPropia: !!formData.tieneGobernanzaPropia,
        // Importante: incluir SIEMPRE la llave gobernanzaId en el payload sin condicionar por tieneGobernanzaPropia.
        gobernanzaId: formData.gobernanzaId ?? null,
        estado,
        servidorIds: Array.isArray(formData.servidorIds) ? formData.servidorIds : [],
      };

      let systemData: any;
      if (mode === 'create') {
        // Incluir módulos SOLO en creación
        const modulos = (formData.modulos || []).map(m => ({
          nombreModulo: m.nombre,
          funcionModulo: m.descripcion || '',
          estado: m.activo ? 1 : 0,
        }));
        systemData = { ...baseSistema, modulos };
      } else {
        // UPDATE: calcular diferencias de servidores y NO enviar módulos
        const prevServidorIds = (originalServidorIdsRef.current ?? new Set<number>((initialData?.servidorIds || []) as number[]));
        const currServidorIds = new Set<number>((formData.servidorIds || []) as number[]);
        const servidoresToInsert = Array.from(currServidorIds).filter(id => !prevServidorIds.has(id as number));
        const servidoresToDelete = Array.from(prevServidorIds).filter(id => !currServidorIds.has(id as number));

        systemData = {
          ...baseSistema,
          sistemaId: formData.id,
          servidoresToInsert,
          servidoresToDelete,
        };
      }

      // Enviar al contenedor (Sistemas.tsx) con saveType para mensajes/flujo
      await onSubmit({ ...systemData, saveType } as any);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }, [formData, stepValidations.overall, onSubmit, mode, initialData]);
  
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
            tiposSistema={referenceData.tiposSistema}
            familiasSistema={referenceData.familiasSistema}
          />
        );
      
      case 2:
        return (
          <Step2HierarchyServers
            {...commonProps}
            sistemas={referenceData.sistemas}
            servidores={referenceData.servidores}
          />
        );
      
      case 3:
        return (
          <Step3Modules
            {...commonProps}
          />
        );
      
      case 4:
        return (
          <Step4Governance
            {...commonProps}
            gobernanzas={referenceData.gobernanzas}
          />
        );
      
      case 5:
        return (
          <Step5Summary
            {...commonProps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            validationResults={stepValidations}
            tiposSistema={referenceData.tiposSistema}
            familiasSistema={referenceData.familiasSistema}
            sistemas={referenceData.sistemas}
            servidores={referenceData.servidores}
            gobernanzas={referenceData.gobernanzas}
            mode={mode}
            originalGovernanceId={initialData?.gobernanzaId}
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
      title={mode === 'create' ? 'Nuevo Sistema' : 'Editar Sistema'}
      subtitle={`Completa los pasos para ${mode === 'create' ? 'crear' : 'actualizar'} el sistema`}
      steps={stepConfigs}
      currentStep={currentStep - 1}
      onStepChange={(index) => setCurrentStep(index + 1)}
      canGoNext={
        currentStep < stepConfigs.length && !(
          currentStep === 4 && typeof (window as any).__step4HasChanges === 'function' && (window as any).__step4HasChanges()
        )
      }
      canGoPrevious={
        currentStep > 1 && !(
          currentStep === 4 && typeof (window as any).__step4HasChanges === 'function' && (window as any).__step4HasChanges()
        )
      }
      allowStepClick={false}
      className="stepper"
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

export default StepperSystemForm;