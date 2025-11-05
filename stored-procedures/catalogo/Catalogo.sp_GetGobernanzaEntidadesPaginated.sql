-- Catalogo.sp_GetGobernanzaEntidadesPaginated
-- Propósito: Listado paginado de asociaciones Gobernanza-Entidad con filtros opcionales
-- Schema: catalogo
-- Parámetros:
--   @Page            INT                 -- página actual (>=1)
--   @PageSize        INT                 -- tamaño de página (1..100)
--   @GobernanzaId    BIGINT      = NULL  -- filtra por GobernanzaId
--   @EntidadId       BIGINT      = NULL  -- filtra por EntidadId
--   @TipoEntidad     NVARCHAR(50)= NULL  -- filtra por TipoEntidad (igualdad)
--   @EsActiva        BIT         = NULL  -- filtra por estado activo
--   @IncludeDeleted  BIT         = 0     -- incluye registros eliminados si es 1
-- Salida:
--   Resultset 1 (paginado):
--     GobernanzaEntidadId BIGINT,
--     GobernanzaId BIGINT,
--     EntidadId BIGINT,
--     TipoEntidad NVARCHAR(50),
--     FechaAsociacion DATETIME2(3),
--     FechaDesasociacion DATETIME2(3) NULL,
--     Observaciones VARCHAR(1000) NULL,
--     EsActiva BIT
--   Resultset 2:
--     TotalCount INT
-- Convenciones:
--   - SET NOCOUNT ON
--   - Selección de columnas explícitas (sin SELECT *)
--   - Referencias al esquema correcto: catalogo.GobernanzaEntidad

CREATE OR ALTER PROCEDURE catalogo.sp_GetGobernanzaEntidadesPaginated
  @Page           INT,
  @PageSize       INT,
  @GobernanzaId   BIGINT       = NULL,
  @EntidadId      BIGINT       = NULL,
  @TipoEntidad    NVARCHAR(50) = NULL,
  @EsActiva       BIT          = NULL,
  @IncludeDeleted BIT          = 0
AS
BEGIN
  SET NOCOUNT ON;

  -- Normalizar límites
  IF (@Page IS NULL OR @Page < 1) SET @Page = 1;
  IF (@PageSize IS NULL OR @PageSize < 1) SET @PageSize = 10;
  IF (@PageSize > 100) SET @PageSize = 100;

  ;WITH Filtered AS (
    SELECT
      ge.GobernanzaEntidadId,
      ge.GobernanzaId,
      ge.EntidadId,
      ge.TipoEntidad,
      ge.FechaAsociacion,
      ge.FechaDesasociacion,
      ge.Observaciones,
      ge.EsActiva
    FROM catalogo.GobernanzaEntidad AS ge
    WHERE
      (@GobernanzaId IS NULL OR ge.GobernanzaId = @GobernanzaId)
      AND (@EntidadId IS NULL OR ge.EntidadId = @EntidadId)
      AND (@TipoEntidad IS NULL OR ge.TipoEntidad = @TipoEntidad)
      AND (@EsActiva IS NULL OR ge.EsActiva = @EsActiva)
      AND (
        @IncludeDeleted = 1
        OR ISNULL(ge.RegistroEliminado, 0) = 0
      )
  )
  SELECT
    f.GobernanzaEntidadId,
    f.GobernanzaId,
    f.EntidadId,
    f.TipoEntidad,
    f.FechaAsociacion,
    f.FechaDesasociacion,
    f.Observaciones,
    f.EsActiva
  FROM Filtered AS f
  ORDER BY f.FechaAsociacion DESC, f.GobernanzaEntidadId DESC
  OFFSET (@Page - 1) * @PageSize ROWS FETCH NEXT @PageSize ROWS ONLY;

  SELECT COUNT(1) AS TotalCount
  FROM catalogo.GobernanzaEntidad AS ge
  WHERE
    (@GobernanzaId IS NULL OR ge.GobernanzaId = @GobernanzaId)
    AND (@EntidadId IS NULL OR ge.EntidadId = @EntidadId)
    AND (@TipoEntidad IS NULL OR ge.TipoEntidad = @TipoEntidad)
    AND (@EsActiva IS NULL OR ge.EsActiva = @EsActiva)
    AND (
      @IncludeDeleted = 1
      OR ISNULL(ge.RegistroEliminado, 0) = 0
    );
END;