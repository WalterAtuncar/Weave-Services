import React from 'react';
import { Settings } from 'lucide-react';
import styles from '../../stepper-system-form/StepperSystemForm.module.css';
import { DocumentFormData, DocumentFormErrors, Proceso } from '../types';

interface Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
  procesos: Proceso[];
}

const Step3Gobierno: React.FC<Props> = ({ formData, errors, onDataChange, onErrorChange, procesos }) => {
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepContainer}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}><Settings size={20} /></div>
          <div>
            <h3 className={styles.stepTitle}>Gobierno del documento</h3>
            <p className={styles.stepDescription}>Selecciona el proceso relacionado y otros parámetros</p>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={`${styles.fieldLabel} ${styles.required}`}>Proceso</label>
              <select 
                className={`${styles.fieldSelect} ${errors.procesoId ? styles.error : ''}`}
                value={formData.procesoId || ''}
                onChange={(e) => onDataChange({ procesoId: e.target.value })}
              >
                <option value="" disabled>Seleccione un proceso</option>
                {procesos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {errors.procesoId && <p className={styles.fieldError}>{errors.procesoId}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Gobierno;