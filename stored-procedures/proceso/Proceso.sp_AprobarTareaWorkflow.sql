-- SP: Proceso.sp_AprobarTareaWorkflow
-- Propósito: Aprobar una tarea del workflow, marcándola como completada
-- Contrato:
--   Parámetros:
--     @WorkflowEjecucionId BIGINT
--     @UsuarioId BIGINT
--     @Observaciones NVARCHAR(500) = NULL
--   Resultado: filas afectadas (1 esperado) o error con código
GO
CREATE OR ALTER PROCEDURE Proceso.sp_AprobarTareaWorkflow
  @WorkflowEjecucionId BIGINT,
  @UsuarioId BIGINT,
  @Observaciones NVARCHAR(500) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRAN;

    -- Validar existencia y pertenencia
    IF NOT EXISTS (
      SELECT 1 FROM Proceso.GobernanzaWorkflowEjecucion WITH (UPDLOCK, ROWLOCK)
      WHERE WorkflowEjecucionId = @WorkflowEjecucionId AND UsuarioActualId = @UsuarioId AND EsActivo = 1)
    BEGIN
      DECLARE @ErrMsg NVARCHAR(200) = N'Tarea no encontrada, no activa o no pertenece al usuario';
      THROW 51010, @ErrMsg, 1;
    END

    -- Marcar completada
    UPDATE Proceso.GobernanzaWorkflowEjecucion
    SET EstadoTarea = 2, -- Completada
        EsActivo = 0,
        FechaCompletado = SYSUTCDATETIME()
    WHERE WorkflowEjecucionId = @WorkflowEjecucionId;

    COMMIT TRAN;
    SELECT 1 AS FilasAfectadas;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRAN;
    DECLARE @ErrNum INT = ERROR_NUMBER();
    DECLARE @ErrMsg NVARCHAR(400) = ERROR_MESSAGE();
    DECLARE @ThrowMsg NVARCHAR(500) = N'Error en sp_AprobarTareaWorkflow: ' + ISNULL(@ErrMsg, N'');
    THROW ISNULL(@ErrNum, 51011), @ThrowMsg, 1;
  END CATCH
END
GO