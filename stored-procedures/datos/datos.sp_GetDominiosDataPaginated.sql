-- SP: Datos.sp_GetDominiosDataPaginated
-- Propósito: Listar DominioData paginado con filtros complejos y total de registros.
-- Contrato:
--   Parámetros de entrada:
--     @Page                INT                -- Página (>=1)
--     @PageSize            INT                -- Tamaño de página (1..100)
--     @IncludeDeleted      BIT                -- Incluir eliminados (0/1)
--     @OrganizacionId      BIGINT    = NULL   -- Filtro por organización
--     @CodigoDominio       NVARCHAR(100) = NULL -- Filtro por código (LIKE)
--     @NombreDominio       NVARCHAR(200) = NULL -- Filtro por nombre (LIKE)
--     @TipoDominioId       BIGINT    = NULL   -- Filtro por tipo
--     @Estado              INT       = NULL   -- Filtro por estado exacto
--     @SoloActivos         BIT       = NULL   -- Si 1, Estado = 1
--     @TieneSubDominios    BIT       = NULL   -- Si 1, TotalSubDominios > 0; si 0, == 0
--     @SoloSinSubDominios  BIT       = NULL   -- Si 1, TotalSubDominios == 0
--     @FechaCreacionDesde  DATETIME2 = NULL   -- Rango fecha creación desde
--     @FechaCreacionHasta  DATETIME2 = NULL   -- Rango fecha creación hasta (inclusive)
--     @FechaActualizacionDesde DATETIME2 = NULL -- Rango fecha actualización desde
--     @FechaActualizacionHasta DATETIME2 = NULL -- Rango fecha actualización hasta (inclusive)
--     @CreadoPor           BIGINT    = NULL   -- Filtro auditoría creado por
--     @ActualizadoPor      BIGINT    = NULL   -- Filtro auditoría actualizado por
--     @SearchTerm          NVARCHAR(200) = NULL -- Búsqueda general en múltiples columnas
--     @OrderBy             NVARCHAR(50) = NULL -- Campo de orden (whitelist interno)
--     @OrderDescending     BIT       = NULL   -- Si 1 DESC, si 0 ASC
--   Resultsets:
--     RS1: Lista paginada de dominios (columnas explícitas)
--     RS2: TotalCount (una fila, columna TotalCount INT)
 --   - Usa schemas por dominio: Datos (DominioData), Organizacion (Organizaciones), Catalogo (TipoDominio, GobernanzaEntidad), Gobernanza (Gobernanza)
--   - Evita SELECT *, usa columnas explícitas.
--   - SET NOCOUNT ON para desempeño.

CREATE OR ALTER PROCEDURE Datos.sp_GetDominiosDataPaginated
  @Page                INT,
  @PageSize            INT,
  @IncludeDeleted      BIT,
  @OrganizacionId      BIGINT    = NULL,
  @CodigoDominio       NVARCHAR(100) = NULL,
  @NombreDominio       NVARCHAR(200) = NULL,
  @TipoDominioId       BIGINT    = NULL,
  @Estado              INT       = NULL,
  @SoloActivos         BIT       = NULL,
  @TieneSubDominios    BIT       = NULL,
  @SoloSinSubDominios  BIT       = NULL,
  @FechaCreacionDesde  DATETIME2 = NULL,
  @FechaCreacionHasta  DATETIME2 = NULL,
  @FechaActualizacionDesde DATETIME2 = NULL,
  @FechaActualizacionHasta DATETIME2 = NULL,
  @CreadoPor           BIGINT    = NULL,
  @ActualizadoPor      BIGINT    = NULL,
  @SearchTerm          NVARCHAR(200) = NULL,
  @OrderBy             NVARCHAR(50) = NULL,
  @OrderDescending     BIT       = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Normalización de paginación
  IF (@Page IS NULL OR @Page < 1) SET @Page = 1;
  IF (@PageSize IS NULL OR @PageSize < 1) SET @PageSize = 10;
  IF (@PageSize > 100) SET @PageSize = 100;

  DECLARE @Skip INT = (@Page - 1) * @PageSize;

  -- Whitelist de campos ORDER BY
  DECLARE @OrderByNormalized NVARCHAR(50) = ISNULL(@OrderBy, N'DominioDataId');
  IF (@OrderByNormalized NOT IN (N'CodigoDominio', N'NombreDominio', N'FechaCreacion', N'FechaActualizacion', N'Estado', N'TipoDominioNombre', N'RazonSocialOrganizacion', N'TotalSubDominios', N'DominioDataId'))
  BEGIN
    SET @OrderByNormalized = N'DominioDataId';
  END
  DECLARE @OrderDir NVARCHAR(4) = CASE WHEN ISNULL(@OrderDescending, 0) = 1 THEN N'DESC' ELSE N'ASC' END;

  -- Consulta base con joins y conteo de subdominios
  ;WITH Base AS (
    SELECT 
      dd.DominioDataId,
      dd.OrganizacionId,
      dd.Codigo AS CodigoDominio,
      dd.Nombre AS NombreDominio,
      dd.Descripcion AS DescripcionDominio,
      dd.TipoDominioId,
      dd.Estado,
      dd.CreadoPor,
      dd.FechaCreacion,
      dd.ActualizadoPor,
      dd.FechaActualizacion,
      dd.Version,
      dd.RegistroEliminado,

      -- Información de organización
      o.Codigo AS CodigoOrganizacion,
      o.RazonSocial AS RazonSocialOrganizacion,
      o.NombreComercial AS NombreComercialOrganizacion,

      -- Información de tipo dominio
      td.TipoDominioCodigo,
      td.TipoDominioNombre,
      td.TipoDominioDescripcion,

      -- Información de gobernanza (opcional)
      ge.GobernanzaId,

      -- Conteo de subdominios
      ISNULL(sdd.TotalSubDominios, 0) AS TotalSubDominios
    FROM Datos.DominioData dd
    LEFT JOIN Organizacion.Organizaciones o ON dd.OrganizacionId = o.OrganizacionId
    LEFT JOIN Catalogo.TipoDominio td ON dd.TipoDominioId = td.TipoDominioId
    LEFT JOIN (
      SELECT 
        DominioPadreId AS DominioDataId,
        COUNT(*) AS TotalSubDominios
      FROM Datos.DominioData 
      WHERE RegistroEliminado = 0 AND DominioPadreId IS NOT NULL
      GROUP BY DominioPadreId
    ) sdd ON dd.DominioDataId = sdd.DominioDataId
    LEFT JOIN (
      SELECT 
        ge.EntidadId AS DominioDataId,
        g.OrganizacionId,
        MAX(ge.GobernanzaId) AS GobernanzaId
      FROM Catalogo.GobernanzaEntidad ge
      INNER JOIN Gobernanza.Gobernanza g ON g.GobernanzaId = ge.GobernanzaId
      WHERE 
        ge.TipoEntidad = 'Data'
        AND ISNULL(ge.EsActiva, 1) = 1
        AND ISNULL(g.RegistroEliminado, 0) = 0
        AND g.Estado = 1
      GROUP BY ge.EntidadId, g.OrganizacionId
    ) ge ON ge.DominioDataId = dd.DominioDataId AND ge.OrganizacionId = dd.OrganizacionId
    WHERE 1 = 1
      AND (@IncludeDeleted = 1 OR dd.RegistroEliminado = 0)
      AND (@OrganizacionId IS NULL OR dd.OrganizacionId = @OrganizacionId)
      AND (@CodigoDominio IS NULL OR dd.Codigo LIKE '%' + @CodigoDominio + '%')
      AND (@NombreDominio IS NULL OR dd.Nombre LIKE '%' + @NombreDominio + '%')
      AND (@TipoDominioId IS NULL OR dd.TipoDominioId = @TipoDominioId)
      AND (@Estado IS NULL OR dd.Estado = @Estado)
      AND (ISNULL(@SoloActivos, 0) = 0 OR dd.Estado = 1)
      AND (
           @TieneSubDominios IS NULL OR 
           (@TieneSubDominios = 1 AND ISNULL(sdd.TotalSubDominios, 0) > 0) OR
           (@TieneSubDominios = 0 AND ISNULL(sdd.TotalSubDominios, 0) = 0)
      )
      AND (ISNULL(@SoloSinSubDominios, 0) = 0 OR ISNULL(sdd.TotalSubDominios, 0) = 0)
      AND (@FechaCreacionDesde IS NULL OR dd.FechaCreacion >= @FechaCreacionDesde)
      AND (@FechaCreacionHasta IS NULL OR dd.FechaCreacion <= @FechaCreacionHasta)
      AND (@FechaActualizacionDesde IS NULL OR dd.FechaActualizacion >= @FechaActualizacionDesde)
      AND (@FechaActualizacionHasta IS NULL OR dd.FechaActualizacion <= @FechaActualizacionHasta)
      AND (@CreadoPor IS NULL OR dd.CreadoPor = @CreadoPor)
      AND (@ActualizadoPor IS NULL OR dd.ActualizadoPor = @ActualizadoPor)
      AND (
           @SearchTerm IS NULL OR @SearchTerm = N'' OR
           dd.Codigo LIKE '%' + @SearchTerm + '%' OR 
           dd.Nombre LIKE '%' + @SearchTerm + '%' OR 
           dd.Descripcion LIKE '%' + @SearchTerm + '%' OR
           o.RazonSocial LIKE '%' + @SearchTerm + '%' OR
           o.NombreComercial LIKE '%' + @SearchTerm + '%' OR
           td.TipoDominioNombre LIKE '%' + @SearchTerm + '%'
      )
  )
  SELECT *
  FROM Base
  ORDER BY 
    CASE WHEN @OrderByNormalized = N'DominioDataId' THEN DominioDataId END,
    CASE WHEN @OrderByNormalized = N'CodigoDominio' THEN CodigoDominio END,
    CASE WHEN @OrderByNormalized = N'NombreDominio' THEN NombreDominio END,
    CASE WHEN @OrderByNormalized = N'FechaCreacion' THEN FechaCreacion END,
    CASE WHEN @OrderByNormalized = N'FechaActualizacion' THEN FechaActualizacion END,
    CASE WHEN @OrderByNormalized = N'Estado' THEN Estado END,
    CASE WHEN @OrderByNormalized = N'TipoDominioNombre' THEN TipoDominioNombre END,
    CASE WHEN @OrderByNormalized = N'RazonSocialOrganizacion' THEN RazonSocialOrganizacion END,
    CASE WHEN @OrderByNormalized = N'TotalSubDominios' THEN TotalSubDominios END
  OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY;

  -- TotalCount con mismos filtros
  SELECT COUNT(1) AS TotalCount
  FROM (
    SELECT dd.DominioDataId
    FROM Datos.DominioData dd
    LEFT JOIN Organizacion.Organizaciones o ON dd.OrganizacionId = o.OrganizacionId
    LEFT JOIN Catalogo.TipoDominio td ON dd.TipoDominioId = td.TipoDominioId
    LEFT JOIN (
      SELECT 
        DominioPadreId AS DominioDataId,
        COUNT(*) AS TotalSubDominios
      FROM Datos.DominioData 
      WHERE RegistroEliminado = 0 AND DominioPadreId IS NOT NULL
      GROUP BY DominioPadreId
    ) sdd ON dd.DominioDataId = sdd.DominioDataId
    WHERE 1 = 1
      AND (@IncludeDeleted = 1 OR dd.RegistroEliminado = 0)
      AND (@OrganizacionId IS NULL OR dd.OrganizacionId = @OrganizacionId)
      AND (@CodigoDominio IS NULL OR dd.Codigo LIKE '%' + @CodigoDominio + '%')
      AND (@NombreDominio IS NULL OR dd.Nombre LIKE '%' + @NombreDominio + '%')
      AND (@TipoDominioId IS NULL OR dd.TipoDominioId = @TipoDominioId)
      AND (@Estado IS NULL OR dd.Estado = @Estado)
      AND (ISNULL(@SoloActivos, 0) = 0 OR dd.Estado = 1)
      AND (
           @TieneSubDominios IS NULL OR 
           (@TieneSubDominios = 1 AND ISNULL(sdd.TotalSubDominios, 0) > 0) OR
           (@TieneSubDominios = 0 AND ISNULL(sdd.TotalSubDominios, 0) = 0)
      )
      AND (ISNULL(@SoloSinSubDominios, 0) = 0 OR ISNULL(sdd.TotalSubDominios, 0) = 0)
      AND (@FechaCreacionDesde IS NULL OR dd.FechaCreacion >= @FechaCreacionDesde)
      AND (@FechaCreacionHasta IS NULL OR dd.FechaCreacion <= @FechaCreacionHasta)
      AND (@FechaActualizacionDesde IS NULL OR dd.FechaActualizacion >= @FechaActualizacionDesde)
      AND (@FechaActualizacionHasta IS NULL OR dd.FechaActualizacion <= @FechaActualizacionHasta)
      AND (@CreadoPor IS NULL OR dd.CreadoPor = @CreadoPor)
      AND (@ActualizadoPor IS NULL OR dd.ActualizadoPor = @ActualizadoPor)
      AND (
           @SearchTerm IS NULL OR @SearchTerm = N'' OR
           dd.Codigo LIKE '%' + @SearchTerm + '%' OR 
           dd.Nombre LIKE '%' + @SearchTerm + '%' OR 
           dd.Descripcion LIKE '%' + @SearchTerm + '%' OR
           o.RazonSocial LIKE '%' + @SearchTerm + '%' OR
           o.NombreComercial LIKE '%' + @SearchTerm + '%' OR
           td.TipoDominioNombre LIKE '%' + @SearchTerm + '%'
      )
  ) X;
END;