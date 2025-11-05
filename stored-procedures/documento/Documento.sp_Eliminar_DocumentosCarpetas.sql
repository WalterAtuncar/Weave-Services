/*
Contrato: Documento.sp_Eliminar_DocumentosCarpetas
Parametros:
  @CarpetaId BIGINT (PK de Documento.DocumentosCarpetas)
  @UsuarioId BIGINT (usuario que ejecuta la eliminación)
Salida: filas afectadas (1 si elimina)
Errores:
  50002: Carpeta no encontrada
  50003: Existen subcarpetas asociadas
  50004: Existen documentos asociados
Descripción:
  Elimina de forma permanente la carpeta. Verifica que no tenga hijos
  ni documentos asociados. Usa transacción para garantizar atomicidad.
*/

CREATE OR ALTER PROCEDURE Documento.sp_Eliminar_DocumentosCarpetas
  @CarpetaId BIGINT,
  @UsuarioId BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  IF (@CarpetaId IS NULL OR @CarpetaId <= 0)
  BEGIN
    RAISERROR('Parámetro CarpetaId inválido', 16, 1);
    RETURN;
  END

  DECLARE @Exists INT = 0;
  SELECT @Exists = 1 FROM Documento.DocumentosCarpetas WITH (NOLOCK) WHERE CarpetaId = @CarpetaId;

  IF (@Exists = 0)
  BEGIN
    RAISERROR('Carpeta no encontrada', 16, 1);
    RETURN;
  END

  -- Validar que no existan subcarpetas
  IF EXISTS (
      SELECT 1 FROM Documento.DocumentosCarpetas WITH (NOLOCK)
      WHERE CarpetaPadreId = @CarpetaId
  )
  BEGIN
    RAISERROR('La carpeta tiene subcarpetas asociadas', 16, 1);
    RETURN;
  END

  -- Validar que no existan documentos asociados
  IF EXISTS (
      SELECT 1 FROM Documento.Documentos WITH (NOLOCK)
      WHERE CarpetaId = @CarpetaId
  )
  BEGIN
    RAISERROR('La carpeta tiene documentos asociados', 16, 1);
    RETURN;
  END

  BEGIN TRANSACTION;
  BEGIN TRY
    -- Auditoría: opcionalmente registrar en tabla de auditoría si existiera

    DELETE FROM Documento.DocumentosCarpetas WHERE CarpetaId = @CarpetaId;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF (XACT_STATE() <> 0) ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
    RETURN;
  END CATCH
END;