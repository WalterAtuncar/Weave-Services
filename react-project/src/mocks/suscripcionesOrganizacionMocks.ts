import { SuscripcionOrganizacion } from '../models/SuscripcionOrganizacion';

export const suscripcionesOrganizacionMockData: { suscripciones: SuscripcionOrganizacion[] } = {
  suscripciones: [
    {
      suscripcionId: 1,
      organizacionId: 1,
      planId: 1,
      fechaInicio: '2023-12-31',
      fechaFin: '2025-12-31',
      limiteUsuarios: 100,
      estado: 'ACTIVA',
      esDemo: false,
      creadoPor: 'admin',
      fechaCreacion: '2023-12-31T10:00:00Z',
      actualizadoPor: 'admin',
      fechaActualizacion: '2023-12-31T10:00:00Z',
      registroEliminado: false
    },
    {
      suscripcionId: 2,
      organizacionId: 2,
      planId: 2,
      fechaInicio: '2024-10-14',
      fechaFin: '2024-11-14',
      limiteUsuarios: 25,
      estado: 'VENCIDA',
      esDemo: false,
      creadoPor: 'founder',
      fechaCreacion: '2024-10-14T09:15:00Z',
      actualizadoPor: 'system',
      fechaActualizacion: '2024-11-15T00:00:00Z',
      registroEliminado: false
    },
    {
      suscripcionId: 3,
      organizacionId: 3,
      planId: 3,
      fechaInicio: '2024-06-10',
      fechaFin: '2024-06-25',
      limiteUsuarios: 5,
      estado: 'ACTIVA',
      esDemo: true,
      creadoPor: 'setup',
      fechaCreacion: '2024-06-10T08:00:00Z',
      actualizadoPor: 'setup',
      fechaActualizacion: '2024-06-10T08:00:00Z',
      registroEliminado: false
    }
  ]
}; 