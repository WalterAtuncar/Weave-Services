/**
 * Tipos para el servicio de Organización Familia Sistema
 * Manejo de relaciones many-to-many entre organizaciones y familias de sistema
 */

import { ApiResponse } from './api.types';
import { FamiliaSistema } from './familia-sistema.types';

// ===== ENTIDAD BASE =====

export interface OrganizacionFamiliaSistema {
  organizacionId: number;
  familiaSistemaId: number;
  fechaCreacion: string;
  creadoPor: number;
  // Propiedades de navegación opcionales
  organizacion?: {
    id: number;
    nombre: string;
    codigo: string;
  };
  familiaSistema?: FamiliaSistema;
}

// ===== REQUESTS =====

export interface GetAllOrganizacionFamiliaSistemaRequest {
  includeDeleted?: boolean;
}

export interface GetOrganizacionFamiliaSistemaByOrganizacionIdRequest {
  organizacionId: number;
}

export interface GetOrganizacionFamiliaSistemaByFamiliaSistemaIdRequest {
  familiaSistemaId: number;
}

export interface CreateOrganizacionFamiliaSistemaRequest {
  organizacionId: number;
  familiaSistemaId: number;
}

export interface DeleteOrganizacionFamiliaSistemaRequest {
  organizacionId: number;
  familiaSistemaId: number;
}

// ===== RESPONSES =====

export type GetAllOrganizacionFamiliaSistemaResponseData = OrganizacionFamiliaSistema[];
export type GetOrganizacionFamiliaSistemaByOrganizacionIdResponseData = OrganizacionFamiliaSistema[];
export type GetOrganizacionFamiliaSistemaByFamiliaSistemaIdResponseData = OrganizacionFamiliaSistema[];
export type CreateOrganizacionFamiliaSistemaResponseData = OrganizacionFamiliaSistema;
export type DeleteOrganizacionFamiliaSistemaResponseData = boolean;

// ===== TIPOS AUXILIARES =====

// Tipo para mostrar familias asignadas con información completa
export interface FamiliaSistemaAsignada {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fechaAsignacion: string;
  organizacionId: number;
}

// Tipo para el dropdown de familias disponibles (no asignadas)
export interface FamiliaSistemaDisponible {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: number;
}

export type GetFamiliasSistemaAsignadasResponseData = FamiliaSistemaAsignada[];
export type GetFamiliasSistemaDisponiblesResponseData = FamiliaSistemaDisponible[];

// ===== FILTROS Y OPCIONES =====

export interface OrganizacionFamiliaSistemaFilters {
  organizacionId?: number;
  familiaSistemaId?: number;
  fechaCreacionDesde?: string;
  fechaCreacionHasta?: string;
}

export interface OrganizacionFamiliaSistemaSortOptions {
  orderBy?: 'organizacionId' | 'familiaSistemaId' | 'fechaCreacion';
  ascending?: boolean;
}