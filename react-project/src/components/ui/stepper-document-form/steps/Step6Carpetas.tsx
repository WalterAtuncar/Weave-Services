import React, { useMemo } from 'react';
import { FolderTree } from 'lucide-react';
import styles from '../../stepper-system-form/StepperSystemForm.module.css';
import { DocumentFormData, DocumentFormErrors, CarpetaRef } from '../types';
import { FoldersTree } from '../../folders/FoldersTree';

interface Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
  carpetas?: CarpetaRef[];
}

const Step6Carpetas: React.FC<Props> = ({ formData, errors, onDataChange, onErrorChange, carpetas = [] }) => {
  const initialFolders = useMemo(() => carpetas || [], [carpetas]);

  const handleSelect = (id: string | number | null, ruta?: string) => {
    onDataChange({ carpetaId: id, carpetaRuta: ruta ?? null });
    if (errors?.carpetaId) onErrorChange({ carpetaId: undefined });
  };

  const resolvePath = (node: any): string => {
    try {
      const names: string[] = [];
      let curr: any = node;
      while (curr) {
        const nm = curr.data?.nombreCarpeta ?? curr.data?.NombreCarpeta ?? curr.name;
        if (nm) names.unshift(String(nm));
        curr = curr.parent;
      }
      return names.join('/');
    } catch {
      return String(node?.name || node?.data?.nombreCarpeta || '');
    }
  };

  return (
    <div className={styles.stepContent} style={{ width: '100%' }}>
      <div className={styles.stepHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderTree size={20} />
          <h3>Carpetas</h3>
        </div>
        <p>Selecciona o crea una carpeta donde se almacenará el documento.</p>
      </div>

      <div className={styles.stepBody} style={{ width: '100%' }}>
        {initialFolders.length === 0 ? (
          <div className={styles.infoBox}>
            <p>No hay carpetas registradas. Puedes crear carpetas directamente en el árbol.</p>
          </div>
        ) : null}

        <FoldersTree
          folders={initialFolders as any}
          height={420}
          width={undefined as any}
          selectedFolderId={formData.carpetaId ?? null}
          onSelectFolder={handleSelect}
          resolvePath={resolvePath}
        />

        {errors?.carpetaId ? (
          <div className={styles.errorBox} style={{ marginTop: 8 }}>
            {errors.carpetaId}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Step6Carpetas;