export interface TipoEntidad {
  id: string;
  nombre: string;
  icono?: string; // nombre de icono lucide opcional
}

// Referencia mínima para listar: EntidadId y NombreEntidad
export interface EntidadRef {
  id: string; // EntidadId
  nombre: string; // NombreEntidad
}

// Mapa de relaciones: key = tipoEntidadId, value = lista de entidades asociadas
export type RelatedEntitiesMap = Record<string, EntidadRef[]>;

export interface RelatedEntitiesManagerProps {
  // Estado inicial (por ejemplo, desde el formulario)
  initial?: RelatedEntitiesMap;
  // Tipos disponibles para seleccionar
  tipos?: TipoEntidad[];
  // Opciones de entidades por tipo (mock o cargadas)
  entidades?: Record<string, EntidadRef[]>;
  // Callback para notificar cambios al padre
  onChange?: (next: RelatedEntitiesMap) => void;
  // Título y descripciones personalizables
  title?: string;
  description?: string;
}