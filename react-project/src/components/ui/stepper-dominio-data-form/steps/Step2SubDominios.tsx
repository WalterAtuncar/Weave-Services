import React from 'react';
import { Database, Info } from 'lucide-react';
import { DominioDataFormData, DominioDataFormErrors, SubDominioDataDto } from '../types';
import styles from '../StepperDominioDataForm.module.css';
import sysStyles from '../../stepper-system-form/StepperSystemForm.module.css';

interface Step2SubDominiosProps {
  formData: DominioDataFormData;
  errors: DominioDataFormErrors;
  onDataChange: (data: Partial<DominioDataFormData>) => void;
  loading?: boolean;
}

const Step2SubDominios: React.FC<Step2SubDominiosProps> = ({
  formData,
  errors,
  onDataChange,
  loading = false
}) => {
  const subDominios = formData.subDominios || [];

  return (
    <div className={styles.stepContainer}>
      {/* Header del Step (mismo estilo que Step 3) */}
      <div className={sysStyles.stepHeader}>
        <div className={sysStyles.stepIcon}>
          <Database size={20} />
        </div>
        <div>
          <h2 className={sysStyles.stepTitle}>Sub Dominios ({subDominios.length})</h2>
          <p className={sysStyles.stepDescription}>
            Lista informativa de los subdominios existentes en el dominio
          </p>
        </div>
      </div>

      {/* Grid informativa de SubDominios */}
      <div className={styles.formSection}>      
        {/* Grid de subdominios existentes */}
        {subDominios.length > 0 ? (
          <div className={styles.subDominiosGrid}>
            {subDominios.map((subDominio, index) => {
              // Asegurar uso de las propiedades del objeto proporcionado (y soportar nombres alternativos legado)
              const codigo = (subDominio as any).codigoSubDominio ?? (subDominio as any).codigo ?? '';
              const nombre = (subDominio as any).nombreSubDominio ?? (subDominio as any).nombre ?? '';
              const descripcion = (subDominio as any).descripcionSubDominio ?? (subDominio as any).descripcion ?? '';

              return (
                <div key={index} className={styles.subDominioCard}>
                  <div className={styles.subDominioHeader}>
                    <h4 className={styles.subDominioName}>
                      {nombre || 'Sin nombre'}
                    </h4>
                    {codigo && (
                      <span className={styles.subDominioCodigo}>
                        {codigo}
                      </span>
                    )}
                  </div>

                  <p className={styles.subDominioDescription}>
                    {descripcion || 'Sin descripción'}
                  </p>

                  <div className={styles.subDominioMeta}>
                    <span className={`${styles.subDominioStatus} ${(subDominio as any).estado === 1 ? styles.active : styles.inactive}`}>
                      {(subDominio as any).estado === 1 ? 'Activo' : 
                       (subDominio as any).estado === 0 ? 'Inactivo' :
                       (subDominio as any).estado === -1 ? 'Rechazado' :
                       (subDominio as any).estado === -2 ? 'Pendiente' :
                       (subDominio as any).estado === -3 ? 'Iniciar Flujo' :
                       (subDominio as any).estado === -4 ? 'Borrador' : 'Desconocido'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Database size={48} className={styles.emptyIcon} />
            <h3>No hay subdominios definidos</h3>
            <p>Este dominio no tiene subdominios asociados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2SubDominios;