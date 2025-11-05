-- SP: Proceso.sp_IniciarWorkflow
-- Propósito: Iniciar un workflow de gobernanza creando la instancia, los grupos por orden y las ejecuciones iniciales.
-- Contrato:
--   Parámetros:
--     @GobernanzaId BIGINT
--     @EntidadId BIGINT
--     @AccionWorkflow NVARCHAR(100)
--     @UsuarioIniciadorId BIGINT
--   Resultado: retorna el ID de la instancia de workflow creada (GobernanzaWorkflowId)
GO
CREATE OR ALTER PROCEDURE Proceso.sp_IniciarWorkflow
  @GobernanzaId BIGINT,
  @EntidadId BIGINT,
  @AccionWorkflow NVARCHAR(100),
  @UsuarioIniciadorId BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRAN;

    -- Validaciones básicas
    IF NOT EXISTS (SELECT 1 FROM Gobernanza.Gobernanza WITH (NOLOCK) WHERE GobernanzaId = @GobernanzaId)
    BEGIN
      THROW 51030, N'Gobernanza no encontrada', 1;
    END

    -- Crear instancia de workflow
    DECLARE @Ahora DATETIME2(7) = SYSUTCDATETIME();
    DECLARE @WorkflowId BIGINT;

    INSERT INTO Proceso.GobernanzaWorkflow (
      GobernanzaId, EntidadId, AccionWork, EstadoWorkflow, Version, Estado,
      CreadoPor, FechaCreacion, ActualizadoPor, FechaActualizacion
    )
    VALUES (
      @GobernanzaId, @EntidadId, @AccionWorkflow, 0, 1, 1,
      @UsuarioIniciadorId, @Ahora, NULL, NULL
    );
    SET @WorkflowId = SCOPE_IDENTITY();

    -- Obtener roles ordenados
    ;WITH RolesOrdenados AS (
      SELECT gr.GobernanzaRolId,
             gr.RolGobernanzaId,
             gr.UsuarioId,
             gr.OrdenEjecucion
      FROM Gobernanza.GobernanzaRol gr WITH (NOLOCK)
      WHERE gr.GobernanzaId = @GobernanzaId AND ISNULL(gr.Estado,1) = 1
    ), Distintos AS (
      SELECT DISTINCT OrdenEjecucion FROM RolesOrdenados
    )
    SELECT 1;

    DECLARE @MinOrden INT;
    SELECT @MinOrden = MIN(OrdenEjecucion) FROM RolesOrdenados;

    -- Insertar grupos por orden
    DECLARE @Grupos TABLE (OrdenEjecucion INT PRIMARY KEY, WorkflowGrupoId BIGINT);

    INSERT INTO Proceso.GobernanzaWorkflowGrupo (
      GobernanzaWorkflowId, OrdenEjecucion, TotalUsuarios, UsuariosCompletados,
      EstadoGrupo, EsActivo, FechaInicio, FechaCompletado,
      Version, Estado, CreadoPor, FechaCreacion, ActualizadoPor, FechaActualizacion
    )
    OUTPUT inserted.OrdenEjecucion, inserted.WorkflowGrupoId INTO @Grupos(OrdenEjecucion, WorkflowGrupoId)
    SELECT @WorkflowId AS GobernanzaWorkflowId,
           d.OrdenEjecucion,
           (SELECT COUNT(1) FROM RolesOrdenados r WHERE r.OrdenEjecucion = d.OrdenEjecucion) AS TotalUsuarios,
           0 AS UsuariosCompletados,
           0 AS EstadoGrupo, -- pendiente
           CASE WHEN d.OrdenEjecucion = @MinOrden THEN 1 ELSE 0 END AS EsActivo,
           CASE WHEN d.OrdenEjecucion = @MinOrden THEN @Ahora ELSE NULL END AS FechaInicio,
           NULL AS FechaCompletado,
           1 AS Version,
           1 AS Estado,
           @UsuarioIniciadorId AS CreadoPor,
           @Ahora AS FechaCreacion,
           NULL AS ActualizadoPor,
           NULL AS FechaActualizacion
    FROM Distintos d;

    -- Insertar ejecuciones por cada rol
    INSERT INTO Proceso.GobernanzaWorkflowEjecucion (
      GobernanzaWorkflowId,
      RolActualId,
      UsuarioActualId,
      RolSiguienteId,
      UsuarioSiguienteId,
      EstadoTarea,
      MotivoRechazo,
      EsActivo,
      FechaInicioTarea,
      FechaCompletado,
      WorkflowGrupoId
    )
    SELECT @WorkflowId,
           ro.RolGobernanzaId,
           ro.UsuarioId,
           NULL AS RolSiguienteId,
           NULL AS UsuarioSiguienteId,
           0 AS EstadoTarea, -- pendiente
           NULL AS MotivoRechazo,
           CASE WHEN ro.OrdenEjecucion = @MinOrden THEN 1 ELSE 0 END AS EsActivo,
           CASE WHEN ro.OrdenEjecucion = @MinOrden THEN @Ahora ELSE NULL END AS FechaInicioTarea,
           NULL AS FechaCompletado,
           g.WorkflowGrupoId
    FROM RolesOrdenados ro
    INNER JOIN @Grupos g ON g.OrdenEjecucion = ro.OrdenEjecucion;

    COMMIT TRAN;
    SELECT @WorkflowId AS GobernanzaWorkflowId;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN;
    DECLARE @ErrNum INT = ERROR_NUMBER();
    DECLARE @ErrMsg NVARCHAR(400) = ERROR_MESSAGE();
    DECLARE @ThrowMsg NVARCHAR(500) = N'Error en sp_IniciarWorkflow: ' + ISNULL(@ErrMsg, N'');
    THROW ISNULL(@ErrNum, 51031), @ThrowMsg, 1;
  END CATCH
END
GO