import { Usuario } from '../models/Usuarios';

const usuariosMock: Usuario[] = [
  {
    usuarioId: 1,
    personaId: 1,
    perfilId: 1,
    nombreUsuario: 'bruno.garcia',
    hashPassword: 'hashedPassword123',
    estado: 'ACTIVO',
    fechaExpiracion: null,
    esSuperAdmin: false,
    organizacionActual: null,
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-15T08:00:00Z',
    registroEliminado: false
  },
  {
    usuarioId: 2,
    personaId: 2,
    perfilId: 2,
    nombreUsuario: 'susana.paredes',
    hashPassword: 'hashedPassword123',
    estado: 'ACTIVO',
    fechaExpiracion: null,
    esSuperAdmin: false,
    organizacionActual: null,
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-15T08:00:00Z',
    registroEliminado: false
  },
  {
    usuarioId: 3,
    personaId: 3,
    perfilId: 4,
    nombreUsuario: 'carlos.lopez',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'INACTIVO',
    fechaExpiracion: null,
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-20T12:30:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 1
  },
  {
    usuarioId: 4,
    personaId: 4,
    perfilId: 5,
    nombreUsuario: 'ana.martinez',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'ACTIVO',
    fechaExpiracion: '2024-12-31',
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'supervisor1',
    fechaActualizacion: '2024-01-25T14:15:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 1
  },
  {
    usuarioId: 5,
    personaId: 5,
    perfilId: 1,
    nombreUsuario: 'luis.rodriguez',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'ACTIVO',
    fechaExpiracion: null,
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-15T08:00:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 1
  },
  {
    usuarioId: 6,
    personaId: 6,
    perfilId: 5,
    nombreUsuario: 'robert.smith',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'ACTIVO',
    fechaExpiracion: '2024-06-30',
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-15T08:00:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 1
  },
  {
    usuarioId: 7,
    personaId: 7,
    perfilId: 5,
    nombreUsuario: 'carmen.vasquez',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'BLOQUEADO',
    fechaExpiracion: null,
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'rrhh1',
    fechaActualizacion: '2024-01-22T09:45:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 1
  },
  {
    usuarioId: 8,
    personaId: 8,
    perfilId: 5,
    nombreUsuario: 'jorge.hernandez',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'INACTIVO',
    fechaExpiracion: null,
    creadoPor: 'admin',
    fechaCreacion: '2024-01-15T08:00:00Z',
    actualizadoPor: 'rrhh1',
    fechaActualizacion: '2024-01-18T16:20:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 1
  },
  // Usuarios adicionales para demostrar diferentes estados
  {
    usuarioId: 9,
    personaId: 6, // Robert también puede tener otro usuario con diferente perfil
    perfilId: 7,
    nombreUsuario: 'consultant.robert',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'PENDIENTE',
    fechaExpiracion: '2024-03-31',
    creadoPor: 'admin',
    fechaCreacion: '2024-01-28T10:00:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-28T10:00:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: null
  },
  {
    usuarioId: 10,
    personaId: 1, // Juan también puede tener otro usuario para otra organización
    perfilId: 3,
    nombreUsuario: 'juan.auditor',
    hashPassword: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
    estado: 'ACTIVO',
    fechaExpiracion: '2024-12-31',
    creadoPor: 'admin',
    fechaCreacion: '2024-01-20T09:30:00Z',
    actualizadoPor: 'admin',
    fechaActualizacion: '2024-01-20T09:30:00Z',
    registroEliminado: false,
    esSuperAdmin: false,
    organizacionActual: 2
  }
];

export const usuariosMockData = {
  usuarios: usuariosMock
}; 