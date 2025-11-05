/*
  SP: Gobernanza.sp_GetAllGobernanzas
  Propósito: Listado especializado de gobernanzas con filtros básicos.

  Parámetros:
    @IncludeDeleted BIT           -- Incluye registros eliminados (RegistroEliminado = 1)
    @OrganizacionId BIGINT = NULL -- Filtra por organización
    @EntidadId BIGINT = NULL      -- Filtra por entidad específica (ignora si = -1)
    @TipoGobiernoId BIGINT = NULL -- Filtra por tipo de gobierno
    @TipoEntidadId BIGINT = NULL  -- Filtra por tipo de entidad
    @UsuarioId BIGINT = NULL      -- Filtra por usuario asignado vía GobernanzaRol
    @SoloProximasAVencer BIT = 0  -- Solo próximas a vencer dentro de 30 días
    @SoloVencidas BIT = 0         -- Solo vencidas a la fecha actual

  Resultado (columnas explícitas):
    g.GobernanzaId,
    g.TipoFlujo,
    g.OrganizacionId,
    g.Nombre,
    g.TipoGobiernoId,
    g.TipoEntidadId,
    g.FechaAsignacion,
    g.FechaVencimiento,
    g.Observaciones,
    g.Estado,
    g.Version,
    g.CreadoPor,
    g.FechaCreacion,
    g.ActualizadoPor,
    g.FechaActualizacion,
    g.RegistroEliminado

  Errores: utilizar excepciones T-SQL si aplica en futuras extensiones.
*/
CREATE OR ALTER PROCEDURE Gobernanza.sp_GetAllGobernanzas
  @IncludeDeleted BIT,
  @OrganizacionId BIGINT = NULL,
  @EntidadId BIGINT = NULL,
  @TipoGobiernoId BIGINT = NULL,
  @TipoEntidadId BIGINT = NULL,
  @UsuarioId BIGINT = NULL,
  @SoloProximasAVencer BIT = 0,
  @SoloVencidas BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @AhoraUtc DATETIME2(7) = SYSUTCDATETIME();
  DECLARE @LimiteProximo DATETIME2(7) = DATEADD(DAY, 30, @AhoraUtc);

  /*
    Nota de schemas: todas las tablas referenciadas usan schemas del bounded context WeaveCore
    - Gobernanza.Gobernanza
    - Gobernanza.GobernanzaEntidad
    - Gobernanza.GobernanzaRol
  */

  SELECT
      g.GobernanzaId,
      g.TipoFlujo,
      g.OrganizacionId,
      g.Nombre,
      g.TipoGobiernoId,
      g.TipoEntidadId,
      g.FechaAsignacion,
      g.FechaVencimiento,
      g.Observaciones,
      g.Estado,
      g.Version,
      g.CreadoPor,
      g.FechaCreacion,
      g.ActualizadoPor,
      g.FechaActualizacion,
      g.RegistroEliminado
  FROM Gobernanza.Gobernanza g
  LEFT JOIN Gobernanza.GobernanzaEntidad ge
         ON ge.GobernanzaId = g.GobernanzaId
        AND (ge.RegistroEliminado = 0 OR ge.RegistroEliminado IS NULL)
  WHERE
      (@IncludeDeleted = 1 OR g.RegistroEliminado = 0)
      AND (@OrganizacionId IS NULL OR g.OrganizacionId = @OrganizacionId)
      AND (
            @EntidadId IS NULL
            OR @EntidadId = -1
            OR ge.EntidadId = @EntidadId
          )
      AND (@TipoGobiernoId IS NULL OR g.TipoGobiernoId = @TipoGobiernoId)
      AND (@TipoEntidadId IS NULL OR g.TipoEntidadId = @TipoEntidadId)
      AND (
            @UsuarioId IS NULL
            OR EXISTS (
                SELECT 1
                FROM Gobernanza.GobernanzaRol gr
                WHERE gr.GobernanzaId = g.GobernanzaId
                  AND gr.UsuarioId = @UsuarioId
                  AND (gr.RegistroEliminado = 0 OR gr.RegistroEliminado IS NULL)
            )
          )
      AND (
            @SoloVencidas = 0
            OR (g.FechaVencimiento IS NOT NULL AND g.FechaVencimiento < @AhoraUtc)
          )
      AND (
            @SoloProximasAVencer = 0
            OR (
                g.FechaVencimiento IS NOT NULL AND
                g.FechaVencimiento BETWEEN @AhoraUtc AND @LimiteProximo
            )
          )
  ORDER BY g.FechaCreacion DESC;
END;