/**
 * Configuración de roles de gobernanza
 * Coincide exactamente con la configuración del backend
 */

export const ROLES_GOBERNANZA = {
  SPONSOR: {
    codigo: 'SP',
    nombre: 'Sponsor',
    nivel: 1,
    color: '#dc2626',
    icon: 'Crown'
  },
  OWNER: {
    codigo: 'OW',
    nombre: 'Owner',
    nivel: 2,
    color: '#ea580c',
    icon: 'Shield'
  },
  EJECUTOR: {
    codigo: 'EJ',
    nombre: 'Ejecutor',
    nivel: 3,
    color: '#059669',
    icon: 'Settings'
  },
  INVOLUCRADO: {
    codigo: 'IN',
    nombre: 'Involucrado',
    nivel: 4,
    color: '#7c3aed',
    icon: 'Users'
  }
} as const;

export const getRolByCodigo = (codigo: string) => {
  return Object.values(ROLES_GOBERNANZA).find(rol => rol.codigo === codigo);
};

export const getRolByNivel = (nivel: number) => {
  return Object.values(ROLES_GOBERNANZA).find(rol => rol.nivel === nivel);
};

export const getRolesOrdenadosPorNivel = () => {
  return Object.values(ROLES_GOBERNANZA).sort((a, b) => a.nivel - b.nivel);
};
