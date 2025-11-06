import { 
  Servidor, 
  SistemaServidor,
  TipoServidor,
  AmbienteServidor,
  EstadoServidor,
  ProveedorCloud
} from '../models/Servidores';

// =============================================
// MOCK DATA PARA SERVIDORES
// =============================================

export const servidoresMock: Servidor[] = [
  // Servidores de Producción
  {
    servidorId: 1,
    organizacionId: 1,
    codigoServidor: 'PROD-WEB-01',
    nombreServidor: 'Servidor Web Principal',
    descripcion: 'Servidor web principal para aplicaciones de producción',
    tipoServidor: TipoServidor.VIRTUAL,
    sistemaOperativo: 'Ubuntu 22.04',
    ambiente: AmbienteServidor.PRODUCCION,
    direccionIP: '10.0.1.10',
    puerto: 80,
    cpu: 'Intel Xeon 4vCPU',
    memoriaRAM: '16 GB',
    almacenamiento: '500 GB SSD',
    proveedor: ProveedorCloud.AWS,
    ubicacionFisica: 'AWS us-east-1',
    responsableTecnico: 'Juan Pérez',
    fechaInstalacion: '2024-01-15T00:00:00.000Z',
    fechaUltimoMantenimiento: '2024-03-01T00:00:00.000Z',
    version: 1,
    estado: EstadoServidor.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T10:30:00.000Z',
    actualizadoPor: 1,
    fechaActualizacion: '2024-03-01T15:45:00.000Z',
    registroEliminado: false,
    sistemasAsignados: 3,
    cantidadSistemas: 3
  },
  {
    servidorId: 2,
    organizacionId: 1,
    codigoServidor: 'PROD-DB-01',
    nombreServidor: 'Servidor Base de Datos Principal',
    descripcion: 'Servidor de base de datos para aplicaciones críticas',
    tipoServidor: TipoServidor.FISICO,
    sistemaOperativo: 'Windows Server 2022',
    ambiente: AmbienteServidor.PRODUCCION,
    direccionIP: '10.0.1.20',
    puerto: 1433,
    cpu: 'Intel Xeon 8vCPU',
    memoriaRAM: '32 GB',
    almacenamiento: '1 TB SSD',
    proveedor: ProveedorCloud.AWS,
    ubicacionFisica: 'AWS us-east-1',
    responsableTecnico: 'María González',
    fechaInstalacion: '2024-01-20T00:00:00.000Z',
    fechaUltimoMantenimiento: '2024-03-05T00:00:00.000Z',
    version: 1,
    estado: EstadoServidor.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-01-20T09:15:00.000Z',
    actualizadoPor: 1,
    fechaActualizacion: '2024-03-05T14:20:00.000Z',
    registroEliminado: false,
    sistemasAsignados: 2,
    cantidadSistemas: 2
  },
  {
    servidorId: 3,
    organizacionId: 1,
    codigoServidor: 'PROD-API-01',
    nombreServidor: 'Servidor API Gateway',
    descripcion: 'Gateway de APIs para microservicios',
    tipoServidor: TipoServidor.VIRTUAL,
    sistemaOperativo: 'Red Hat Enterprise Linux 8',
    ambiente: AmbienteServidor.PRODUCCION,
    direccionIP: '10.0.1.30',
    puerto: 8080,
    cpu: 'AMD EPYC 6vCPU',
    memoriaRAM: '24 GB',
    almacenamiento: '250 GB SSD',
    proveedor: ProveedorCloud.ON_PREMISE,
    ubicacionFisica: 'Datacenter Principal - Rack A-05',
    responsableTecnico: 'Carlos Rodríguez',
    fechaInstalacion: '2024-02-01T00:00:00.000Z',
    fechaUltimoMantenimiento: '2024-03-10T00:00:00.000Z',
    version: 1,
    estado: EstadoServidor.ACTIVO,
    creadoPor: 1,
    fechaCreacion: '2024-02-01T11:00:00.000Z',
    actualizadoPor: 1,
    fechaActualizacion: '2024-03-10T16:30:00.000Z',
    registroEliminado: false,
    sistemasAsignados: 5,
    cantidadSistemas: 5
  },
  // Servidores de Desarrollo
  {
    servidorId: 4,
    organizacionId: 1,
    codigoServidor: 'DEV-WEB-01',
    nombreServidor: 'Servidor Web Desarrollo',
    descripcion: 'Servidor para desarrollo y pruebas de aplicaciones web',
    tipoServidor: TipoServidor.VIRTUAL,
    sistemaOperativo: 'Ubuntu 20.04',
    ambiente: AmbienteServidor.DESARROLLO,
    direccionIP: '10.1.1.10',
    puerto: 3000,
    cpu: 'Intel Core i5 2vCPU',
    memoriaRAM: '8 GB',
    almacenamiento: '200 GB SSD',
    proveedor: ProveedorCloud.AZURE,
    ubicacionFisica: 'Azure West US 2',
    responsableTecnico: 'Ana López',
    fechaInstalacion: '2024-01-25T00:00:00.000Z',
    fechaUltimoMantenimiento: '2024-02-15T00:00:00.000Z',
    version: 1,
    estado: EstadoServidor.ACTIVO,
    creadoPor: 2,
    fechaCreacion: '2024-01-25T08:45:00.000Z',
    actualizadoPor: 2,
    fechaActualizacion: '2024-02-15T12:10:00.000Z',
    registroEliminado: false,
    sistemasAsignados: 2,
    cantidadSistemas: 2
  },
  {
    servidorId: 5,
    organizacionId: 1,
    codigoServidor: 'DEV-DB-01',
    nombreServidor: 'Servidor Base de Datos Desarrollo',
    descripcion: 'Servidor de base de datos para desarrollo y pruebas',
    tipoServidor: TipoServidor.VIRTUAL,
    sistemaOperativo: 'CentOS 8',
    ambiente: AmbienteServidor.DESARROLLO,
    direccionIP: '10.1.1.20',
    puerto: 5432,
    cpu: 'Intel Core i3 2vCPU',
    memoriaRAM: '8 GB',
    almacenamiento: '100 GB SSD',
    proveedor: ProveedorCloud.GOOGLE_CLOUD,
    ubicacionFisica: 'Google Cloud us-central1',
    responsableTecnico: 'Luis Martín',
    fechaInstalacion: '2024-01-30T00:00:00.000Z',
    fechaUltimoMantenimiento: '2024-02-20T00:00:00.000Z',
    version: 1,
    estado: EstadoServidor.ACTIVO,
    creadoPor: 2,
    fechaCreacion: '2024-01-30T14:20:00.000Z',
    actualizadoPor: 2,
    fechaActualizacion: '2024-02-20T10:15:00.000Z',
    registroEliminado: false,
    sistemasAsignados: 1,
    cantidadSistemas: 1
  },
  {
    servidorId: 6,
    organizacionId: 1,
    codigoServidor: 'DEV-TEST-01',
    nombreServidor: 'Servidor Web Desarrollo',
    descripcion: 'Servidor para desarrollo de integración y QA',
    tipoServidor: TipoServidor.VIRTUAL,
    sistemaOperativo: 'Ubuntu 22.04',
    ambiente: AmbienteServidor.DESARROLLO,
    direccionIP: '10.1.1.30',
    puerto: 4000,
    cpu: 'AMD Ryzen 2vCPU',
    memoriaRAM: '4 GB',
    almacenamiento: '100 GB HDD',
    proveedor: ProveedorCloud.DIGITAL_OCEAN,
    ubicacionFisica: 'DigitalOcean NYC3',
    responsableTecnico: 'Pedro Sánchez',
    fechaInstalacion: '2024-02-10T00:00:00.000Z',
    fechaUltimoMantenimiento: '2024-02-28T00:00:00.000Z',
    version: 1,
    estado: EstadoServidor.INACTIVO,
    creadoPor: 3,
    fechaCreacion: '2024-02-10T16:00:00.000Z',
    actualizadoPor: 3,
    fechaActualizacion: '2024-02-28T09:30:00.000Z',
    registroEliminado: false,
    sistemasAsignados: 0,
    cantidadSistemas: 0
  }
];

// =============================================
// MOCK DATA PARA SISTEMAS-SERVIDORES
// =============================================

export const sistemaServidoresMock: SistemaServidor[] = [
  {
    sistemaServidorId: 1,
    sistemaId: 1,
    servidorId: 1,
    fechaAsignacion: '2024-01-15T10:30:00.000Z',
    fechaDesasignacion: null,
    activo: true,
    observaciones: 'Asignación inicial del sistema CRM',
    version: 1,
    creadoPor: 1,
    fechaCreacion: '2024-01-15T10:30:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    nombreSistema: 'Sistema CRM',
    nombreServidor: 'Servidor Web Principal'
  },
  {
    sistemaServidorId: 2,
    sistemaId: 2,
    servidorId: 2,
    fechaAsignacion: '2024-01-20T09:15:00.000Z',
    fechaDesasignacion: null,
    activo: true,
    observaciones: 'Base de datos principal para ERP',
    version: 1,
    creadoPor: 1,
    fechaCreacion: '2024-01-20T09:15:00.000Z',
    actualizadoPor: null,
    fechaActualizacion: null,
    registroEliminado: false,
    nombreSistema: 'Sistema ERP',
    nombreServidor: 'Servidor Base de Datos Principal'
  }
];

export default servidoresMock;

// =============================================
// FUNCIONES UTILITARIAS PARA MOCKS
// =============================================

export const getServidoresByOrganizacion = (organizacionId: number): Servidor[] => {
  return servidoresMock.filter(servidor => 
    servidor.organizacionId === organizacionId && !servidor.registroEliminado
  );
};

export const getServidoresActivosByOrganizacion = (organizacionId: number): Servidor[] => {
  return servidoresMock.filter(servidor => 
    servidor.organizacionId === organizacionId && 
    servidor.estado === EstadoServidor.ACTIVO &&
    !servidor.registroEliminado
  );
};

export const getServidorById = (servidorId: number): Servidor | undefined => {
  return servidoresMock.find(servidor => servidor.servidorId === servidorId);
};

export const getServidoresByAmbiente = (organizacionId: number, ambiente: AmbienteServidor): Servidor[] => {
  return servidoresMock.filter(servidor => 
    servidor.organizacionId === organizacionId &&
    servidor.ambiente === ambiente &&
    !servidor.registroEliminado
  );
};

export const getServidoresByTipo = (organizacionId: number, tipo: TipoServidor): Servidor[] => {
  return servidoresMock.filter(servidor => 
    servidor.organizacionId === organizacionId &&
    servidor.tipoServidor === tipo &&
    !servidor.registroEliminado
  );
};

export const getServidoresByProveedor = (organizacionId: number, proveedor: ProveedorCloud): Servidor[] => {
  return servidoresMock.filter(servidor => 
    servidor.organizacionId === organizacionId &&
    servidor.proveedor === proveedor &&
    !servidor.registroEliminado
  );
};

export const getSistemaServidorByIds = (sistemaId: number, servidorId: number): SistemaServidor | undefined => {
  return sistemaServidoresMock.find(ss => 
    ss.sistemaId === sistemaId && 
    ss.servidorId === servidorId && 
    ss.activo && 
    !ss.registroEliminado
  );
};

export const getSistemasByServidor = (servidorId: number): SistemaServidor[] => {
  return sistemaServidoresMock.filter(ss => 
    ss.servidorId === servidorId && 
    ss.activo && 
    !ss.registroEliminado
  );
};

export const getServidoresBySistema = (sistemaId: number): SistemaServidor[] => {
  return sistemaServidoresMock.filter(ss => 
    ss.sistemaId === sistemaId && 
    ss.activo && 
    !ss.registroEliminado
  );
};

export const getServidoresStats = (organizacionId: number) => {
  const servidores = getServidoresByOrganizacion(organizacionId);
  
  const porTipo = servidores.reduce((acc, servidor) => {
    acc[servidor.tipoServidor] = (acc[servidor.tipoServidor] || 0) + 1;
    return acc;
  }, {} as Record<TipoServidor, number>);

  const porAmbiente = servidores.reduce((acc, servidor) => {
    acc[servidor.ambiente] = (acc[servidor.ambiente] || 0) + 1;
    return acc;
  }, {} as Record<AmbienteServidor, number>);

  const porEstado = servidores.reduce((acc, servidor) => {
    acc[servidor.estado] = (acc[servidor.estado] || 0) + 1;
    return acc;
  }, {} as Record<EstadoServidor, number>);

  const porProveedor = servidores.reduce((acc, servidor) => {
    acc[servidor.proveedor] = (acc[servidor.proveedor] || 0) + 1;
    return acc;
  }, {} as Record<ProveedorCloud, number>);

  return {
    total: servidores.length,
    activos: servidores.filter(s => s.estado === EstadoServidor.ACTIVO).length,
    inactivos: servidores.filter(s => s.estado === EstadoServidor.INACTIVO).length,
    porTipo,
    porAmbiente,
    porEstado,
    porProveedor,
    totalMemoriaRAM: servidores.reduce((acc, servidor) => {
      const memoria = servidor.memoriaRAM ? parseInt(servidor.memoriaRAM.replace(/\D/g, '')) : 0;
      return acc + memoria;
    }, 0),
    totalAlmacenamiento: servidores.reduce((acc, servidor) => {
      const almacenamiento = servidor.almacenamiento ? parseInt(servidor.almacenamiento.replace(/\D/g, '')) : 0;
      return acc + almacenamiento;
    }, 0),
    totalSistemasAsignados: sistemaServidoresMock.filter(ss => ss.activo && !ss.registroEliminado).length
  };
};

export const buscarServidores = (organizacionId: number, termino: string): Servidor[] => {
  const terminoLower = termino.toLowerCase();
  return servidoresMock.filter(servidor => 
    servidor.organizacionId === organizacionId &&
    !servidor.registroEliminado &&
    (
      servidor.nombreServidor.toLowerCase().includes(terminoLower) ||
      servidor.codigoServidor?.toLowerCase().includes(terminoLower) ||
      servidor.descripcion?.toLowerCase().includes(terminoLower) ||
      servidor.direccionIP?.toLowerCase().includes(terminoLower) ||
      servidor.responsableTecnico?.toLowerCase().includes(terminoLower)
    )
  );
};

export const validarCodigoServidorUnico = (codigo: string, organizacionId: number, servidorId?: number): boolean => {
  return !servidoresMock.some(servidor => 
    servidor.codigoServidor === codigo &&
    servidor.organizacionId === organizacionId &&
    servidor.servidorId !== servidorId &&
    !servidor.registroEliminado
  );
};

export const validarIPUnica = (ip: string, organizacionId: number, servidorId?: number): boolean => {
  return !servidoresMock.some(servidor => 
    servidor.direccionIP === ip &&
    servidor.organizacionId === organizacionId &&
    servidor.servidorId !== servidorId &&
    !servidor.registroEliminado
  );
}; 