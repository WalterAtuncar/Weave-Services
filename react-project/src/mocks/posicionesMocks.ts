import { Posicion } from '../models/Posiciones';

// Mock data para Posiciones (sin campos de auditoría para simplificar)
const posicionesMock: Omit<Posicion, 'creadoPor' | 'fechaCreacion' | 'actualizadoPor' | 'fechaActualizacion' | 'registroEliminado'>[] = [
  // Posiciones para Dirección General (ID: 1)
  {
    posicionId: 1,
    unidadesOrgId: 1,
    nombre: 'Director General',
    categoria: 'EJECUTIVO',
    objetivo: 'Liderar la organización y definir la estrategia corporativa',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Gerencia de Recursos Humanos (ID: 2)
  {
    posicionId: 2,
    unidadesOrgId: 2,
    nombre: 'Gerente de Recursos Humanos',
    categoria: 'GERENCIAL',
    objetivo: 'Dirigir las estrategias de gestión del talento humano',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 3,
    unidadesOrgId: 2,
    nombre: 'Asistente de Gerencia RH',
    categoria: 'ASISTENTE',
    objetivo: 'Brindar soporte administrativo a la gerencia de recursos humanos',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Gerencia de Tecnología (ID: 3)
  {
    posicionId: 4,
    unidadesOrgId: 3,
    nombre: 'Gerente de Tecnología e Información',
    categoria: 'GERENCIAL',
    objetivo: 'Liderar la estrategia tecnológica de la organización',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Gerencia de Operaciones (ID: 4)
  {
    posicionId: 5,
    unidadesOrgId: 4,
    nombre: 'Gerente de Operaciones',
    categoria: 'GERENCIAL',
    objetivo: 'Supervisar y optimizar los procesos operativos',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Departamento de Selección y Contratación (ID: 5)
  {
    posicionId: 6,
    unidadesOrgId: 5,
    nombre: 'Jefe de Selección y Contratación',
    categoria: 'JEFATURA',
    objetivo: 'Dirigir los procesos de reclutamiento y selección de personal',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 7,
    unidadesOrgId: 5,
    nombre: 'Especialista en Selección de Personal',
    categoria: 'ESPECIALISTA',
    objetivo: 'Ejecutar procesos de selección y evaluación de candidatos',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 8,
    unidadesOrgId: 5,
    nombre: 'Analista de Reclutamiento',
    categoria: 'ANALISTA',
    objetivo: 'Analizar perfiles y gestionar base de datos de candidatos',
    ordenImpresion: 3,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Departamento de Desarrollo Organizacional (ID: 6)
  {
    posicionId: 9,
    unidadesOrgId: 6,
    nombre: 'Jefe de Desarrollo Organizacional',
    categoria: 'JEFATURA',
    objetivo: 'Liderar iniciativas de desarrollo del capital humano',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 10,
    unidadesOrgId: 6,
    nombre: 'Especialista en Capacitación',
    categoria: 'ESPECIALISTA',
    objetivo: 'Diseñar y ejecutar programas de capacitación y desarrollo',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Departamento de Desarrollo de Software (ID: 7)
  {
    posicionId: 11,
    unidadesOrgId: 7,
    nombre: 'Jefe de Desarrollo de Software',
    categoria: 'JEFATURA',
    objetivo: 'Dirigir el equipo de desarrollo y definir arquitecturas de software',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 12,
    unidadesOrgId: 7,
    nombre: 'Arquitecto de Software',
    categoria: 'ESPECIALISTA',
    objetivo: 'Diseñar arquitecturas de software robustas y escalables',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Departamento de Infraestructura y Soporte (ID: 8)
  {
    posicionId: 13,
    unidadesOrgId: 8,
    nombre: 'Jefe de Infraestructura y Soporte',
    categoria: 'JEFATURA',
    objetivo: 'Administrar la infraestructura tecnológica y servicios de soporte',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 14,
    unidadesOrgId: 8,
    nombre: 'Especialista en Infraestructura',
    categoria: 'ESPECIALISTA',
    objetivo: 'Administrar servidores, redes y servicios de infraestructura',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 15,
    unidadesOrgId: 8,
    nombre: 'Técnico de Soporte',
    categoria: 'TECNICO',
    objetivo: 'Brindar soporte técnico a usuarios finales',
    ordenImpresion: 3,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Departamento de Calidad y Procesos (ID: 9)
  {
    posicionId: 16,
    unidadesOrgId: 9,
    nombre: 'Jefe de Calidad y Procesos',
    categoria: 'JEFATURA',
    objetivo: 'Asegurar la calidad de procesos y productos organizacionales',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 17,
    unidadesOrgId: 9,
    nombre: 'Analista de Calidad',
    categoria: 'ANALISTA',
    objetivo: 'Analizar y mejorar procesos organizacionales',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Área de Reclutamiento (ID: 10)
  {
    posicionId: 18,
    unidadesOrgId: 10,
    nombre: 'Coordinador de Reclutamiento',
    categoria: 'COORDINACION',
    objetivo: 'Coordinar actividades de reclutamiento y atracción de talento',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 19,
    unidadesOrgId: 10,
    nombre: 'Reclutador Senior',
    categoria: 'ESPECIALISTA',
    objetivo: 'Gestionar búsquedas especializadas y perfiles ejecutivos',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Área de Desarrollo Frontend (ID: 11)
  {
    posicionId: 20,
    unidadesOrgId: 11,
    nombre: 'Coordinador Frontend',
    categoria: 'COORDINACION',
    objetivo: 'Coordinar el desarrollo de interfaces de usuario',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 21,
    unidadesOrgId: 11,
    nombre: 'Desarrollador Frontend Senior',
    categoria: 'ESPECIALISTA',
    objetivo: 'Desarrollar interfaces avanzadas y mentorear desarrolladores junior',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 22,
    unidadesOrgId: 11,
    nombre: 'Desarrollador Frontend',
    categoria: 'ANALISTA',
    objetivo: 'Desarrollar componentes y funcionalidades de interfaz de usuario',
    ordenImpresion: 3,
    version: 1,
    estado: 'ACTIVO'
  },
  
  // Posiciones para Área de Desarrollo Backend (ID: 12)
  {
    posicionId: 23,
    unidadesOrgId: 12,
    nombre: 'Coordinador Backend',
    categoria: 'COORDINACION',
    objetivo: 'Coordinar el desarrollo de servicios y APIs',
    ordenImpresion: 1,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 24,
    unidadesOrgId: 12,
    nombre: 'Desarrollador Backend Senior',
    categoria: 'ESPECIALISTA',
    objetivo: 'Desarrollar servicios complejos y liderar arquitectura backend',
    ordenImpresion: 2,
    version: 1,
    estado: 'ACTIVO'
  },
  {
    posicionId: 25,
    unidadesOrgId: 12,
    nombre: 'Desarrollador Backend',
    categoria: 'ANALISTA',
    objetivo: 'Desarrollar APIs y servicios para aplicaciones',
    ordenImpresion: 3,
    version: 1,
    estado: 'ACTIVO'
  }
];

export const posicionesMockData = {
  posiciones: posicionesMock
}; 