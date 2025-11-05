/*
Contrato: Documento.sp_Restaurar_DocumentosCarpetas
Parametros:
  @CarpetaId BIGINT (PK de Documento.DocumentosCarpetas)
  @UsuarioId BIGINT (usuario que ejecuta la restauración)
Salida: filas afectadas (1 si restaura)
Errores:
  50001: Carpeta no encontrada
Descripción:
  Restaura una carpeta previamente eliminada (soft delete → activo),
  seteando auditoría estándar y asegurando consistencia.
*/

CREATE OR ALTER PROCEDURE Documento.sp_Restaurar_DocumentosCarpetas
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

  UPDATE Documento.DocumentosCarpetas
  SET RegistroEliminado = 0,
      Estado = CASE WHEN Estado = 0 THEN 1 ELSE Estado END,
      Version = Version + 1,
      ActualizadoPor = @UsuarioId,
      FechaActualizacion = SYSUTCDATETIME()
  WHERE CarpetaId = @CarpetaId;

  RETURN;
END;