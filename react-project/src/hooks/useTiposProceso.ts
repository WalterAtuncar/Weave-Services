import { useState, useEffect, useCallback } from 'react';
import { tiposProcesoService } from '../services';
import { TipoProcesoEntity } from '../models/Procesos';

interface UseTiposProcesoReturn {
    tiposProceso: TipoProcesoEntity[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    obtenerTipoPorId: (id: number) => TipoProcesoEntity | undefined;
    obtenerTiposPorNivel: (nivel: number) => TipoProcesoEntity[];
}

interface UseTiposProcesoProps {
    organizacionId: number;
}

export const useTiposProceso = ({ organizacionId }: UseTiposProcesoProps): UseTiposProcesoReturn => {
    const [tiposProceso, setTiposProceso] = useState<TipoProcesoEntity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTiposProceso = useCallback(async () => {
        try {
            if (organizacionId <= 0) {
                throw new Error('El ID de organización debe ser mayor a 0');
            }

            setLoading(true);
            setError(null);
            const tipos = await tiposProcesoService.obtenerTodosTiposProceso(organizacionId);
            setTiposProceso(tipos);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar tipos de procesos';
            setError(errorMessage);
            console.error('Error al cargar tipos de procesos:', err);
        } finally {
            setLoading(false);
        }
    }, [organizacionId]);

    useEffect(() => {
        fetchTiposProceso();
    }, [fetchTiposProceso]);

    const obtenerTipoPorId = useCallback((id: number): TipoProcesoEntity | undefined => {
        return tiposProceso.find(tipo => tipo.tipoProcesoId === id);
    }, [tiposProceso]);

    const obtenerTiposPorNivel = useCallback((nivel: number): TipoProcesoEntity[] => {
        return tiposProceso.filter(tipo => tipo.nivel === nivel);
    }, [tiposProceso]);

    const refetch = useCallback(async () => {
        await fetchTiposProceso();
    }, [fetchTiposProceso]);

    return {
        tiposProceso,
        loading,
        error,
        refetch,
        obtenerTipoPorId,
        obtenerTiposPorNivel
    };
};