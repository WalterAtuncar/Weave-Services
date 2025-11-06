import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Network } from 'lucide-react';
import { SystemFormData, SystemFormErrors, Sistema, Servidor } from '../types';
import styles from '../StepperSystemForm.module.css';
import { Label } from '../../label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../select';
import { ChipGroup, ChipItem } from '../../chip';
import { sistemaServidorService } from '../../../../services/sistema-servidor.service';

interface Step2HierarchyServersProps {
  formData: SystemFormData;
  errors: SystemFormErrors;
  onDataChange: (data: Partial<SystemFormData>) => void;
  sistemas: Sistema[];
  servidores: Servidor[];
  loading?: boolean;
}

const Step2HierarchyServers: React.FC<Step2HierarchyServersProps> = ({
  formData,
  errors,
  onDataChange,
  sistemas = [],
  servidores = [],
  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [newServidorId, setNewServidorId] = useState('');

  // Hydratación inicial de servidores en modo edición
  const hydratedServersRef = useRef(false);
  useEffect(() => {
    // Ejecutar solo una vez cuando:
    // - Estamos en edición (tenemos formData.id)
    // - Ya cargaron los catálogos de servidores (para mostrar nombres en chips)
    // - Aún no hay servidorIds en el form (evitar sobreescribir cambios del usuario)
    if (hydratedServersRef.current) return;
    if (!formData?.id) return;
    if (loading) return;
    if (!Array.isArray(servidores) || servidores.length === 0) return;
    if (Array.isArray(formData.servidorIds) && formData.servidorIds.length > 0) {
      hydratedServersRef.current = true;
      return;
    }

    let cancelled = false;
    const loadAssignedServers = async () => {
      try {
        const resp = await sistemaServidorService.getServidoresBySistema(Number(formData.id));
        if (cancelled) return;
        const ids = Array.isArray(resp?.data)
          ? Array.from(
              new Set(
                resp.data
                  .map((item: any) => Number(item?.servidorId))
                  .filter((n: any) => Number.isFinite(n))
              )
            )
          : [];
        if (ids.length > 0) {
          onDataChange({ servidorIds: ids });
        }
      } catch (e) {
        console.error('Error cargando servidores del sistema (Step2HierarchyServers):', e);
      } finally {
        hydratedServersRef.current = true;
      }
    };

    loadAssignedServers();
    return () => {
      cancelled = true;
    };
  }, [formData?.id, servidores, loading, onDataChange]);

  const handleSelectPadre = (value: string) => {
    // Permitir limpiar selección con valor especial 'none'
    if (value === 'none' || value === '') {
      onDataChange({ sistemaDepende: undefined });
      return;
    }
    const id = value ? Number(value) : undefined;
    onDataChange({ sistemaDepende: id });
  };

  const addServidor = (id: number) => {
    const current = new Set(formData.servidorIds || []);
    current.add(id);
    onDataChange({ servidorIds: Array.from(current) });
  };

  const removeServidor = (id: number) => {
    const current = new Set(formData.servidorIds || []);
    current.delete(id);
    onDataChange({ servidorIds: Array.from(current) });
  };

  const handleServidorAdd = (value: string) => {
    const id = Number(value);
    if (!Number.isNaN(id)) {
      addServidor(id);
    }
    // resetear el selector para permitir agregar más
    setNewServidorId('');
  };

  const filteredSistemas = useMemo(
    () =>
      sistemas.filter(
        (s) =>
          s.nombre.toLowerCase().includes(search.toLowerCase()) ||
          (s as any).codigo?.toLowerCase?.().includes(search.toLowerCase())
      ),
    [sistemas, search]
  );

  const selectedServidorChips: ChipItem[] = useMemo(() => {
    const ids = formData.servidorIds || [];
    return ids
      .map((id) => servidores.find((s) => s.id === id))
      .filter((s): s is Servidor => !!s)
      .map((srv) => ({ id: srv.id, label: srv.nombre, type: 'server' }));
  }, [formData.servidorIds, servidores]);

  const availableServidores = useMemo(() => {
    const selected = new Set(formData.servidorIds || []);
    return servidores.filter((s) => !selected.has(s.id));
  }, [servidores, formData.servidorIds]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Network size={20} />
        </div>
        <div>
          <h2 className={styles.stepTitle}>Jerarquía y Servidores</h2>
          <p className={styles.stepDescription}>Seleccione el sistema padre y los servidores asociados</p>
        </div>
      </div>

      {/* Jerarquía */}
      <div className={styles.formSection}>
        <div className={styles.fieldGroup}>
          <Label>Sistema del que depende (opcional)</Label>
          <input
            type="text"
            className={styles.input}
            placeholder="Buscar sistema"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
          <Select
            value={formData.sistemaDepende?.toString() ?? 'none'}
            onValueChange={handleSelectPadre}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="(Sin sistema padre)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">(Sin sistema padre)</SelectItem>
              {filteredSistemas.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Servidores */}
      <div className={styles.formSection}>
        <div className={styles.fieldGroup}>
          <Label>Servidores</Label>
          <ChipGroup
            chips={selectedServidorChips}
            removable
            onRemove={(id) => removeServidor(Number(id))}
            showServerIcon
            title="Servidores seleccionados"
          />
        </div>

        <div className={styles.fieldGroup}>
          <Label>Agregar servidor</Label>
          <Select
            value={newServidorId}
            onValueChange={handleServidorAdd}
            disabled={loading || availableServidores.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={availableServidores.length ? 'Seleccione un servidor' : 'No hay servidores disponibles'} />
            </SelectTrigger>
            <SelectContent>
              {availableServidores.length === 0 ? (
                <SelectItem value="none" disabled>
                  No disponible
                </SelectItem>
              ) : (
                availableServidores.map((srv) => (
                  <SelectItem key={srv.id} value={srv.id.toString()}>
                    {srv.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Step2HierarchyServers;