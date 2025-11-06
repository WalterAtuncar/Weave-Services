export interface Step2AutoFillRequest {
  contenido: string;
  tiposDisponibles?: string[];
  idioma?: string; // 'es' por defecto
}

export interface Step2AutoFillResponse {
  titulo: string;
  tipo: string; // nombre del tipo de documento
  objetivo: string;
}