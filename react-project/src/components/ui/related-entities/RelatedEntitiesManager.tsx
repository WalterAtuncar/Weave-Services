import React, { useMemo, useState, useEffect } from 'react';
import { ListChecks, Plus, Trash, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../stepper-system-form/StepperSystemForm.module.css';
import { Button } from '../button';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  SelectWrapper, 
  SelectContent, 
  SelectItem 
} from '../select';
import type { RelatedEntitiesManagerProps, RelatedEntitiesMap, TipoEntidad, EntidadRef } from './types';
import { TIPOS_ENTIDAD_MOCK, ENTIDADES_BY_TIPO_MOCK } from './mock';
import { useEntidadesPorTipo } from '../../../hooks/useEntidadesPorTipo';

const RelatedEntitiesManager: React.FC<RelatedEntitiesManagerProps> = ({
  initial,
  tipos = TIPOS_ENTIDAD_MOCK,
  entidades = ENTIDADES_BY_TIPO_MOCK,
  onChange,
  title = 'Asignar entidades',
  description = 'Relaciona el documento con distintos tipos de entidades',
}) => {
  const { theme } = useTheme();
  const [relations, setRelations] = useState<RelatedEntitiesMap>(initial || {});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [panelExiting, setPanelExiting] = useState<boolean>(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>('');
  const [entidadSeleccionada, setEntidadSeleccionada] = useState<string>('');
  const [entidadesSeleccionadasMulti, setEntidadesSeleccionadasMulti] = useState<string[]>([]);
  
  // Usar el hook para búsqueda jerárquica de entidades
  const { 
    entidades: entidadesDinamicas, 
    loading: loadingEntidades, 
    error: errorEntidades,
    searchEntidades,
    clearSearch
  } = useEntidadesPorTipo(tipoSeleccionado);
 
  // Contador de tipos de entidades asociadas (keys del mapa relations)
  const tiposCount = Object.keys(relations).length;

  // Determinar si usar entidades dinámicas o mock
  const usarEntidadesDinamicas = tipoSeleccionado && ['1', '2', '3', '4'].includes(tipoSeleccionado);
  
  const opcionesEntidad = useMemo<EntidadRef[]>(() => {
    if (usarEntidadesDinamicas) {
      return entidadesDinamicas;
    }
    return entidades[tipoSeleccionado] || [];
  }, [tipoSeleccionado, entidades, entidadesDinamicas, usarEntidadesDinamicas]);

  // Debug: monitorear tamaño de opciones cuando el tipo es Proceso
  useEffect(() => {
    if (tipoSeleccionado === '2') {
      console.log('[Procesos][UI] tipoSeleccionado:', tipoSeleccionado, 'usarDinamicas:', usarEntidadesDinamicas, 'opcionesLen:', opcionesEntidad.length, 'muestra:', opcionesEntidad.slice(0, 3));
    }
  }, [tipoSeleccionado, opcionesEntidad, usarEntidadesDinamicas]);

  const nombreTipo = (id: string) => tipos.find(t => t.id === id)?.nombre || id;

  const agregarRelacion = () => {
    if (!tipoSeleccionado) return;
    const idsSeleccionados = entidadesSeleccionadasMulti.length > 0
      ? entidadesSeleccionadasMulti
      : (entidadSeleccionada ? [entidadSeleccionada] : []);
    if (idsSeleccionados.length === 0) return;

    const entidadesAAgregar = idsSeleccionados
      .map(id => opcionesEntidad.find(e => String(e.id) === String(id)))
      .filter(Boolean) as EntidadRef[];
    if (entidadesAAgregar.length === 0) return;

    setRelations(prev => {
      const actuales = prev[tipoSeleccionado] ? [...prev[tipoSeleccionado]] : [];
      const idsActuales = new Set(actuales.map(e => String(e.id)));
      const nuevos = entidadesAAgregar.filter(e => !idsActuales.has(String(e.id)));
      if (nuevos.length === 0) return prev;
      const next = { ...prev, [tipoSeleccionado]: [...actuales, ...nuevos] };
      onChange?.(next);
      return next;
    });

    // Reset selección y cerrar panel
    setEntidadSeleccionada('');
    setEntidadesSeleccionadasMulti([]);
    cerrarPanel();
  };

  const eliminarRelacion = (tipoId: string, entidadId: string) => {
    setRelations(prev => {
      const arr = prev[tipoId] || [];
      const nextArr = arr.filter(e => String(e.id) !== String(entidadId));
      const next = { ...prev } as RelatedEntitiesMap;
      if (nextArr.length > 0) next[tipoId] = nextArr; else delete next[tipoId];
      onChange?.(next);
      return next;
    });
  };

  const abrirPanel = (presetTipo?: string) => {
    if (presetTipo) setTipoSeleccionado(presetTipo);
    setPanelExiting(false);
    setPanelOpen(true);
  };

  const cerrarPanel = () => {
    setPanelExiting(true);
    setPanelOpen(false);
    setEntidadSeleccionada('');
    setEntidadesSeleccionadasMulti([]);
    clearSearch(); // Limpiar búsqueda al cerrar panel
  };

  // Sincronizar cambios en "initial" con el estado interno
  useEffect(() => {
    setRelations(initial || {});
  }, [initial]);

  // Manejar cambio de tipo de entidad
  const handleTipoChange = (nuevoTipo: string) => {
    setTipoSeleccionado(nuevoTipo);
    setEntidadSeleccionada('');
    setEntidadesSeleccionadasMulti([]);
    clearSearch(); // Limpiar búsqueda al cambiar tipo
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepContainer}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}><ListChecks size={20} /></div>
          <div>
            <h3 className={styles.stepTitle}>{title}</h3>
            <p className={styles.stepDescription}>{description}</p>
          </div>
        </div>

        <div className={`${styles.formGrid} ${(panelOpen || panelExiting) ? styles.twoColumnsWideLeft : styles.singleColumn}`}>
          {/* Columna izquierda: Secciones por tipo */}
          <div className={styles.formSection} style={{ border: '1px solid transparent', boxShadow: 'none', gap: 8, padding: 12 }}>
            <div className={styles.sectionHeader} style={{ marginBottom: 8, paddingBottom: 6, justifyContent: 'space-between' }}>
              <div className={styles.sectionHeaderLabel}>
                <h4 className={styles.sectionTitle}>Entidades Relacionadas</h4>
              </div>
              <div className={styles.sectionHeaderIcon} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Botón + icon-only, circular, primario */}
                <Button variant="primary" size="s" iconName="Plus" onClick={() => abrirPanel()} />
              </div>
            </div>

            {Object.keys(relations).length === 0 ? (
              <div className={styles.itemList} style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className={styles.mutedText}>Aún no has asociado entidades</span>
              </div>
            ) : (
              <div className={styles.stepContainer} style={{ gap: 8 }}>
                {Object.entries(relations).map(([tipoId, items]) => {
                  const isCollapsed = !!collapsed[tipoId];
                  return (
                    <div key={tipoId} className={styles.formSection} style={{ border: '1px solid transparent', boxShadow: 'none', padding: isCollapsed ? 8 : 12, gap: isCollapsed ? 6 : 12 }}>
                      <div className={styles.sectionHeader} style={{ marginBottom: isCollapsed ? 4 : 8, paddingBottom: isCollapsed ? 4 : 6, justifyContent: 'flex-start' }}>
                        <div className={styles.sectionHeaderLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Button
                            variant="action"
                            size="s"
                            iconName={isCollapsed ? 'ChevronDown' : 'ChevronUp'}
                            onClick={() => setCollapsed(prev => ({ ...prev, [tipoId]: !prev[tipoId] }))}
                          />
                          <h5 className={styles.sectionTitle}>{nombreTipo(tipoId)}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                            {items.length > 0 && (
                              <span
                                style={{
                                  minWidth: 24,
                                  width: 24,
                                  height: 24,
                                  padding: 0,
                                  borderRadius: 999,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                                  color: theme === 'dark' ? '#fff' : '#0b2138',
                                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'}`
                                }}
                                title={`${items.length} entidad${items.length === 1 ? '' : 'es'} asociada${items.length === 1 ? '' : 's'}`}
                              >
                                {items.length}
                              </span>
                            )}
                            {!isCollapsed && (
                              // Botón + por tipo, al lado derecho del label
                              <Button variant="primary" size="s" iconName="Plus" onClick={() => abrirPanel(tipoId)} />
                            )}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            key={`list-${tipoId}`}
                            className={styles.selectedList}
                            style={{ overflow: 'hidden', transformOrigin: 'top center' }}
                            initial={{ scaleY: 0, opacity: 0, filter: 'blur(6px)' }}
                            animate={{ scaleY: 1, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ scaleY: 0, opacity: 0, filter: 'blur(6px)' }}
                            transition={{ duration: 0.675, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {items.map((it) => (
                              <div key={`${tipoId}-${it.id}`} className={styles.selectedItem} style={{ border: '1px solid transparent', boxShadow: 'none' }}>
                                <div className={styles.selectedMain}>
                                  <span className={styles.selectedTitle}>{it.nombre}</span>
                                </div>
                                <button className={styles.removeBtn} onClick={() => eliminarRelacion(tipoId, String(it.id))} title="Eliminar">
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.buttonGroup} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button className={`${styles.button} ${styles.primary}`} onClick={() => { /* Mantener botón para flujo futuro */ }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} />
                Guardar información
              </Button>
            </div>
          </div>

          {/* Columna derecha: Panel de selección (colapsable con Framer Motion) */}
          <AnimatePresence initial={false} onExitComplete={() => setPanelExiting(false)}>
            {panelOpen && (
              <motion.div
                key="select-panel"
                className={styles.formSection}
                style={{ border: '1px solid transparent', boxShadow: 'none', transformOrigin: 'right center', padding: 12, gap: 12 }}
                initial={{ scaleX: 0, opacity: 0, filter: 'blur(6px)' }}
                animate={{ scaleX: 1, opacity: 1, filter: 'blur(0px)' }}
                exit={{ scaleX: 0, opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.675, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.sectionHeader} style={{ marginBottom: 8, paddingBottom: 6, justifyContent: 'space-between' }}>
                  <div className={styles.sectionHeaderLabel}>
                    <h4 className={styles.sectionTitle}>Seleccionar y asociar</h4>
                  </div>
                  <div className={styles.sectionHeaderIcon}>
                    {/* Botón de cierre X en modo icon-only circular con estilo secundario (outline) */}
                    <Button variant="outline" size="s" iconName="X" onClick={cerrarPanel} />
                  </div>
                </div>

                <div className={styles.formGrid} style={{ gap: 12 }}>
                  <div className={styles.fieldGroup}>
                    <SelectWrapper
                      label="Tipo de Entidad"
                      value={tipoSeleccionado}
                      onValueChange={handleTipoChange}
                      placeholder="Selecciona tipo"
                    >
                      <SelectContent>
                        {tipos.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </SelectWrapper>
                  </div>

                  <div className={styles.fieldGroup}>
                    <SelectWrapper
                      label="Seleccionar entidad"
                      multiSelected={true}
                      selectedValues={entidadesSeleccionadasMulti}
                      onValuesChange={setEntidadesSeleccionadasMulti}
                      placeholder={
                        !tipoSeleccionado 
                          ? 'Primero selecciona el tipo'
                          : loadingEntidades 
                            ? 'Cargando entidades...'
                            : 'Elige una entidad'
                      }
                      searchable
                      searchPlaceholder="Buscar entidad..."
                      disabled={!tipoSeleccionado || loadingEntidades}
                      onSearch={usarEntidadesDinamicas ? searchEntidades : undefined}
                    >
                      <SelectContent>
                        {loadingEntidades ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-600">Cargando entidades...</span>
                          </div>
                        ) : errorEntidades ? (
                          <div className="flex items-center justify-center p-4">
                            <span className="text-sm text-red-600">{errorEntidades}</span>
                          </div>
                        ) : opcionesEntidad.length === 0 ? (
                          <div className="flex items-center justify-center p-4">
                            <span className="text-sm text-gray-600">No se encontraron entidades</span>
                          </div>
                        ) : (
                          opcionesEntidad.map(e => (
                            <SelectItem key={String(e.id)} value={String(e.id)}>{e.nombre}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </SelectWrapper>
                  </div>

                  <div className={styles.buttonGroup} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      className={`${styles.button} ${styles.primary}`}
                      onClick={agregarRelacion}
                      disabled={!tipoSeleccionado || (entidadesSeleccionadasMulti.length === 0 && !entidadSeleccionada)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Plus size={16} />
                      Asociar Entidad
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RelatedEntitiesManager;