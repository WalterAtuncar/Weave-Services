-- SP: Datos.sp_GetSubDominiosByDominioIds
-- Propósito: Devolver subdominios (hijos) para una lista de DominioDataId (padres) provista como CSV.
-- Contrato:
--   Parámetros de entrada:
--     @DominioIdsCsv NVARCHAR(MAX) -- Lista CSV de IDs de dominios padre (BIGINT)
--     @IncludeDeleted BIT          -- Incluir eliminados (0/1)
--   Resultset:
--     RS1: Lista de subdominios con columnas explícitas
-- Notas:
--   - Usa STRING_SPLIT para descomponer el CSV en tabla.
--   - Evita SELECT *, usa columnas explícitas.
--   - SET NOCOUNT ON para desempeño.

CREATE OR ALTER PROCEDURE Datos.sp_GetSubDominiosByDominioIds
  @DominioIdsCsv NVARCHAR(MAX),
  @IncludeDeleted BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  -- Normalizar CSV
  IF (@DominioIdsCsv IS NULL OR LTRIM(RTRIM(@DominioIdsCsv)) = N'')
  BEGIN
    -- Retornar vacío
    SELECT TOP 0
      child.DominioDataId AS SubDominioDataId,
      child.DominioPadreId AS DominioDataId,
      child.Codigo AS CodigoSubDominio,
      child.Nombre AS NombreSubDominio,
      child.Descripcion AS DescripcionSubDominio,
      child.TieneGobernanzaPropia,
      child.Estado,
      child.CreadoPor,
      child.FechaCreacion,
      child.ActualizadoPor,
      child.FechaActualizacion,
      child.Version,
      child.RegistroEliminado,
      ge.GobernanzaId,
      dd.Codigo AS DominioCodigo,
      dd.Nombre AS DominioNombre
    FROM Datos.DominioData child
    LEFT JOIN Datos.DominioData dd ON child.DominioPadreId = dd.DominioDataId
    LEFT JOIN Catalogo.GobernanzaEntidad ge ON ge.EntidadId = child.DominioDataId AND ge.TipoEntidad = 'Data' AND ISNULL(ge.EsActiva,1) = 1;
    RETURN;
  END

  ;WITH Ids AS (
    SELECT DISTINCT TRY_CAST(value AS BIGINT) AS DominioId
    FROM STRING_SPLIT(@DominioIdsCsv, ',')
    WHERE TRY_CAST(value AS BIGINT) IS NOT NULL
  )
  SELECT 
    child.DominioDataId AS SubDominioDataId,
    child.DominioPadreId AS DominioDataId,
    child.Codigo AS CodigoSubDominio,
    child.Nombre AS NombreSubDominio,
    child.Descripcion AS DescripcionSubDominio,
    child.TieneGobernanzaPropia,
    child.Estado,
    child.CreadoPor,
    child.FechaCreacion,
    child.ActualizadoPor,
    child.FechaActualizacion,
    child.Version,
    child.RegistroEliminado,
    ge.GobernanzaId,
    dd.Codigo AS DominioCodigo,
    dd.Nombre AS DominioNombre
  FROM Datos.DominioData child
  LEFT JOIN Datos.DominioData dd ON child.DominioPadreId = dd.DominioDataId
  LEFT JOIN Catalogo.GobernanzaEntidad ge ON ge.EntidadId = child.DominioDataId AND ge.TipoEntidad = 'Data' AND ISNULL(ge.EsActiva,1) = 1
  WHERE child.DominioPadreId IN (SELECT DominioId FROM Ids)
    AND (@IncludeDeleted = 1 OR child.RegistroEliminado = 0)
  ORDER BY child.DominioPadreId, child.Codigo;
END;