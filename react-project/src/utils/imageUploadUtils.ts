/**
 * Utilidades para carga y validación de imágenes de perfil
 */

// Configuración de límites para imágenes de perfil
export const IMAGE_UPLOAD_CONFIG = {
  maxFileSizeMB: 5, // 5MB máximo
  maxFileSizeBytes: 5 * 1024 * 1024, // 5MB en bytes
  maxDimensions: {
    width: 1024,
    height: 1024
  },
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  allowedExtensions: ['.jpg', '.jpeg', '.png']
};

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
}

export interface ImageProcessResult {
  success: boolean;
  base64?: string;
  error?: string;
}

/**
 * Valida si un archivo es una imagen válida para perfil
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  // Validar tipo de archivo
  if (!IMAGE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de archivo no válido. Solo se permiten archivos JPG y PNG.'
    };
  }

  // Validar tamaño del archivo
  if (file.size > IMAGE_UPLOAD_CONFIG.maxFileSizeBytes) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Tamaño máximo permitido: ${IMAGE_UPLOAD_CONFIG.maxFileSizeMB}MB.`
    };
  }

  // Validar extensión del nombre del archivo
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!IMAGE_UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Extensión de archivo no válida. Use .jpg, .jpeg o .png.'
    };
  }

  return {
    isValid: true,
    file
  };
};

/**
 * Valida las dimensiones de una imagen
 */
export const validateImageDimensions = (image: HTMLImageElement): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const { width, height } = image;
    const { maxDimensions } = IMAGE_UPLOAD_CONFIG;

    if (width > maxDimensions.width || height > maxDimensions.height) {
      resolve({
        isValid: false,
        error: `Las dimensiones de la imagen son demasiado grandes. Máximo permitido: ${maxDimensions.width}x${maxDimensions.height}px.`
      });
    } else {
      resolve({
        isValid: true
      });
    }
  });
};

/**
 * Convierte un archivo de imagen a base64 con validaciones
 */
export const processImageToBase64 = (file: File): Promise<ImageProcessResult> => {
  return new Promise((resolve) => {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      resolve({
        success: false,
        error: validation.error
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const base64Result = e.target?.result as string;
        
        // Crear imagen para validar dimensiones
        const img = new Image();
        
        img.onload = async () => {
          const dimensionValidation = await validateImageDimensions(img);
          
          if (!dimensionValidation.isValid) {
            resolve({
              success: false,
              error: dimensionValidation.error
            });
            return;
          }

          // Todo válido, devolver base64
          resolve({
            success: true,
            base64: base64Result
          });
        };

        img.onerror = () => {
          resolve({
            success: false,
            error: 'Error al procesar la imagen. Verifique que el archivo no esté corrupto.'
          });
        };

        img.src = base64Result;
      } catch (error) {
        resolve({
          success: false,
          error: 'Error al procesar el archivo de imagen.'
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Error al leer el archivo de imagen.'
      });
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Dispara el selector de archivo de imagen
 */
export const triggerImageFileSelector = (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = IMAGE_UPLOAD_CONFIG.allowedTypes.join(',');
    input.multiple = false;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        resolve(files[0]);
      } else {
        resolve(null);
      }
      
      // Limpiar el input
      input.remove();
    };

    input.oncancel = () => {
      resolve(null);
      input.remove();
    };

    // Disparar el selector
    input.click();
  });
};

/**
 * Función completa para manejar la carga de imagen de perfil
 */
export const handleProfileImageUpload = async (): Promise<ImageProcessResult> => {
  try {
    // Disparar selector de archivo
    const selectedFile = await triggerImageFileSelector();
    
    if (!selectedFile) {
      return {
        success: false,
        error: 'No se seleccionó ningún archivo.'
      };
    }

    // Procesar imagen a base64
    const result = await processImageToBase64(selectedFile);
    return result;

  } catch (error) {
    return {
      success: false,
      error: 'Error inesperado al procesar la imagen.'
    };
  }
}; 