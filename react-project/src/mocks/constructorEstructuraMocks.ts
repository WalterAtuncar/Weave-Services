import { organizacionesMockData } from './organizacionesMocks';

// Mock data específico para el Constructor de Estructura
export const constructorEstructuraMockData = {
  // Organizaciones de ejemplo para usar en el constructor
  organizacionesConstructor: [
    {
      organizacionId: 1,
      codigo: 'ORG-001',
      razonSocial: 'Empresa de Ejemplo S.A.C.',
      logoUrl: '/public/logo/logow.svg'
    },
    {
      organizacionId: 2,
      codigo: 'ORG-002',
      razonSocial: 'Tecnología y Desarrollo S.R.L.',
      logoUrl: '/public/logo/logow-light.svg'
    },
    {
      organizacionId: 3,
      codigo: 'ORG-003',
      razonSocial: 'Innovación Corporativa E.I.R.L.',
      logoUrl: '/public/logo/logoww2.svg'
    }
  ],

  // Configuración por defecto para nuevas estructuras
  configuracionDefecto: {
    expandirTodosPorDefecto: true,
    mostrarEstadisticas: true,
    permitirEdicion: true,
    mostrarObjetivos: true,
    mostrarCentrosCosto: true
  }
};

// Función helper para obtener datos de organización para el constructor
export const getOrganizacionParaConstructor = (organizacionId: number) => {
  const organizacionCompleta = organizacionesMockData.organizaciones
    .find(org => org.organizacionId === organizacionId);
  
  if (!organizacionCompleta) {
    return constructorEstructuraMockData.organizacionesConstructor[0];
  }

  return {
    organizacionId: organizacionCompleta.organizacionId,
    codigo: organizacionCompleta.codigo,
    razonSocial: organizacionCompleta.razonSocial,
    logoUrl: organizacionCompleta.logoUrl || '/public/logo/logow.svg'
  };
}; 