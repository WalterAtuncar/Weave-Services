import { PlanSuscripcion } from '../models/PlanSuscripcion';

export const planesSuscripcionMockData: { planes: PlanSuscripcion[] } = {
  planes: [
    {
      planId: 1,
      nombrePlan: 'Premium Anual',
      descripcion: 'Plan completo con todas las funcionalidades avanzadas para empresas grandes',
      limiteUsuarios: 100,
      duracionDias: 365,
      precio: 2999.99,
      tipoPlan: 'ENTERPRISE',
      activo: true,
      creadoPor: 'admin',
      fechaCreacion: '2023-01-01T00:00:00Z',
      actualizadoPor: 'admin',
      fechaActualizacion: '2024-01-01T00:00:00Z',
      registroEliminado: false
    },
    {
      planId: 2,
      nombrePlan: 'Básico Mensual',
      descripcion: 'Plan básico para pequeñas empresas con funcionalidades esenciales',
      limiteUsuarios: 25,
      duracionDias: 30,
      precio: 49.99,
      tipoPlan: 'COMERCIAL',
      activo: true,
      creadoPor: 'admin',
      fechaCreacion: '2023-01-01T00:00:00Z',
      actualizadoPor: 'admin',
      fechaActualizacion: '2024-01-01T00:00:00Z',
      registroEliminado: false
    },
    {
      planId: 3,
      nombrePlan: 'Demo',
      descripcion: 'Plan de prueba gratuito por 15 días con funcionalidades limitadas',
      limiteUsuarios: 5,
      duracionDias: 15,
      precio: 0.00,
      tipoPlan: 'DEMO',
      activo: true,
      creadoPor: 'system',
      fechaCreacion: '2023-01-01T00:00:00Z',
      actualizadoPor: 'system',
      fechaActualizacion: '2024-01-01T00:00:00Z',
      registroEliminado: false
    },
    {
      planId: 4,
      nombrePlan: 'Profesional Trimestral',
      descripcion: 'Plan intermedio ideal para empresas medianas con funcionalidades avanzadas',
      limiteUsuarios: 50,
      duracionDias: 90,
      precio: 399.99,
      tipoPlan: 'COMERCIAL',
      activo: true,
      creadoPor: 'admin',
      fechaCreacion: '2023-06-01T00:00:00Z',
      actualizadoPor: 'admin',
      fechaActualizacion: '2024-06-01T00:00:00Z',
      registroEliminado: false
    }
  ]
}; 