-- Procedimiento: Documento.sp_Mover_DocumentosCarpetas
-- Propósito: Mover una carpeta a un nuevo padre, con validaciones de jerarquía y auditoría.
-- Parámetros de entrada:
--   @CarpetaId       INT        -- Carpeta a mover
--   @NuevoPadreId    INT        -- Nuevo padre de la carpeta
--   @UsuarioId       INT        -- Usuario que ejecuta la operación
-- Salida:
--   Sin filas de salida. Usa códigos de error con THROW.
-- Errores esperados:
--   51000: Parámetros inválidos
--   51001: Movimiento inválido: el nuevo padre es descendiente de la carpeta
-- Auditoría:
--   Actualiza: ActualizadoPor, FechaActualizacion, Version (+1)

CREATE OR ALTER PROCEDURE Documento.sp_Mover_DocumentosCarpetas
  @CarpetaId    INT,
  @NuevoPadreId INT,
  @UsuarioId    INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Validaciones básicas
    IF @CarpetaId IS NULL OR @NuevoPadreId IS NULL OR @UsuarioId IS NULL
      THROW 51000, N'Parámetros inválidos: @CarpetaId, @NuevoPadreId y @UsuarioId son requeridos.', 1;

    IF @CarpetaId = @NuevoPadreId
      THROW 51000, N'Parámetros inválidos: la carpeta no puede ser su propio padre.', 1;

    -- Validar que el nuevo padre NO sea descendiente de la carpeta (evitar ciclos)
    ;WITH Descendencia AS (
      SELECT dc.CarpetaId
      FROM Documento.DocumentosCarpetas dc
      WHERE dc.CarpetaId = @CarpetaId
      UNION ALL
      SELECT h.CarpetaId
      FROM Documento.DocumentosCarpetas h
      INNER JOIN Descendencia d ON h.CarpetaPadreId = d.CarpetaId
    )
    IF EXISTS (SELECT 1 FROM Descendencia WHERE CarpetaId = @NuevoPadreId)
      THROW 51001, N'Movimiento inválido: el nuevo padre es descendiente de la carpeta.', 1;

    -- Actualización con auditoría y concurrencia optimista
    UPDATE Documento.DocumentosCarpetas
      SET CarpetaPadreId     = @NuevoPadreId,
          ActualizadoPor     = @UsuarioId,
          FechaActualizacion = SYSUTCDATETIME(),
          Version            = Version + 1
    WHERE CarpetaId = @CarpetaId
      AND ISNULL(RegistroEliminado, 0) = 0;

    COMMIT TRANSACTION;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;

    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrState INT = ERROR_STATE();
    RAISERROR(@ErrMsg, @ErrSeverity, @ErrState);
  END CATCH
END;