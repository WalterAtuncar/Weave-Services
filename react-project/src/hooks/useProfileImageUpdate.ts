import { useState } from 'react';
import { authService } from '../services';
import { personasService } from '../services/personas.service';
import { handleProfileImageUpload } from '../utils/imageUploadUtils';
import { AlertService } from '../components/ui/alerts/AlertService';
import { ErrorHandler } from '../utils/errorHandler';

export interface UseProfileImageUpdateReturn {
  isUploading: boolean;
  updateProfileImage: () => Promise<void>;
}

/**
 * Hook personalizado para manejar la actualización de la imagen de perfil del usuario
 */
export const useProfileImageUpdate = (): UseProfileImageUpdateReturn => {
  const [isUploading, setIsUploading] = useState(false);

  const updateProfileImage = async (): Promise<void> => {
    if (isUploading) return; // Prevenir múltiples uploads simultáneos

    try {
      setIsUploading(true);

      // 1. Obtener el usuario actual y su personaId
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.personaId) {
        AlertService.error('No se pudo obtener la información del usuario actual');
        return;
      }

      // 2. Obtener los datos completos de la persona

      const personaResponse = await personasService.getPersonaCompleto({
        personaId: currentUser.personaId
      });

      if (!personaResponse.success || !personaResponse.data) {
        AlertService.error('No se pudo obtener la información de la persona');
        return;
      }

      const personaData = personaResponse.data;


      // 3. Disparar el selector de imagen y procesarla
      AlertService.info('Seleccione una imagen para su perfil...');
      const imageResult = await handleProfileImageUpload();

      if (!imageResult.success) {
        if (imageResult.error && imageResult.error !== 'No se seleccionó ningún archivo.') {
          AlertService.error(imageResult.error);
        }
        return;
      }

      if (!imageResult.base64) {
        AlertService.error('Error al procesar la imagen');
        return;
      }

      // 4. Actualizar la persona con la nueva foto

      const updateRequest = {
        personaId: currentUser.personaId,
        tipoDoc: personaData.tipoDoc,
        nroDoc: personaData.nroDoc,
        codEmpleado: personaData.codEmpleado,
        apellidoPaterno: personaData.apellidoPaterno,
        apellidoMaterno: personaData.apellidoMaterno,
        nombres: personaData.nombres,
        fotoUrl: imageResult.base64, // Asignar la nueva imagen en base64
        estadoLaboral: personaData.estadoLaboral,
        fechaNacimiento: personaData.fechaNacimiento,
        fechaIngreso: personaData.fechaIngreso,
        emailPersonal: personaData.emailPersonal,
        celular: personaData.celular,
        direccion: personaData.direccion,
        ubigeo: personaData.ubigeo,
        organizacionId: personaData.organizacionId,
        sedeId: personaData.sedeId,
        estado: personaData.estado
      };

      const updateResponse = await personasService.updatePersona(updateRequest);

      if (!updateResponse.success) {
        AlertService.error('Error al actualizar la foto de perfil');
        console.error('Error al actualizar persona:', updateResponse.errors);
        return;
      }

      // 5. Actualizar el localStorage con la nueva fotoUrl
      const currentSession = authService.getUserSession();
      if (currentSession && currentSession.usuario) {
        // Actualizar el usuario en la sesión
        const updatedUser = {
          ...currentSession.usuario,
          fotoUrl: imageResult.base64
        };

        const updatedSession = {
          ...currentSession,
          usuario: updatedUser
        };

        // Guardar la sesión actualizada
        localStorage.setItem('userSession', JSON.stringify(updatedSession));
        

      }

      // 6. Mostrar mensaje de éxito
      AlertService.success('Foto de perfil actualizada correctamente');

      // 7. Recargar la página para reflejar los cambios en todos los componentes
      window.location.reload();

    } catch (error) {
      console.error('Error al actualizar foto de perfil:', error);
      await ErrorHandler.handleServiceError(error, 'actualizar foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    updateProfileImage
  };
};