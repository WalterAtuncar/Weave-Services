import React, { useMemo, useCallback } from 'react';
import { Package } from 'lucide-react';
import { Step3Props, SystemFormData, SystemFormErrors, SystemModuleData } from '../types';
import { ModuleForm } from '../../module-form';
import { EstadoSistema, SistemaModulo } from '../../../../models/Sistemas';
import styles from '../StepperSystemForm.module.css';

interface Step3ModulesProps extends Step3Props {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  loading?: boolean;
}

// Mapea el tipo usado en el Stepper (SystemModuleData) al tipo del ModuleForm (SistemaModulo)
const mapToSistemaModulo = (m: SystemModuleData, fallbackSistemaId: number = 0): SistemaModulo => ({
  sistemaModuloId: m.id,
  sistemaId: m.sistemaId ?? fallbackSistemaId,
  nombreModulo: m.nombre,
  funcionModulo: m.descripcion || '',
  version: parseInt(m.version || '1', 10) || 1,
  estado: m.activo ? EstadoSistema.Activo : EstadoSistema.Inactivo,
  creadoPor: null,
  fechaCreacion: new Date().toISOString(),
  actualizadoPor: null,
  fechaActualizacion: null,
  registroEliminado: false,
});

// Mapea desde SistemaModulo (ModuleForm) al tipo del Stepper (SystemModuleData)
const mapToSystemModuleData = (m: SistemaModulo): SystemModuleData => ({
  id: m.sistemaModuloId,
  nombre: m.nombreModulo,
  descripcion: m.funcionModulo,
  version: String(m.version ?? 1),
  activo: m.estado === EstadoSistema.Activo,
  orden: undefined,
  sistemaId: m.sistemaId,
});

const Step3Modules: React.FC<Step3ModulesProps> = ({
  formData,
  errors,
  onDataChange,
  loading = false,
}) => {
  const sistemaId = formData.id ?? 0;

  // Preparar los módulos para el ModuleForm de forma estable y memoizada
  const modulosForModuleForm: SistemaModulo[] = useMemo(() => {
    const source = formData.modulos || [];
    return source
      .filter((m) => (typeof m?.id === 'number' && m.id > 0) || ((m?.nombre || '').trim().length > 0))
      .map((m) => ({
        ...mapToSistemaModulo(m, sistemaId),
        // Evitar valores inestables por render (como fechas generadas cada vez)
        fechaCreacion: null,
        fechaActualizacion: null,
        creadoPor: null,
        actualizadoPor: null,
      }));
  }, [formData.modulos, sistemaId]);

  const handleModulosChange = useCallback((newModulos: SistemaModulo[]) => {
    const mapped: SystemModuleData[] = newModulos.map(mapToSystemModuleData);
    onDataChange({ modulos: mapped });
  }, [onDataChange]);

  return (
    <div className={styles.stepContainer}>
      {/* Header del Step */}
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Package size={20} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Gestión de Módulos</h2>
          <p className={styles.stepDescription}>
            Define los módulos que componen el sistema
          </p>
        </div>
      </div>

      {/* Sección: Módulos del Sistema */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <Package size={18} />
          </div>
          <div>
            <h3 className={styles.sectionTitle}>Módulos del Sistema</h3>
            <p className={styles.sectionDescription}>
              Define los módulos que componen tu sistema
            </p>
          </div>
        </div>

        <ModuleForm
          sistemaId={sistemaId}
          modulos={modulosForModuleForm}
          onModulosChange={handleModulosChange}
          loading={loading}
          disabled={false}
          compact={false}
          readOnly={false}
        />
      </div>
    </div>
  );
};

export default Step3Modules;