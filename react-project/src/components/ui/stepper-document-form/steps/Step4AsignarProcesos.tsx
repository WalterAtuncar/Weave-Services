import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListChecks } from 'lucide-react';
import styles from '../../stepper-system-form/StepperSystemForm.module.css';
import { DocumentFormData, DocumentFormErrors, Proceso } from '../types';
import { procesosService } from '../../../../services';

interface Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
  procesos: Proceso[];
}

const Step4AsignarProcesos: React.FC<Props> = ({ formData, errors, onDataChange, onErrorChange, procesos }) => {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; nombre: string; codigo?: string | null; nombrePadre?: string | null; nombreTipoProceso?: string | null }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<Record<string, { id: string; nombre: string; codigo?: string | null; nombrePadre?: string | null; nombreTipoProceso?: string | null }>>({});
  const [jerarquiaIndex, setJerarquiaIndex] = useState<Record<string, { id: string; nombre: string; codigo?: string | null; nombrePadre?: string | null; nombreTipoProceso?: string | null }>>({});
  const debounceRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filteredProcesos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return procesos;
    return procesos.filter(p => p.nombre.toLowerCase().includes(term));
  }, [procesos, search]);

  const selected = new Set(formData.procesosIds || []);

  const toggleProceso = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onDataChange({ procesosIds: Array.from(next) });
    // Limpiar error si existía
    if (errors.procesosIds) onErrorChange({ procesosIds: undefined });
  };

  // Resolver organizacionId desde localStorage (patrón usado en otros módulos)
  const resolveOrganizationId = (): number | null => {
    try {
      const raw = localStorage.getItem('userSession');
      if (!raw) return null;
      const session = JSON.parse(raw);
      const orgId = session?.organizacion?.organizacionId;
      if (typeof orgId === 'number') return orgId;
      if (typeof orgId === 'string') {
        const parsed = Number(orgId);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Mapear desde API de procesos a sugerencia ligera para UI
  const mapProcesoFromAPI = (item: any) => {
    const id = String(item.procesoId || item.ProcesoId || item.id);
    const nombre = item.nombreProceso || item.NombreProceso || item.nombre;
    const codigo = item.codigoProceso || item.CodigoProceso || item.codigo || null;
    const nombrePadre = item.nombrePadre || (item.procesoParent?.nombre) || null;
    const nombreTipoProceso = item.nombreTipoProceso || item.tipoProcesoNombre || null;
    return { id, nombre, codigo, nombrePadre, nombreTipoProceso };
  };

  // Cargar jerarquía completa para indexar por ID y evitar llamadas por ID
  useEffect(() => {
    const orgId = resolveOrganizationId();
    if (!orgId) return;
    const fetchJerarquia = async () => {
      try {
        const resp = await procesosService.getJerarquiaProcesos({ organizacionId: orgId });
        const payload: any = resp?.data;
        const items = Array.isArray(payload?.jerarquia)
          ? payload.jerarquia
          : Array.isArray(payload?.data?.jerarquia)
            ? payload.data.jerarquia
            : [];
        const nameMap: Record<number, string> = {};
        items.forEach((it: any) => {
          const idNum = Number(it.procesoId);
          if (Number.isFinite(idNum)) nameMap[idNum] = it.nombreProceso;
        });
        const index: Record<string, { id: string; nombre: string; codigo?: string | null; nombrePadre?: string | null; nombreTipoProceso?: string | null }> = {};
        items.forEach((it: any) => {
          const mapped = mapProcesoFromAPI(it);
          if (!mapped.nombrePadre && it.padreId && nameMap[it.padreId]) {
            mapped.nombrePadre = nameMap[it.padreId];
          }
          index[mapped.id] = mapped;
        });
        setJerarquiaIndex(index);
      } catch (e) {
        console.warn('No se pudo cargar jerarquía de procesos', e);
      }
    };
    fetchJerarquia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce usando el servicio paginado
  useEffect(() => {
    const term = search.trim();
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (term.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        // Solo enviar nombreProceso y agregar organizacionId desde localStorage
        const orgId = resolveOrganizationId();
        const resp = await procesosService.getProcesosPaginated({
          page: 1,
          pageSize: 8,
          orderBy: 'fechaCreacion',
          ascending: false,
          nombre: term,
          organizacionId: orgId ?? undefined
        });
        const data: any = resp?.data || {};
        const rawItems = Array.isArray(data.procesos)
          ? data.procesos
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.items)
              ? data.items
              : Array.isArray(data.result)
                ? data.result
                : Array.isArray(data)
                  ? data
                  : [];
        const mapped = rawItems.map(mapProcesoFromAPI);
        setSuggestions(mapped);
        setShowDropdown(true);
      } catch (e) {
        console.error('Error buscando procesos:', e);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [search]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(ev.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectSuggestion = (s: { id: string; nombre: string; codigo?: string | null; nombrePadre?: string | null; nombreTipoProceso?: string | null }) => {
    if (!s?.id) return;
    const next = new Set(formData.procesosIds || []);
    next.add(s.id);
    onDataChange({ procesosIds: Array.from(next) });
    if (errors.procesosIds) onErrorChange({ procesosIds: undefined });
    setSelectedDetails(prev => ({ ...prev, [s.id]: s }));
    setSearch('');
    setShowDropdown(false);
  };

  const removeSelected = (id: string) => {
    const next = new Set(formData.procesosIds || []);
    next.delete(id);
    onDataChange({ procesosIds: Array.from(next) });
    setSelectedDetails(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Hidratación de detalles cuando hay IDs seleccionados sin datos (usar jerarquía indexada)
  useEffect(() => {
    const hydrate = async () => {
      const ids = formData.procesosIds || [];
      if (!ids || ids.length === 0) return;
      for (const id of ids) {
        if (selectedDetails[id]) continue;
        // 1) Intentar con la base de referencia (procesos prop)
        const ref = procesos.find(p => String(p.id) === String(id));
        if (ref && ref.nombre) {
          setSelectedDetails(prev => ({ ...prev, [id]: { id: String(id), nombre: ref.nombre } }));
          continue;
        }
        // 2) Usar jerarquía indexada
        const fromIndex = jerarquiaIndex[id];
        if (fromIndex) {
          setSelectedDetails(prev => ({ ...prev, [id]: fromIndex }));
        }
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.procesosIds, procesos, jerarquiaIndex]);

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepContainer}>
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}><ListChecks size={20} /></div>
          <div>
            <h3 className={styles.stepTitle}>Asignar procesos</h3>
            <p className={styles.stepDescription}>Selecciona uno o varios procesos relacionados al documento.</p>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Búsqueda</h4>
            <p className={styles.sectionDescription}>Filtra por nombre para encontrar procesos rápidamente.</p>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.fieldGroup} ${styles.autocompleteContainer}`} ref={dropdownRef}>
              <label className={styles.fieldLabel}>Buscar procesos</label>
              <input
                type="text"
                className={styles.fieldInput}
                placeholder="Ingresa al menos 3 caracteres (solo por nombre)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              />

              {showDropdown && (
                <div className={styles.suggestionsDropdown}>
                  {isLoading ? (
                    <div className={styles.suggestionItem}>Buscando...</div>
                  ) : suggestions.length === 0 ? (
                    <div className={styles.suggestionItem}>Sin resultados</div>
                  ) : (
                    suggestions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.suggestionItem}
                        onClick={() => handleSelectSuggestion(s)}
                      >
                        <div className={styles.suggestionMain}>
                          <span className={styles.suggestionTitle}>{s.nombre}</span>
                          {s.codigo ? <span className={styles.suggestionCode}>[{s.codigo}]</span> : null}
                        </div>
                        <div className={styles.suggestionMeta}>
                          {s.nombreTipoProceso ? <span className={styles.mutedText}>Tipo: {s.nombreTipoProceso}</span> : null}
                          {s.nombrePadre ? <span className={styles.mutedText}>Padre: {s.nombrePadre}</span> : null}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.sectionTitle}>Listado de procesos</h4>
            <p className={styles.sectionDescription}>Seleccionados y base de referencia.</p>
          </div>

          {/* Seleccionados (detalles enriquecidos) */}
          <div className={`${styles.formGrid} ${styles.fullWidth}`}>
            <div className={styles.selectedList}>
              {(formData.procesosIds || []).length === 0 ? (
                <p className={styles.fieldHint}>Aún no has seleccionado procesos.</p>
              ) : (
                (formData.procesosIds || []).map(id => {
                  const info = selectedDetails[id];
                  const refName = filteredProcesos.find(p => String(p.id) === id)?.nombre;
                  const label = info?.nombre || refName || 'Cargando…';
                  return (
                    <div key={id} className={styles.selectedItem}>
                      <div className={styles.selectedMain}>
                        <span className={styles.selectedTitle}>{info?.nombrePadre ? `${info.nombrePadre} / ${label}` : label}</span>
                        {info?.codigo ? <span className={styles.chip}>Código: {info.codigo}</span> : null}
                        {info?.nombreTipoProceso ? <span className={styles.chip}>Tipo: {info.nombreTipoProceso}</span> : null}
                        {info?.nombrePadre ? <span className={styles.chip}>Padre: {info.nombrePadre}</span> : null}
                      </div>
                      <button type="button" className={styles.removeBtn} onClick={() => removeSelected(id)}>Quitar</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Base de referencia (checkboxes iniciales) */}
          <div className={`${styles.formGrid} ${styles.fullWidth}`}>
            {filteredProcesos.length === 0 ? (
              <p className={styles.fieldHint}>No se encontraron procesos en la base de referencia.</p>
            ) : (
              filteredProcesos.map(p => (
                <div key={p.id} className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected.has(String(p.id))}
                    onChange={() => toggleProceso(String(p.id))}
                    id={`proc-${p.id}`}
                  />
                  <label htmlFor={`proc-${p.id}`} className={styles.checkboxLabel}>{p.nombre}</label>
                </div>
              ))
            )}
          </div>

          {errors.procesosIds && <p className={styles.fieldError}>{errors.procesosIds}</p>}
        </div>
      </div>
    </div>
  );
};

export default Step4AsignarProcesos;