import { PersonaPosicion } from '../models/PersonaPosicion';

// Mock data para PersonaPosicion (sin campos de auditoría para simplificar)
const personaPosicionMock: Omit<PersonaPosicion, 'creadoPor' | 'fechaCreacion' | 'actualizadoPor' | 'fechaActualizacion' | 'registroEliminado'>[] = [
  // Asignaciones actuales
  {
    personaId: 1,
    posicionId: 1, // Director General
    fechaInicio: '2023-01-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 2,
    posicionId: 2, // Gerente de Recursos Humanos
    fechaInicio: '2023-02-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 3,
    posicionId: 4, // Gerente de Tecnología e Información
    fechaInicio: '2023-02-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 4,
    posicionId: 5, // Gerente de Operaciones
    fechaInicio: '2023-03-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 5,
    posicionId: 6, // Jefe de Selección y Contratación
    fechaInicio: '2023-03-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 6,
    posicionId: 9, // Jefe de Desarrollo Organizacional
    fechaInicio: '2023-04-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 7,
    posicionId: 11, // Jefe de Desarrollo de Software
    fechaInicio: '2023-04-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 8,
    posicionId: 13, // Jefe de Infraestructura y Soporte
    fechaInicio: '2023-05-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 9,
    posicionId: 16, // Jefe de Calidad y Procesos
    fechaInicio: '2023-05-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 10,
    posicionId: 7, // Especialista en Selección de Personal
    fechaInicio: '2023-06-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 11,
    posicionId: 8, // Analista de Reclutamiento
    fechaInicio: '2023-06-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 12,
    posicionId: 10, // Especialista en Capacitación
    fechaInicio: '2023-07-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 13,
    posicionId: 12, // Arquitecto de Software
    fechaInicio: '2023-07-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 14,
    posicionId: 14, // Especialista en Infraestructura
    fechaInicio: '2023-08-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 15,
    posicionId: 15, // Técnico de Soporte
    fechaInicio: '2023-08-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 16,
    posicionId: 17, // Analista de Calidad
    fechaInicio: '2023-09-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 17,
    posicionId: 18, // Coordinador de Reclutamiento
    fechaInicio: '2023-09-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 18,
    posicionId: 19, // Reclutador Senior
    fechaInicio: '2023-10-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 19,
    posicionId: 20, // Coordinador Frontend
    fechaInicio: '2023-10-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 20,
    posicionId: 21, // Desarrollador Frontend Senior
    fechaInicio: '2023-11-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 21,
    posicionId: 22, // Desarrollador Frontend
    fechaInicio: '2023-11-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 22,
    posicionId: 23, // Coordinador Backend
    fechaInicio: '2023-12-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 23,
    posicionId: 24, // Desarrollador Backend Senior
    fechaInicio: '2023-12-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 24,
    posicionId: 25, // Desarrollador Backend
    fechaInicio: '2024-01-15',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 25,
    posicionId: 3, // Asistente de Gerencia RH
    fechaInicio: '2024-02-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  
  // Asignaciones históricas (personas que cambiaron de posición)
  {
    personaId: 26,
    posicionId: 22, // Desarrollador Frontend
    fechaInicio: '2023-06-01',
    fechaFin: '2023-12-31',
    estado: 'FINALIZADO',
    version: 1
  },
  {
    personaId: 26,
    posicionId: 21, // Desarrollador Frontend Senior (promoción)
    fechaInicio: '2024-01-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  {
    personaId: 27,
    posicionId: 25, // Desarrollador Backend
    fechaInicio: '2023-07-01',
    fechaFin: '2024-01-31',
    estado: 'FINALIZADO',
    version: 1
  },
  {
    personaId: 27,
    posicionId: 24, // Desarrollador Backend Senior (promoción)
    fechaInicio: '2024-02-01',
    fechaFin: null,
    estado: 'ACTIVO',
    version: 1
  },
  
  // Asignación suspendida temporalmente
  {
    personaId: 28,
    posicionId: 15, // Técnico de Soporte
    fechaInicio: '2023-09-01',
    fechaFin: null,
    estado: 'SUSPENDIDO',
    version: 1
  },
  
  // Asignación inactiva
  {
    personaId: 29,
    posicionId: 17, // Analista de Calidad
    fechaInicio: '2023-08-01',
    fechaFin: null,
    estado: 'INACTIVO',
    version: 1
  }
];

export const personaPosicionMockData = {
  personaPosiciones: personaPosicionMock
}; 