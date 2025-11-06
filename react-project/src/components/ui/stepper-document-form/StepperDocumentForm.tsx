import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Upload,
  Edit3,
  Settings, 
  CheckCircle,
  ListChecks,
  FolderTree
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Stepper } from '../stepper/Stepper';
import { StepConfig } from '../stepper/types';
import { 
  StepperDocumentFormProps, 
  DocumentFormData, 
  DocumentFormErrors, 
  ValidationResult,
  FormMode,
  TipoDocumento,
  Proceso,
  CarpetaRef
} from './types';
import Step1SubirArchivo from './steps/Step1SubirArchivo';
import Step2DatosDocumento from './steps/Step2DatosDocumento';
import Step3Gobierno from './steps/Step3Gobierno';
import Step4AsignarEntidades from './steps/Step4AsignarEntidades';
import Step5Governance from './steps/Step5Governance';
// import { LexicalEditor } from '../text-editor'; // Editor se mantiene en el proyecto, pero no se usa en Step 3
import { Button } from '../button';
import { DocumentProcessorService } from '../../../services/vectorization';
import Step4Resumen from './steps/Step4Resumen';
// Step6Carpetas eliminado: la selección de carpeta se mueve al Step 1
import { 
  validateStep1, 
  validateStep2, 
  validateStep3, 
  validateAllSteps,
  isStepComplete 
} from './utils/validations';
import { 
  initializeFormData, 
  transformFormDataForSubmission
} from './utils/dataHelpers';
import styles from '../stepper-system-form/StepperSystemForm.module.css';
import { AlertService } from '../alerts';
import { DocumentViewer } from '../document-viewer';
import SimpleDocumentInlineViewer from '../document-viewer/SimpleDocumentInlineViewer';

const StepperDocumentForm: React.FC<StepperDocumentFormProps> = ({
  isOpen,
  inline = false,
  mode = 'create',
  initialData,
  onClose,
  onSubmit,
  onLoadData,
  isSubmitting = false,
  onFormDataChange
}) => {
  const { theme } = useTheme();
  
  // ===== ESTADO DEL FORMULARIO =====
  const [formData, setFormData] = useState<DocumentFormData>(() => 
    initialData || initializeFormData()
  );
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // ===== DATOS DE REFERENCIA =====
  const [referenceData, setReferenceData] = useState<{ 
    tiposDocumento: TipoDocumento[]; 
    procesos: Proceso[]; 
    carpetas?: CarpetaRef[];
  }>({ 
    tiposDocumento: [], 
    procesos: [],
    carpetas: []
  });

  // ===== CONFIGURACIÓN DE PASOS =====
  const stepConfigs: StepConfig[] = [
    {
      id: 'step1',
      label: 'Subir Archivo',
      icon: Upload,
      description: 'Carga del archivo PDF del documento'
    },
    {
      id: 'step2',
      label: 'Datos del Documento',
      icon: FileText,
      description: 'Información básica del documento'
    },
    {
      id: 'step3',
      label: 'Visor',
      icon: Edit3,
      description: 'Visualiza el archivo original (PDF o DOCX)'
    },
    {
      id: 'step4',
      label: 'Asignar entidades',
      icon: ListChecks,
      description: 'Relaciona el documento con una o varias entidades'
    },
    {
      id: 'step5',
      label: 'Gobierno',
      icon: Settings,
      description: 'Configuración de gobierno del documento'
    },
    {
      id: 'step6',
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
    setStepValidations({
      step1: validations.step1.isValid,
      step2: validations.step2.isValid,
      step3: validations.step3.isValid,
      overall: validations.overall
    });
    // Notificar cambios al padre para sincronizar panel de detalles
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData]);

  // ===== FUNCIONES =====
  
  const loadReferenceData = async () => {
    if (!onLoadData) return;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await onLoadData();
      setReferenceData(data);
    } catch (error) {
      console.error('Error loading reference data:', error);
      setLoadError('Error al cargar los datos de referencia');
      AlertService.error('Error al cargar los datos necesarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = useCallback((newData: Partial<DocumentFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    
    // Limpiar errores relacionados cuando se actualiza el campo
    const updatedErrors = { ...errors };
    Object.keys(newData).forEach(key => {
      if (key in updatedErrors) {
        delete updatedErrors[key as keyof DocumentFormErrors];
      }
    });
    setErrors(updatedErrors);
  }, [errors]);

  const handleErrorChange = useCallback((newErrors: Partial<DocumentFormErrors>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < stepConfigs.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, stepConfigs.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async (saveType: 'draft' | 'approval') => {
    console.log('[Stepper Documentos] Botón Finalizar presionado. Verificando validación...', { saveType });
    console.log('[Stepper Documentos] Estado de validaciones:', stepValidations);

    const documentData = await transformFormDataForSubmission(formData, saveType);
    console.log('[Stepper Documentos] Preview de payload (siempre):', documentData);
    console.log('[Stepper Documentos] Vista previa Mongo (snake_case):', documentData?.documentoVectorialMongo);

    if (saveType === 'approval' && !stepValidations.overall) {
      console.log('[Stepper Documentos] Envío bloqueado: formulario inválido para aprobación.');
      AlertService.warning('El formulario está incompleto o tiene errores. Completa todos los pasos para enviar a aprobación.');
      return;
    }

    try {
      console.log('[Stepper Documentos] Payload completo a enviar:', documentData);
      console.log('[Stepper Documentos] SQL Server payload (documentoDb):', documentData?.documentoDb);
      console.log('[Stepper Documentos] Mongo payload (documentoVectorialDto):', documentData?.documentoVectorialDto);
      await onSubmit(documentData, saveType);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }, [formData, stepValidations, onSubmit]);

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
          <Step1SubirArchivo
            {...commonProps}
            carpetas={referenceData.carpetas}
          />
        );
      
      case 2:
        return (
          <Step2DatosDocumento
            {...commonProps}
            tiposDocumento={referenceData.tiposDocumento}
          />
        );
      
      case 3:
        {
          const insecure = typeof window !== 'undefined' && !window.isSecureContext;
          const fileForView = formData.archivoVisualizacion || formData.archivo || undefined;
          return (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h3>Visor del Documento</h3>
                <p>Vista sin edición. Puedes descargar el archivo en su formato original.</p>
              </div>
              <div className={styles.stepBody}>
                {insecure ? (
                  // En contexto HTTP, usar visor simple basado en iframe/img (compatible con cualquier origen)
                  <SimpleDocumentInlineViewer file={fileForView} />
                ) : (
                  // En contexto seguro, usar el visor avanzado con PDF.js/Docx
                  <DocumentViewer 
                    file={formData.archivoVisualizacion || undefined}
                    originalFile={formData.archivo || undefined}
                  />
                )}
              </div>
            </div>
          );
        }
      
      case 4:
        return (
          <Step4AsignarEntidades
            {...commonProps}
          />
        );

      case 5:
        return (
          <Step5Governance
            {...commonProps}
          />
        );

      case 6:
        return (
          <Step4Resumen
            {...commonProps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            validationResults={stepValidations}
            tiposDocumento={referenceData.tiposDocumento}
            procesos={referenceData.procesos}
            carpetas={referenceData.carpetas}
            mode={mode}
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
      title={mode === 'create' ? 'Nuevo Documento' : 'Editar Documento'}
      subtitle={`Completa los pasos para ${mode === 'create' ? 'crear' : 'actualizar'} el documento`}
      steps={stepConfigs}
      currentStep={currentStep - 1}
      onStepChange={(index) => setCurrentStep(index + 1)}
      showStepNumbers={true}
      canGoNext={
        currentStep < stepConfigs.length && (
          currentStep === 1 ? (stepValidations.step1 && Boolean(formData.carpetaId)) :
          currentStep === 2 ? stepValidations.step2 :
          true
        )
      }
      canGoPrevious={currentStep > 1}
      allowStepClick={false}
      hideNextButton={currentStep === stepConfigs.length}
      className="stepper stepper-large"
      inline={inline}
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

export default StepperDocumentForm;