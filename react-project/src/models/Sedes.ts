export interface Sede {
  sedeId: number;
  organizacionId: number;
  nombre: string;
  descripcion: string;
  ubigeo: string;
  nombreDepartamento: string;
  nombreProvincia: string;
  nombreDistrito: string;
  ubicacionCompleta: string;
  cantidadUnidadesOrg: number;
  cantidadPosiciones: number;
  cantidadPersonas: number;
  razonSocialOrganizacion: string;
  nombreComercialOrganizacion: string;
  codigoOrganizacion: string;
  estado: 'ACTIVA' | 'INACTIVA';
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
  actualizadoPor: string;
}

export interface SedeFormData {
  organizacionId: number;
  nombre: string;
  descripcion: string;
  ubigeo: string;
  nombreDepartamento?: string;
  nombreProvincia?: string;
  nombreDistrito?: string;
}

export interface SedeResumen {
  sedeId: number;
  nombre: string;
  descripcion: string;
  ubicacionCompleta: string;
  cantidadUnidadesOrg: number;
  cantidadPosiciones: number;
  cantidadPersonas: number;
  tieneUnidadesOrg: boolean;
  tienePosiciones: boolean;
  tienePersonas: boolean;
} 