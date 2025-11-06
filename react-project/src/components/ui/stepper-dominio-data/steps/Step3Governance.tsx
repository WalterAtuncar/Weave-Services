import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAuth } from '../../../../hooks/useAuth';
import { AlertService } from '../../alerts/AlertService';
import { Button } from '../../button/button';
import { Label } from '../../label';
import { 
  SelectWrapper,
  SelectContent,
  SelectItem 
} from '../../select/Select';
import { gobernanzaService, tipoEntidadService } from '../../../../services';
import { GobernanzaDto } from '../../../../services/types/gobernanza.types';
import { TipoEntidad } from '../../../../services/types/tipo-entidad.types';
import { 
  StepperDominioDataFormData,
  StepperDominioDataErrors,
  StepperDominioDataReferenceData
} from '../stepper-dominio-data.types';
import { Shield, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface Step3GovernanceProps {
  formData: StepperDominioDataFormData;
  errors: StepperDominioDataErrors;
  onFormDataChange: (data: Partial<StepperDominioDataFormData>) => void;
  referenceData: StepperDominioDataReferenceData;
  isLoading?: boolean;
  disabled?: boolean;
}

export const Step3Governance: React.FC<Step3GovernanceProps> = ({
  formData,
  errors,
  onFormDataChange,
  referenceData,
  isLoading = false,
  disabled = false
}) => {
  const { colors } = useTheme();
  const { organizationInfo } = useAuth();

  // Estados locales para gobernanza
  const [gobernanzasDisponibles, setGobernanzasDisponibles] = useState<GobernanzaDto[]>([]);
  const [loadingGobernanzas, setLoadingGobernanzas] = useState(false);
  const [tiposEntidad, setTiposEntidad] = useState<TipoEntidad[]>([]);
  const [selectedGobernanza, setSelectedGobernanza] = useState<GobernanzaDto | null>(null);

  // Obtener organizacionId del localStorage
  const getOrganizationId = (): number => {
    // Intentar con organizationInfo primero
    if (organizationInfo?.id && organizationInfo.id > 0) {
      return organizationInfo.id;
    }
    
    // Fallback a localStorage
    try {
      const sessionData = localStorage.getItem('userSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const orgId = session?.organizacion?.organizacionId;
        if (orgId && orgId > 0) {
          return orgId;
        }
      }
    } catch (error) {
      console.error('Error al obtener organizacionId del localStorage:', error);
    }
    
    return 1; // Valor por defecto
  };

  // Cargar tipos de entidad al montar el componente
  useEffect(() => {
    const loadTiposEntidad = async () => {
      try {
        const organizacionId = getOrganizationId();
        const response = await tipoEntidadService.getAllTiposEntidad({
          includeDeleted: false,
          organizationId: organizacionId
        });
        
        if (response.success && response.data) {
          setTiposEntidad(response.data);
        } else {
          console.error('Error al cargar tipos de entidad:', response.message);
        }
      } catch (error) {
        console.error('Error cargando tipos de entidad:', error);
      }
    };

    loadTiposEntidad();
  }, []);

  // Cargar gobiernos filtrados por tipo de entidad 'Data'
  useEffect(() => {
    const loadGobernanzasPorTipoEntidad = async () => {
      if (tiposEntidad.length === 0) {
        setGobernanzasDisponibles([]);
        return;
      }

      setLoadingGobernanzas(true);
      try {
        const organizacionId = getOrganizationId();
        
        // Buscar el tipo de entidad 'Data'
        const tipoEntidadData = tiposEntidad.find(tipo => 
          tipo.tipoEntidadCodigo?.toLowerCase() === 'data' ||
          tipo.tipoEntidadNombre?.toLowerCase().includes('data')
        );
        
        if (!tipoEntidadData) {
          console.warn('No se encontró tipo de entidad Data');
          setGobernanzasDisponibles([]);
          return;
        }

        const filtros = {
          tipoEntidadId: tipoEntidadData.tipoEntidadId,
          organizacionId: organizacionId,
          includeDeleted: false
        };
        const response = await gobernanzaService.getAllGobernanzas(filtros);

        if (response.success && response.data) {
          // Filtrar solo gobernanzas activas
          const gobernanzasActivas = response.data.filter((g: any) => {
            const estaActiva = (g.activo === true) || (g.estado === 1) || (typeof g.estado === 'string' && g.estado.toLowerCase() === 'activo');
            const noEliminada = (g.registroEliminado === false) || (g.registroEliminado === 0) || (g.registroEliminado === null) || (typeof g.registroEliminado === 'undefined');
            return estaActiva && noEliminada;
          });
          setGobernanzasDisponibles(gobernanzasActivas);
        } else {
          console.error('Error al cargar gobernanzas:', response.message);
          setGobernanzasDisponibles([]);
        }
      } catch (error) {
        console.error('Error cargando gobernanzas:', error);
        setGobernanzasDisponibles([]);
      } finally {
        setLoadingGobernanzas(false);
      }
    };

    loadGobernanzasPorTipoEntidad();
  }, [tiposEntidad]);

  // Actualizar gobernanza seleccionada cuando cambie el ID
  useEffect(() => {
    if (formData.gobernanzaId && formData.gobernanzaId > 0) {
      const gobernanza = gobernanzasDisponibles.find(g => g.gobernanzaId === formData.gobernanzaId);
      setSelectedGobernanza(gobernanza || null);
    } else {
      setSelectedGobernanza(null);
    }
  }, [formData.gobernanzaId, gobernanzasDisponibles]);

  // Manejar cambio en el checkbox de gobierno propio
  const handleTieneGobernanzaPropiaChange = (checked: boolean) => {
    onFormDataChange({
      tieneGobernanzaPropia: checked,
      gobernanzaId: checked ? formData.gobernanzaId : undefined
    });
  };

  // Manejar cambio en la selección de gobernanza
  const handleGobernanzaChange = (value: string) => {
    const gobernanzaId = value ? parseInt(value) : undefined;
    onFormDataChange({ gobernanzaId });
  };

  // Manejar visualización de detalles de gobernanza
  const handleViewGovernance = () => {
    if (selectedGobernanza) {
      // Aquí podrías abrir un modal o navegar a una vista de detalles
      AlertService.info(`Detalles de gobernanza: ${selectedGobernanza.nombre}`);
    }
  };

  // Opciones de gobernanza para el select
  const gobernanzaOptions = useMemo(() => {
    return gobernanzasDisponibles.map(gobernanza => ({
      value: gobernanza.gobernanzaId.toString(),
      label: gobernanza.nombre || `Gobierno ${gobernanza.gobernanzaId}`
    }));
  }, [gobernanzasDisponibles]);

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: '400px'
    }}>
      {/* Encabezado del paso */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '8px'
        }}>
          <Shield 
            size={24} 
            style={{ color: colors.primary }}
          />
          <h3 style={{ 
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: colors.text
          }}>
            Configuración de Gobierno
          </h3>
        </div>
        <p style={{ 
          margin: 0,
          color: colors.textSecondary,
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          Define si el dominio de datos tendrá un gobierno específico y selecciona cuál aplicará.
        </p>
      </div>

      {/* Información sobre gobierno */}
      <div style={{
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={20} style={{ color: colors.primary, marginTop: '2px' }} />
        <div>
          <p style={{ 
            margin: '0 0 8px 0',
            fontWeight: '500',
            color: colors.text,
            fontSize: '14px'
          }}>
            ¿Qué es el gobierno de datos?
          </p>
          <p style={{ 
            margin: 0,
            color: colors.textSecondary,
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            El gobierno de datos define las políticas, procesos y responsabilidades para la gestión 
            de la calidad, seguridad y uso de los datos dentro del dominio.
          </p>
        </div>
      </div>

      {/* Formulario de gobierno */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Checkbox para gobierno propio */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '8px'
          }}>
            <input
              id="tieneGobernanzaPropia"
              type="checkbox"
              checked={!!formData.tieneGobernanzaPropia}
              onChange={(e) => handleTieneGobernanzaPropiaChange(e.target.checked)}
              disabled={disabled || isLoading}
              style={{
                width: '16px',
                height: '16px',
                accentColor: colors.primary
              }}
            />
            <Label 
              htmlFor="tieneGobernanzaPropia"
              style={{ 
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text,
                cursor: 'pointer'
              }}
            >
              Este dominio tiene gobierno propio
            </Label>
          </div>
          <p style={{ 
            margin: '0 0 0 28px',
            color: colors.textSecondary,
            fontSize: '12px'
          }}>
            Si no se selecciona, el dominio heredará el gobierno de la organización
          </p>
        </div>

        {/* Selector de gobernanza */}
        {formData.tieneGobernanzaPropia && (
          <div>
            <Label 
              htmlFor="gobernanzaId"
              style={{ 
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text
              }}
            >
              Seleccionar Gobierno *
            </Label>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <SelectWrapper
                  value={formData.gobernanzaId && formData.gobernanzaId > 0 ? formData.gobernanzaId.toString() : undefined}
                  onValueChange={handleGobernanzaChange}
                  disabled={disabled || isLoading || loadingGobernanzas}
                  searchable
                  searchPlaceholder="Buscar gobierno..."
                  icon="Shield"
                  placeholder={
                    loadingGobernanzas 
                      ? "Cargando gobiernos..." 
                      : "Seleccione un gobierno"
                  }
                >
                  <SelectContent>
                    {gobernanzaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectWrapper>
                
                {errors.gobernanzaId && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    color: colors.error,
                    fontSize: '12px'
                  }}>
                    <AlertCircle size={14} />
                    {errors.gobernanzaId}
                  </div>
                )}
              </div>

              {/* Botón para ver detalles */}
              {selectedGobernanza && (
                <Button
                  type="button"
                  variant="outline"
                  size="s"
                  onClick={handleViewGovernance}
                  disabled={disabled || isLoading}
                  iconName="Shield"
                  iconPosition="left"
                  title="Ver detalles de la gobernanza"
                >
                  Ver Detalles
                </Button>
              )}
            </div>

            {/* Información de la gobernanza seleccionada */}
            {selectedGobernanza && (
              <div style={{
                marginTop: '16px',
                backgroundColor: colors.backgroundSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <CheckCircle size={16} style={{ color: colors.success, marginTop: '2px' }} />
                <div>
                  <p style={{ 
                    margin: '0 0 4px 0',
                    fontWeight: '500',
                    color: colors.text,
                    fontSize: '13px'
                  }}>
                    Gobierno seleccionado: {selectedGobernanza.nombre}
                  </p>
                  {selectedGobernanza.descripcion && (
                    <p style={{ 
                      margin: 0,
                      color: colors.textSecondary,
                      fontSize: '12px',
                      lineHeight: '1.3'
                    }}>
                      {selectedGobernanza.descripcion}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensaje cuando no tiene gobierno propio */}
        {!formData.tieneGobernanzaPropia && (
          <div style={{
            backgroundColor: colors.backgroundSecondary,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <Shield size={32} style={{ color: colors.textSecondary, marginBottom: '8px' }} />
            <p style={{ 
              margin: '0 0 4px 0',
              color: colors.text,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Sin gobierno específico
            </p>
            <p style={{ 
              margin: 0,
              color: colors.textSecondary,
              fontSize: '12px'
            }}>
              Este dominio utilizará el gobierno general de la organización
            </p>
          </div>
        )}

        {/* Resumen de gobiernos disponibles */}
        {gobernanzasDisponibles.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ 
              margin: '0 0 8px 0',
              fontSize: '12px',
              color: colors.textSecondary
            }}>
              Gobiernos disponibles: {gobernanzasDisponibles.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3Governance;