import React, { useEffect, useMemo, useState } from 'react';
import RelatedEntitiesManager from '../../related-entities/RelatedEntitiesManager';
import type { DocumentFormData, DocumentFormErrors } from '../types';
import type { RelatedEntitiesMap } from '../../related-entities/types';
import { ENTIDADES_BY_TIPO_MOCK } from '../../related-entities/mock';
import { useTiposEntidad } from '../../../../hooks/useTiposEntidad';
import { AlertService } from '../../alerts';
import { sistemasService } from '../../../../services/sistemas.service';
import { procesosService } from '../../../../services/procesos.service';
import { dominiosDataService } from '../../../../services/dominios-data.service';

interface Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
}

const Step4AsignarEntidades: React.FC<Props> = ({ formData, errors, onDataChange, onErrorChange }) => {
  const { tiposEntidad, loading, error } = useTiposEntidad();
  const [initialRelations, setInitialRelations] = useState<RelatedEntitiesMap>({});
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Mostrar error si hay problemas cargando los tipos de entidad
  React.useEffect(() => {
    if (error) {
      AlertService.error('Error al cargar tipos de entidad', error);
    }
  }, [error]);

  // Normaliza una entidad devuelta por API al formato EntidadRef
  const normalizeEntidad = (tipoNum: number, raw: any) => {
    let idValue = '';
    let displayName = '';
    if (tipoNum === 1) {
      const sistemaId = raw?.sistemaId ?? raw?.id;
      const codigo = raw?.codigoSistema ?? raw?.codigo ?? '';
      const nombre = raw?.nombreSistema ?? raw?.nombre ?? '';
      idValue = String(sistemaId ?? '');
      displayName = (codigo && nombre) ? `${codigo} - ${nombre}` : (nombre || `ID: ${idValue}`);
    } else if (tipoNum === 2) {
      const procesoId = raw?.procesoId ?? raw?.id;
      const codigo = raw?.codigoProceso ?? raw?.codigo ?? '';
      const nombre = raw?.nombreProceso ?? raw?.nombre ?? '';
      idValue = String(procesoId ?? '');
      const partes: string[] = [];
      if (String(codigo).trim()) partes.push(String(codigo).trim());
      if (String(nombre).trim()) partes.push(String(nombre).trim());
      displayName = partes.length ? partes.join(' - ') : `ID: ${idValue}`;
    } else if (tipoNum === 3) {
      const dominioId = raw?.dominioDataId ?? raw?.dominioId ?? raw?.id;
      const codigo = raw?.codigoDominio ?? raw?.codigo ?? '';
      const nombre = raw?.nombreDominio ?? raw?.nombre ?? '';
      idValue = String(dominioId ?? '');
      displayName = (codigo && nombre) ? `${codigo} - ${nombre}` : (nombre || `ID: ${idValue}`);
    } else {
      idValue = String(raw?.id ?? '');
      displayName = raw?.nombre || `ID: ${idValue}`;
    }
    return { id: idValue, nombre: displayName } as any;
  };

  // Carga entidades por tipo y lista de IDs usando los services
  const fetchByTipoAndIds = async (tipoId: string, ids: (string | number)[]) => {
    const tipoNum = parseInt(String(tipoId), 10);
    const numericIds = (ids || [])
      .map(v => parseInt(String(v), 10))
      .filter(n => Number.isFinite(n) && n > 0);

    const results: any[] = [];
    for (const id of numericIds) {
      try {
        if (tipoNum === 1) {
          const res = await sistemasService.getSistemaById({ sistemaId: id } as any);
          if (res?.success && res?.data) results.push(normalizeEntidad(1, res.data));
          else results.push({ id: String(id), nombre: `ID: ${id}` });
        } else if (tipoNum === 2) {
          const res = await procesosService.getProcesoById({ procesoId: id } as any);
          if (res?.success && res?.data) results.push(normalizeEntidad(2, res.data));
          else results.push({ id: String(id), nombre: `ID: ${id}` });
        } else if (tipoNum === 3) {
          const res = await dominiosDataService.getDominioDataById({ dominioId: id } as any);
          if (res?.success && res?.data) results.push(normalizeEntidad(3, res.data));
          else results.push({ id: String(id), nombre: `ID: ${id}` });
        } else {
          results.push({ id: String(id), nombre: `ID: ${id}` });
        }
      } catch (e) {
        results.push({ id: String(id), nombre: `ID: ${id}` });
      }
    }
    return results;
  };

  // Construir relaciones iniciales dinámicamente desde formData.entidadesRelacionadas
  useEffect(() => {
    const source = formData.entidadesRelacionadas || {};
    const tipoIds = Object.keys(source);
    if (tipoIds.length === 0) {
      setInitialRelations({});
      return;
    }
    let aborted = false;
    const load = async () => {
      setInitialLoading(true);
      const map: RelatedEntitiesMap = {} as any;
      for (const tipoId of tipoIds) {
        const ids = (source as any)[tipoId] || [];
        const refs = await fetchByTipoAndIds(tipoId, ids);
        if (refs.length > 0) map[tipoId] = refs as any;
      }
      if (!aborted) setInitialRelations(map);
      setInitialLoading(false);
    };
    load();
    return () => { aborted = true; };
  }, [formData.entidadesRelacionadas]);

  const handleChange = (next: RelatedEntitiesMap) => {
    const idsMap: Record<string, string[]> = {};
    Object.entries(next).forEach(([tipoId, items]) => {
      idsMap[tipoId] = items.map(it => String(it.id));
    });
    onDataChange({ entidadesRelacionadas: idsMap });
    if (errors?.general) onErrorChange({ general: undefined });
  };

  // Mostrar indicador de carga mientras se cargan los tipos de entidad
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando tipos de entidad...</p>
        </div>
      </div>
    );
  }

  return (
    <RelatedEntitiesManager
      initial={initialRelations}
      tipos={tiposEntidad}
      entidades={ENTIDADES_BY_TIPO_MOCK}
      onChange={handleChange}
      title="Asignar entidades"
      description="Asocia procesos, riesgos u otras entidades relacionadas al documento"
    />
  );
};

export default Step4AsignarEntidades;