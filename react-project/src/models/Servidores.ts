// =============================================
// ENUMS Y TIPOS PARA MÓDULO SERVIDORES
// =============================================

// Enum para Tipo de Servidor (según backend: 0=Virtual, 1=Físico)
export enum TipoServidor {
  VIRTUAL = 0,
  FISICO = 1
}

// Enum para Ambiente (según backend: 0=Desarrollo, 1=Producción, 2=Pruebas, 3=PreProducción, 4=Recovery)
export enum AmbienteServidor {
  DESARROLLO = 0,
  PRODUCCION = 1,
  PRUEBAS = 2,
  PREPRODUCCION = 3,
  RECOVERY = 4
}

// Enum para Estado de Servidor (según backend: 0=Inactivo, 1=Activo)
export enum EstadoServidor {
  INACTIVO = 0,
  ACTIVO = 1
}

// Enum para Proveedor Cloud (solo para frontend, no usado en backend)
export enum ProveedorCloud {
  AWS = 1,
  AZURE = 2,
  GOOGLE_CLOUD = 3,
  ORACLE_CLOUD = 4,
  IBM_CLOUD = 5,
  DIGITAL_OCEAN = 6,
  VULTR = 7,
  LINODE = 8,
  ON_PREMISE = 9
}

// =============================================
// INTERFACES TYPESCRIPT
// =============================================

export interface Servidor {
  servidorId: number;
  organizacionId: number;
  codigoServidor: string | null;
  nombreServidor: string;
  descripcion: string | null;
  tipoServidor: TipoServidor;
  sistemaOperativo: string; // Cambiado de enum a string según backend
  ambiente: AmbienteServidor;
  direccionIP: string | null;
  puerto: number | null;
  cpu: string | null;
  memoriaRAM: string | null;
  almacenamiento: string | null;
  proveedor: ProveedorCloud;
  ubicacionFisica: string | null;
  responsableTecnico: string | null;
  fechaInstalacion: string | null;
  fechaUltimoMantenimiento: string | null;
  version: number;
  estado: EstadoServidor;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  // Propiedades calculadas/navegación
  sistemasAsignados?: number;
  cantidadSistemas?: number;
}

// Interface para crear servidor (alineada con swagger CreateServidorCommand)
export interface CreateServidorDto {
  organizacionId: number;
  codigoServidor: string;
  nombreServidor: string;
  tipoServidor: TipoServidor;
  ambiente: AmbienteServidor;
  sistemaOperativo: string; // Cambiado de enum a string según backend
  direccionIP: string;
  estado?: EstadoServidor;
  creadoPor?: number;
  // Campo temporal para mantener compatibilidad con frontend
  proveedor?: ProveedorCloud;
}

// Interface para actualizar servidor (alineada con swagger UpdateServidorCommand)
export interface UpdateServidorDto {
  servidorId: number;
  organizacionId: number;
  codigoServidor: string;
  nombreServidor: string;
  tipoServidor: TipoServidor;
  ambiente: AmbienteServidor;
  sistemaOperativo: string; // Cambiado de enum a string según backend
  direccionIP: string;
  estado?: EstadoServidor;
  actualizadoPor?: number;
  // Campo temporal para mantener compatibilidad con frontend
  proveedor?: ProveedorCloud;
}

// Interface para relación Sistema-Servidor
export interface SistemaServidor {
  sistemaServidorId: number;
  sistemaId: number;
  servidorId: number;
  fechaAsignacion: string;
  fechaDesasignacion: string | null;
  activo: boolean;
  observaciones: string | null;
  version: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  // Propiedades navegación
  nombreSistema?: string;
  nombreServidor?: string;
}

// =============================================
// DATOS MAESTROS - LABELS PARA LOS ENUMS
// =============================================

export const TIPO_SERVIDOR_LABELS: Record<TipoServidor, string> = {
  [TipoServidor.VIRTUAL]: 'Virtual',
  [TipoServidor.FISICO]: 'Físico'
};

// Opciones de sistemas operativos comunes (para frontend)
export const SISTEMA_OPERATIVO_OPTIONS = [
  'Windows Server 2019',
  'Windows Server 2022',
  'Ubuntu 20.04',
  'Ubuntu 22.04',
  'CentOS 7',
  'CentOS 8',
  'Red Hat Enterprise Linux 8',
  'Red Hat Enterprise Linux 9',
  'Debian 11',
  'Debian 12',
  'Oracle Linux 8',
  'Oracle Linux 9',
  'SUSE Linux Enterprise 15',
  'Amazon Linux 2',
  'Docker',
  'Kubernetes'
];

export const AMBIENTE_SERVIDOR_LABELS: Record<AmbienteServidor, string> = {
  [AmbienteServidor.DESARROLLO]: 'Desarrollo',
  [AmbienteServidor.PRODUCCION]: 'Producción',
  [AmbienteServidor.PRUEBAS]: 'Pruebas',
  [AmbienteServidor.PREPRODUCCION]: 'Pre-Producción',
  [AmbienteServidor.RECOVERY]: 'Recovery'
};

export const ESTADO_SERVIDOR_LABELS: Record<EstadoServidor, string> = {
  [EstadoServidor.ACTIVO]: 'Activo',
  [EstadoServidor.INACTIVO]: 'Inactivo'
};

export const PROVEEDOR_CLOUD_LABELS: Record<ProveedorCloud, string> = {
  [ProveedorCloud.AWS]: 'Amazon Web Services',
  [ProveedorCloud.AZURE]: 'Microsoft Azure',
  [ProveedorCloud.GOOGLE_CLOUD]: 'Google Cloud Platform',
  [ProveedorCloud.ORACLE_CLOUD]: 'Oracle Cloud',
  [ProveedorCloud.IBM_CLOUD]: 'IBM Cloud',
  [ProveedorCloud.DIGITAL_OCEAN]: 'DigitalOcean',
  [ProveedorCloud.VULTR]: 'Vultr',
  [ProveedorCloud.LINODE]: 'Linode',
  [ProveedorCloud.ON_PREMISE]: 'On-Premise'
};

// =============================================
// FUNCIONES HELPER PARA LOS LABELS
// =============================================

export const getTipoServidorLabel = (tipo: TipoServidor): string => {
  return TIPO_SERVIDOR_LABELS[tipo] || 'Desconocido';
};

export const getSistemaOperativoLabel = (so: string): string => {
  return so || 'Desconocido';
};

export const getAmbienteServidorLabel = (ambiente: AmbienteServidor): string => {
  return AMBIENTE_SERVIDOR_LABELS[ambiente] || 'Desconocido';
};

export const getEstadoServidorLabel = (estado: EstadoServidor): string => {
  return ESTADO_SERVIDOR_LABELS[estado] || 'Desconocido';
};

export const getProveedorCloudLabel = (proveedor: ProveedorCloud): string => {
  return PROVEEDOR_CLOUD_LABELS[proveedor] || 'Desconocido';
};

// Función para obtener opciones de dropdown
export const getTipoServidorOptions = () => {
  return Object.entries(TIPO_SERVIDOR_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};

export const getSistemaOperativoOptions = () => {
  return SISTEMA_OPERATIVO_OPTIONS.map((so) => ({
    value: so,
    label: so
  }));
};

export const getAmbienteServidorOptions = () => {
  return Object.entries(AMBIENTE_SERVIDOR_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};

export const getEstadoServidorOptions = () => {
  return Object.entries(ESTADO_SERVIDOR_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};

export const getProveedorCloudOptions = () => {
  return Object.entries(PROVEEDOR_CLOUD_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
};

// =============================================
// FUNCIONES UTILITARIAS
// =============================================

export const getServidorDisplayName = (servidor: Servidor): string => {
  const partes = [servidor.nombreServidor];
  if (servidor.ambiente !== undefined) {
    partes.push(`(${getAmbienteServidorLabel(servidor.ambiente)})`);
  }
  return partes.join(' ');
};

export const getServidorIcon = (tipo: TipoServidor): string => {
  switch (tipo) {
    case TipoServidor.FISICO:
      return '🖥️';
    case TipoServidor.VIRTUAL:
      return '💻';
    default:
      return '🖥️';
  }
};

export const getAmbienteColor = (ambiente: AmbienteServidor): string => {
  switch (ambiente) {
    case AmbienteServidor.DESARROLLO:
      return '#10b981'; // green - desarrollo
    case AmbienteServidor.PRODUCCION:
      return '#ef4444'; // red - producción
    case AmbienteServidor.PRUEBAS:
      return '#f59e0b'; // amber - pruebas
    case AmbienteServidor.PREPRODUCCION:
      return '#8b5cf6'; // violet - pre-producción
    case AmbienteServidor.RECOVERY:
      return '#6366f1'; // indigo - recovery
    default:
      return '#6b7280'; // gray
  }
}; 