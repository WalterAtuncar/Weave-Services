import React, { useState } from 'react';
import { X, ChevronDown, User, Settings, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import { ActividadesData } from './DefinicionActividades';
import styles from './Procesos.module.css';

interface DetalleActividadesProps {
  isOpen: boolean;
  onClose: () => void;
  configuracionData: ConfiguracionData;
  actividadesData: ActividadesData;
}

export const DetalleActividades: React.FC<DetalleActividadesProps> = ({
  isOpen,
  onClose,
  configuracionData,
  actividadesData
}) => {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ backgroundColor: colors.surface }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            Detalle de Actividades
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ color: colors.text }}>
            Actividades para {configuracionData.nombre}: {actividadesData.actividades.length}
          </p>
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.actionButton}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}; 