import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Building, Home, Map } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Modal } from '../../ui/modal/Modal';
import { SearchableSelect, SearchableSelectOption } from '../../ui/searchable-select';
import { ubigeoService } from '../../../services/ubigeo.service';
import { UbigeoDto } from '../../../services/ubigeo.types';
import { AlertService } from '../../ui/alerts/AlertService';

export interface UbigeoProps {
  /** Controla si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Función que se ejecuta al seleccionar un ubigeo */
  onSelect?: (selection: UbigeoSelection) => void;
  /** Título del modal */
  title?: string;
  /** Ubigeo preseleccionado */
  defaultValue?: {
    pais?: number;
    departamento?: number;
    provincia?: number;
    distrito?: number;
  };
  /** Datos de precarga - puede ser por IDs o por código/nombre */
  preloadData?: {
    pais?: number;
    departamento?: number;
    provincia?: number;
    distrito?: number;
    codigo?: string;
    nombre?: string;
  };
}

export interface UbigeoSelection {
  pais: number;
  departamento: number;
  provincia: number;
  distrito: number;
  codigo: string;
  nombre: string;
}

export const Ubigeo: React.FC<UbigeoProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Seleccionar Ubicación",
  defaultValue,
  preloadData
}) => {
  const { colors } = useTheme();

  // Estados para los datos de ubigeo
  const [ubigeoData, setUbigeoData] = useState<UbigeoDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadCompleted, setPreloadCompleted] = useState(false);

  // Estados para las selecciones
  const [selectedPais, setSelectedPais] = useState<number | null>(defaultValue?.pais || null);
  const [selectedDepartamento, setSelectedDepartamento] = useState<number | null>(defaultValue?.departamento || null);
  const [selectedProvincia, setSelectedProvincia] = useState<number | null>(defaultValue?.provincia || null);
  const [selectedDistrito, setSelectedDistrito] = useState<number | null>(defaultValue?.distrito || null);

  // Cargar datos de ubigeo al abrir el modal y resetear selecciones
  useEffect(() => {
    if (isOpen) {
      // Resetear todas las selecciones cuando se abre el modal
      setSelectedPais(null);
      setSelectedDepartamento(null);
      setSelectedProvincia(null);
      setSelectedDistrito(null);
      setPreloadCompleted(false);
      loadUbigeoData();
    }
  }, [isOpen]);

  // Manejar precarga cuando se cargan los datos y hay datos de precarga
  useEffect(() => {
    // Validar que tengamos datos completos antes de proceder
    if (ubigeoData.length > 0 && !isLoading && !isPreloading && !preloadCompleted) {
      const paises = ubigeoData.filter(item => item.idNivel === 0);
      const departamentos = ubigeoData.filter(item => item.idNivel === 1);
      const provincias = ubigeoData.filter(item => item.idNivel === 2);
      const distritos = ubigeoData.filter(item => item.idNivel === 3);
      
      // Solo proceder si tenemos datos de todos los niveles
      if (paises.length > 0 && departamentos.length > 0 && provincias.length > 0 && distritos.length > 0) {
        if (preloadData) {
          handlePreload();
        } else if (!selectedPais) {
          // Seleccionar automáticamente el primer país solo si no hay precarga
          setSelectedPais(paises[0].ubigeoId);
          setPreloadCompleted(true);
        }
      }
    }
  }, [ubigeoData, preloadData, isLoading, isPreloading, preloadCompleted, selectedPais]);

  // Resetear selecciones dependientes cuando cambia el nivel superior (solo si no está precargando)
  useEffect(() => {
    if (!isPreloading && !preloadCompleted) {
      setSelectedDepartamento(null);
      setSelectedProvincia(null);
      setSelectedDistrito(null);
    }
  }, [selectedPais, isPreloading, preloadCompleted]);

  useEffect(() => {
    if (!isPreloading && !preloadCompleted) {
      setSelectedProvincia(null);
      setSelectedDistrito(null);
    }
  }, [selectedDepartamento, isPreloading, preloadCompleted]);

  useEffect(() => {
    if (!isPreloading && !preloadCompleted) {
      setSelectedDistrito(null);
    }
  }, [selectedProvincia, isPreloading, preloadCompleted]);

  const loadUbigeoData = async () => {
    try {
      setIsLoading(true);
      const response = await ubigeoService.getUbigeos();
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // Validar que tengamos datos de todos los niveles
        const paises = response.data.filter(item => item.idNivel === 0);
        const departamentos = response.data.filter(item => item.idNivel === 1);
        const provincias = response.data.filter(item => item.idNivel === 2);
        const distritos = response.data.filter(item => item.idNivel === 3);
        
        if (paises.length === 0 || departamentos.length === 0 || provincias.length === 0 || distritos.length === 0) {
          await AlertService.warning('Los datos de ubicación están incompletos. Algunas funciones pueden no estar disponibles.');
        }
        
        setUbigeoData(response.data);
      } else {
        await AlertService.error('Error al cargar los datos de ubicación');
      }
    } catch (error) {
      await AlertService.error('Error de conexión al cargar ubicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja la precarga de datos según el tipo de información disponible
   */
  const handlePreload = async () => {
    if (!preloadData || isPreloading || ubigeoData.length === 0) {
      return;
    }

    try {
      setIsPreloading(true);

      // Escenario 1: Precarga por IDs (pais, departamento, provincia, distrito)
      if (
        preloadData.pais && 
        preloadData.departamento && 
        preloadData.provincia && 
        preloadData.distrito &&
        typeof preloadData.pais === 'number' &&
        typeof preloadData.departamento === 'number' &&
        typeof preloadData.provincia === 'number' &&
        typeof preloadData.distrito === 'number'
      ) {
        await preloadByIds(preloadData.pais, preloadData.departamento, preloadData.provincia, preloadData.distrito);
      }
      // Escenario 2: Precarga por código/nombre (ingeniería inversa)
      else if (preloadData.codigo && preloadData.nombre) {
        await preloadByCodigoNombre(preloadData.codigo, preloadData.nombre);
      }
    } catch (error) {
      await AlertService.error('Error al precargar ubicación');
    } finally {
      setIsPreloading(false);
      setPreloadCompleted(true);
    }
  };

  /**
   * Precarga por IDs conocidos - Escenario 1
   */
  const preloadByIds = async (paisId: number, departamentoId: number, provinciaId: number, distritoId: number) => {
    // Validar que todos los IDs existan en los datos
    const paisExists = ubigeoData.find(u => u.ubigeoId === paisId && u.idNivel === 0);
    const deptExists = ubigeoData.find(u => u.ubigeoId === departamentoId && u.idNivel === 1);
    const provExists = ubigeoData.find(u => u.ubigeoId === provinciaId && u.idNivel === 2);
    const distExists = ubigeoData.find(u => u.ubigeoId === distritoId && u.idNivel === 3);

    if (!paisExists || !deptExists || !provExists || !distExists) {
      await AlertService.error('Los datos de ubicación preseleccionados no son válidos');
      return;
    }

    // Setear todos los valores de una vez para evitar interferencias de los useEffect
    setSelectedPais(paisId);
    setSelectedDepartamento(departamentoId);
    setSelectedProvincia(provinciaId);
    setSelectedDistrito(distritoId);
  };

  /**
   * Precarga por código/nombre - Escenario 2 (Ingeniería Inversa)
   */
  const preloadByCodigoNombre = async (codigo: string, nombre: string) => {
    // Validar que tengamos datos suficientes
    if (ubigeoData.length === 0) {
      await AlertService.error('No hay datos de ubicación disponibles');
      return;
    }

    // Buscar el distrito por código y nombre
    const distrito = ubigeoData.find(u => 
      u.idNivel === 3 && 
      u.codigo === codigo && 
      u.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (!distrito) {
      await AlertService.error(`No se encontró el distrito "${nombre}" con código "${codigo}"`);
      return;
    }

    // Obtener la provincia (padre del distrito)
    const provincia = ubigeoData.find(u => 
      u.idNivel === 2 && 
      u.ubigeoId === distrito.ubigeoPadreId
    );

    if (!provincia) {
      await AlertService.error('Error en la jerarquía: provincia no encontrada');
      return;
    }

    // Obtener el departamento (padre de la provincia)
    const departamento = ubigeoData.find(u => 
      u.idNivel === 1 && 
      u.ubigeoId === provincia.ubigeoPadreId
    );

    if (!departamento) {
      await AlertService.error('Error en la jerarquía: departamento no encontrado');
      return;
    }

    // Obtener el país (padre del departamento)
    const pais = ubigeoData.find(u => 
      u.idNivel === 0 && 
      u.ubigeoId === departamento.ubigeoPadreId
    );

    if (!pais) {
      await AlertService.error('Error en la jerarquía: país no encontrado');
      return;
    }

    // Ahora aplicar la precarga por IDs con la jerarquía reconstruida
    await preloadByIds(pais.ubigeoId, departamento.ubigeoId, provincia.ubigeoId, distrito.ubigeoId);
  };

  // Convertir UbigeoDto a SearchableSelectOption
  const convertToOptions = (ubigeoList: UbigeoDto[]): SearchableSelectOption[] => {
    return ubigeoList.map(item => ({
      value: item.ubigeoId,
      label: item.nombre,
      disabled: false
    }));
  };

  // Filtrar datos por nivel
  const getPaises = () => {
    return convertToOptions(ubigeoData.filter(item => item.idNivel === 0));
  };

  const getDepartamentos = () => {
    if (!selectedPais) {
      return [];
    }
    return convertToOptions(ubigeoData.filter(item => 
      item.idNivel === 1 && item.ubigeoPadreId === selectedPais
    ));
  };

  const getProvincias = () => {
    if (!selectedDepartamento) {
      return [];
    }
    return convertToOptions(ubigeoData.filter(item => 
      item.idNivel === 2 && item.ubigeoPadreId === selectedDepartamento
    ));
  };

  const getDistritos = () => {
    if (!selectedProvincia) {
      return [];
    }
    return convertToOptions(ubigeoData.filter(item => 
      item.idNivel === 3 && item.ubigeoPadreId === selectedProvincia
    ));
  };

  // Obtener el nombre del elemento seleccionado
  const getNombreById = (id: number | null): string => {
    if (!id) return '';
    const item = ubigeoData.find(u => u.ubigeoId === id);
    return item ? item.nombre : '';
  };

  // Obtener el código del distrito seleccionado
  const getCodigoDistrito = (): string => {
    if (!selectedDistrito) return '';
    const distrito = ubigeoData.find(u => u.ubigeoId === selectedDistrito);
    return distrito ? distrito.codigo : '';
  };

  // Manejar la selección
  const handleSelect = () => {
    if (!selectedPais || !selectedDepartamento || !selectedProvincia || !selectedDistrito) {
      AlertService.warning('Debe seleccionar todos los niveles: País, Departamento, Provincia y Distrito');
      return;
    }

    const selection: UbigeoSelection = {
      pais: selectedPais,
      departamento: selectedDepartamento,
      provincia: selectedProvincia,
      distrito: selectedDistrito,
      codigo: getCodigoDistrito(),
      nombre: getNombreById(selectedDistrito)
    };

    if (onSelect) {
      onSelect(selection);
    }

    onClose();
  };

  // Manejar cancelación
  const handleCancel = () => {
    // Resetear selecciones
    setSelectedPais(null);
    setSelectedDepartamento(null);
    setSelectedProvincia(null);
    setSelectedDistrito(null);
    setPreloadCompleted(false);
    onClose();
  };

  // Verificar si se puede seleccionar
  const canSelect = selectedPais && selectedDepartamento && selectedProvincia && selectedDistrito;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 20px',
          color: colors.textSecondary
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.border}`,
              borderTop: `3px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Cargando ubicaciones...</p>
          </div>
        </div>
      );
    }

    if (isPreloading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 20px',
          color: colors.textSecondary
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${colors.border}`,
              borderTop: `3px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p>Precargando ubicación seleccionada...</p>
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px' }}>
        {/* Selectores en grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* País */}
          <SearchableSelect
            label="País"
            value={selectedPais}
            onChange={(value) => setSelectedPais(Number(value))}
            options={getPaises()}
            placeholder="Seleccione un país"
            icon={Globe}
            required={true}
          />

          {/* Departamento */}
          <SearchableSelect
            label="Departamento"
            value={selectedDepartamento}
            onChange={(value) => setSelectedDepartamento(Number(value))}
            options={getDepartamentos()}
            placeholder="Seleccione un departamento"
            icon={Building}
            disabled={!selectedPais}
            required={true}
          />

          {/* Provincia */}
          <SearchableSelect
            label="Provincia"
            value={selectedProvincia}
            onChange={(value) => setSelectedProvincia(Number(value))}
            options={getProvincias()}
            placeholder="Seleccione una provincia"
            icon={Map}
            disabled={!selectedDepartamento}
            required={true}
          />

          {/* Distrito */}
          <SearchableSelect
            label="Distrito"
            value={selectedDistrito}
            onChange={(value) => setSelectedDistrito(Number(value))}
            options={getDistritos()}
            placeholder="Seleccione un distrito"
            icon={Home}
            disabled={!selectedProvincia}
            required={true}
          />
        </div>

        {/* Resumen de selección */}
        {canSelect && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: colors.surface,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <MapPin size={14} style={{ color: colors.primary }} />
              <span style={{ 
                color: colors.primary, 
                fontWeight: '600',
                fontSize: '13px'
              }}>
                Ubicación Seleccionada
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* Columna 1: Nombre del distrito */}
              <div>
                <div style={{
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {getNombreById(selectedDistrito)}
                </div>
                <div style={{
                  color: colors.textSecondary,
                  fontSize: '12px',
                  marginTop: '2px'
                }}>
                  {getNombreById(selectedProvincia)}, {getNombreById(selectedDepartamento)}, {getNombreById(selectedPais)}
                </div>
              </div>
              
              {/* Columna 2: Separador visual */}
              <div style={{
                width: '1px',
                height: '30px',
                backgroundColor: colors.border
              }} />
              
              {/* Columna 3: Código */}
              <div style={{
                textAlign: 'right'
              }}>
                                 <div style={{
                   color: colors.textSecondary,
                   fontSize: '11px',
                   fontWeight: '500',
                   textTransform: 'uppercase',
                   letterSpacing: '0.5px'
                 }}>
                   Ubigeo
                 </div>
                <div style={{
                  color: colors.text,
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  marginTop: '2px'
                }}>
                  {getCodigoDistrito()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="l"
      hideFooter={true}
    >
      {renderContent()}
      
      {/* Footer personalizado */}
      {!isLoading && !isPreloading && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '20px',
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.background
        }}>
          <Button
            variant="custom"
            size="m"
            onClick={handleCancel}
            backgroundColor="#6B7280"
            textColor="#FFFFFF"
            iconName="X"
            iconPosition="left"
          >
            Cancelar
          </Button>
          
          <Button
            variant="custom"
            size="m"
            onClick={handleSelect}
            disabled={!canSelect}
            backgroundColor={canSelect ? "#10B981" : "#9CA3AF"}
            textColor="#FFFFFF"
            iconName="MapPin"
            iconPosition="left"
          >
            Seleccionar
          </Button>
        </div>
      )}
    </Modal>
  );
}; 