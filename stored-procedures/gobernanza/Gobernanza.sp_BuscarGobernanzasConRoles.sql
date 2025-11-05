-- SP: Gobernanza.sp_BuscarGobernanzasConRoles
-- Propósito: Listar gobernanzas con sus roles asignados, filtrando por organización y nombre.
-- Contrato:
--   Parámetros de entrada:
--     @OrganizacionId  BIGINT              -- Organización dueña de la gobernanza
--     @Filtro          NVARCHAR(100) = NULL -- Filtro por nombre de gobernanza (LIKE)
--   Resultset (columnas explícitas):
--     GobernanzaId BIGINT
--     NombreGobernanza VARCHAR(500)
--     GobernanzaRolId BIGINT
--     RolGobernanzaId BIGINT
--     UsuarioId BIGINT
--     OrdenEjecucion INT
--     PuedeEditar BIT
--     FechaAsignacion DATETIME
-- Notas:
--   - `SET NOCOUNT ON` para evitar mensajes de cuenta de filas.
--   - Filtros de auditoría: Estado activo y RegistroEliminado = 0.
--   - Referencias de schema:
--       * Gobernanza.Gobernanza
--       * Gobernanza.GobernanzaRol

CREATE OR ALTER PROCEDURE Gobernanza.sp_BuscarGobernanzasConRoles
  @OrganizacionId BIGINT,
  @Filtro NVARCHAR(100) = NULL
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
  WHERE g.OrganizacionId = @OrganizacionId
    AND ISNULL(g.RegistroEliminado, 0) = 0
    AND g.Estado = 1
    AND ISNULL(gr.RegistroEliminado, 0) = 0
    AND gr.Estado = 1
    AND (@Filtro IS NULL OR @Filtro = N'' OR g.Nombre LIKE '%' + @Filtro + '%')
  ORDER BY g.GobernanzaId, gr.OrdenEjecucion;
END;