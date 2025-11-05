/*
  SP: Gobernanza.sp_RevocarGobernanza
  Parámetros:
    @GobernanzaId   BIGINT NOT NULL
    @Motivo         NVARCHAR(500) NULL
    @ActualizadoPor NVARCHAR(100) NULL

  Salida: filas afectadas (1 si revocación exitosa)
*/
GO
CREATE OR ALTER PROCEDURE Gobernanza.sp_RevocarGobernanza
  @GobernanzaId   BIGINT,
  @Motivo         NVARCHAR(500) = NULL,
  @ActualizadoPor NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE g
      SET g.Estado = 0, -- inactivo/revocado
          g.Observaciones = CASE 
                                WHEN @Motivo IS NULL THEN g.Observaciones 
                                ELSE LEFT(ISNULL(g.Observaciones, '' ) + ' | Revocado: ' + CONVERT(varchar(500), @Motivo), 1000) 
                             END,
          g.ActualizadoPor = @ActualizadoPor,
          g.FechaActualizacion = SYSUTCDATETIME()
    FROM Gobernanza.Gobernanza g
    WHERE g.GobernanzaId = @GobernanzaId;

    DECLARE @Rows INT = @@ROWCOUNT;
    COMMIT TRANSACTION;
    RETURN @Rows;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrNum INT = ERROR_NUMBER();
    DECLARE @FinalMsg NVARCHAR(2048) = N'Error en sp_RevocarGobernanza: ' + ISNULL(@ErrMsg, N'') + N' (#' + CONVERT(NVARCHAR(20), @ErrNum) + N')';
    THROW 51004, @FinalMsg, 1;
  END CATCH
END
GO