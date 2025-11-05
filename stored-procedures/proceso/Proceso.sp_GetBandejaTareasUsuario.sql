-- SP: Proceso.sp_GetBandejaTareasUsuario
-- Propósito: Obtener la bandeja de tareas de workflow para un usuario
-- Contrato:
--   Parámetros:
--     @UsuarioId BIGINT
--     @IncluirPendientes BIT = 1
--     @IncluirEnProceso BIT = 1
--     @IncluirCompletadas BIT = 0
--     @IncluirRechazadas BIT = 0
--     @FechaInicioDesde DATETIME2 = NULL
--     @FechaInicioHasta DATETIME2 = NULL
--     @FechaCompletadoDesde DATETIME2 = NULL
--     @FechaCompletadoHasta DATETIME2 = NULL
--     @AccionWorkflow NVARCHAR(100) = NULL
--     @GobernanzaId BIGINT = NULL
--     @WorkflowGrupoId BIGINT = NULL
--     @LimitePendientes INT = NULL
--     @LimiteCompletadas INT = NULL
--   Resultset:
--     WorkflowEjecucionId, GobernanzaWorkflowId, WorkflowGrupoId,
--     RolActualId, UsuarioActualId, RolSiguienteId, UsuarioSiguienteId,
--     EstadoTarea, EsActivo, FechaInicioTarea, FechaCompletado,
--     AccionWork, GobernanzaId, EntidadId, Version, EstadoWorkflow,
--     GobernanzaNombre, RolActualNombre, RolSiguienteNombre
GO
CREATE OR ALTER PROCEDURE Proceso.sp_GetBandejaTareasUsuario
  @UsuarioId BIGINT,
  @IncluirPendientes BIT = 1,
  @IncluirEnProceso BIT = 1,
  @IncluirCompletadas BIT = 0,
  @IncluirRechazadas BIT = 0,
  @FechaInicioDesde DATETIME2 = NULL,
  @FechaInicioHasta DATETIME2 = NULL,
  @FechaCompletadoDesde DATETIME2 = NULL,
  @FechaCompletadoHasta DATETIME2 = NULL,
  @AccionWorkflow NVARCHAR(100) = NULL,
  @GobernanzaId BIGINT = NULL,
  @WorkflowGrupoId BIGINT = NULL,
  @LimitePendientes INT = NULL,
  @LimiteCompletadas INT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Construir conjunto de estados incluidos
  DECLARE @Estados TABLE (Estado INT);
  IF (@IncluirPendientes = 1) INSERT INTO @Estados VALUES (0); -- Pendiente
  IF (@IncluirEnProceso = 1) INSERT INTO @Estados VALUES (1); -- En proceso
  IF (@IncluirCompletadas = 1) INSERT INTO @Estados VALUES (2); -- Completada
  IF (@IncluirRechazadas = 1) INSERT INTO @Estados VALUES (3); -- Rechazada

  ;WITH Tareas AS (
    SELECT 
      gwe.WorkflowEjecucionId,
      gwe.GobernanzaWorkflowId,
      gwe.WorkflowGrupoId,
      gwe.RolActualId,
      gwe.UsuarioActualId,
      gwe.RolSiguienteId,
      gwe.UsuarioSiguienteId,
      gwe.EstadoTarea,
      gwe.EsActivo,
      gwe.FechaInicioTarea,
      gwe.FechaCompletado,
      gw.AccionWork,
      gw.GobernanzaId,
      gw.EntidadId,
      gw.Version,
      gw.EstadoWorkflow,
      g.Nombre AS GobernanzaNombre,
      ra.RolGobernanzaNombre AS RolActualNombre,
      rs.RolGobernanzaNombre AS RolSiguienteNombre,
      CASE WHEN gwe.EstadoTarea IN (0,1) THEN 'Pendiente' ELSE 'Completada' END AS GrupoEstado
    FROM Proceso.GobernanzaWorkflowEjecucion AS gwe
    INNER JOIN Proceso.GobernanzaWorkflow AS gw ON gw.GobernanzaWorkflowId = gwe.GobernanzaWorkflowId
    INNER JOIN Gobernanza.Gobernanza AS g ON g.GobernanzaId = gw.GobernanzaId
    LEFT JOIN Gobernanza.RolGobernanza AS ra ON ra.RolGobernanzaId = gwe.RolActualId
    LEFT JOIN Gobernanza.RolGobernanza AS rs ON rs.RolGobernanzaId = gwe.RolSiguienteId
    WHERE gwe.UsuarioActualId = @UsuarioId
      AND (NOT EXISTS(SELECT 1 FROM @Estados) OR gwe.EstadoTarea IN (SELECT Estado FROM @Estados))
      AND (@FechaInicioDesde IS NULL OR gwe.FechaInicioTarea >= @FechaInicioDesde)
      AND (@FechaInicioHasta IS NULL OR gwe.FechaInicioTarea <= @FechaInicioHasta)
      AND (@FechaCompletadoDesde IS NULL OR gwe.FechaCompletado >= @FechaCompletadoDesde)
      AND (@FechaCompletadoHasta IS NULL OR gwe.FechaCompletado <= @FechaCompletadoHasta)
      AND (@AccionWorkflow IS NULL OR gw.AccionWork LIKE '%' + @AccionWorkflow + '%')
      AND (@GobernanzaId IS NULL OR gw.GobernanzaId = @GobernanzaId)
      AND (@WorkflowGrupoId IS NULL OR gwe.WorkflowGrupoId = @WorkflowGrupoId)
  ), TareasConRango AS (
    SELECT 
      ROW_NUMBER() OVER (PARTITION BY GrupoEstado ORDER BY FechaInicioTarea DESC) AS RowNum,
      *
    FROM Tareas
  )
  SELECT 
    WorkflowEjecucionId,
    GobernanzaWorkflowId,
    WorkflowGrupoId,
    RolActualId,
    UsuarioActualId,
    RolSiguienteId,
    UsuarioSiguienteId,
    EstadoTarea,
    EsActivo,
    FechaInicioTarea,
    FechaCompletado,
    AccionWork,
    GobernanzaId,
    EntidadId,
    Version,
    EstadoWorkflow,
    GobernanzaNombre,
    RolActualNombre,
    RolSiguienteNombre
  FROM TareasConRango
  WHERE (GrupoEstado = 'Pendiente' AND ( @LimitePendientes IS NULL OR RowNum <= @LimitePendientes))
     OR (GrupoEstado = 'Completada' AND ( @LimiteCompletadas IS NULL OR RowNum <= @LimiteCompletadas))
  ORDER BY FechaInicioTarea DESC, WorkflowEjecucionId;
END
GO