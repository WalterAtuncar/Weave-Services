// Tipos para el servicio de Organizaciones

// DTO principal de Organizacion
export interface OrganizacionDto {
  organizacionId: number;
  codigo: string | null;
  razonSocial: string | null;
  nombreComercial: string | null;
  tipoDocumento: number | null;
  numeroDocumento: string | null;
  sector: number | null;
  industria: number | null;
  pais: number | null;
  departamento: number | null;
  provincia: number | null;
  distrito: number | null;
  direccion: string | null;
  nombrePais: string | null;
  nombreDepartamento: string | null;
  nombreProvincia: string | null;
  nombreDistrito: string | null;
  ubicacionCompleta: string | null;
  ubicacionCorta: string | null;
  telefono: string | null;
  email: string | null;
  paginaWeb: string | null;
  mision: string | null;
  vision: string | null;
  valoresCorporativos: string | null;
  fechaConstitucion: string | null;
  fechaInicioOperaciones: string | null;
  logoUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  suscripcionActualId: number | null;
  estadoLicencia: number | null;
  estadoLicenciaTexto: string | null;
  instancia: string | null;
  dominio: string | null;
  tenantId: string | null;
  clientId: string | null;
  callbackPath: string | null;
  nombrePlanActual: string | null;
  fechaInicioSuscripcion: string | null;
  fechaFinSuscripcion: string | null;
  limiteUsuarios: number | null;
  suscripcionVigente: boolean | null;
  diasRestantesSuscripcion: number | null;
  totalUnidadesOrganizacionales: number | null;
  totalUsuarios: number | null;
  tieneUbicacionCompleta: boolean | null;
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  nombreUsuarioCreador: string | null;
  nombreUsuarioActualizador: string | null;
  tipoDocumentoTexto: string | null;
  sectorTexto: string | null;
  industriaTexto: string | null;
  estadoTexto: string | null;
}

// Entidad completa de Organizacion (para endpoints que devuelven la entidad completa)
export interface Organizacion {
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  organizacionId: number;
  codigo: string | null;
  razonSocial: string;
  nombreComercial: string | null;
  tipoDocumento: number | null;
  numeroDocumento: string | null;
  sector: number | null;
  industria: number | null;
  pais: number | null;
  departamento: number | null;
  provincia: number | null;
  distrito: number | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  paginaWeb: string | null;
  mision: string | null;
  vision: string | null;
  valoresCorporativos: string | null;
  fechaConstitucion: string | null;
  fechaInicioOperaciones: string | null;
  logoUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  suscripcionActualId: number | null;
  estadoLicencia: number | null;
  instancia: string | null;
  dominio: string | null;
  tenantId: string | null;
  clientId: string | null;
  clientSecret: string | null;
  callbackPath: string | null;
  ubigeoPais: any | null;
  ubigeoDepartamento: any | null;
  ubigeoProvincia: any | null;
  ubigeoDistrito: any | null;
  suscripcionActual: any | null;
  unidadesOrganizacionales: any[] | null;
  suscripciones: any[] | null;
  ubicacionCompleta: string | null;
  ubicacionCorta: string | null;
  tieneUbicacionCompleta: boolean;
}

// Command para crear organizacion
export interface CreateOrganizacionCommand {
  codigo?: string | null;
  razonSocial: string;
  nombreComercial?: string | null;
  tipoDocumento?: number | null;
  numeroDocumento?: string | null;
  sector?: number | null;
  industria?: number | null;
  pais?: number | null;
  departamento?: number | null;
  provincia?: number | null;
  distrito?: number | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  paginaWeb?: string | null;
  mision?: string | null;
  vision?: string | null;
  valoresCorporativos?: string | null;
  fechaConstitucion?: string | null;
  fechaInicioOperaciones?: string | null;
  logoUrl?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  suscripcionActualId?: number | null;
  estadoLicencia?: number | null;
  instancia?: string | null;
  dominio?: string | null;
  tenantId?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  callbackPath?: string | null;
}

// Command para actualizar organizacion
export interface UpdateOrganizacionCommand {
  organizacionId: number;
  codigo?: string | null;
  razonSocial: string;
  nombreComercial?: string | null;
  tipoDocumento?: number | null;
  numeroDocumento?: string | null;
  sector?: number | null;
  industria?: number | null;
  pais?: number | null;
  departamento?: number | null;
  provincia?: number | null;
  distrito?: number | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  paginaWeb?: string | null;
  mision?: string | null;
  vision?: string | null;
  valoresCorporativos?: string | null;
  fechaConstitucion?: string | null;
  fechaInicioOperaciones?: string | null;
  logoUrl?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  suscripcionActualId?: number | null;
  estadoLicencia?: number | null;
  instancia?: string | null;
  dominio?: string | null;
  tenantId?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  callbackPath?: string | null;
}

// Request types
export interface GetOrganizacionesRequest {
  includeDeleted?: boolean;
}

export interface GetOrganizacionRequest {
  id: number;
  includeDeleted?: boolean;
}

export interface GetOrganizacionesPaginatedRequest {
  Page?: number;
  PageSize?: number;
  RazonSocial?: string;
  NombreComercial?: string;
  Codigo?: string;
  NumeroDocumento?: string;
  TipoDocumento?: number;
  Sector?: number;
  Industria?: number;
  EstadoLicencia?: number;
  Pais?: number;
  Departamento?: number;
  Provincia?: number;
  Distrito?: number;
  FechaConstitucionDesde?: string;
  FechaConstitucionHasta?: string;
  FechaInicioOperacionesDesde?: string;
  FechaInicioOperacionesHasta?: string;
  SoloConSuscripcionVigente?: boolean;
  SoloConSuscripcionPorVencer?: boolean;
  DiasAnticipacionVencimiento?: number;
  Estado?: number;
  IncludeDeleted?: boolean;
  Instancia?: string;
  Dominio?: string;
  TenantId?: string;
  ClientId?: string;
  OrderBy?: string;
  OrderDescending?: boolean;
}

export interface ValidarADRequest {
  dominio: string;
}

export interface ValidarADMultipleRequest {
  dominios: string[];
}

// Response types
export interface GetOrganizacionesResponse {
  success: boolean;
  message: string;
  data: OrganizacionDto[];
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface GetOrganizacionResponse {
  success: boolean;
  message: string;
  data: OrganizacionDto;
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface GetOrganizacionCompletaResponse {
  success: boolean;
  message: string;
  data: Organizacion;
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface CreateOrganizacionResponse {
  success: boolean;
  message: string;
  data: number; // ID de la organizacion creada
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface UpdateOrganizacionResponse {
  success: boolean;
  message: string;
  data: boolean;
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface DeleteOrganizacionResponse {
  success: boolean;
  message: string;
  data: boolean;
  errors: string[];
  statusCode: number;
  metadata: any;
}

// PagedResult eliminado para evitar conflictos - usar desde common.types.ts

export interface GetOrganizacionesPaginatedResponse {
  success: boolean;
  message: string;
  data: {
    items: OrganizacionDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface EstadisticasPorEstadoResponse {
  success: boolean;
  message: string;
  data: { [key: string]: number };
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface ValidarADResponse {
  success: boolean;
  message: string;
  data: any;
  errors: string[];
  statusCode: number;
  metadata: any;
}

// Enums y constantes
export enum EstadoOrganizacion {
  Inactivo = 0,
  Activo = 1
}

export enum EstadoLicencia {
  Inactiva = 0,
  Activa = 1,
  Suspendida = 2,
  Vencida = 3
}

// TipoDocumento enum movido a common.types.ts para evitar duplicaciones

// Enum para sectores económicos
export enum SectorEconomico {
  Agricultura = 1,
  Mineria = 2,
  Manufactura = 3,
  Electricidad = 4,
  Construccion = 5,
  Comercio = 6,
  Transporte = 7,
  Hoteles = 8,
  Financiero = 9,
  Inmobiliario = 10,
  Servicios = 11,
  Educacion = 12,
  Salud = 13,
  Gobierno = 14,
  Tecnologia = 15,
  Telecomunicaciones = 16,
  Entretenimiento = 17,
  Consultoria = 18,
  Logistica = 19,
  Seguros = 20,
  Retail = 21,
  Turismo = 22,
  Energia = 23,
  Medioambiente = 24,
  Otro = 99
}

// Enum para industrias
export enum Industria {
  Agroalimentaria = 1,
  Automotriz = 2,
  Bancaria = 3,
  Biotecnologia = 4,
  Construccion = 5,
  Educacion = 6,
  Energia = 7,
  Entretenimiento = 8,
  Farmaceutica = 9,
  Financiera = 10,
  Inmobiliaria = 11,
  Logistica = 12,
  Manufactura = 13,
  Medica = 14,
  Metalurgia = 15,
  Mineria = 16,
  Petroleo = 17,
  Quimica = 18,
  Retail = 19,
  Seguros = 20,
  Tecnologia = 21,
  Telecomunicaciones = 22,
  Textil = 23,
  Transporte = 24,
  Turismo = 25,
  Servicios = 26,
  Consultoria = 27,
  Marketing = 28,
  Publicitaria = 29,
  Medioambiente = 30,
  Otro = 99
}

// Helpers para obtener texto de enums
export const getSectorEconomicoText = (sector: number | null): string => {
  if (sector === null) return 'No especificado';
  switch (sector) {
    case SectorEconomico.Agricultura: return 'Agricultura, Ganadería, Caza y Silvicultura';
    case SectorEconomico.Mineria: return 'Minería';
    case SectorEconomico.Manufactura: return 'Industrias Manufactureras';
    case SectorEconomico.Electricidad: return 'Electricidad, Gas y Agua';
    case SectorEconomico.Construccion: return 'Construcción';
    case SectorEconomico.Comercio: return 'Comercio al por Mayor y Menor';
    case SectorEconomico.Transporte: return 'Transporte, Almacenamiento y Comunicaciones';
    case SectorEconomico.Hoteles: return 'Hoteles y Restaurantes';
    case SectorEconomico.Financiero: return 'Intermediación Financiera';
    case SectorEconomico.Inmobiliario: return 'Actividades Inmobiliarias';
    case SectorEconomico.Servicios: return 'Servicios Empresariales';
    case SectorEconomico.Educacion: return 'Educación';
    case SectorEconomico.Salud: return 'Servicios Sociales y de Salud';
    case SectorEconomico.Gobierno: return 'Gobierno y Defensa';
    case SectorEconomico.Tecnologia: return 'Tecnología de la Información';
    case SectorEconomico.Telecomunicaciones: return 'Telecomunicaciones';
    case SectorEconomico.Entretenimiento: return 'Entretenimiento y Recreación';
    case SectorEconomico.Consultoria: return 'Consultoría';
    case SectorEconomico.Logistica: return 'Logística y Distribución';
    case SectorEconomico.Seguros: return 'Seguros';
    case SectorEconomico.Retail: return 'Retail y Comercio Minorista';
    case SectorEconomico.Turismo: return 'Turismo';
    case SectorEconomico.Energia: return 'Energía';
    case SectorEconomico.Medioambiente: return 'Medio Ambiente';
    case SectorEconomico.Otro: return 'Otro';
    default: return 'Sector no definido';
  }
};

export const getIndustriaText = (industria: number | null): string => {
  if (industria === null) return 'No especificado';
  switch (industria) {
    case Industria.Agroalimentaria: return 'Agroalimentaria';
    case Industria.Automotriz: return 'Automotriz';
    case Industria.Bancaria: return 'Bancaria';
    case Industria.Biotecnologia: return 'Biotecnología';
    case Industria.Construccion: return 'Construcción';
    case Industria.Educacion: return 'Educación';
    case Industria.Energia: return 'Energía';
    case Industria.Entretenimiento: return 'Entretenimiento';
    case Industria.Farmaceutica: return 'Farmacéutica';
    case Industria.Financiera: return 'Financiera';
    case Industria.Inmobiliaria: return 'Inmobiliaria';
    case Industria.Logistica: return 'Logística';
    case Industria.Manufactura: return 'Manufactura';
    case Industria.Medica: return 'Médica';
    case Industria.Metalurgia: return 'Metalurgia';
    case Industria.Mineria: return 'Minería';
    case Industria.Petroleo: return 'Petróleo y Gas';
    case Industria.Quimica: return 'Química';
    case Industria.Retail: return 'Retail';
    case Industria.Seguros: return 'Seguros';
    case Industria.Tecnologia: return 'Tecnología';
    case Industria.Telecomunicaciones: return 'Telecomunicaciones';
    case Industria.Textil: return 'Textil';
    case Industria.Transporte: return 'Transporte';
    case Industria.Turismo: return 'Turismo';
    case Industria.Servicios: return 'Servicios';
    case Industria.Consultoria: return 'Consultoría';
    case Industria.Marketing: return 'Marketing';
    case Industria.Publicitaria: return 'Publicitaria';
    case Industria.Medioambiente: return 'Medio Ambiente';
    case Industria.Otro: return 'Otro';
    default: return 'Industria no definida';
  }
};

// Constantes para filtros
export const ESTADOS_ORGANIZACION: { value: EstadoOrganizacion; label: string }[] = [
  { value: EstadoOrganizacion.Inactivo, label: 'Inactivo' },
  { value: EstadoOrganizacion.Activo, label: 'Activo' }
];

export const ESTADOS_LICENCIA: { value: EstadoLicencia; label: string }[] = [
  { value: EstadoLicencia.Inactiva, label: 'Inactiva' },
  { value: EstadoLicencia.Activa, label: 'Activa' },
  { value: EstadoLicencia.Suspendida, label: 'Suspendida' },
  { value: EstadoLicencia.Vencida, label: 'Vencida' }
];

export const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: TipoDocumento.RUC, label: 'RUC' },
  { value: TipoDocumento.DNI, label: 'DNI' },
  { value: TipoDocumento.Pasaporte, label: 'Pasaporte' },
  { value: TipoDocumento.CarnetExtranjeria, label: 'Carnet de Extranjería' }
];

// ===== NUEVAS INTERFACES PARA ESTRUCTURA ORGANIZACIONAL =====

// Interfaces para la estructura organizacional
export interface OrganizacionEstructura {
  organizacionId: number;
  razonSocial: string;
}

export interface PersonaEstructura {
  personaId: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nroDoc: string;
  tipoDoc: string;
  emailPersonal: string;
  celular: string;
  codEmpleado: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  estado: string;
}

export interface UnidadOrgEstructura {
  unidadesOrgId: number;
  organizacionId: number;
  unidadPadreId: number | null;
  nombre: string;
  nombreCorto: string;
  tipoUnidad: string;
  objetivo: string;
  estado: string;
  version: number;
}

export interface PosicionEstructura {
  posicionId: number;
  unidadesOrgId: number;
  nombre: string;
  categoria: string;
  objetivo: string;
  ordenImpresion: number;
  estado: string;
  version: number;
}

export interface PersonaPosicionEstructura {
  personaId: number;
  posicionId: number;
  fechaInicio: string;
  fechaFin: string | null;
}

// Interface principal para la estructura organizacional completa
export interface EstructuraOrganizacional {
  organizacion: OrganizacionEstructura;
  personas: PersonaEstructura[];
  unidadesOrg: UnidadOrgEstructura[];
  posiciones: PosicionEstructura[];
  personaPosicion: PersonaPosicionEstructura[];
}

// Response type para el endpoint de estructura organizacional
export interface GetEstructuraOrganizacionalResponse {
  success: boolean;
  message: string;
  data: EstructuraOrganizacional;
  errors: string[];
  statusCode: number;
  metadata: any;
}

// ===== NUEVAS INTERFACES PARA CARGA MASIVA =====

// Interfaces para el request de carga masiva
export interface CargaMasivaOrganizacionRequest {
  organizacionId: number;
  razonSocial: string;
  codigo: string;
}

export interface CargaMasivaPersonaRequest {
  personaIdTemp: number;
  tipoDoc: number;
  nroDoc: string;
  codEmpleado: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  estadoLaboral: number;
  fechaNacimiento: string;
  fechaIngreso: string;
  emailPersonal: string;
  celular: string;
  direccion: string;
  ubigeo: string;
  esUsuario: boolean;
}

export interface CargaMasivaUnidadOrgRequest {
  unidadOrgIdTemp: number;
  organizacionId: number;
  unidadPadreId: number | null;
  tipoUnidad: number;
  nombre: string;
  nombreCorto: string;
  objetivo: string;
  posicionCategoria: number;
  centroCosto: string;
}

export interface CargaMasivaPosicionRequest {
  posicionIdTemp: number;
  unidadOrgIdTemp: number;
  nombre: string;
  categoria: number;
  objetivo: string;
  ordenImpresion: number;
}

export interface CargaMasivaPersonaPosicionRequest {
  personaIdTemp: number;
  posicionIdTemp: number;
  fechaInicio: string;
  fechaFin: string | null;
}

// Request principal para carga masiva
export interface CargaMasivaRequest {
  organizacion: CargaMasivaOrganizacionRequest;
  personas: CargaMasivaPersonaRequest[];
  unidadesOrg: CargaMasivaUnidadOrgRequest[];
  posiciones: CargaMasivaPosicionRequest[];
  personaPosicion: CargaMasivaPersonaPosicionRequest[];
}

// Interfaces para la respuesta de carga masiva
export interface CargaMasivaEstadisticas {
  personasExistentes: number;
  personasCreadas: number;
  personasErrores: number;
  unidadesOrgExistentes: number;
  unidadesOrgCreadas: number;
  unidadesOrgErrores: number;
  posicionesExistentes: number;
  posicionesCreadas: number;
  posicionesErrores: number;
  relacionesCreadas: number;
  relacionesErrores: number;
  totalElementosProcesados: number;
  totalExitosos: number;
  totalErrores: number;
}

export interface CargaMasivaResultado {
  esExitoso: boolean;
  mensaje: string;
  estadisticas: CargaMasivaEstadisticas;
  errores: string[];
  advertencias: string[];
  mapeoPersonas: { [key: string]: number };
  mapeoUnidadesOrg: { [key: string]: number };
  mapeoPosiciones: { [key: string]: number };
}

export interface CargaMasivaResponse {
  success: boolean;
  message: string;
  data: CargaMasivaResultado;
  errors: string[];
  statusCode: number;
  metadata: string | null;
}

// Response para el endpoint de eliminación de estructura organizacional
export interface DeleteEstructuraOrganizacionalResponse {
  success: boolean;
  message: string;
  data: boolean;
  errors: string[];
  statusCode: number;
  metadata: any;
}

// ===== TIPOS DE DOCUMENTO =====
export enum TipoDocumento {
  RUC = 1,
  DNI = 2,
  Pasaporte = 3,
  CarnetExtranjeria = 4
}

// Tipos comunes ya movidos a common.types.ts:
// - PaginationOptions 
// - SortOptions 
// - PagedResult 

// Tipos para guardar el layout del organigrama (React Flow)
export interface NodePositionLayout {
  /** ID del nodo (usaremos unidadesOrgId) */
  nodeId: number;
  x: number;
  y: number;
}

export interface ViewportLayout {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Request para guardar/actualizar el layout organizacional
 * - positions: posiciones absolutas de los nodos (en px)
 * - viewport: estado de la vista (opcional)
 * - view: identificador de la vista (por ejemplo: 'reactflow')
 * - scope: alcance del layout (por ejemplo: 'shared' o 'personal')
 * - dataVersion: versión opcional para control de concurrencia optimista
 */
export interface SaveOrganizationalLayoutRequest {
  positions: NodePositionLayout[];
  viewport?: ViewportLayout | null;
  view?: string | null;
  scope?: 'shared' | 'personal' | null;
  dataVersion?: number | null;
}

export interface SaveOrganizationalLayoutResponse {
  success: boolean;
  message: string;
  data: boolean;
  errors: string[];
  statusCode: number;
  metadata: any;
}