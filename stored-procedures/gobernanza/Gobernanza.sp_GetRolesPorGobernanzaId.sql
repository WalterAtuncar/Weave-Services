-- SP: Gobernanza.sp_GetRolesPorGobernanzaId
-- Propósito: Listar roles asignados para una gobernanza específica
-- Contrato:
--   Parámetros:
--     @GobernanzaId BIGINT
--     @SoloActivos BIT = 1
--     @IncludeDeleted BIT = 0
--   Resultset:
--     GobernanzaId BIGINT
--     NombreGobernanza VARCHAR(500)
--     GobernanzaRolId BIGINT
--     RolGobernanzaId INT
--     UsuarioId BIGINT
--     OrdenEjecucion INT
--     PuedeEditar BIT
--     FechaAsignacion DATETIME2
GO
CREATE OR ALTER PROCEDURE Gobernanza.sp_GetRolesPorGobernanzaId
  @GobernanzaId BIGINT,
  @SoloActivos BIT = 1,
  @IncludeDeleted BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  SELECT 
    g.GobernanzaId,
    g.Nombre AS NombreGobernanza,
    gr.GobernanzaRolId,
    gr.RolGobernanzaId,
    gr.UsuarioId,
    gr.OrdenEjecucion,
    gr.PuedeEditar,
    gr.FechaAsignacion
  FROM Gobernanza.Gobernanza g
  INNER JOIN Gobernanza.GobernanzaRol gr ON gr.GobernanzaId = g.GobernanzaId
  WHERE g.GobernanzaId = @GobernanzaId
    AND (@IncludeDeleted = 1 OR ISNULL(g.RegistroEliminado, 0) = 0)
    AND (@SoloActivos = 0 OR g.Estado = 1)
    AND (@IncludeDeleted = 1 OR ISNULL(gr.RegistroEliminado, 0) = 0)
    AND (@SoloActivos = 0 OR gr.Estado = 1)
  ORDER BY gr.OrdenEjecucion, gr.GobernanzaRolId;
END
GO