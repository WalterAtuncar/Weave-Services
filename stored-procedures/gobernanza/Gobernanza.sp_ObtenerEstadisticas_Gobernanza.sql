/*
  SP: Gobernanza.sp_ObtenerEstadisticas_Gobernanza
  Parámetros:
    @TipoGobiernoId BIGINT NULL
    @UsuarioId      BIGINT NULL

  Salida (una sola fila):
    - Total            INT
    - Activas          INT
    - Vencidas         INT
    - ProximasAVencer  INT

  Errores: usar THROW con códigos específicos si aplica
*/
GO
CREATE OR ALTER PROCEDURE Gobernanza.sp_ObtenerEstadisticas_Gobernanza
  @TipoGobiernoId BIGINT = NULL,
  @UsuarioId BIGINT = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Nota: Validar esquemas/columnas según modelo real
  -- Se asume tabla principal: Gobernanza.Gobernanza con columnas
  -- (Estado, FechaVencimiento, TipoGobiernoId, UsuarioId)

  DECLARE @Hoy DATE = CAST(GETDATE() AS DATE);
  DECLARE @En7Dias DATE = DATEADD(DAY, 7, @Hoy);

  SELECT
    Total = COUNT(1),
    Activas = SUM(CASE WHEN g.Estado = 1 THEN 1 ELSE 0 END),
    Vencidas = SUM(CASE WHEN g.FechaVencimiento IS NOT NULL AND g.FechaVencimiento < @Hoy THEN 1 ELSE 0 END),
    ProximasAVencer = SUM(CASE WHEN g.FechaVencimiento IS NOT NULL AND g.FechaVencimiento BETWEEN @Hoy AND @En7Dias THEN 1 ELSE 0 END)
  FROM Gobernanza.Gobernanza g
  WHERE (@TipoGobiernoId IS NULL OR g.TipoGobiernoId = @TipoGobiernoId)
    AND (
      @UsuarioId IS NULL
      OR EXISTS (
        SELECT 1
        FROM Gobernanza.GobernanzaRol gr
        WHERE gr.GobernanzaId = g.GobernanzaId
          AND ISNULL(gr.RegistroEliminado, 0) = 0
          AND gr.UsuarioId = @UsuarioId
      )
    );
END
GO