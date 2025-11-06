/**
 * Servicio para gestión de Notificaciones de Gobernanza
 * Actualizado según el modelo Domain.Entities.Governance.NotificacionGobernanza
 * Incluye CRUD completo y gestión de lectura de notificaciones
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Tipos de entidades
  NotificacionGobernanza,
  TipoNotificacionGobernanza,
  EstadoNotificacion,
  
  // Commands
  CreateNotificacionGobernanzaCommand,
  UpdateNotificacionGobernanzaCommand,
  MarcarComoLeidaCommand,
  
  // Requests
  GetAllNotificacionesGobernanzaRequest,
  GetNotificacionGobernanzaByIdRequest,
  GetNotificacionesPorUsuarioRequest,
  GetNotificacionesPorGobernanzaRequest,
  DeleteNotificacionGobernanzaRequest,
  
  // Responses
  GetAllNotificacionesGobernanzaResponseData,
  GetNotificacionGobernanzaByIdResponseData,
  CreateNotificacionGobernanzaResponseData,
  UpdateNotificacionGobernanzaResponseData,
  DeleteNotificacionGobernanzaResponseData,
  MarcarComoLeidaResponseData,
  
  // Tipos response
  GetNotificacionGobernanzaResponse,
  GetNotificacionGobernanzaListResponse,
  CreateNotificacionGobernanzaResponse,
  UpdateNotificacionGobernanzaResponse,
  DeleteNotificacionGobernanzaResponse,
  MarcarComoLeidaResponse,
  
  // Tipos auxiliares
  NotificacionesGobernanzaFilters,
  NotificacionesGobernanzaSortOptions
} from './types/notificacion-gobernanza.types';

export class NotificacionGobernanzaService extends BaseApiService {
  protected baseEndpoint = '/NotificacionGobernanza';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== OPERACIONES CRUD BÁSICAS =====

  /**
   * Obtiene todas las notificaciones de gobernanza
   * GET /api/NotificacionGobernanza
   */
  async getAllNotificacionesGobernanza(request?: GetAllNotificacionesGobernanzaRequest): Promise<GetNotificacionGobernanzaListResponse> {
    const params = new URLSearchParams();
    
    if (request?.includeDeleted !== undefined) {
      params.append('includeDeleted', request.includeDeleted.toString());
    }
    if (request?.gobernanzaId !== undefined) {
      params.append('gobernanzaId', request.gobernanzaId.toString());
    }
    if (request?.soloNoLeidas !== undefined) {
      params.append('soloNoLeidas', request.soloNoLeidas.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;

    return await this.get<NotificacionGobernanza[]>(url);
  }

  /**
   * Obtiene una notificación de gobernanza por ID
   * GET /api/NotificacionGobernanza/{id}
   */
  async getNotificacionGobernanzaById(notificacionGobernanzaId: number, includeDeleted: boolean = false): Promise<GetNotificacionGobernanzaResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/${notificacionGobernanzaId}?${queryString}` : `${this.baseEndpoint}/${notificacionGobernanzaId}`;
    
    return await this.get<NotificacionGobernanza>(url);
  }

  /**
   * Obtiene notificaciones por gobernanza
   * GET /api/NotificacionGobernanza/gobernanza/{gobernanzaId}
   */
  async getNotificacionesPorGobernanza(gobernanzaId: number, includeDeleted: boolean = false): Promise<GetNotificacionGobernanzaListResponse> {
    const params = new URLSearchParams();
    if (includeDeleted) params.append('includeDeleted', 'true');

    const queryString = params.toString();
    const url = queryString ? `${this.baseEndpoint}/gobernanza/${gobernanzaId}?${queryString}` : `${this.baseEndpoint}/gobernanza/${gobernanzaId}`;
    
    return await this.get<NotificacionGobernanza[]>(url);
  }

  /**
   * Crea una nueva notificación de gobernanza
   * POST /api/NotificacionGobernanza
   */
  async createNotificacionGobernanza(command: CreateNotificacionGobernanzaCommand): Promise<CreateNotificacionGobernanzaResponse> {
    return await this.post<NotificacionGobernanza>(this.baseEndpoint, command);
  }

  /**
   * Actualiza una notificación de gobernanza existente
   * PUT /api/NotificacionGobernanza/{id}
   */
  async updateNotificacionGobernanza(command: UpdateNotificacionGobernanzaCommand): Promise<UpdateNotificacionGobernanzaResponse> {
    const url = `${this.baseEndpoint}/${command.notificacionGobernanzaId}`;
    return await this.put<NotificacionGobernanza>(url, command);
  }

  /**
   * Elimina una notificación de gobernanza (soft delete)
   * DELETE /api/NotificacionGobernanza/{id}
   */
  async deleteNotificacionGobernanza(request: DeleteNotificacionGobernanzaRequest): Promise<DeleteNotificacionGobernanzaResponse> {
    const params = new URLSearchParams();
    
    if (request.forceDelete !== undefined) {
      params.append('forceDelete', request.forceDelete.toString());
    }
    if (request.motivo) {
      params.append('motivo', request.motivo);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/${request.notificacionGobernanzaId}?${queryString}`
      : `${this.baseEndpoint}/${request.notificacionGobernanzaId}`;

    return await this.delete<boolean>(url);
  }

  // ===== OPERACIONES ESPECIALES =====

  /**
   * Marca una notificación como leída
   * POST /api/NotificacionGobernanza/{id}/marcar-leida
   */
  async marcarComoLeida(command: MarcarComoLeidaCommand): Promise<MarcarComoLeidaResponse> {
    const url = `${this.baseEndpoint}/${command.notificacionGobernanzaId}/marcar-leida`;
    return await this.post<NotificacionGobernanza>(url, command);
  }

  /**
   * Marca varias notificaciones como leídas
   * POST /api/NotificacionGobernanza/marcar-multiples-leidas
   */
  async marcarMultiplesComoLeidas(notificacionIds: number[], fechaLectura?: string): Promise<ApiResponse<boolean>> {
    const url = `${this.baseEndpoint}/marcar-multiples-leidas`;
    const body = {
      notificacionIds,
      fechaLectura: fechaLectura || new Date().toISOString()
    };
    return await this.post<boolean>(url, body);
  }

  // ===== OPERACIONES ESPECIALIZADAS =====

  /**
   * Obtiene notificaciones no leídas
   */
  async getNotificacionesNoLeidas(gobernanzaId?: number): Promise<GetNotificacionGobernanzaListResponse> {
    const request: GetAllNotificacionesGobernanzaRequest = {
      soloNoLeidas: true,
      gobernanzaId,
      includeDeleted: false
    };
    return await this.getAllNotificacionesGobernanza(request);
  }

  /**
   * Obtiene notificaciones por tipo
   */
  async getNotificacionesPorTipo(tipoNotificacion: string, gobernanzaId?: number): Promise<GetNotificacionGobernanzaListResponse> {
    const response = await this.getAllNotificacionesGobernanza({ 
      gobernanzaId, 
      includeDeleted: false 
    });
    
    if (response.success && response.data) {
      const filtradas = response.data.filter(notif => notif.tipoNotificacion === tipoNotificacion);
      
      return {
        ...response,
        data: filtradas
      };
    }

    return {
      success: false,
      data: [],
      message: response.message || 'Error al obtener notificaciones por tipo',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Obtiene notificaciones leídas
   */
  async getNotificacionesLeidas(gobernanzaId?: number): Promise<GetNotificacionGobernanzaListResponse> {
    const response = await this.getAllNotificacionesGobernanza({ 
      gobernanzaId, 
      includeDeleted: false 
    });
    
    if (response.success && response.data) {
      const leidas = response.data.filter(notif => notif.leida);
      
      return {
        ...response,
        data: leidas
      };
    }

    return response;
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Busca notificaciones por término
   */
  async searchNotificaciones(
    searchTerm: string, 
    filters?: NotificacionesGobernanzaFilters,
    sort?: NotificacionesGobernanzaSortOptions
  ): Promise<GetNotificacionGobernanzaListResponse> {
    const response = await this.getAllNotificacionesGobernanza({ 
      includeDeleted: filters?.includeDeleted,
      gobernanzaId: filters?.gobernanzaId,
      soloNoLeidas: filters?.soloNoLeidas
    });
    
    if (response.success && response.data) {
      let filteredData = response.data;

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter(notif => 
          notif.titulo.toLowerCase().includes(term) ||
          notif.mensaje.toLowerCase().includes(term) ||
          notif.tipoNotificacion.toLowerCase().includes(term)
        );
      }

      // Aplicar filtros adicionales
      if (filters?.tipoNotificacion) {
        filteredData = filteredData.filter(notif => notif.tipoNotificacion === filters.tipoNotificacion);
      }
      
      if (filters?.leida !== undefined) {
        filteredData = filteredData.filter(notif => notif.leida === filters.leida);
      }

      if (filters?.fechaEnvioDesde) {
        const fechaDesde = new Date(filters.fechaEnvioDesde);
        filteredData = filteredData.filter(notif => new Date(notif.fechaEnvio) >= fechaDesde);
      }

      if (filters?.fechaEnvioHasta) {
        const fechaHasta = new Date(filters.fechaEnvioHasta);
        filteredData = filteredData.filter(notif => new Date(notif.fechaEnvio) <= fechaHasta);
      }

      // Aplicar ordenamiento
      if (sort?.orderBy) {
        filteredData.sort((a, b) => {
          const field = sort.orderBy!;
          const aValue = a[field as keyof NotificacionGobernanza];
          const bValue = b[field as keyof NotificacionGobernanza];
          
          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;
          
          if (aValue < bValue) return sort.ascending ? -1 : 1;
          if (aValue > bValue) return sort.ascending ? 1 : -1;
          return 0;
        });
      }

      return {
        success: true,
        data: filteredData,
        message: response.message,
        errors: response.errors,
        statusCode: response.statusCode,
        metadata: response.metadata
      };
    }

    return response;
  }

  /**
   * Obtiene estadísticas de notificaciones
   */
  async getEstadisticasNotificaciones(gobernanzaId?: number): Promise<ApiResponse<{
    totalNotificaciones: number;
    notificacionesLeidas: number;
    notificacionesNoLeidas: number;
    distribucionPorTipo: Record<string, number>;
    ultimaFechaEnvio?: string;
    primeraFechaEnvio?: string;
    promedioLecturaPorDia: number;
  }>> {
    const response = await this.getAllNotificacionesGobernanza({ 
      gobernanzaId, 
      includeDeleted: true 
    });
    
    if (response.success && response.data) {
      const notificaciones = response.data;
      
      const leidas = notificaciones.filter(n => n.leida);
      const fechasEnvio = notificaciones.map(n => new Date(n.fechaEnvio)).sort((a, b) => a.getTime() - b.getTime());
      
      // Calcular promedio de lectura por día
      const notificacionesConFechaLectura = leidas.filter(n => n.fechaLectura);
      const lecturasPorDia = notificacionesConFechaLectura.reduce((acc, notif) => {
        const fecha = new Date(notif.fechaLectura!).toDateString();
        acc[fecha] = (acc[fecha] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const diasConLectura = Object.keys(lecturasPorDia).length;
      const totalLecturas = Object.values(lecturasPorDia).reduce((sum, count) => sum + count, 0);
      
      const estadisticas = {
        totalNotificaciones: notificaciones.length,
        notificacionesLeidas: leidas.length,
        notificacionesNoLeidas: notificaciones.length - leidas.length,
        distribucionPorTipo: notificaciones.reduce((acc, notif) => {
          acc[notif.tipoNotificacion] = (acc[notif.tipoNotificacion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        ultimaFechaEnvio: fechasEnvio.length > 0 ? fechasEnvio[fechasEnvio.length - 1].toISOString() : undefined,
        primeraFechaEnvio: fechasEnvio.length > 0 ? fechasEnvio[0].toISOString() : undefined,
        promedioLecturaPorDia: diasConLectura > 0 ? totalLecturas / diasConLectura : 0
      };
      
      return {
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente',
        errors: [],
        statusCode: 200,
        metadata: ''
      };
    }

    return {
      success: false,
      data: {
        totalNotificaciones: 0,
        notificacionesLeidas: 0,
        notificacionesNoLeidas: 0,
        distribucionPorTipo: {},
        promedioLecturaPorDia: 0
      },
      message: response.message || 'Error al obtener estadísticas',
      errors: response.errors || [],
      statusCode: response.statusCode || 500,
      metadata: response.metadata || ''
    };
  }

  /**
   * Valida si se puede crear una nueva notificación
   */
  async validarNuevaNotificacion(command: CreateNotificacionGobernanzaCommand): Promise<ApiResponse<{
    esValido: boolean;
    errores: string[];
    advertencias: string[];
  }>> {
    try {
      const errores: string[] = [];
      const advertencias: string[] = [];

      // Validaciones básicas
      if (!command.titulo || command.titulo.trim().length === 0) {
        errores.push('El título es obligatorio');
      }

      if (command.titulo && command.titulo.length > 200) {
        errores.push('El título no puede exceder 200 caracteres');
      }

      if (!command.mensaje || command.mensaje.trim().length === 0) {
        errores.push('El mensaje es obligatorio');
      }

      if (command.mensaje && command.mensaje.length > 1000) {
        errores.push('El mensaje no puede exceder 1000 caracteres');
      }

      if (!command.tipoNotificacion || command.tipoNotificacion.trim().length === 0) {
        errores.push('El tipo de notificación es obligatorio');
      }

      // Verificar tipos válidos
      const tiposValidos = Object.values(TipoNotificacionGobernanza);
      if (command.tipoNotificacion && !tiposValidos.includes(command.tipoNotificacion as TipoNotificacionGobernanza)) {
        errores.push('Tipo de notificación no válido');
      }

      // Verificar fechas
      if (command.fechaEnvio) {
        const fechaEnvio = new Date(command.fechaEnvio);
        const ahora = new Date();
        
        if (fechaEnvio < ahora) {
          advertencias.push('La fecha de envío está en el pasado');
        }
      }

      // Verificar notificaciones duplicadas (mismo título y mensaje para la misma gobernanza)
      if (command.gobernanzaId) {
        const notificacionesExistentes = await this.getNotificacionesPorGobernanza(command.gobernanzaId);
        
        if (notificacionesExistentes.success && notificacionesExistentes.data) {
          const duplicada = notificacionesExistentes.data.find(notif => 
            notif.titulo === command.titulo && 
            notif.mensaje === command.mensaje &&
            !notif.registroEliminado
          );
          
          if (duplicada) {
            advertencias.push('Ya existe una notificación similar para esta gobernanza');
          }
        }
      }

      const esValido = errores.length === 0;

      return {
        success: true,
        data: { esValido, errores, advertencias },
        message: esValido ? 'Validación exitosa' : 'Se encontraron errores de validación',
        errors: [],
        statusCode: 200,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: { esValido: false, errores: ['Error interno de validación'], advertencias: [] },
        message: 'Error al validar notificación',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }

  /**
   * Marca todas las notificaciones de una gobernanza como leídas
   */
  async marcarTodasComoLeidas(gobernanzaId: number, fechaLectura?: string): Promise<ApiResponse<number>> {
    try {
      const notificacionesResponse = await this.getNotificacionesNoLeidas(gobernanzaId);
      
      if (!notificacionesResponse.success || !notificacionesResponse.data) {
        return {
          success: false,
          data: 0,
          message: 'Error al obtener notificaciones no leídas',
          errors: notificacionesResponse.errors || [],
          statusCode: notificacionesResponse.statusCode || 500,
          metadata: ''
        };
      }

      const notificacionesNoLeidas = notificacionesResponse.data;
      const ids = notificacionesNoLeidas.map(n => n.notificacionGobernanzaId);
      
      if (ids.length === 0) {
        return {
          success: true,
          data: 0,
          message: 'No hay notificaciones no leídas',
          errors: [],
          statusCode: 200,
          metadata: ''
        };
      }

      const marcarResponse = await this.marcarMultiplesComoLeidas(ids, fechaLectura);
      
      if (marcarResponse.success) {
        return {
          success: true,
          data: ids.length,
          message: `${ids.length} notificaciones marcadas como leídas`,
          errors: [],
          statusCode: 200,
          metadata: ''
        };
      }

      return {
        success: false,
        data: 0,
        message: marcarResponse.message || 'Error al marcar notificaciones como leídas',
        errors: marcarResponse.errors || [],
        statusCode: marcarResponse.statusCode || 500,
        metadata: ''
      };

    } catch (error) {
      return {
        success: false,
        data: 0,
        message: 'Error al marcar todas las notificaciones como leídas',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        statusCode: 500,
        metadata: ''
      };
    }
  }
}

// Instancia singleton del servicio
export const notificacionGobernanzaService = new NotificacionGobernanzaService(); 