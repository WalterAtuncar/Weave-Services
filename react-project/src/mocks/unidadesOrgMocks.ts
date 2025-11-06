import { UnidadOrganizacional } from '../models/UnidadesOrg';

// Mock data para UnidadesOrg (sin campos de auditoría para simplificar)
const unidadesOrgMock: Omit<UnidadOrganizacional, 'creadoPor' | 'fechaCreacion' | 'actualizadoPor' | 'fechaActualizacion' | 'registroEliminado'>[] = [
  {
    unidadesOrgId: 1,
    organizacionId: 1,
    unidadPadreId: null,
    tipoUnidad: 'DIRECCION',
    nombre: 'Dirección General',
    nombreCorto: 'DG',
    objetivo: 'Liderar y dirigir estratégicamente la organización hacia el cumplimiento de sus objetivos institucionales',
    posicionCategoria: 'EJECUTIVO',
    centroCosto: 'CC-001',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 2,
    organizacionId: 1,
    unidadPadreId: 1,
    tipoUnidad: 'GERENCIA',
    nombre: 'Gerencia de Recursos Humanos',
    nombreCorto: 'GRH',
    objetivo: 'Gestionar el talento humano de la organización mediante políticas y procedimientos efectivos',
    posicionCategoria: 'GERENCIAL',
    centroCosto: 'CC-002',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 3,
    organizacionId: 1,
    unidadPadreId: 1,
    tipoUnidad: 'GERENCIA',
    nombre: 'Gerencia de Tecnología e Información',
    nombreCorto: 'GTI',
    objetivo: 'Proveer soluciones tecnológicas innovadoras que soporten los procesos organizacionales',
    posicionCategoria: 'GERENCIAL',
    centroCosto: 'CC-003',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 4,
    organizacionId: 1,
    unidadPadreId: 1,
    tipoUnidad: 'GERENCIA',
    nombre: 'Gerencia de Operaciones',
    nombreCorto: 'GOP',
    objetivo: 'Supervisar y optimizar los procesos operativos para garantizar la eficiencia organizacional',
    posicionCategoria: 'GERENCIAL',
    centroCosto: 'CC-004',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 5,
    organizacionId: 1,
    unidadPadreId: 2,
    tipoUnidad: 'DEPARTAMENTO',
    nombre: 'Departamento de Selección y Contratación',
    nombreCorto: 'DSC',
    objetivo: 'Ejecutar procesos de reclutamiento, selección y contratación de personal calificado',
    posicionCategoria: 'JEFATURA',
    centroCosto: 'CC-005',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 6,
    organizacionId: 1,
    unidadPadreId: 2,
    tipoUnidad: 'DEPARTAMENTO',
    nombre: 'Departamento de Desarrollo Organizacional',
    nombreCorto: 'DDO',
    objetivo: 'Promover el desarrollo del capital humano a través de capacitación y desarrollo organizacional',
    posicionCategoria: 'JEFATURA',
    centroCosto: 'CC-006',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 7,
    organizacionId: 1,
    unidadPadreId: 3,
    tipoUnidad: 'DEPARTAMENTO',
    nombre: 'Departamento de Desarrollo de Software',
    nombreCorto: 'DDS',
    objetivo: 'Desarrollar y mantener aplicaciones de software que satisfagan las necesidades organizacionales',
    posicionCategoria: 'JEFATURA',
    centroCosto: 'CC-007',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 8,
    organizacionId: 1,
    unidadPadreId: 3,
    tipoUnidad: 'DEPARTAMENTO',
    nombre: 'Departamento de Infraestructura y Soporte',
    nombreCorto: 'DIS',
    objetivo: 'Mantener y administrar la infraestructura tecnológica y brindar soporte técnico',
    posicionCategoria: 'JEFATURA',
    centroCosto: 'CC-008',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 9,
    organizacionId: 1,
    unidadPadreId: 4,
    tipoUnidad: 'DEPARTAMENTO',
    nombre: 'Departamento de Calidad y Procesos',
    nombreCorto: 'DCP',
    objetivo: 'Asegurar la calidad de los procesos y productos mediante mejora continua',
    posicionCategoria: 'JEFATURA',
    centroCosto: 'CC-009',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 10,
    organizacionId: 1,
    unidadPadreId: 5,
    tipoUnidad: 'AREA',
    nombre: 'Área de Reclutamiento',
    nombreCorto: 'AR',
    objetivo: 'Identificar y atraer candidatos potenciales para las posiciones vacantes',
    posicionCategoria: 'COORDINACION',
    centroCosto: 'CC-010',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 11,
    organizacionId: 1,
    unidadPadreId: 7,
    tipoUnidad: 'AREA',
    nombre: 'Área de Desarrollo Frontend',
    nombreCorto: 'ADF',
    objetivo: 'Desarrollar interfaces de usuario intuitivas y responsivas',
    posicionCategoria: 'COORDINACION',
    centroCosto: 'CC-011',
    version: 1,
    estado: 'ACTIVO'
  },
  {
    unidadesOrgId: 12,
    organizacionId: 1,
    unidadPadreId: 7,
    tipoUnidad: 'AREA',
    nombre: 'Área de Desarrollo Backend',
    nombreCorto: 'ADB',
    objetivo: 'Desarrollar servicios y APIs robustas para soportar las aplicaciones',
    posicionCategoria: 'COORDINACION',
    centroCosto: 'CC-012',
    version: 1,
    estado: 'ACTIVO'
  }
];

export const unidadesOrgMockData = {
  unidadesOrganizacionales: unidadesOrgMock
}; 