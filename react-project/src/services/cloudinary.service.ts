import { BaseApiService } from './base-api.service';

// =============================================
// INTERFACES
// =============================================

export interface CloudinaryUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    fileName: string;
    size: number;
    folder?: string;
  };
}

export interface CloudinaryMultipleUploadResponse {
  success: boolean;
  message: string;
  data: {
    uploaded: Array<{
      fileName: string;
      url: string;
      size: number;
      success: boolean;
    }>;
    errors: string[];
    folder?: string;
  };
}

export interface CloudinaryDeleteResponse {
  success: boolean;
  message: string;
  data: {
    publicId: string;
  };
}

export interface CloudinaryTransformResponse {
  success: boolean;
  data: {
    publicId: string;
    url: string;
    transformations: {
      width?: number;
      height?: number;
      crop?: string;
    };
  };
}

// =============================================
// SERVICIO PRINCIPAL
// =============================================

class CloudinaryService extends BaseApiService {
  private readonly baseUrl = '/api/Cloudinary';

  /**
   * Sube una imagen a Cloudinary
   * @param file - Archivo de imagen
   * @param folder - Carpeta donde guardar (opcional)
   * @returns URL de la imagen subida
   */
  async uploadImage(file: File, folder?: string): Promise<CloudinaryUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const queryParams = folder ? `?folder=${encodeURIComponent(folder)}` : '';
      
      const response = await this.post<CloudinaryUploadResponse>(
        `${this.baseUrl}/upload${queryParams}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Sube múltiples imágenes a Cloudinary
   * @param files - Array de archivos de imagen
   * @param folder - Carpeta donde guardar (opcional)
   * @returns URLs de las imágenes subidas
   */
  async uploadMultipleImages(files: File[], folder?: string): Promise<CloudinaryMultipleUploadResponse> {
    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      const queryParams = folder ? `?folder=${encodeURIComponent(folder)}` : '';
      
      const response = await this.post<CloudinaryMultipleUploadResponse>(
        `${this.baseUrl}/upload-multiple${queryParams}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response;
    } catch (error) {
      console.error('Error uploading multiple images to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de Cloudinary
   * @param publicId - ID público de la imagen
   * @returns Resultado de la eliminación
   */
  async deleteImage(publicId: string): Promise<CloudinaryDeleteResponse> {
    try {
      const response = await this.delete<CloudinaryDeleteResponse>(
        `${this.baseUrl}/delete/${encodeURIComponent(publicId)}`
      );

      return response;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL de una imagen con transformaciones
   * @param publicId - ID público de la imagen
   * @param width - Ancho (opcional)
   * @param height - Alto (opcional)
   * @param crop - Tipo de recorte (opcional)
   * @returns URL de la imagen transformada
   */
  async getTransformedImageUrl(
    publicId: string, 
    width?: number, 
    height?: number, 
    crop?: string
  ): Promise<CloudinaryTransformResponse> {
    try {
      const params = new URLSearchParams();
      if (width) params.append('width', width.toString());
      if (height) params.append('height', height.toString());
      if (crop) params.append('crop', crop);

      const queryString = params.toString();
      const url = `${this.baseUrl}/transform/${encodeURIComponent(publicId)}${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.get<CloudinaryTransformResponse>(url);

      return response;
    } catch (error) {
      console.error('Error getting transformed image URL from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Valida si un archivo es una imagen válida
   * @param file - Archivo a validar
   * @returns True si es válido
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, BMP, WEBP'
      };
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Extrae el public ID de una URL de Cloudinary
   * @param url - URL de Cloudinary
   * @returns Public ID extraído
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      // Ejemplo: https://res.cloudinary.com/daibn7axq/image/upload/v1234567890/folder/image.jpg
      const match = url.match(/\/upload\/[^\/]+\/(.+)$/);
      if (match && match[1]) {
        // Remover la extensión del archivo
        return match[1].replace(/\.[^/.]+$/, '');
      }
      return null;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }
}

// =============================================
// INSTANCIA EXPORTADA
// =============================================

export const cloudinaryService = new CloudinaryService();
