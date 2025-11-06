// Tipos para el servicio de Sedes

// Entidad principal de Sede
export interface Sede {
  sedeId: number;
  organizacionId: number | null;
  nombre: string | null;
  descripcion: string | null;
  ubigeo: string | null;
  organizacion: any | null;
  unidadesOrg: any[] | null;
}

// DTO completo de Sede con información adicional
export interface SedeDto {
  sedeId: number;
  organizacionId: number | null;
  nombre: string | null;
  descripcion: string | null;
  ubigeo: string | null;
  codigoOrganizacion: string | null;
  razonSocialOrganizacion: string | null;
  nombreComercialOrganizacion: string | null;
  nombreDepartamento: string | null;
  nombreProvincia: string | null;
  nombreDistrito: string | null;
  ubicacionCompleta: string | null;
  cantidadUnidadesOrg: number;
  cantidadPosiciones: number;
  cantidadPersonas: number;
  tieneUnidadesOrg: boolean;
  tienePosiciones: boolean;
  tienePersonas: boolean;
}

// Command para crear una nueva sede
export interface CreateSedeCommand {
  organizacionId: number;
  nombre: string;
  descripcion?: string | null;
  ubigeo?: string | null;
}

// Command para actualizar una sede existente
export interface UpdateSedeCommand {
  sedeId: number;
  organizacionId?: number | null;
  nombre?: string | null;
  descripcion?: string | null;
  ubigeo?: string | null;
  actualizarOrganizacion: boolean;
  actualizarInformacionBasica: boolean;
  actualizarUbicacion: boolean;
  permitirCambioOrganizacion: boolean;
}

// Request types
export interface GetSedesRequest {
  organizacionId?: number;
  ubigeo?: string;
  searchTerm?: string;
}

export interface GetSedeRequest {
  id: number;
}

export interface GetSedeCompletaRequest {
  id: number;
}

export interface GetSedesPorOrganizacionRequest {
  organizacionId: number;
}

export interface GetSedesPaginatedRequest {
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  OrganizacionId?: number;
  Ubigeo?: string;
  Nombre?: string;
  Descripcion?: string;
  NombreDepartamento?: string;
  NombreProvincia?: string;
  NombreDistrito?: string;
  TieneUnidadesOrg?: boolean;
  TienePosiciones?: boolean;
  TienePersonas?: boolean;
  OrderBy?: string;
  OrderDescending?: boolean;
}

export interface SearchSedesRequest {
  searchTerm: string;
}

export interface GetSedesPorUbicacionRequest {
  ubigeo: string;
}

export interface DeleteSedeRequest {
  id: number;
  reasignarUnidades?: boolean;
  nuevaSedeParaUnidades?: number;
}

// Response types
export interface GetSedesResponse {
  success: boolean;
  message: string;
  data: Sede[];
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface GetSedeResponse {
  success: boolean;
  message: string;
  data: Sede;
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface GetSedeCompletaResponse {
  success: boolean;
  message: string;
  data: SedeDto;
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface CreateSedeResponse {
  success: boolean;
  message: string;
  data: number; // ID de la sede creada
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface UpdateSedeResponse {
  success: boolean;
  message: string;
  data: boolean;
  errors: string[];
  statusCode: number;
  metadata: any;
}

export interface DeleteSedeResponse {
  success: boolean;
  message: string;
  data: boolean;
  errors: string[];
  statusCode: number;
  metadata: any;
}

// PagedResult movido a common.types.ts para evitar duplicaciones

export interface GetSedesPaginatedResponse {
  success: boolean;
  message: string;
  data: PagedResult<SedeDto>;
  errors: string[];
  statusCode: number;
  metadata: any;
}

// Enums
export enum EstadoSede {
  Inactivo = 0,
  Activo = 1
} 