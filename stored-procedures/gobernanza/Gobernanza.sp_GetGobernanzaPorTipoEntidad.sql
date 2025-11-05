-- SP: Gobernanza.sp_GetGobernanzaPorTipoEntidad
-- Propósito: Obtener gobernanza activa para un TipoEntidad y sus roles asignados
-- Contrato:
--   Parámetros:
--     @TipoEntidadId INT
--     @OrganizacionId BIGINT = NULL
--     @SoloActivos BIT = 1
--     @IncludeDeleted BIT = 0
--   Resultset 1 (Gobernanza):
--     GobernanzaId, Nombre, TipoGobiernoId, TipoEntidadId,
--     FechaAsignacion, FechaVencimiento, Observaciones, Estado,
--     CreadoPor, FechaCreacion
--   Resultset 2 (Roles):
--     GobernanzaRolId, RolGobernanzaId, UsuarioId, OrdenEjecucion,
--     PuedeEditar, FechaAsignacion, Estado
GO
CREATE OR ALTER PROCEDURE Gobernanza.sp_GetGobernanzaPorTipoEntidad
  @TipoEntidadId INT,
  @OrganizacionId BIGINT = NULL,
  @SoloActivos BIT = 1,
  @IncludeDeleted BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @GobernanzaId BIGINT;

  SELECT TOP 1 @GobernanzaId = g.GobernanzaId
  FROM Gobernanza.Gobernanza g
  WHERE g.TipoEntidadId = @TipoEntidadId
    AND (@OrganizacionId IS NULL OR g.OrganizacionId = @OrganizacionId)
    AND (@IncludeDeleted = 1 OR ISNULL(g.RegistroEliminado, 0) = 0)
    AND (@SoloActivos = 0 OR g.Estado = 1)
  ORDER BY g.FechaAsignacion DESC;

  SELECT 
    g.GobernanzaId,
    g.Nombre AS NombreGobernanza,
    g.TipoGobiernoId,
    g.TipoEntidadId,
    g.FechaAsignacion,
    g.FechaVencimiento,
    g.Observaciones,
    g.Estado,
    g.CreadoPor,
    g.FechaCreacion
  FROM Gobernanza.Gobernanza g
  WHERE g.GobernanzaId = @GobernanzaId;

  SELECT 
    gr.GobernanzaRolId,
    gr.RolGobernanzaId,
    gr.UsuarioId,
    gr.OrdenEjecucion,
    gr.PuedeEditar,
    gr.FechaAsignacion,
    gr.Estado
  FROM Gobernanza.GobernanzaRol gr
  WHERE gr.GobernanzaId = @GobernanzaId
    AND (@IncludeDeleted = 1 OR ISNULL(gr.RegistroEliminado, 0) = 0)
    AND (@SoloActivos = 0 OR gr.Estado = 1)
  ORDER BY gr.OrdenEjecucion, gr.GobernanzaRolId;
END
GO