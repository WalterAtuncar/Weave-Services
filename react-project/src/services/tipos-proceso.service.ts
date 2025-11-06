import { BaseApiService } from './api.service';
import { TipoProcesoEntity } from '../models/Procesos';

export interface TipoProcesoResponse {
    tipoProcesoId: number;
    nombreTipoProceso: string;
    descripcionTipoProceso?: string | null;
    nivel: number;
    estadoTipoProceso: boolean;
    organizacionId: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
}

class TiposProcesoService extends BaseApiService {
    private readonly baseUrl = '/Procesos';

    /**
     * Obtiene los tipos de proceso filtrados por organización
     * @param organizacionId ID de la organización (parámetro obligatorio)
     */
    async obtenerTodosTiposProceso(organizacionId: number): Promise<TipoProcesoEntity[]> {
        try {
            if (organizacionId <= 0) {
                throw new Error('El ID de organización debe ser mayor a 0');
            }

            const response = await this.get<TipoProcesoResponse[]>(`${this.baseUrl}/tipos-proceso/organizacion/${organizacionId}`);
            
            if (response.success && response.data) {
                return response.data.map(this.mapToEntity);
            }
            
            throw new Error(response.message || 'Error al obtener tipos de proceso');
        } catch (error) {
            console.error(`Error al obtener tipos de proceso para organización ${organizacionId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene los tipos de proceso filtrados por organización
     */
    async obtenerTiposProcesosPorOrganizacion(organizacionId: number): Promise<TipoProcesoEntity[]> {
        try {
            if (organizacionId <= 0) {
                throw new Error('El ID de organización debe ser mayor a 0');
            }

            const response = await this.get<TipoProcesoResponse[]>(`${this.baseUrl}/tipos-proceso/organizacion/${organizacionId}`);
            
            if (response.success && response.data) {
                return response.data.map(this.mapToEntity);
            }
            
            throw new Error(response.message || 'Error al obtener tipos de proceso por organización');
        } catch (error) {
            console.error(`Error al obtener tipos de proceso para organización ${organizacionId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene un tipo de proceso por su ID
     * @param id ID del tipo de proceso
     * @param organizacionId ID de la organización
     */
    async obtenerTipoProcesoPorId(id: number, organizacionId: number): Promise<TipoProcesoEntity | null> {
        try {
            const tiposProceso = await this.obtenerTodosTiposProceso(organizacionId);
            return tiposProceso.find(tipo => tipo.tipoProcesoId === id) || null;
        } catch (error) {
            console.error(`Error al obtener tipo de proceso con ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene tipos de procesos por nivel
     * @param nivel Nivel de los tipos de proceso
     * @param organizacionId ID de la organización
     */
    async obtenerTiposProcesosPorNivel(nivel: number, organizacionId: number): Promise<TipoProcesoEntity[]> {
        try {
            const tiposProceso = await this.obtenerTodosTiposProceso(organizacionId);
            return tiposProceso.filter(tipo => tipo.nivel === nivel);
        } catch (error) {
            console.error(`Error al obtener tipos de procesos por nivel ${nivel}:`, error);
            throw error;
        }
    }

    /**
     * Mapea la respuesta de la API al modelo de entidad del frontend
     */
    private mapToEntity(response: TipoProcesoResponse): TipoProcesoEntity {
        return {
            tipoProcesoId: response.tipoProcesoId,
            nombreTipoProceso: response.nombreTipoProceso,
            descripcionTipoProceso: response.descripcionTipoProceso,
            nivel: response.nivel,
            estadoTipoProceso: response.estadoTipoProceso,
            organizacionId: response.organizacionId
        };
    }
}

export const tiposProcesoService = new TiposProcesoService();