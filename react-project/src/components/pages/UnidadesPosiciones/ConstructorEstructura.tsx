import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
  Hash,
  Building,
  UserPlus,
  Briefcase,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Modal } from '../../ui/modal/Modal';
import { SearchableSelect } from '../../ui/searchable-select/SearchableSelect';
import { unidadesOrgMockData } from '../../../mocks/unidadesOrgMocks';
import { posicionesMockData } from '../../../mocks/posicionesMocks';
import { UnidadOrganizacional } from '../../../models/UnidadesOrg';
import { Posicion } from '../../../models/Posiciones';
import { TipoUnidad, TIPOS_UNIDAD } from '../../../services/types/unidades-org.types';
import { CategoriaPosicion } from '../../../services/types/posiciones.types';
import { CATEGORIAS_POSICION } from '../../../services/types/posiciones.types';
import styles from './ConstructorEstructura.module.css';

// Tipos para el estado del componente
interface UnidadConEstado extends UnidadOrganizacional {
  expandido: boolean;
  posiciones: Posicion[];
  nivel: number;
}

interface ModalState {
  isOpen: boolean;
  mode: 'create-unidad' | 'edit-unidad' | 'create-posicion' | 'edit-posicion' | 'view' | null;
  selectedUnidad?: UnidadConEstado;
  selectedPosicion?: Posicion;
  parenteUnidadId?: number | null;
}

interface FormDataUnidad {
  nombre: string;
  nombreCorto: string;
  tipoUnidad: number;
  objetivo: string;
  centroCosto: string;
  posicionCategoria: number;
}

interface FormDataPosicion {
  nombre: string;
  categoria: number;
  objetivo: string;
  ordenImpresion: number;
}

// Props del componente
export interface ConstructorEstructuraProps {
  organizacionData: {
    organizacionId: number;
    codigo: string;
    razonSocial: string;
    logoUrl?: string;
  };
  onSave?: (estructura: UnidadConEstado[]) => void;
  readOnly?: boolean;
}

export const ConstructorEstructura: React.FC<ConstructorEstructuraProps> = ({ 
  organizacionData, 
  onSave, 
  readOnly = false 
}) => {
  const { colors, theme } = useTheme();

  // Estados principales
  const [unidades, setUnidades] = useState<UnidadConEstado[]>([]);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, mode: null });
  const [selectedUnidadId, setSelectedUnidadId] = useState<number | null>(null);
  
  // Estados de formularios
  const [formUnidad, setFormUnidad] = useState<FormDataUnidad>({
    nombre: '',
    nombreCorto: '',
            tipoUnidad: TipoUnidad.CORPORATIVO,
    objetivo: '',
    centroCosto: '',
            posicionCategoria: CategoriaPosicion.Directivo
  });

  const [formPosicion, setFormPosicion] = useState<FormDataPosicion>({
    nombre: '',
            categoria: CategoriaPosicion.Directivo,
    objetivo: '',
    ordenImpresion: 1
  });

  // Opciones para selects usando los enums y constantes de los types
  const tiposUnidad = TIPOS_UNIDAD.map(tipo => ({
    value: tipo.value,
    label: tipo.label
  }));

  const categoriasPosicion = CATEGORIAS_POSICION.map(categoria => ({
    value: categoria.value,
    label: categoria.label
  }));

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstructuraInicial();
  }, [organizacionData]);

  const cargarEstructuraInicial = () => {
    // Filtrar unidades por organización
    const unidadesOrg = unidadesOrgMockData.unidadesOrganizacionales
      .filter(u => u.organizacionId === organizacionData.organizacionId);
    
    // Obtener posiciones relacionadas
    const posicionesData = posicionesMockData.posiciones;
    
    // Crear estructura jerárquica con estado
    const unidadesConEstado: UnidadConEstado[] = unidadesOrg.map(unidad => ({
      ...unidad,
      // Propiedades faltantes con valores por defecto
      creadoPor: unidad.creadoPor || 'sistema',
      fechaCreacion: unidad.fechaCreacion || new Date().toISOString(),
      registroEliminado: unidad.registroEliminado || false,
      // Propiedades del estado del componente
      expandido: true,
      posiciones: posicionesData.filter(p => p.unidadesOrgId === unidad.unidadesOrgId),
      nivel: calcularNivel(unidad as UnidadOrganizacional, unidadesOrg)
    }));

    // Ordenar por jerarquía (padres primero, luego hijos)
    const unidadesOrdenadas = ordenarPorJerarquia(unidadesConEstado);
    setUnidades(unidadesOrdenadas);
  };

  const calcularNivel = (unidad: UnidadOrganizacional, todasUnidades: UnidadOrganizacional[], visitados = new Set<number>()): number => {
    if (!unidad.unidadPadreId) return 0;
    
    // Prevenir bucles infinitos
    if (visitados.has(unidad.unidadesOrgId)) return 0;
    visitados.add(unidad.unidadesOrgId);
    
    const padre = todasUnidades.find(u => u.unidadesOrgId === unidad.unidadPadreId);
    if (!padre) return 0;
    
    return 1 + calcularNivel(padre, todasUnidades, visitados);
  };

  const ordenarPorJerarquia = (unidades: UnidadConEstado[]): UnidadConEstado[] => {
    const resultado: UnidadConEstado[] = [];
    const procesados = new Set<number>();

    const agregarUnidadYHijos = (unidadId: number | null, nivel: number = 0) => {
      const unidadesEnNivel = unidades.filter(u => 
        u.unidadPadreId === unidadId && !procesados.has(u.unidadesOrgId)
      );

      unidadesEnNivel.sort((a, b) => a.nombre.localeCompare(b.nombre));

      unidadesEnNivel.forEach(unidad => {
        unidad.nivel = nivel;
        resultado.push(unidad);
        procesados.add(unidad.unidadesOrgId);
        agregarUnidadYHijos(unidad.unidadesOrgId, nivel + 1);
      });
    };

    agregarUnidadYHijos(null);
    return resultado;
  };

  // Funciones de expansión/colapso
  const toggleExpansion = (unidadId: number) => {
    setUnidades(prev => 
      prev.map(u => 
        u.unidadesOrgId === unidadId 
          ? { ...u, expandido: !u.expandido }
          : u
      )
    );
  };

  // Funciones de modal
  const abrirModalCrearUnidad = (parenteId: number | null = null) => {
    setFormUnidad({
      nombre: '',
      nombreCorto: '',
              tipoUnidad: parenteId ? TipoUnidad.DEPARTAMENTO : TipoUnidad.CORPORATIVO,
      objetivo: '',
      centroCosto: '',
              posicionCategoria: parenteId ? CategoriaPosicion.Jefatura : CategoriaPosicion.Directivo
    });
    
    setModal({
      isOpen: true,
      mode: 'create-unidad',
      parenteUnidadId: parenteId
    });
  };

  const abrirModalCrearPosicion = (unidadId: number) => {
    const unidad = unidades.find(u => u.unidadesOrgId === unidadId);
    setFormPosicion({
      nombre: '',
      categoria: CategoriaPosicion.Especialista,
      objetivo: '',
      ordenImpresion: (unidad?.posiciones.length || 0) + 1
    });
    
    setModal({
      isOpen: true,
      mode: 'create-posicion',
      selectedUnidad: unidad
    });
  };

  const cerrarModal = () => {
    setModal({ isOpen: false, mode: null });
  };

  // Funciones de guardado (simuladas)
  const guardarUnidad = () => {
    if (!formUnidad.nombre.trim()) return;

    const nuevaUnidad: UnidadConEstado = {
      unidadesOrgId: Math.max(...unidades.map(u => u.unidadesOrgId)) + 1,
      organizacionId: organizacionData.organizacionId,
      unidadPadreId: modal.parenteUnidadId,
      tipoUnidad: formUnidad.tipoUnidad,
      nombre: formUnidad.nombre,
      nombreCorto: formUnidad.nombreCorto || null,
      objetivo: formUnidad.objetivo || null,
      posicionCategoria: formUnidad.posicionCategoria,
      centroCosto: formUnidad.centroCosto || null,
      version: 1,
      estado: 'ACTIVO',
      expandido: true,
      posiciones: [],
      nivel: modal.parenteUnidadId ? 
        (unidades.find(u => u.unidadesOrgId === modal.parenteUnidadId)?.nivel || 0) + 1 : 0
    };

    setUnidades(prev => {
      const nuevasUnidades = [...prev, nuevaUnidad];
      return ordenarPorJerarquia(nuevasUnidades);
    });

    cerrarModal();
  };

  const guardarPosicion = () => {
    if (!formPosicion.nombre.trim() || !modal.selectedUnidad) return;

    const nuevaPosicion: Posicion = {
      posicionId: Math.max(...unidades.flatMap(u => u.posiciones).map(p => p.posicionId)) + 1,
      unidadesOrgId: modal.selectedUnidad.unidadesOrgId,
      nombre: formPosicion.nombre,
      categoria: formPosicion.categoria,
      objetivo: formPosicion.objetivo || null,
      ordenImpresion: formPosicion.ordenImpresion,
      version: 1,
      estado: 'ACTIVO'
    };

    setUnidades(prev => 
      prev.map(u => 
        u.unidadesOrgId === modal.selectedUnidad!.unidadesOrgId
          ? { ...u, posiciones: [...u.posiciones, nuevaPosicion] }
          : u
      )
    );

    cerrarModal();
  };

  // Función para obtener el icono por tipo de unidad
  const getIconoTipoUnidad = (tipo: string) => {
    switch (tipo) {
      case 'DIRECCION': return <Building2 className={styles.iconoUnidad} />;
      case 'GERENCIA': return <Building className={styles.iconoUnidad} />;
      case 'DEPARTAMENTO': return <Briefcase className={styles.iconoUnidad} />;
      default: return <Target className={styles.iconoUnidad} />;
    }
  };

  // Función para obtener color por nivel
  const getColorNivel = (nivel: number) => {
    const colores = [
      'var(--primary)', // Nivel 0
      'hsl(220, 70%, 50%)', // Nivel 1
      'hsl(200, 65%, 45%)', // Nivel 2
      'hsl(180, 60%, 40%)', // Nivel 3
      'hsl(160, 55%, 35%)', // Nivel 4+
    ];
    return colores[Math.min(nivel, colores.length - 1)];
  };

  // Función para obtener color de badge por categoría
  const getColorCategoria = (categoria: string) => {
    const colores: Record<string, string> = {
      'EJECUTIVO': 'hsl(340, 82%, 52%)',
      'GERENCIAL': 'hsl(262, 83%, 58%)',
      'JEFATURA': 'hsl(221, 83%, 53%)',
      'COORDINACION': 'hsl(142, 76%, 36%)',
      'ESPECIALISTA': 'hsl(32, 95%, 44%)',
      'ANALISTA': 'hsl(188, 95%, 37%)',
      'TECNICO': 'hsl(48, 96%, 53%)',
      'ASISTENTE': 'hsl(280, 100%, 70%)'
    };
    return colores[categoria] || 'var(--muted-foreground)';
  };

  // Renderizar unidades
  const renderUnidades = () => {
    return unidades.map((unidad, index) => {
      const tieneHijos = unidades.some(u => u.unidadPadreId === unidad.unidadesOrgId);
      const estaVisible = unidad.unidadPadreId === null || 
        unidades.find(u => u.unidadesOrgId === unidad.unidadPadreId)?.expandido;

      if (!estaVisible) return null;

      // Crear key única y segura
      const uniqueKey = `unidad-${unidad.unidadesOrgId || index}-${unidad.nombre.replace(/\s+/g, '-')}`;

      return (
        <div key={uniqueKey} className={styles.unidadContainer}>
          {/* Líneas de conexión */}
          {unidad.nivel > 0 && (
            <div 
              className={styles.lineaConexion}
              style={{ 
                left: `${(unidad.nivel - 1) * 24 + 12}px`,
                borderColor: getColorNivel(unidad.nivel - 1)
              }}
            />
          )}

          {/* Tarjeta de unidad */}
          <div 
            className={`${styles.unidadCard} ${selectedUnidadId === unidad.unidadesOrgId ? styles.selected : ''}`}
            style={{ 
              marginLeft: `${unidad.nivel * 24}px`,
              borderLeftColor: getColorNivel(unidad.nivel)
            }}
            onClick={() => setSelectedUnidadId(
              selectedUnidadId === unidad.unidadesOrgId ? null : unidad.unidadesOrgId
            )}
          >
            {/* Header de la unidad */}
            <div className={styles.unidadHeader}>
              <div className={styles.unidadInfo}>
                {tieneHijos && (
                  <button
                    className={styles.expandButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpansion(unidad.unidadesOrgId);
                    }}
                  >
                    {unidad.expandido ? 
                      <ChevronDown size={16} /> : 
                      <ChevronRight size={16} />
                    }
                  </button>
                )}
                
                {getIconoTipoUnidad(unidad.tipoUnidad)}
                
                <div className={styles.unidadTexto}>
                  <h4 className={styles.unidadNombre}>{unidad.nombre}</h4>
                  <div className={styles.unidadDetalles}>
                    <span className={styles.tipoUnidad}>{unidad.tipoUnidad}</span>
                    {unidad.nombreCorto && (
                      <span className={styles.nombreCorto}>({unidad.nombreCorto})</span>
                    )}
                    {unidad.centroCosto && (
                      <span className={styles.centroCosto}>
                        <Hash size={12} />
                        {unidad.centroCosto}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!readOnly && (
                <div className={styles.unidadAcciones}>
                  <Button
                    variant="ghost"
                    size="s"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModalCrearPosicion(unidad.unidadesOrgId);
                    }}
                    className={styles.botonAccion}
                  >
                    <UserPlus size={14} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="s"
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModalCrearUnidad(unidad.unidadesOrgId);
                    }}
                    className={styles.botonAccion}
                  >
                    <Plus size={14} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="s"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar edición
                    }}
                    className={styles.botonAccion}
                  >
                    <Edit size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Objetivo de la unidad */}
            {unidad.objetivo && (
              <div className={styles.unidadObjetivo}>
                <Target size={12} />
                <span>{unidad.objetivo}</span>
              </div>
            )}

            {/* Posiciones de la unidad */}
            {unidad.posiciones.length > 0 && (
              <div className={styles.posicionesContainer}>
                <div className={styles.posicionesHeader}>
                  <Users size={14} />
                  <span>Posiciones ({unidad.posiciones.length})</span>
                </div>
                <div className={styles.posicionesList}>
                  {unidad.posiciones.map((posicion, posIndex) => {
                    const posicionKey = `posicion-${posicion.posicionId || posIndex}-${unidad.unidadesOrgId}-${posicion.nombre.replace(/\s+/g, '-')}`;
                    return (
                    <div 
                      key={posicionKey} 
                      className={styles.posicionBadge}
                      style={{ 
                        backgroundColor: `${getColorCategoria(posicion.categoria)}15`,
                        borderColor: getColorCategoria(posicion.categoria),
                        color: getColorCategoria(posicion.categoria)
                      }}
                    >
                      <span className={styles.posicionNombre}>{posicion.nombre}</span>
                      <span className={styles.posicionCategoria}>{posicion.categoria}</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  // Renderizar el modal
  const renderModal = () => {
    if (!modal.isOpen) return null;

    const esCreacionUnidad = modal.mode === 'create-unidad';
    const esCreacionPosicion = modal.mode === 'create-posicion';

    const saveButtonText = esCreacionUnidad ? 'Crear Unidad' : 'Crear Posición';
    const canSave = esCreacionUnidad 
      ? formUnidad.nombre.trim().length > 0
      : formPosicion.nombre.trim().length > 0;

    const handleSave = () => {
      if (esCreacionUnidad) {
        guardarUnidad();
      } else {
        guardarPosicion();
      }
    };

    return (
      <Modal
        isOpen={modal.isOpen}
        onClose={cerrarModal}
        title={
          esCreacionUnidad 
            ? modal.parenteUnidadId 
              ? 'Crear Sub-Unidad'
              : 'Crear Unidad Raíz'
            : esCreacionPosicion
              ? 'Crear Posición'
              : 'Detalle'
        }
        size="md"
        saveButtonText={saveButtonText}
        onSave={handleSave}
        saveDisabled={!canSave}
      >
        <div className={styles.modalContent}>
          {esCreacionUnidad && (
            <>
              {modal.parenteUnidadId && (
                <div className={styles.contextInfo}>
                  <AlertCircle size={16} />
                  <span>
                    Se creará como sub-unidad de: <strong>
                      {unidades.find(u => u.unidadesOrgId === modal.parenteUnidadId)?.nombre}
                    </strong>
                  </span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Nombre de la Unidad *</label>
                <Input
                  value={formUnidad.nombre}
                  onChange={(e) => setFormUnidad(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Gerencia de Tecnología"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre Corto</label>
                  <Input
                    value={formUnidad.nombreCorto}
                    onChange={(e) => setFormUnidad(prev => ({ ...prev, nombreCorto: e.target.value }))}
                    placeholder="Ej: GTI"
                  />
                </div>

                <div className={styles.formGroup}>
                  <SearchableSelect
                    label="Tipo de Unidad"
                    value={formUnidad.tipoUnidad}
                    onChange={(value) => setFormUnidad(prev => ({ ...prev, tipoUnidad: Number(value) }))}
                    options={tiposUnidad}
                    placeholder="Seleccione tipo de unidad"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <SearchableSelect
                    label="Categoría de Posición"
                    value={formUnidad.posicionCategoria}
                    onChange={(value) => setFormUnidad(prev => ({ ...prev, posicionCategoria: Number(value) }))}
                    options={categoriasPosicion}
                    placeholder="Seleccione categoría"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Centro de Costo</label>
                  <Input
                    value={formUnidad.centroCosto}
                    onChange={(e) => setFormUnidad(prev => ({ ...prev, centroCosto: e.target.value }))}
                    placeholder="Ej: CC-001"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Objetivo</label>
                <textarea
                  className={styles.textarea}
                  value={formUnidad.objetivo}
                  onChange={(e) => setFormUnidad(prev => ({ ...prev, objetivo: e.target.value }))}
                  placeholder="Describe el objetivo principal de esta unidad..."
                  rows={3}
                />
              </div>
            </>
          )}

          {esCreacionPosicion && (
            <>
              <div className={styles.contextInfo}>
                <Users size={16} />
                <span>
                  Se creará en la unidad: <strong>{modal.selectedUnidad?.nombre}</strong>
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>Nombre de la Posición *</label>
                <Input
                  value={formPosicion.nombre}
                  onChange={(e) => setFormPosicion(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Desarrollador Frontend Senior"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <SearchableSelect
                    label="Categoría"
                    value={formPosicion.categoria}
                    onChange={(value) => setFormPosicion(prev => ({ ...prev, categoria: Number(value) }))}
                    options={categoriasPosicion}
                    placeholder="Seleccione categoría"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Orden de Impresión</label>
                  <Input
                    type="number"
                    value={formPosicion.ordenImpresion}
                    onChange={(e) => setFormPosicion(prev => ({ ...prev, ordenImpresion: parseInt(e.target.value) || 1 }))}
                    min={1}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Objetivo</label>
                <textarea
                  className={styles.textarea}
                  value={formPosicion.objetivo}
                  onChange={(e) => setFormPosicion(prev => ({ ...prev, objetivo: e.target.value }))}
                  placeholder="Describe las responsabilidades principales de esta posición..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className={styles.constructorContainer}>
      {/* Header del constructor */}
      <div className={styles.constructorHeader}>
        <div className={styles.organizacionInfo}>
          {organizacionData.logoUrl && (
            <img 
              src={organizacionData.logoUrl} 
              alt="Logo" 
              className={styles.organizacionLogo}
            />
          )}
          <div>
            <h2 className={styles.organizacionNombre}>{organizacionData.razonSocial}</h2>
            <p className={styles.organizacionCodigo}>Código: {organizacionData.codigo}</p>
          </div>
        </div>

        {!readOnly && (
          <div className={styles.headerAcciones}>
            <Button 
              onClick={() => abrirModalCrearUnidad(null)}
              className={styles.botonPrincipal}
            >
              <Plus size={16} />
              Nueva Unidad Raíz
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className={styles.estadisticas}>
        <div className={styles.estadistica}>
          <Building2 size={20} />
          <div>
            <span className={styles.estadisticaNumero}>{unidades.length}</span>
            <span className={styles.estadisticaLabel}>Unidades</span>
          </div>
        </div>
        <div className={styles.estadistica}>
          <Users size={20} />
          <div>
            <span className={styles.estadisticaNumero}>
              {unidades.reduce((total, u) => total + u.posiciones.length, 0)}
            </span>
            <span className={styles.estadisticaLabel}>Posiciones</span>
          </div>
        </div>
        <div className={styles.estadistica}>
          <Target size={20} />
          <div>
            <span className={styles.estadisticaNumero}>
              {Math.max(...unidades.map(u => u.nivel), 0) + 1}
            </span>
            <span className={styles.estadisticaLabel}>Niveles</span>
          </div>
        </div>
      </div>

      {/* Área de construcción */}
      <div className={styles.areaConstructor}>
        {unidades.length === 0 ? (
          <div className={styles.estadoVacio}>
            <Building2 size={48} />
            <h3>No hay unidades organizacionales</h3>
            <p>Comienza creando una unidad raíz para {organizacionData.razonSocial}</p>
            {!readOnly && (
              <Button 
                onClick={() => abrirModalCrearUnidad(null)}
                className={styles.botonCrearPrimero}
              >
                <Plus size={16} />
                Crear Primera Unidad
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.estructuraVisual}>
            {renderUnidades()}
          </div>
        )}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};
