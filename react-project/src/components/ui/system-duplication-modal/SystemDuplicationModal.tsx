import React, { useState, useEffect, useMemo } from 'react';
import { Copy, AlertCircle, CheckCircle, Settings, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Checkbox } from '../checkbox/Checkbox';
import { Modal } from '../modal/Modal';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertService } from '../alerts/AlertService';
import { 
  Sistema, 
  CreateSistemaDto, 
  TipoSistema, 
  FamiliaSistema, 
  EstadoSistema,
  getTipoSistemaLabel,
  getFamiliaSistemaLabel,
  getEstadoSistemaLabel
} from '../../../models/Sistemas';
import styles from './SystemDuplicationModal.module.css';
import { sanitizeCodigoSistema } from '../../../utils/sistemasValidation';

export interface SystemDuplicationModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Sistema a duplicar */
  sistema: Sistema;
  /** Lista de sistemas existentes para validación */
  sistemasExistentes: Sistema[];
  /** ID de la organización */
  organizacionId: number;
  /** Callback cuando se completa la duplicación */
  onDuplicationComplete: (nuevoSistema: CreateSistemaDto) => Promise<void>;
  /** Callback para manejo de errores */
  onError?: (error: string) => void;
}

export interface DuplicationConfig {
  nombreSistema: string;
  codigoSistema: string;
  includeModulos: boolean;
  includeDependencias: boolean;
  includePermisos: boolean;
  nuevoTipo?: TipoSistema;
  nuevaFamilia?: FamiliaSistema;
  nuevoEstado: EstadoSistema;
  prefijo: string;
  sufijo: string;
  numeroSecuencial: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export const SystemDuplicationModal: React.FC<SystemDuplicationModalProps> = ({
  isOpen,
  onClose,
  sistema,
  sistemasExistentes,
  organizacionId,
  onDuplicationComplete,
  onError
}) => {
  const { colors } = useTheme();

  // Estado de configuración de duplicación
  const [config, setConfig] = useState<DuplicationConfig>({
    nombreSistema: '',
    codigoSistema: '',
    includeModulos: true,
    includeDependencias: false,
    includePermisos: false,
    nuevoEstado: EstadoSistema.ACTIVO,
    prefijo: '',
    sufijo: 'Copy',
    numeroSecuencial: 1
  });

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);

  // Inicializar configuración cuando cambia el sistema
  useEffect(() => {
    if (sistema && isOpen) {
      const baseName = sistema.nombreSistema;
      const baseCode = sistema.codigoSistema || '';
      
      // Encontrar siguiente número secuencial disponible
      const nextNumber = findNextSequentialNumber(baseName, sistemasExistentes);
      
      setConfig({
        nombreSistema: `${baseName} - Copia`,
        codigoSistema: baseCode ? `${baseCode}_COPY` : '',
        includeModulos: true,
        includeDependencias: false,
        includePermisos: false,
        nuevoEstado: EstadoSistema.ACTIVO,
        prefijo: '',
        sufijo: 'Copia',
        numeroSecuencial: nextNumber
      });
    }
  }, [sistema, isOpen, sistemasExistentes]);

  // Generar nombres automáticamente
  const generateNames = () => {
    if (!sistema) return;

    const baseName = sistema.nombreSistema;
    const baseCode = sistema.codigoSistema || '';
    const { prefijo, sufijo, numeroSecuencial } = config;

    let newName = baseName;
    let newCode = baseCode;

    // Aplicar prefijo
    if (prefijo) {
      newName = `${prefijo} ${newName}`;
      newCode = prefijo.toUpperCase() + '_' + newCode;
    }

    // Aplicar sufijo
    if (sufijo) {
      newName = `${newName} ${sufijo}`;
      newCode = newCode + '_' + sufijo.toUpperCase();
    }

    // Aplicar número secuencial
    if (numeroSecuencial > 1) {
      newName = `${newName} ${numeroSecuencial}`;
      newCode = newCode + `_${numeroSecuencial}`;
    }

    setConfig(prev => ({
      ...prev,
      nombreSistema: newName.trim(),
      codigoSistema: sanitizeCodigoSistema(newCode.replace(/^_+|_+$/g, ''))
    }));
  };

  // Auto-generar cuando cambian los parámetros
  useEffect(() => {
    if (autoGenerate && sistema) {
      generateNames();
    }
  }, [config.prefijo, config.sufijo, config.numeroSecuencial, autoGenerate, sistema]);

  // Validar configuración
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!config.nombreSistema.trim()) {
      errors.push('El nombre del sistema es requerido');
    } else {
      // Verificar duplicados de nombre
      const nameExists = sistemasExistentes.some(s => 
        s.nombreSistema.toLowerCase() === config.nombreSistema.toLowerCase()
      );
      if (nameExists) {
        errors.push('Ya existe un sistema con este nombre');
      }
    }

    if (config.codigoSistema.trim()) {
      // Verificar duplicados de código
      const codeExists = sistemasExistentes.some(s => 
        s.codigoSistema?.toLowerCase() === config.codigoSistema.toLowerCase()
      );
      if (codeExists) {
        errors.push('Ya existe un sistema con este código');
      }

      // Formato del código se controla por sanitización en el input
    }

    // Verificar si el sistema original es muy similar
    if (config.nombreSistema === sistema?.nombreSistema) {
      warnings.push('El nuevo nombre es idéntico al original');
    }

    // Sugerencias
    if (!config.includeModulos && sistema?.modulos?.length) {
      suggestions.push(`El sistema original tiene ${sistema.modulos.length} módulos que podrían incluirse`);
    }

    if (config.includeDependencias && !sistema?.sistemaDepende) {
      warnings.push('El sistema original no tiene dependencias para copiar');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, [config, sistemasExistentes, sistema]);

  // Encontrar siguiente número secuencial
  const findNextSequentialNumber = (baseName: string, sistemas: Sistema[]): number => {
    const pattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?(\\d+)$`);
    const numbers = sistemas
      .map(s => {
        const match = s.nombreSistema.match(pattern);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);

    return numbers.length > 0 ? Math.max(...numbers) + 1 : 2;
  };

  // Manejar cambios en la configuración
  const handleConfigChange = (updates: Partial<DuplicationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    
    // Desactivar auto-generación si se modifica manualmente el nombre
    if (updates.nombreSistema !== undefined || updates.codigoSistema !== undefined) {
      setAutoGenerate(false);
    }
  };

  // Realizar duplicación
  const handleDuplicate = async () => {
    if (!validation.isValid) {
      AlertService.error('Corrige los errores antes de continuar');
      return;
    }

    setIsDuplicating(true);

    try {
      const nuevoSistema: CreateSistemaDto = {
        organizacionId,
        nombreSistema: config.nombreSistema.trim(),
        codigoSistema: config.codigoSistema.trim() || null,
        funcionPrincipal: sistema.funcionPrincipal,
        tipoSistema: config.nuevoTipo || sistema.tipoSistema,
        familiaSistema: config.nuevaFamilia || sistema.familiaSistema,
        sistemaDepende: config.includeDependencias ? sistema.sistemaDepende : null,
        modulos: config.includeModulos ? sistema.modulos?.map(m => ({
          nombreModulo: m.nombreModulo,
          descripcionModulo: m.descripcionModulo,
          estadoModulo: m.estadoModulo
        })) : undefined
      };

      await onDuplicationComplete(nuevoSistema);
      
      AlertService.success('Sistema duplicado exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al duplicar sistema:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onError?.(errorMessage);
      AlertService.error('Error al duplicar el sistema');
    } finally {
      setIsDuplicating(false);
    }
  };

  // Restablecer auto-generación
  const handleAutoGenerate = () => {
    setAutoGenerate(true);
    generateNames();
  };

  if (!sistema) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Duplicar Sistema: ${sistema.nombreSistema}`}
      size="lg"
    >
      <div className={styles.duplicationModal}>
        {/* Información del sistema original */}
        <div className={styles.originalSystemInfo} style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
          <div className={styles.originalSystemHeader}>
            <h3 style={{ color: colors.text }}>Sistema Original</h3>
          </div>
          <div className={styles.originalSystemDetails}>
            <div className={styles.detail}>
              <span className={styles.detailLabel} style={{ color: colors.textSecondary }}>Nombre:</span>
              <span style={{ color: colors.text }}>{sistema.nombreSistema}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel} style={{ color: colors.textSecondary }}>Código:</span>
              <span style={{ color: colors.text }}>{sistema.codigoSistema || 'Sin código'}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel} style={{ color: colors.textSecondary }}>Tipo:</span>
              <span style={{ color: colors.text }}>{getTipoSistemaLabel(sistema.tipoSistema)}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel} style={{ color: colors.textSecondary }}>Módulos:</span>
              <span style={{ color: colors.text }}>{sistema.modulos?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Configuración básica */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
              Configuración del Nuevo Sistema
            </h3>
            <Button
              variant="ghost"
              size="s"
              onClick={handleAutoGenerate}
              disabled={autoGenerate}
            >
              <Wand2 size={16} />
              Auto-generar
            </Button>
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Nombre del Sistema"
              value={config.nombreSistema}
              onChange={(e) => handleConfigChange({ nombreSistema: e.target.value })}
              placeholder="Ingresa el nombre del nuevo sistema"
              required
            />

            <Input
              label="Código del Sistema"
              value={config.codigoSistema}
              onChange={(e) => handleConfigChange({ codigoSistema: sanitizeCodigoSistema(e.target.value).toUpperCase() })}
              placeholder="Código opcional (ej: SYS_COPY)"
            />
          </div>
        </div>

        {/* Generación automática */}
        {autoGenerate && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
              Configuración de Auto-generación
            </h3>
            
            <div className={styles.autoGenGrid}>
              <Input
                label="Prefijo"
                value={config.prefijo}
                onChange={(e) => handleConfigChange({ prefijo: e.target.value })}
                placeholder="Ej: Test, Dev, Prod"
              />

              <Input
                label="Sufijo"
                value={config.sufijo}
                onChange={(e) => handleConfigChange({ sufijo: e.target.value })}
                placeholder="Ej: Copy, Clone, v2"
              />

              <Input
                label="Número Secuencial"
                type="number"
                min="1"
                value={config.numeroSecuencial}
                onChange={(e) => handleConfigChange({ numeroSecuencial: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
        )}

        {/* Opciones de duplicación */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
            Opciones de Duplicación
          </h3>
          
          <div className={styles.optionsGrid}>
            <label className={styles.option} style={{ color: colors.text }}>
              <Checkbox
                checked={config.includeModulos}
                onChange={(checked) => handleConfigChange({ includeModulos: checked })}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>Incluir Módulos</span>
                <span className={styles.optionDescription} style={{ color: colors.textSecondary }}>
                  Copiar todos los módulos del sistema original
                </span>
              </div>
            </label>

            <label className={styles.option} style={{ color: colors.text }}>
              <Checkbox
                checked={config.includeDependencias}
                onChange={(checked) => handleConfigChange({ includeDependencias: checked })}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>Incluir Dependencias</span>
                <span className={styles.optionDescription} style={{ color: colors.textSecondary }}>
                  Mantener las mismas relaciones de dependencia
                </span>
              </div>
            </label>

            <label className={styles.option} style={{ color: colors.text }}>
              <Checkbox
                checked={config.includePermisos}
                onChange={(checked) => handleConfigChange({ includePermisos: checked })}
              />
              <div className={styles.optionContent}>
                <span className={styles.optionLabel}>Incluir Permisos</span>
                <span className={styles.optionDescription} style={{ color: colors.textSecondary }}>
                  Copiar configuración de permisos y accesos
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Configuración avanzada */}
        {showAdvanced && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle} style={{ color: colors.text }}>
              Configuración Avanzada
            </h3>
            
            <div className={styles.advancedGrid}>
              <Select
                value={config.nuevoTipo || sistema.tipoSistema}
                onValueChange={(value) => handleConfigChange({ nuevoTipo: value as TipoSistema })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoSistema).map(tipo => (
                    <SelectItem key={tipo} value={tipo}>
                      {getTipoSistemaLabel(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={config.nuevaFamilia || sistema.familiaSistema}
                onValueChange={(value) => handleConfigChange({ nuevaFamilia: value as FamiliaSistema })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar familia" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FamiliaSistema).map(familia => (
                    <SelectItem key={familia} value={familia}>
                      {getFamiliaSistemaLabel(familia)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={config.nuevoEstado}
                onValueChange={(value) => handleConfigChange({ nuevoEstado: value as EstadoSistema })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EstadoSistema).map(estado => (
                    <SelectItem key={estado} value={estado}>
                      {getEstadoSistemaLabel(estado)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Validación */}
        {(validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0) && (
          <div className={styles.validation}>
            {validation.errors.length > 0 && (
              <div className={styles.validationSection}>
                <div className={styles.validationHeader} style={{ color: '#EF4444' }}>
                  <AlertCircle size={16} />
                  Errores
                </div>
                <ul className={styles.validationList}>
                  {validation.errors.map((error, index) => (
                    <li key={index} style={{ color: '#EF4444' }}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className={styles.validationSection}>
                <div className={styles.validationHeader} style={{ color: '#F59E0B' }}>
                  <AlertCircle size={16} />
                  Advertencias
                </div>
                <ul className={styles.validationList}>
                  {validation.warnings.map((warning, index) => (
                    <li key={index} style={{ color: '#F59E0B' }}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.suggestions.length > 0 && (
              <div className={styles.validationSection}>
                <div className={styles.validationHeader} style={{ color: '#3B82F6' }}>
                  <CheckCircle size={16} />
                  Sugerencias
                </div>
                <ul className={styles.validationList}>
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index} style={{ color: '#3B82F6' }}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings size={16} />
            {showAdvanced ? 'Ocultar' : 'Mostrar'} Avanzado
          </Button>

          <div className={styles.primaryActions}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDuplicating}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleDuplicate}
              disabled={!validation.isValid || isDuplicating}
              loading={isDuplicating}
            >
              <Copy size={16} />
              Duplicar Sistema
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};