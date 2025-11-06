import { useState, useCallback, useMemo, useEffect } from 'react';
import { sistemasService } from '../services/sistemas.service';
import { procesosService } from '../services/procesos.service';
import { dominiosDataService } from '../services/dominios-data.service';
import { documentoVectorialService } from '../services/documento-vectorial.service';
import type { EntidadRef } from '../components/ui/related-entities/types';

// Función para obtener el ID de organización desde localStorage
const getOrganizationId = (): number => {
  try {
    const raw = localStorage.getItem('userSession');
    if (raw) {
      const session = JSON.parse(raw);
      const orgId = session?.organizacion?.organizacionId;
      if (typeof orgId === 'number') return orgId;
      if (typeof orgId === 'string') {
        const parsed = Number(orgId);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  } catch (error) {
    console.error('Error al obtener organizationId:', error);
  }
  return 1; // Valor por defecto
};

interface UseEntidadesPorTipoResult {
  entidades: EntidadRef[];
  loading: boolean;
  error: string | null;
  searchEntidades: (searchTerm: string) => void;
  clearSearch: () => void;
}

interface EntidadBase {
  id: string | number;
  nombre?: string;
  codigo?: string;
  descripcion?: string;
}

/**
 * Hook personalizado para manejar la búsqueda jerárquica de entidades
 * basada en el tipoEntidadId seleccionado.
 * 
 * Mapeo de tipos:
 * - tipoEntidadId 1: Sistemas
 * - tipoEntidadId 2: Procesos  
 * - tipoEntidadId 3: DominioData
 * - tipoEntidadId 4: Documentos
 */
export const useEntidadesPorTipo = (tipoEntidadId: string | number | null): UseEntidadesPorTipoResult => {
  const [entidades, setEntidades] = useState<EntidadRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Convertir tipoEntidadId a número para comparación
  const tipoId = useMemo(() => {
    if (tipoEntidadId === null || tipoEntidadId === undefined) return null;
    return typeof tipoEntidadId === 'string' ? parseInt(tipoEntidadId, 10) : tipoEntidadId;
  }, [tipoEntidadId]);

  // Función para normalizar entidades a EntidadRef
  const normalizeEntidad = (item: EntidadBase, tipoEntidad: number): EntidadRef => {
    let displayName = '';
    let idValue: string = String((item as any)?.id ?? '');

    switch (tipoEntidad) {
      case 1: { // Sistemas
        const sistema = item as any;
        const codigoSistema = sistema.codigoSistema ?? sistema.codigo ?? '';
        const nombreSistema = sistema.nombreSistema ?? sistema.nombre ?? '';
        const sistemaId = sistema.sistemaId ?? sistema.id;
        idValue = String(sistemaId ?? '')
        displayName = codigoSistema && nombreSistema ? `${codigoSistema} - ${nombreSistema}` : (nombreSistema || `ID: ${idValue}`);
        break;
      }
      case 2: { // Procesos
        const proceso = item as any;
        const codigoProceso = proceso.codigoProceso ?? proceso.codigo ?? '';
        const nombreProceso = proceso.nombreProceso ?? proceso.nombre ?? '';
        const procesoId = proceso.procesoId ?? proceso.id;
        idValue = String(procesoId ?? '')
        // Construir nombre robusto considerando ambos campos
        const partes: string[] = [];
        if (String(codigoProceso).trim()) partes.push(String(codigoProceso).trim());
        if (String(nombreProceso).trim()) partes.push(String(nombreProceso).trim());
        displayName = partes.length > 0 ? partes.join(' - ') : `ID: ${idValue}`;
        break;
      }
      case 3: { // Dominios
        const dominio = item as any;
        const codigoDominio = dominio.codigoDominio ?? dominio.codigo ?? '';
        const nombreDominio = dominio.nombreDominio ?? dominio.nombre ?? '';
        const dominioId = dominio.dominioDataId ?? dominio.dominioId ?? dominio.id;
        idValue = String(dominioId ?? '')
        displayName = codigoDominio && nombreDominio ? `${codigoDominio} - ${nombreDominio}` : (nombreDominio || `ID: ${idValue}`);
        break;
      }
      case 4: { // Documentos - no mostrar por ahora
        const documento = item as any;
        const docId = documento.documentoId ?? documento.id;
        idValue = String(docId ?? '')
        displayName = '';
        break;
      }
      default: {
        displayName = item.nombre || `ID: ${idValue}`;
        break;
      }
    }

    return {
      id: String(idValue),
      nombre: displayName
    };
  };

  // Función para cargar sistemas (tipoEntidadId = 1)
  const loadSistemas = async (search?: string) => {
    try {
      const organizacionId = getOrganizationId();
      const response = await sistemasService.getSistemasPaginated({
        page: 1,
        pageSize: 100, // Cargar más elementos para búsqueda
        organizacionId,
        searchTerm: search || undefined
      });

      if (response.success && response.data?.data) {
        const sistemasNormalizados = response.data.data.map(item => normalizeEntidad(item, 1));
        setEntidades(sistemasNormalizados);
      } else {
        setEntidades([]);
        setError(response.message || 'Error al cargar sistemas');
      }
    } catch (err) {
      console.error('Error cargando sistemas:', err);
      setError('Error al cargar sistemas');
      setEntidades([]);
    }
  };

  // Función para cargar procesos (tipoEntidadId = 2)
  const loadProcesos = async (search?: string) => {
    try {
      const organizacionId = getOrganizationId();
      const response = await procesosService.getProcesosPaginated({
        page: 1,
        pageSize: 100,
        organizacionId,
        searchTerm: search || undefined
      });

      // Debug: verificar forma de la respuesta y cantidad de items
      console.log(
        '[Procesos][Hook] success:', response.success,
        'keys:', response.data ? Object.keys(response.data as any) : [],
        'itemsLen(data):', Array.isArray((response.data as any)?.data) ? (response.data as any).data.length : 'no-array',
        'itemsLen(procesos):', Array.isArray((response.data as any)?.procesos) ? (response.data as any).procesos.length : 'no-array'
      );

      if (response.success && response.data) {
        const raw: any = response.data as any;
        const lista: any[] = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.procesos) ? raw.procesos : []);
        console.log('[Procesos][Hook] listaDerivadaLen:', lista.length, 'first:', lista[0]);
        const procesosNormalizados = lista.map(item => normalizeEntidad(item, 2));
        // Debug: verificar resultado de normalización
        console.log('[Procesos][Hook] normalizadosLen:', procesosNormalizados.length, 'muestra:', procesosNormalizados.slice(0, 3));
        setEntidades(procesosNormalizados);
      } else {
        setEntidades([]);
        setError(response.message || 'Error al cargar procesos');
      }
    } catch (err) {
      console.error('Error cargando procesos:', err);
      setError('Error al cargar procesos');
      setEntidades([]);
    }
  };

  // Función para cargar dominios data (tipoEntidadId = 3)
  const loadDominiosData = async (search?: string) => {
    try {
      const organizacionId = getOrganizationId();
      const response = await dominiosDataService.getDominiosDataPaginated({
        page: 1,
        pageSize: 100,
        organizacionId,
        searchTerm: search || undefined
      });

      if (response.success && response.data?.data) {
        const dominiosNormalizados = response.data.data.map(item => normalizeEntidad(item, 3));
        setEntidades(dominiosNormalizados);
      } else {
        setEntidades([]);
        setError(response.message || 'Error al cargar dominios de datos');
      }
    } catch (err) {
      console.error('Error cargando dominios data:', err);
      setError('Error al cargar dominios de datos');
      setEntidades([]);
    }
  };

  // Función para cargar documentos (tipoEntidadId = 4)
  const loadDocumentos = async (search?: string) => {
    try {
      const response = await documentoVectorialService.obtenerDocumentosPaginados({
        pagina: 1,
        tamaño: 100
      });

      if (response.success && response.data?.documentos) {
        const documentosNormalizados = response.data.documentos.map(item => normalizeEntidad(item, 4));
        setEntidades(documentosNormalizados);
      } else {
        setEntidades([]);
        setError(response.message || 'Error al cargar documentos');
      }
    } catch (err) {
      console.error('Error cargando documentos:', err);
      setError('Error al cargar documentos');
      setEntidades([]);
    }
  };

  // Función principal para cargar entidades según el tipo
  const loadEntidades = async (search?: string) => {
    if (!tipoId) {
      setEntidades([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      switch (tipoId) {
        case 1:
          await loadSistemas(search);
          break;
        case 2:
          await loadProcesos(search);
          break;
        case 3:
          await loadDominiosData(search);
          break;
        case 4:
          await loadDocumentos(search);
          break;
        default:
          setEntidades([]);
          setError(`Tipo de entidad no soportado: ${tipoId}`);
      }
    } catch (err) {
      console.error('Error general cargando entidades:', err);
      setError('Error al cargar entidades');
      setEntidades([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar entidades cuando cambia el tipo
  useEffect(() => {
    loadEntidades();
  }, [tipoId]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (!searchTerm) {
      loadEntidades();
      return;
    }

    const timeoutId = setTimeout(() => {
      loadEntidades(searchTerm);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, tipoId]);

  const searchEntidades = (search: string) => {
    setSearchTerm(search);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    entidades,
    loading,
    error,
    searchEntidades,
    clearSearch
  };
};