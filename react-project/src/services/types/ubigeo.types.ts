// Tipos para el servicio de Ubigeo

export interface UbigeoDto {
  ubigeoId: number;
  ubigeoPadreId: number | null;
  idNivel: number;
  codigo: string;
  codigoCompleto: string;
  nombre: string;
  nombreCorto: string;
  ubigeoPadre: UbigeoDto | null;
  ubigeosHijos: UbigeoDto[];
  organizacionesPais: any[];
  organizacionesDepartamento: any[];
  organizacionesProvincia: any[];
  organizacionesDistrito: any[];
  personas: any[];
  tipoNivel: string;
  esPais: boolean;
  esDepartamento: boolean;
  esProvincia: boolean;
  esDistrito: boolean;
  nombreCompleto: string;
  nombreConTipo: string;
}

// Request types
export interface GetUbigeosRequest {
  includeDeleted?: boolean;
}

// Response types
export interface GetUbigeosResponse {
  success: boolean;
  message: string;
  data: UbigeoDto[];
  errors: string[];
  statusCode: number;
  metadata: any;
}

// Tipos de nivel de ubigeo
export type TipoNivelUbigeo = 'País' | 'Departamento' | 'Provincia' | 'Distrito';

// Constantes para filtros
export const TIPOS_NIVEL_UBIGEO: { value: TipoNivelUbigeo; label: string }[] = [
  { value: 'País', label: 'País' },
  { value: 'Departamento', label: 'Departamento' },
  { value: 'Provincia', label: 'Provincia' },
  { value: 'Distrito', label: 'Distrito' }
]; 