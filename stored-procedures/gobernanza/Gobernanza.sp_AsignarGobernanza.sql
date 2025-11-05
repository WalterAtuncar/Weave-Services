/*
  SP: Gobernanza.sp_AsignarGobernanza
  Parámetros:
    @TipoEntidadId   BIGINT NOT NULL
    @EntidadId       BIGINT NOT NULL
    @RolId           BIGINT NOT NULL
    @UsuarioId       BIGINT NOT NULL
    @OrganizacionId  BIGINT NULL
    @CreadoPor       NVARCHAR(100) NULL

  Salida: una fila con columna [Id] BIGINT (ID creado)
*/
GO
CREATE OR ALTER PROCEDURE Gobernanza.sp_AsignarGobernanza
  @TipoEntidadId   BIGINT,
  @EntidadId       BIGINT,
  @RolId           BIGINT,
  @UsuarioId       BIGINT,
  @OrganizacionId  BIGINT = NULL,
  @CreadoPor       NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Localizar la gobernanza activa para la entidad y tipo
    DECLARE @GobernanzaId BIGINT;
    SELECT TOP 1 @GobernanzaId = g.GobernanzaId
    FROM Gobernanza.Gobernanza g
    INNER JOIN Gobernanza.GobernanzaEntidad ge ON ge.GobernanzaId = g.GobernanzaId
    WHERE g.TipoEntidadId = @TipoEntidadId
      AND ge.EntidadId = @EntidadId
      AND (@OrganizacionId IS NULL OR g.OrganizacionId = @OrganizacionId)
      AND ISNULL(g.RegistroEliminado, 0) = 0 AND g.Estado = 1
      AND ISNULL(ge.RegistroEliminado, 0) = 0 AND ge.EsActiva = 1
    ORDER BY ge.FechaAsociacion DESC;

    IF @GobernanzaId IS NULL
    BEGIN
      THROW 51001, 'Gobernanza no encontrada para la entidad especificada', 1;
    END

    -- Evitar duplicados de asignación
    IF EXISTS (
      SELECT 1 FROM Gobernanza.GobernanzaRol gr
      WHERE gr.GobernanzaId = @GobernanzaId
        AND gr.RolGobernanzaId = @RolId
        AND gr.UsuarioId = @UsuarioId
        AND ISNULL(gr.RegistroEliminado, 0) = 0
    )
    BEGIN
      THROW 51001, 'La asignación ya existe', 1;
    END

    INSERT INTO Gobernanza.GobernanzaRol
      (GobernanzaId, RolGobernanzaId, UsuarioId, FechaAsignacion, OrdenEjecucion, PuedeEditar, Estado, Version, CreadoPor, FechaCreacion, RegistroEliminado)
    VALUES
      (@GobernanzaId, @RolId, @UsuarioId, SYSUTCDATETIME(), 1, 0, 1, 1, @CreadoPor, SYSUTCDATETIME(), 0);

    DECLARE @NewId BIGINT = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    SELECT Id = @NewId;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrNum INT = ERROR_NUMBER();
    DECLARE @FinalMsg NVARCHAR(2048) = N'Error en sp_AsignarGobernanza: ' + ISNULL(@ErrMsg, N'') + N' (#' + CONVERT(NVARCHAR(20), @ErrNum) + N')';
    THROW 51001, @FinalMsg, 1;
  END CATCH
END
GO