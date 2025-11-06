import { ApiResponse } from './api.types';

export interface Carpeta {
  carpetaId: number;
  organizacionId: number;
  nombreCarpeta: string;
  carpetaPadreId?: number | null;
  carpetaPrivada?: boolean | null;
}

export interface CarpetaArbolItem {
  carpetaId: number;
  organizacionId: number;
  nombreCarpeta: string;
  carpetaPadreId?: number | null;
  carpetaPrivada: boolean;
  nivel: number;
}

export interface CreateCarpetaCommand {
  organizacionId: number;
  nombreCarpeta: string;
  carpetaPadreId?: number | null;
  carpetaPrivada?: boolean;
}

export interface UpdateCarpetaCommand {
  carpetaId: number;
  organizacionId: number;
  nombreCarpeta: string;
  carpetaPadreId?: number | null;
  carpetaPrivada: boolean;
}

export interface GetCarpetasRequest {
  organizacionId?: number;
  includeDeleted?: boolean;
}

export interface GetArbolCarpetasRequest {
  organizacionId: number;
  includeDeleted?: boolean;
}

export type GetCarpetasResponseData = Carpeta[];
export type CreateCarpetaResponseData = number;
export type UpdateCarpetaResponseData = boolean;
export type DeleteCarpetaResponseData = boolean;
export type RestoreCarpetaResponseData = boolean;
export type MoveCarpetaResponseData = boolean;
export type GetArbolCarpetasResponseData = CarpetaArbolItem[];

export type GetCarpetasResponse = ApiResponse<GetCarpetasResponseData>;
export type CreateCarpetaResponse = ApiResponse<CreateCarpetaResponseData>;
export type UpdateCarpetaResponse = ApiResponse<UpdateCarpetaResponseData>;
export type DeleteCarpetaResponse = ApiResponse<DeleteCarpetaResponseData>;
export type RestoreCarpetaResponse = ApiResponse<RestoreCarpetaResponseData>;
export type MoveCarpetaResponse = ApiResponse<MoveCarpetaResponseData>;
export type GetArbolCarpetasResponse = ApiResponse<GetArbolCarpetasResponseData>;