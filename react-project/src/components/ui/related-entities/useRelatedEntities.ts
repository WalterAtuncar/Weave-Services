import { useMemo, useState } from 'react';
import type { RelatedEntitiesMap, TipoEntidad, EntidadRef } from './types';

interface Params {
  initial?: RelatedEntitiesMap;
  tipos?: TipoEntidad[];
  entidades?: Record<string, EntidadRef[]>;
  onChange?: (next: RelatedEntitiesMap) => void;
}

export const useRelatedEntities = ({ initial, tipos = [], entidades = {}, onChange }: Params) => {
  const [relations, setRelations] = useState<RelatedEntitiesMap>(initial || {});
  const [selectedTipoId, setSelectedTipoId] = useState<string>('');
  const [selectedEntidadId, setSelectedEntidadId] = useState<string>('');

  const selectedEntidadOptions = useMemo(() => {
    return entidades[selectedTipoId] || [];
  }, [selectedTipoId, entidades]);

  const addRelation = (tipoId: string, entidadId: string) => {
    const entidad = (entidades[tipoId] || []).find(e => String(e.id) === String(entidadId));
    if (!entidad) return;
    setRelations(prev => {
      const arr = prev[tipoId] ? [...prev[tipoId]] : [];
      // Evitar duplicados
      if (arr.some(e => String(e.id) === String(entidadId))) {
        return prev;
      }
      const next = { ...prev, [tipoId]: [...arr, entidad] };
      onChange?.(next);
      return next;
    });
  };

  const removeRelation = (tipoId: string, entidadId: string) => {
    setRelations(prev => {
      const arr = prev[tipoId] || [];
      const nextArr = arr.filter(e => String(e.id) !== String(entidadId));
      const next: RelatedEntitiesMap = { ...prev };
      if (nextArr.length > 0) next[tipoId] = nextArr; else delete next[tipoId];
      onChange?.(next);
      return next;
    });
  };

  return {
    relations,
    setRelations,
    selectedTipoId,
    setSelectedTipoId,
    selectedEntidadId,
    setSelectedEntidadId,
    tipos,
    entidades,
    selectedEntidadOptions,
    addRelation,
    removeRelation,
  };
};