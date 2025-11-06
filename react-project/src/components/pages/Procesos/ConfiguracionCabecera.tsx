import React, { useState } from 'react';
import { X, FileText, ChevronDown } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Procesos.module.css';

interface ConfiguracionCabeceraProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: ConfiguracionData) => void;
  initialData?: ConfiguracionData;
}

export interface ConfiguracionData {
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: string;
  criticidad: string;
  estado: string;
  procesoPadre: string;
  organizacion: string;
  categoria: string;
}

const NIVELES = ['Alto', 'Medio', 'Bajo'];
const CRITICIDADES = ['Crítico', 'Importante', 'Normal'];
const ESTADOS = ['Borrador', 'En Proceso', 'Activo', 'Inactivo'];
const CATEGORIAS = ['Financiero', 'Operativo', 'Estratégico', 'Soporte'];

export const ConfiguracionCabecera: React.FC<ConfiguracionCabeceraProps> = ({
  isOpen,
  onClose,
  onContinue,
  initialData
}) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<ConfiguracionData>(initialData || {
    codigo: '',
    nombre: '',
    descripcion: '',
    nivel: 'Medio',
    criticidad: 'Normal',
    estado: 'Borrador',
    procesoPadre: '',
    organizacion: '',
    categoria: 'Operativo'
  });

  const [errors, setErrors] = useState<Partial<ConfiguracionData>>({});

  const handleInputChange = (field: keyof ConfiguracionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ConfiguracionData> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (!/^P\d{6}$/.test(formData.codigo)) {
      newErrors.codigo = 'El código debe tener el formato P000000';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.organizacion.trim()) {
      newErrors.organizacion = 'La organización es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue(formData);
    }
  };

  const handleGenerateCode = () => {
    const randomCode = 'P' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    handleInputChange('codigo', randomCode);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ backgroundColor: colors.surface }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            <FileText size={24} />
            1.- Completa la cabecera
          </h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            style={{ color: colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            {/* Código del proceso */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Código del proceso *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  className={styles.formInput}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: errors.codigo ? '#ef4444' : colors.border
                  }}
                  placeholder="P000001"
                />
                <button
                  onClick={handleGenerateCode}
                  className={styles.actionButton}
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white',
                    padding: '0.5rem 1rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Auto
                </button>
              </div>
              {errors.codigo && (
                <span className={styles.formError}>{errors.codigo}</span>
              )}
            </div>

            {/* Nombre del proceso */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Nombre del proceso *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={styles.formInput}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.nombre ? '#ef4444' : colors.border
                }}
                placeholder="Pago de Factura"
              />
              {errors.nombre && (
                <span className={styles.formError}>{errors.nombre}</span>
              )}
            </div>

            {/* Nivel */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Nivel
              </label>
              <div className={styles.filterGroup}>
                <select
                  value={formData.nivel}
                  onChange={(e) => handleInputChange('nivel', e.target.value)}
                  className={styles.formSelect}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  {NIVELES.map(nivel => (
                    <option key={nivel} value={nivel}>{nivel}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ color: colors.textSecondary }} />
              </div>
            </div>

            {/* Criticidad */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Criticidad
              </label>
              <div className={styles.filterGroup}>
                <select
                  value={formData.criticidad}
                  onChange={(e) => handleInputChange('criticidad', e.target.value)}
                  className={styles.formSelect}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  {CRITICIDADES.map(criticidad => (
                    <option key={criticidad} value={criticidad}>{criticidad}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ color: colors.textSecondary }} />
              </div>
            </div>

            {/* Estado */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Estado
              </label>
              <div className={styles.filterGroup}>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className={styles.formSelect}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ color: colors.textSecondary }} />
              </div>
            </div>

            {/* Proceso padre */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Proceso padre
              </label>
              <input
                type="text"
                value={formData.procesoPadre}
                onChange={(e) => handleInputChange('procesoPadre', e.target.value)}
                className={styles.formInput}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }}
                placeholder="Vacío (proceso principal)"
              />
            </div>

            {/* Organización */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Organización *
              </label>
              <input
                type="text"
                value={formData.organizacion}
                onChange={(e) => handleInputChange('organizacion', e.target.value)}
                className={styles.formInput}
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.organizacion ? '#ef4444' : colors.border
                }}
                placeholder="Nombre de la organización"
              />
              {errors.organizacion && (
                <span className={styles.formError}>{errors.organizacion}</span>
              )}
            </div>

            {/* Categoría */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} style={{ color: colors.text }}>
                Categoría
              </label>
              <div className={styles.filterGroup}>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className={styles.formSelect}
                  style={{ 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  {CATEGORIAS.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ color: colors.textSecondary }} />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} style={{ color: colors.text }}>
              Descripción del proceso *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              className={styles.formTextarea}
              style={{ 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: errors.descripcion ? '#ef4444' : colors.border
              }}
              placeholder="Describe el objetivo y alcance del proceso..."
              rows={4}
            />
            {errors.descripcion && (
              <span className={styles.formError}>{errors.descripcion}</span>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            style={{ 
              backgroundColor: colors.background,
              color: colors.textSecondary,
              borderColor: colors.border
            }}
          >
            Cerrar
          </button>
          
          <button
            onClick={handleContinue}
            className={`${styles.actionButton} ${styles.primaryButton}`}
            style={{ 
              backgroundColor: colors.primary,
              color: 'white'
            }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}; 