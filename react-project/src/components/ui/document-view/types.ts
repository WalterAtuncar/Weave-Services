// Tipos compartidos para vistas de documentos estilo Google Drive
export type DocumentoEstado = 'nuevo' | 'reciente' | 'favorito' | 'participo' | 'normal';
export type DocumentoTipo = 'manual' | 'politica' | 'procedimiento' | 'instructivo' | 'otro';

export interface Documento {
  id: number;
  titulo: string;
  categoria: string;
  propietario: string;
  fecha: string; // ISO string
  tipo: DocumentoTipo;
  estado: DocumentoEstado;
  icono?: string; // emoji o nombre de icono
  // Campos extendidos para vistas tipo Drive
  ubicacion?: string;
  sugeridoMotivo?: string; // "Lo has abierto - 22 may 2025" etc
  ultimaApertura?: string; // ISO string
  compartido?: boolean;
  miniaturaUrl?: string; // thumbnail
  // Dimensiones reales de la miniatura, para respetar proporción
  miniaturaAncho?: number;
  miniaturaAlto?: number;
  miniaturaMimeType?: string;
  extension?: string; // pdf, jpg, docx
  // Nuevo: URL del archivo para generar la miniatura en cliente (especialmente PDFs)
  fileUrl?: string;
  // Nuevo: tamaño del archivo en bytes para mostrar en la lista (opcional)
  sizeBytes?: number;
  // Nuevo: contenido base64 del archivo y su MIME para visor/descarga directa
  contenidoBase64?: string;
  mimeType?: string;
  // Nuevo: carpeta asociada para vistas jerárquicas
  carpetaId?: number | null;
  // Nuevo: id de gobernanza para condicionar acciones
  gobernanzaId?: number | null;
  // Nuevo: descripción del documento proveniente de SQL
  descripcionDocumento?: string | null;
  // Nuevo: estado numérico del backend para validaciones (ej. -2 workflow)
  estadoNumero?: number | null;
}