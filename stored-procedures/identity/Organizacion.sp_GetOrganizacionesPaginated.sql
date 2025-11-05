/*
  SP: Organizacion.sp_GetOrganizacionesPaginated
  Descripción: Lista paginada de organizaciones con filtros avanzados y datos enriquecidos.
  Parámetros de entrada:
    @Page INT (>=1)
    @PageSize INT (>=1)
    @RazonSocial VARCHAR(300) NULL
    @Codigo VARCHAR(100) NULL
    @NumeroDocumento VARCHAR(50) NULL
    @TipoDocumento INT NULL
    @Sector INT NULL
    @Industria INT NULL
    @Pais BIGINT NULL
    @Departamento BIGINT NULL
    @Provincia BIGINT NULL
    @Distrito BIGINT NULL
    @FechaConstitucionDesde DATETIME NULL
    @FechaConstitucionHasta DATETIME NULL
    @FechaInicioOperacionesDesde DATETIME NULL
    @FechaInicioOperacionesHasta DATETIME NULL
    @IncludeDeleted BIT = 0
    @Estado INT NULL
    @SoloConSuscripcionVigente BIT = 0
    @SoloConSuscripcionPorVencer BIT = 0
    @DiasAnticipacionVencimiento INT NULL -- días para considerar "por vencer"
    @Instancia VARCHAR(100) NULL
    @Dominio VARCHAR(200) NULL
    @TenantId VARCHAR(100) NULL
    @ClientId VARCHAR(100) NULL

  Columnas de salida (resultset 1):
    OrganizacionId, Codigo, RazonSocial, TipoDocumento, NumeroDocumento,
    Sector, Industria,
    Pais, Departamento, Provincia, Distrito, Direccion,
    NombrePais, NombreDepartamento, NombreProvincia, NombreDistrito,
    Telefono, Email, PaginaWeb,
    FechaConstitucion, FechaInicioOperaciones,
    Mision, Vision, ValoresCorporativos,
    LogoUrl, ColorPrimario, ColorSecundario,
    SuscripcionActualId, EstadoLicencia,
    Instancia, Dominio, TenantId, ClientId,
    Estado, Version, CreadoPor, FechaCreacion, ActualizadoPor, FechaActualizacion, RegistroEliminado,
    SuscripcionId, FechaInicioSuscripcion, FechaFinSuscripcion, LimiteUsuarios, NombrePlanActual,
    NombreUsuarioCreador, NombreUsuarioActualizador,
    TotalUnidadesOrganizacionales, TotalUsuarios

  Columnas de salida (resultset 2):
    TotalCount INT

  Errores:
    - Validaciones de parámetros fuera de rango: RAISERROR con estado 16.
  Notas:
    - Usa schemas: Organizacion.*, Identidad.*, Catalogo.*
    - SET NOCOUNT ON; seleccionado por performance.
*/
GO

CREATE OR ALTER PROCEDURE Organizacion.sp_GetOrganizacionesPaginated
  @Page INT,
  @PageSize INT,
  @RazonSocial VARCHAR(300) = NULL,
  @Codigo VARCHAR(100) = NULL,
  @NumeroDocumento VARCHAR(50) = NULL,
  @TipoDocumento INT = NULL,
  @Sector INT = NULL,
  @Industria INT = NULL,
  @Pais BIGINT = NULL,
  @Departamento BIGINT = NULL,
  @Provincia BIGINT = NULL,
  @Distrito BIGINT = NULL,
  @FechaConstitucionDesde DATETIME = NULL,
  @FechaConstitucionHasta DATETIME = NULL,
  @FechaInicioOperacionesDesde DATETIME = NULL,
  @FechaInicioOperacionesHasta DATETIME = NULL,
  @IncludeDeleted BIT = 0,
  @Estado INT = NULL,
  @SoloConSuscripcionVigente BIT = 0,
  @SoloConSuscripcionPorVencer BIT = 0,
  @DiasAnticipacionVencimiento INT = NULL,
  @Instancia VARCHAR(100) = NULL,
  @Dominio VARCHAR(200) = NULL,
  @TenantId VARCHAR(100) = NULL,
  @ClientId VARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF (@Page IS NULL OR @Page < 1) RAISERROR('Page must be >= 1', 16, 1);
  IF (@PageSize IS NULL OR @PageSize < 1) RAISERROR('PageSize must be >= 1', 16, 1);

  DECLARE @Skip INT = (@Page - 1) * @PageSize;
  DECLARE @TodayUtc DATETIME = SYSUTCDATETIME();

  ;WITH OrgBase AS (
    SELECT o.*
    FROM Organizacion.Organizaciones o
    WHERE
      (@IncludeDeleted = 1 OR o.RegistroEliminado = 0)
      AND (@Estado IS NULL OR o.Estado = @Estado)
      AND (@RazonSocial IS NULL OR o.RazonSocial LIKE '%' + @RazonSocial + '%')
      AND (@Codigo IS NULL OR o.Codigo LIKE '%' + @Codigo + '%')
      AND (@NumeroDocumento IS NULL OR o.NumeroDocumento LIKE '%' + @NumeroDocumento + '%')
      AND (@TipoDocumento IS NULL OR o.TipoDocumento = @TipoDocumento)
      AND (@Sector IS NULL OR o.Sector = @Sector)
      AND (@Industria IS NULL OR o.Industria = @Industria)
      AND (@Pais IS NULL OR o.Pais = @Pais)
      AND (@Departamento IS NULL OR o.Departamento = @Departamento)
      AND (@Provincia IS NULL OR o.Provincia = @Provincia)
      AND (@Distrito IS NULL OR o.Distrito = @Distrito)
      AND (@FechaConstitucionDesde IS NULL OR o.FechaConstitucion >= @FechaConstitucionDesde)
      AND (@FechaConstitucionHasta IS NULL OR o.FechaConstitucion <= @FechaConstitucionHasta)
      AND (@FechaInicioOperacionesDesde IS NULL OR o.FechaInicioOperaciones >= @FechaInicioOperacionesDesde)
      AND (@FechaInicioOperacionesHasta IS NULL OR o.FechaInicioOperaciones <= @FechaInicioOperacionesHasta)
      AND (@Instancia IS NULL OR o.Instancia LIKE '%' + @Instancia + '%')
      AND (@Dominio IS NULL OR o.Dominio LIKE '%' + @Dominio + '%')
      AND (@TenantId IS NULL OR o.TenantId = @TenantId)
      AND (@ClientId IS NULL OR o.ClientId = @ClientId)
      -- Filtros de suscripción
      AND (
        @SoloConSuscripcionVigente = 0 OR EXISTS (
          SELECT 1 FROM Organizacion.SuscripcionesOrganizacion s
          WHERE s.OrganizacionId = o.OrganizacionId
            AND s.RegistroEliminado = 0
            AND s.FechaInicio <= @TodayUtc
            AND s.FechaFin >= @TodayUtc
        )
      )
      AND (
        @SoloConSuscripcionPorVencer = 0 OR EXISTS (
          SELECT 1 FROM Organizacion.SuscripcionesOrganizacion s
          WHERE s.OrganizacionId = o.OrganizacionId
            AND s.RegistroEliminado = 0
            AND s.FechaFin BETWEEN @TodayUtc AND DATEADD(DAY, ISNULL(@DiasAnticipacionVencimiento, 30), @TodayUtc)
        )
      )
  )
  SELECT 
      b.OrganizacionId,
      b.Codigo,
      b.RazonSocial,
      b.TipoDocumento,
      b.NumeroDocumento,
      b.Sector,
      b.Industria,
      b.Pais,
      b.Departamento,
      b.Provincia,
      b.Distrito,
      b.Direccion,
      up.Nombre AS NombrePais,
      ud.Nombre AS NombreDepartamento,
      uv.Nombre AS NombreProvincia,
      ui.Nombre AS NombreDistrito,
      b.Telefono,
      b.Email,
      b.PaginaWeb,
      b.FechaConstitucion,
      b.FechaInicioOperaciones,
      b.Mision,
      b.Vision,
      b.ValoresCorporativos,
      b.LogoUrl,
      b.ColorPrimario,
      b.ColorSecundario,
      b.SuscripcionActualId,
      b.EstadoLicencia,
      b.Instancia,
      b.Dominio,
      b.TenantId,
      b.ClientId,
      b.Estado,
      b.Version,
      b.CreadoPor,
      b.FechaCreacion,
      b.ActualizadoPor,
      b.FechaActualizacion,
      b.RegistroEliminado,
      so.SuscripcionId,
      so.FechaInicio AS FechaInicioSuscripcion,
      so.FechaFin AS FechaFinSuscripcion,
      so.LimiteUsuarios,
      p.Nombre AS NombrePlanActual,
      uc.NombreUsuario AS NombreUsuarioCreador,
      ua.NombreUsuario AS NombreUsuarioActualizador,
      ISNULL(uo.TotalUnidadesOrganizacionales, 0) AS TotalUnidadesOrganizacionales,
      ISNULL(u.TotalUsuarios, 0) AS TotalUsuarios
  FROM OrgBase b
  OUTER APPLY (
    SELECT TOP 1 s.SuscripcionId, s.FechaInicio, s.FechaFin, s.LimiteUsuarios, s.PlanId
    FROM Organizacion.SuscripcionesOrganizacion s
    WHERE s.OrganizacionId = b.OrganizacionId AND s.RegistroEliminado = 0
    ORDER BY s.FechaFin DESC
  ) so
  LEFT JOIN Organizacion.PlanesSuscripcion p ON p.PlanId = so.PlanId
  LEFT JOIN Catalogo.Ubigeo up ON up.UbigeoId = b.Pais
  LEFT JOIN Catalogo.Ubigeo ud ON ud.UbigeoId = b.Departamento
  LEFT JOIN Catalogo.Ubigeo uv ON uv.UbigeoId = b.Provincia
  LEFT JOIN Catalogo.Ubigeo ui ON ui.UbigeoId = b.Distrito
  LEFT JOIN Identidad.Usuarios uc ON uc.UsuarioId = TRY_CAST(b.CreadoPor AS BIGINT)
  LEFT JOIN Identidad.Usuarios ua ON ua.UsuarioId = TRY_CAST(b.ActualizadoPor AS BIGINT)
  OUTER APPLY (
    SELECT COUNT(1) AS TotalUnidadesOrganizacionales
    FROM Organizacion.UnidadesOrg uo2
    WHERE uo2.OrganizacionId = b.OrganizacionId AND uo2.RegistroEliminado = 0
  ) uo
  OUTER APPLY (
    SELECT COUNT(1) AS TotalUsuarios
    FROM Identidad.Personas p2
    WHERE p2.OrganizacionId = b.OrganizacionId AND p2.Estado = 1 AND p2.RegistroEliminado = 0
  ) u
  ORDER BY b.RazonSocial ASC
  OFFSET @Skip ROWS FETCH NEXT @PageSize ROWS ONLY;

  SELECT COUNT(1) AS TotalCount
  FROM OrgBase;
END;
GO