/**
 * Servicio para gestión de Dominios de Data
 * Basado en sistemas.service.ts pero adaptado para dominios y sub-dominios de datos
 * Implementación mock temporal para desarrollo del frontend
 */

import { BaseApiService } from './api.service';
import { ApiResponse } from './types/api.types';
import {
  // Requests
  GetAllDominiosDataRequest,
  GetDominioDataByIdRequest,
  GetDominioDataCompletoRequest,
  GetDominiosDataPaginatedRequest,
  CreateDominioDataRequest,
  UpdateDominioDataRequest,
  DeleteDominioDataRequest,
  GetDominiosByTipoRequest,
  CreateSubDominioDataRequest,
  UpdateSubDominioDataRequest,
  DeleteSubDominioDataRequest,
  GetSubDominiosDataRequest,
  BulkImportDominiosDataRequest,
  
  // Responses
  GetAllDominiosDataResponseData,
  GetDominioDataByIdResponseData,
  GetDominioDataCompletoResponseData,
  CreateDominioDataResponseData,
  UpdateDominioDataResponseData,
  DeleteDominioDataResponseData,
  GetDominiosActivosResponseData,
  GetDominiosByTipoResponseData,
  GetSubDominiosDataResponseData,
  CreateSubDominioDataResponseData,
  UpdateSubDominioDataResponseData,
  DeleteSubDominioDataResponseData,
  DominiosDataPaginatedResponseData,
  GetEstadisticasDominiosDataResponseData,
  BulkImportDominiosDataResponseData,
  
  // Entidades
  DominioDataCompleto
} from './types/dominios-data.types';
import {
  DominioData,
  SubDominioData,
  EstadoDominioData,
  TipoDominioData,
  CategoriaSubDominio,
  NivelSensibilidad
} from '../models/DominiosData';

/**
 * Servicio para gestión de Dominios de Data
 */
export class DominiosDataService extends BaseApiService {
  protected baseEndpoint = '/DominioData';

  constructor() {
    super(undefined, {
      enableAuth: true,
      enableSpinner: true,
      enableLogging: true
    });
  }

  // ===== DATOS MOCK =====
  
  private mockDominios: DominioData[] = [
    {
      dominioId: 1,
      codigo: 'DOM001',
      nombre: 'Datos Financieros',
      descripcion: 'Dominio que agrupa todos los datos relacionados con información financiera de la organización',
      tipo: 'financiero' as TipoDominioData,
      dominioParentId: undefined,
      organizacionId: 3,
      estado: EstadoDominioData.ACTIVO,
      propietarioNegocio: 'Juan Pérez',
      stewardData: 'María González',
      politicasGobierno: 'Políticas de privacidad y protección de datos personales',
      fechaCreacion: '2024-01-15T10:00:00Z',
      fechaActualizacion: '2024-01-20T15:30:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false,
      totalSubDominios: 4,
      dominioParent_Nombre: undefined
    },
    {
      dominioId: 2,
      codigo: 'DOM002',
      nombre: 'Datos de Clientes',
      descripcion: 'Dominio que contiene información personal y comercial de clientes',
      tipo: 'comercial' as TipoDominioData,
      dominioParentId: undefined,
      organizacionId: 3,
      estado: EstadoDominioData.ACTIVO,
      propietarioNegocio: 'Carlos Rodríguez',
      stewardData: 'Ana Martínez',
      politicasGobierno: 'Políticas de seguridad financiera y cumplimiento regulatorio',
      fechaCreacion: '2024-01-16T09:00:00Z',
      fechaActualizacion: '2024-01-22T11:45:00Z',
      creadoPor: 1,
      actualizadoPor: 2,
      registroEliminado: false,
      totalSubDominios: 3,
      dominioParent_Nombre: undefined
    },
    {
      dominioId: 3,
      codigo: 'DOM003',
      nombre: 'Datos Operacionales',
      descripcion: 'Dominio que incluye datos de procesos y operaciones del negocio',
      tipo: 'operacional' as TipoDominioData,
      dominioParentId: undefined,
      organizacionId: 3,
      estado: EstadoDominioData.ACTIVO,
      propietarioNegocio: 'Luis Fernández',
      stewardData: 'Carmen López',
      politicasGobierno: 'Políticas de gestión de catálogo de productos',
      fechaCreacion: '2024-01-17T14:00:00Z',
      fechaActualizacion: '2024-01-23T16:20:00Z',
      creadoPor: 2,
      actualizadoPor: 2,
      registroEliminado: false,
      totalSubDominios: 2,
      dominioParent_Nombre: undefined
    },
    {
      dominioId: 4,
      codigo: 'DOM004',
      nombre: 'Datos de Recursos Humanos',
      descripcion: 'Dominio con información de empleados y gestión de personal',
      tipo: 'recursos_humanos' as TipoDominioData,
      dominioParentId: undefined,
      organizacionId: 3,
      estado: EstadoDominioData.ACTIVO,
      propietarioNegocio: 'Roberto Silva',
      stewardData: 'Patricia Ruiz',
      politicasGobierno: 'Políticas de gestión operacional',
      fechaCreacion: '2024-01-18T08:30:00Z',
      fechaActualizacion: '2024-01-24T10:15:00Z',
      creadoPor: 3,
      actualizadoPor: 3,
      registroEliminado: false,
      totalSubDominios: 1,
      dominioParent_Nombre: undefined
    },
    {
      dominioId: 5,
      codigo: 'DOM005',
      nombre: 'Datos de Productos',
      descripcion: 'Dominio que contiene información de productos y servicios',
      tipo: 'comercial' as TipoDominioData,
      dominioParentId: undefined,
      organizacionId: 3,
      estado: EstadoDominioData.ACTIVO,
      propietarioNegocio: 'Juan Pérez',
      stewardData: 'María González',
      politicasGobierno: 'Políticas estrictas de protección de PII',
      fechaCreacion: '2024-01-19T12:00:00Z',
      fechaActualizacion: '2024-01-25T14:30:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false,
      totalSubDominios: 0,
      dominioParent_Nombre: 'Datos de Personas'
    }
  ];

  private mockSubDominios: SubDominioData[] = [
    {
      subDominioId: 1,
      dominioId: 1,
      codigo: 'SUBDOM001',
      nombre: 'Estados Financieros',
      descripcion: 'Información de balances, estados de resultados y flujos de caja',
      categoria: 'datos_financieros' as CategoriaSubDominio,
      nivelSensibilidad: 'altamente_confidencial' as NivelSensibilidad,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: true,
      propietarioResponsable: 'Juan Pérez',
      custodioData: 'María González',
      fechaCreacion: '2024-01-15T10:30:00Z',
      fechaActualizacion: '2024-01-20T16:00:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false
    },
    {
      subDominioId: 2,
      dominioId: 1,
      codigo: 'SUBDOM002',
      nombre: 'Presupuestos',
      descripcion: 'Datos de planificación y control presupuestario',
      categoria: 'datos_financieros' as CategoriaSubDominio,
      nivelSensibilidad: 'confidencial' as NivelSensibilidad,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: false,
      propietarioResponsable: 'Juan Pérez',
      custodioData: 'María González',
      fechaCreacion: '2024-01-15T11:00:00Z',
      fechaActualizacion: '2024-01-21T09:30:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false
    },
    {
      subDominioId: 3,
      dominioId: 1,
      codigo: 'SUBDOM003',
      nombre: 'Facturación',
      descripcion: 'Información de facturas, cobros y cuentas por cobrar',
      categoria: 'datos_financieros' as CategoriaSubDominio,
      nivelSensibilidad: 'altamente_confidencial' as NivelSensibilidad,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: true,
      propietarioResponsable: 'Juan Pérez',
      custodioData: 'María González',
      fechaCreacion: '2024-01-16T08:00:00Z',
      fechaActualizacion: '2024-01-22T12:15:00Z',
      creadoPor: 2,
      actualizadoPor: 2,
      registroEliminado: false
    },
    {
      subDominioId: 4,
      dominioId: 2,
      codigo: 'SUBDOM004',
      nombre: 'Información Personal',
      descripcion: 'Datos personales y de contacto de clientes',
      categoria: 'datos_personales' as CategoriaSubDominio,
      nivelSensibilidad: 'altamente_confidencial' as NivelSensibilidad,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: false,
      propietarioResponsable: 'Carlos Rodríguez',
      custodioData: 'Ana Martínez',
      fechaCreacion: '2024-01-17T10:00:00Z',
      fechaActualizacion: '2024-01-23T14:45:00Z',
      creadoPor: 1,
      actualizadoPor: 2,
      registroEliminado: false
    },
    {
      subDominioId: 5,
      dominioId: 2,
      codigo: 'SUBDOM005',
      nombre: 'Historial Comercial',
      descripcion: 'Registro de transacciones y relación comercial',
      categoria: 'datos_comerciales' as CategoriaSubDominio,
      nivelSensibilidad: 'confidencial' as NivelSensibilidad,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: true,
      propietarioResponsable: 'Carlos Rodríguez',
      custodioData: 'Ana Martínez',
      fechaCreacion: '2024-01-16T09:30:00Z',
      fechaActualizacion: '2024-01-22T11:50:00Z',
      creadoPor: 1,
      actualizadoPor: 2,
      registroEliminado: false
    },
    {
      subDominioId: 6,
      dominioId: 2,
      codigo: 'SUBDOM006',
      nombre: 'Preferencias',
      descripcion: 'Configuraciones y preferencias del cliente',
      categoria: CategoriaSubDominio.DATOS_TECNICOS,
      nivelSensibilidad: NivelSensibilidad.INTERNO,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: false,
      propietarioResponsable: 'Carlos Rodríguez',
      custodioData: 'Ana Martínez',
      fechaCreacion: '2024-01-17T10:00:00Z',
      fechaActualizacion: '2024-01-23T14:45:00Z',
      creadoPor: 1,
      actualizadoPor: 2,
      registroEliminado: false
    },
    {
      subDominioId: 7,
      dominioId: 3,
      codigo: 'SUBDOM007',
      nombre: 'Procesos de Negocio',
      descripcion: 'Información de workflows y procesos operativos',
      categoria: CategoriaSubDominio.DATOS_OPERACIONALES,
      nivelSensibilidad: NivelSensibilidad.ALTAMENTE_CONFIDENCIAL,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: true,
      propietarioResponsable: 'Luis Fernández',
      custodioData: 'Carmen López',
      fechaCreacion: '2024-01-18T08:30:00Z',
      fechaActualizacion: '2024-01-24T10:15:00Z',
      creadoPor: 2,
      actualizadoPor: 2,
      registroEliminado: false
    },
    {
      subDominioId: 8,
      dominioId: 3,
      codigo: 'SUBDOM008',
      nombre: 'Métricas y KPIs',
      descripcion: 'Indicadores de rendimiento y métricas operacionales',
      categoria: CategoriaSubDominio.DATOS_OPERACIONALES,
      nivelSensibilidad: NivelSensibilidad.CONFIDENCIAL,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: false,
      propietarioResponsable: 'Luis Fernández',
      custodioData: 'Carmen López',
      fechaCreacion: '2024-01-19T12:00:00Z',
      fechaActualizacion: '2024-01-25T14:30:00Z',
      creadoPor: 3,
      actualizadoPor: 3,
      registroEliminado: false
    },
    {
      subDominioId: 9,
      dominioId: 4,
      codigo: 'SUBDOM009',
      nombre: 'Información Laboral',
      descripcion: 'Datos de contratos, salarios y beneficios',
      categoria: CategoriaSubDominio.DATOS_LABORALES,
      nivelSensibilidad: NivelSensibilidad.ALTAMENTE_CONFIDENCIAL,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: true,
      propietarioResponsable: 'Roberto Silva',
      custodioData: 'Patricia Ruiz',
      fechaCreacion: '2024-01-20T09:00:00Z',
      fechaActualizacion: '2024-01-26T11:15:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false
    },
    {
      subDominioId: 10,
      dominioId: 4,
      codigo: 'SUBDOM010',
      nombre: 'Evaluaciones',
      descripcion: 'Registros de desempeño y evaluaciones',
      categoria: CategoriaSubDominio.DATOS_LABORALES,
      nivelSensibilidad: NivelSensibilidad.CONFIDENCIAL,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: false,
      propietarioResponsable: 'Roberto Silva',
      custodioData: 'Patricia Ruiz',
      fechaCreacion: '2024-01-21T14:00:00Z',
      fechaActualizacion: '2024-01-27T16:30:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false
    },
    {
      subDominioId: 11,
      dominioId: 5,
      codigo: 'SUBDOM011',
      nombre: 'Catálogo',
      descripcion: 'Información descriptiva de productos y servicios',
      categoria: CategoriaSubDominio.DATOS_TECNICOS,
      nivelSensibilidad: NivelSensibilidad.PUBLICO,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: true,
      propietarioResponsable: 'Juan Pérez',
      custodioData: 'María González',
      fechaCreacion: '2024-01-22T10:00:00Z',
      fechaActualizacion: '2024-01-28T12:45:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false
    },
    {
      subDominioId: 12,
      dominioId: 5,
      codigo: 'SUBDOM012',
      nombre: 'Inventario',
      descripcion: 'Datos de stock y gestión de inventarios',
      categoria: CategoriaSubDominio.DATOS_OPERACIONALES,
      nivelSensibilidad: NivelSensibilidad.ALTAMENTE_CONFIDENCIAL,
      estado: EstadoDominioData.ACTIVO,
      estadoTexto: 'Activo',
      tieneGobernanzaPropia: false,
      propietarioResponsable: 'Juan Pérez',
      custodioData: 'María González',
      fechaCreacion: '2024-01-23T15:00:00Z',
      fechaActualizacion: '2024-01-29T17:20:00Z',
      creadoPor: 1,
      actualizadoPor: 1,
      registroEliminado: false
    }
  ];

  private nextDominioId = 6;
  private nextSubDominioId = 13;

  // ===== MÉTODOS PRINCIPALES =====

  /**
   * Obtiene todos los dominios
   */
  async getAllDominiosData(
    request: GetAllDominiosDataRequest
  ): Promise<ApiResponse<GetAllDominiosDataResponseData>> {
    try {
      await this.simulateDelay();
      
      let dominios = [...this.mockDominios];
      
      // Filtrar por organizacionId (requerido)
      dominios = dominios.filter(d => d.organizacionId === request.organizacionId);
      
      if (request.soloDominiosRaiz) {
        dominios = dominios.filter(d => !d.dominioParentId);
      }
      
      if (!request.includeDeleted) {
        dominios = dominios.filter(d => !d.registroEliminado);
      }
      
      if (request.includeSubDominios) {
        // Aquí se incluirían los sub-dominios en la respuesta
      }
      
      return this.createSuccessResponse(dominios);
    } catch (error) {
      console.error('Error al obtener dominios:', error);
      return this.createErrorResponse('Error al obtener dominios', error);
    }
  }

  /**
   * Obtiene dominios con paginación
   */
  async getDominiosDataPaginated(
    request: GetDominiosDataPaginatedRequest
  ): Promise<ApiResponse<DominiosDataPaginatedResponseData>> {
    try {
      // Llamada real al endpoint del backend
      const response = await this.get<DominiosDataPaginatedResponseData>(
        `${this.baseEndpoint}/paginated`,
        {
          params: {
            page: request.page || 1,
            pageSize: request.pageSize || 10,
            orderBy: request.orderBy || 'fechaCreacion',
            ascending: request.ascending || false,
            includeDeleted: request.includeDeleted || false,
            organizacionId: request.organizacionId,
            ...(request.searchTerm && { searchTerm: request.searchTerm }),
            ...(request.tipoDominio && { tipoDominio: request.tipoDominio }),
            ...(request.estado && { estado: request.estado }),
            ...(request.dominioParentId && { dominioParentId: request.dominioParentId }),
            ...(request.soloDominiosRaiz && { soloDominiosRaiz: request.soloDominiosRaiz }),
            ...(request.propietarioNegocio && { propietarioNegocio: request.propietarioNegocio }),
            ...(request.stewardData && { stewardData: request.stewardData }),
            ...(request.tieneSubDominios !== undefined && { tieneSubDominios: request.tieneSubDominios }),
            ...(request.fechaCreacionDesde && { fechaCreacionDesde: request.fechaCreacionDesde }),
            ...(request.fechaCreacionHasta && { fechaCreacionHasta: request.fechaCreacionHasta })
          }
        }
      );
      
      return response;
    } catch (error) {
      return this.createErrorResponse('Error al obtener dominios paginados', error);
    }
  }

  /**
   * Obtiene un dominio por ID
   */
  async getDominioDataById(
    request: GetDominioDataByIdRequest
  ): Promise<ApiResponse<GetDominioDataByIdResponseData>> {
    try {
      await this.simulateDelay();
      
      const dominio = this.mockDominios.find(d => d.dominioId === request.dominioId);
      
      if (!dominio) {
        return this.createErrorResponse('Dominio no encontrado');
      }
      
      return this.createSuccessResponse(dominio);
    } catch (error) {
      return this.createErrorResponse('Error al obtener dominio', error);
    }
  }

  /**
   * Obtiene un dominio completo con relaciones
   */
  async getDominioDataCompleto(
    request: GetDominioDataCompletoRequest
  ): Promise<ApiResponse<GetDominioDataCompletoResponseData>> {
    try {
      await this.simulateDelay();
      
      const dominio = this.mockDominios.find(d => d.dominioId === request.dominioId);
      
      if (!dominio) {
        return this.createErrorResponse('Dominio no encontrado');
      }
      
      const dominioCompleto: DominioDataCompleto = {
        ...dominio,
        dominioParent: dominio.dominioParentId 
          ? this.mockDominios.find(d => d.dominioId === dominio.dominioParentId)
          : undefined,
        subDominios: this.mockDominios.filter(d => d.dominioParentId === dominio.dominioId),
        subDominiosData: this.mockSubDominios.filter(s => s.dominioId === dominio.dominioId),
        totalSubDominios: this.mockDominios.filter(d => d.dominioParentId === dominio.dominioId).length,
        totalSubDominiosData: this.mockSubDominios.filter(s => s.dominioId === dominio.dominioId).length
      };
      
      return this.createSuccessResponse(dominioCompleto);
    } catch (error) {
      return this.createErrorResponse('Error al obtener dominio completo', error);
    }
  }

  /**
   * Crea un nuevo dominio
   */
  async createDominioData(
    request: CreateDominioDataRequest
  ): Promise<ApiResponse<CreateDominioDataResponseData>> {
    try {
      const response = await this.post<CreateDominioDataResponseData>(
        this.baseEndpoint,
        {
          organizacionId: request.organizacionId,
          codigoDominio: request.codigoDominio,
          nombreDominio: request.nombreDominio,
          descripcion: request.descripcion,
          tipoDominioId: request.tipoDominioId || (typeof request.tipoDominio === 'number' ? request.tipoDominio : undefined),
          propietarioNegocio: request.propietarioNegocio,
          stewardData: request.stewardData,
          politicasGobierno: request.politicasGobierno,
          gobernanzaId: request.gobernanzaId,
          estado: typeof request.estado === 'number' ? request.estado : 1 // Usar estado válido; por defecto ACTIVO (1)
        }
      );
      return response;
    } catch (error) {
      const errResp = this.createErrorResponse('Error al crear el dominio de data', error);
      try {
        // Cargar servicio de alertas dinámicamente para evitar ciclos de importación
        const { AlertService } = await import('../components/ui/alerts/AlertService');
        AlertService.error(errResp.message || 'Error al crear el dominio de data');
      } catch (_) {
        // Si por alguna razón falla la importación dinámica, continuar sin bloquear el flujo
      }
      return errResp;
    }
  }

  /**
   * Actualiza un dominio existente
   */
  async updateDominioData(
    request: UpdateDominioDataRequest
  ): Promise<ApiResponse<UpdateDominioDataResponseData>> {
    try {
      const response = await this.put<UpdateDominioDataResponseData>(
        `${this.baseEndpoint}/${request.dominioId}`,
        {
          dominioDataId: request.dominioId,
          organizacionId: request.organizacionId,
          codigoDominio: request.codigoDominio,
          nombreDominio: request.nombreDominio,
          descripcionDominio: request.descripcionDominio,
          tipoDominioId: request.tipoDominioId,
          gobernanzaId: request.gobernanzaId,
          estado: typeof request.estado === 'number' ? request.estado : 1, // Usar estado válido; por defecto ACTIVO (1)
          actualizadoPor: request.actualizadoPor
        }
      );
      return response;
    } catch (error) {
      const errResp = this.createErrorResponse('Error al actualizar el dominio de data', error);
      try {
        const { AlertService } = await import('../components/ui/alerts/AlertService');
        AlertService.error(errResp.message || 'Error al actualizar el dominio de data');
      } catch (_) {}
      return errResp;
    }
  }

  /**
   * Elimina un dominio
   */
  async deleteDominioData(
    request: DeleteDominioDataRequest
  ): Promise<ApiResponse<DeleteDominioDataResponseData>> {
    try {
      await this.simulateDelay();
      
      const index = this.mockDominios.findIndex(d => d.dominioId === request.dominioId);
      
      if (index === -1) {
        return this.createErrorResponse('Dominio no encontrado');
      }
      
      if (request.forceDelete) {
        // Eliminar físicamente
        this.mockDominios.splice(index, 1);
        // También eliminar sub-dominios relacionados
        this.mockSubDominios = this.mockSubDominios.filter(s => s.dominioId !== request.dominioId);
      } else {
        // Eliminación lógica
        this.mockDominios[index].registroEliminado = true;
        this.mockDominios[index].fechaActualizacion = new Date().toISOString();
      }
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.createErrorResponse('Error al eliminar dominio', error);
    }
  }

  // ===== MÉTODOS PARA SUB-DOMINIOS =====

  /**
   * Obtiene sub-dominios de un dominio
   */
  async getSubDominiosData(
    request: GetSubDominiosDataRequest
  ): Promise<ApiResponse<GetSubDominiosDataResponseData>> {
    try {
      await this.simulateDelay();
      
      let subDominios = this.mockSubDominios.filter(s => s.dominioId === request.dominioId);
      
      if (!request.includeDeleted) {
        subDominios = subDominios.filter(s => !s.registroEliminado);
      }
      
      return this.createSuccessResponse(subDominios);
    } catch (error) {
      return this.createErrorResponse('Error al obtener sub-dominios', error);
    }
  }

  /**
   * Crea un nuevo sub-dominio
   */
  async createSubDominioData(
    request: CreateSubDominioDataRequest
  ): Promise<ApiResponse<CreateSubDominioDataResponseData>> {
    try {
      await this.simulateDelay();
      
      const nuevoSubDominio: SubDominioData = {
        subDominioId: this.nextSubDominioId++,
        dominioId: request.dominioId,
        codigo: request.codigo || `SUB-${this.nextSubDominioId - 1}`,
        nombre: request.nombre,
        descripcion: request.descripcion,
        categoria: request.categoria,
        nivelSensibilidad: request.nivelSensibilidad,
        estado: request.estado || EstadoDominioData.ACTIVO,
        propietarioResponsable: request.propietarioResponsable,
        custodioData: request.custodioData,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: request.creadoPor || 1,
        actualizadoPor: request.creadoPor || 1,
        registroEliminado: false
      };
      
      this.mockSubDominios.push(nuevoSubDominio);
      
      // Actualizar contador en el dominio padre
      const dominioIndex = this.mockDominios.findIndex(d => d.dominioId === request.dominioId);
      if (dominioIndex !== -1) {
        this.mockDominios[dominioIndex].totalSubDominios = 
          (this.mockDominios[dominioIndex].totalSubDominios || 0) + 1;
      }
      
      return this.createSuccessResponse(nuevoSubDominio.subDominioId);
    } catch (error) {
      return this.createErrorResponse('Error al crear sub-dominio', error);
    }
  }

  /**
   * Actualiza un sub-dominio existente
   */
  async updateSubDominioData(
    request: UpdateSubDominioDataRequest
  ): Promise<ApiResponse<UpdateSubDominioDataResponseData>> {
    try {
      await this.simulateDelay();
      
      const index = this.mockSubDominios.findIndex(s => s.subDominioId === request.subDominioId);
      
      if (index === -1) {
        return this.createErrorResponse('Sub-dominio no encontrado');
      }
      
      const subDominioActualizado: SubDominioData = {
        ...this.mockSubDominios[index],
        codigo: request.codigo || this.mockSubDominios[index].codigo,
        nombre: request.nombre,
        descripcion: request.descripcion,
        categoria: request.categoria,
        nivelSensibilidad: request.nivelSensibilidad,
        estado: request.estado,
        propietarioResponsable: request.propietarioResponsable,
        custodioData: request.custodioData,
        fechaActualizacion: new Date().toISOString(),
        actualizadoPor: request.actualizadoPor || 1
      };
      
      this.mockSubDominios[index] = subDominioActualizado;
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.createErrorResponse('Error al actualizar sub-dominio', error);
    }
  }

  /**
   * Elimina un sub-dominio
   */
  async deleteSubDominioData(
    request: DeleteSubDominioDataRequest
  ): Promise<ApiResponse<DeleteSubDominioDataResponseData>> {
    try {
      await this.simulateDelay();
      
      const index = this.mockSubDominios.findIndex(s => s.subDominioId === request.subDominioId);
      
      if (index === -1) {
        return this.createErrorResponse('Sub-dominio no encontrado');
      }
      
      // Eliminar físicamente
      this.mockSubDominios.splice(index, 1);
      
      // Actualizar contador en el dominio padre
      const dominioIndex = this.mockDominios.findIndex(d => d.dominioId === request.dominioId);
      if (dominioIndex !== -1) {
        this.mockDominios[dominioIndex].totalSubDominios = 
          Math.max(0, (this.mockDominios[dominioIndex].totalSubDominios || 0) - 1);
      }
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.createErrorResponse('Error al eliminar sub-dominio', error);
    }
  }

  // ===== MÉTODOS ADICIONALES =====

  /**
   * Obtiene dominios activos
   */
  async getDominiosActivos(): Promise<ApiResponse<GetDominiosActivosResponseData>> {
    try {
      await this.simulateDelay();
      
      const dominiosActivos = this.mockDominios.filter(d => 
        d.estado === EstadoDominioData.ACTIVO && !d.registroEliminado
      );
      
      return this.createSuccessResponse(dominiosActivos);
    } catch (error) {
      return this.createErrorResponse('Error al obtener dominios activos', error);
    }
  }

  /**
   * Obtiene dominios por tipo
   */
  async getDominiosByTipo(
    request: GetDominiosByTipoRequest
  ): Promise<ApiResponse<GetDominiosByTipoResponseData>> {
    try {
      await this.simulateDelay();
      
      const dominios = this.mockDominios.filter(d => 
        d.tipo === request.tipoDominio && !d.registroEliminado
      );
      
      return this.createSuccessResponse(dominios);
    } catch (error) {
      return this.createErrorResponse('Error al obtener dominios por tipo', error);
    }
  }

  /**
   * Obtiene estadísticas de dominios
   */
  async getEstadisticasDominiosData(): Promise<ApiResponse<GetEstadisticasDominiosDataResponseData>> {
    try {
      await this.simulateDelay();
      
      const dominiosActivos = this.mockDominios.filter(d => !d.registroEliminado);
      
      const estadisticas: GetEstadisticasDominiosDataResponseData = {
        totalDominios: dominiosActivos.length,
        dominiosActivos: dominiosActivos.filter(d => d.estado === EstadoDominioData.ACTIVO).length,
        dominiosInactivos: dominiosActivos.filter(d => d.estado === EstadoDominioData.INACTIVO).length,
        dominiosRaiz: dominiosActivos.filter(d => !d.dominioParentId).length,
        subDominios: dominiosActivos.filter(d => d.dominioParentId).length,
        totalSubDominiosData: this.mockSubDominios.filter(s => !s.registroEliminado).length,
        tiposConMasDominios: [],
        dominiosConMasSubDominios: [],
        distribucionPorSensibilidad: [],
        distribucionPorCategoria: []
      };
      
      return this.createSuccessResponse(estadisticas);
    } catch (error) {
      return this.createErrorResponse('Error al obtener estadísticas', error);
    }
  }

  /**
   * Obtiene todos los tipos de dominio disponibles
   * @param includeDeleted Indica si se deben incluir los registros eliminados
   */
  async getTiposDominio(includeDeleted: boolean = false): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.get<any[]>(`/DominioData/TipoDominio?includeDeleted=${includeDeleted}`);
      return response;
    } catch (error) {
      return this.createErrorResponse('Error al obtener tipos de dominio', error);
    }
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Simula delay de red
   */
  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Crea respuesta exitosa
   */
  private createSuccessResponse<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      message: 'Operación exitosa'
    };
  }
}

// Instancia singleton del servicio
export const dominiosDataService = new DominiosDataService();