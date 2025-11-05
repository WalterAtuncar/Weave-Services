/*
  SP: Gobernanza.sp_TransferirGobernanza
  Parámetros:
    @GobernanzaId     BIGINT NOT NULL
    @UsuarioOrigenId  BIGINT NOT NULL
    @UsuarioDestinoId BIGINT NOT NULL
    @ActualizadoPor   NVARCHAR(100) NULL

  Salida: filas afectadas (1 si transferencia exitosa)
*/
GO
CREATE OR ALTER PROCEDURE Gobernanza.sp_TransferirGobernanza
  @GobernanzaId     BIGINT,
  @UsuarioOrigenId  BIGINT,
  @UsuarioDestinoId BIGINT,
  @ActualizadoPor   NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    -- Validar que el usuario de origen está asignado en GobernanzaRol
    IF NOT EXISTS (
      SELECT 1 
      FROM Gobernanza.GobernanzaRol gr
      WHERE gr.GobernanzaId = @GobernanzaId 
        AND gr.UsuarioId = @UsuarioOrigenId
        AND ISNULL(gr.RegistroEliminado, 0) = 0
        AND gr.Estado = 1
    )
    BEGIN
      THROW 51002, 'Usuario de origen no coincide con la asignación actual', 1;
    END

    -- Transferir asignaciones del usuario origen al destino dentro de la gobernanza
    UPDATE gr
      SET gr.UsuarioId = @UsuarioDestinoId,
          gr.ActualizadoPor = @ActualizadoPor,
          gr.FechaActualizacion = SYSUTCDATETIME()
    FROM Gobernanza.GobernanzaRol gr
    WHERE gr.GobernanzaId = @GobernanzaId
      AND gr.UsuarioId = @UsuarioOrigenId
      AND ISNULL(gr.RegistroEliminado, 0) = 0
      AND gr.Estado = 1;

    DECLARE @Rows INT = @@ROWCOUNT;
    COMMIT TRANSACTION;
    RETURN @Rows;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrNum INT = ERROR_NUMBER();
    DECLARE @FinalMsg NVARCHAR(2048) = N'Error en sp_TransferirGobernanza: ' + ISNULL(@ErrMsg, N'') + N' (#' + CONVERT(NVARCHAR(20), @ErrNum) + N')';
    THROW 51003, @FinalMsg, 1;
  END CATCH
END
GO