/*
  Nombre: Documento.sp_GetArbol_DocumentosCarpetas
  Schema: Documento
  Propósito: Obtener el árbol jerárquico de carpetas por organización.

  Parámetros de entrada:
    @OrganizacionId BIGINT (obligatorio) - Identificador de la organización.
    @IncludeDeleted BIT (opcional, default 0) - Incluir registros marcados como eliminados.

  Columnas de salida (ordenadas por Nivel, NombreCarpeta):
    CarpetaId        BIGINT
    OrganizacionId   BIGINT
    CarpetaPadreId   BIGINT NULL
    NombreCarpeta    NVARCHAR(255)
    CarpetaPrivada   BIT
    Nivel            INT  -- profundidad desde la raíz (0 = raíz)

  Reglas:
    - Usa SET NOCOUNT ON.
    - No usa SELECT *; columnas explícitas.
    - Filtra por OrganizacionId y, según @IncludeDeleted, por RegistroEliminado = 0.
*/
CREATE OR ALTER PROCEDURE Documento.sp_GetArbol_DocumentosCarpetas
  @OrganizacionId BIGINT,
  @IncludeDeleted BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  ;WITH ArbolCarpetas AS (
    SELECT
      c.CarpetaId,
      c.OrganizacionId,
      c.CarpetaPadreId,
      c.NombreCarpeta,
      CAST(ISNULL(c.CarpetaPrivada, 0) AS BIT) AS CarpetaPrivada,
      CAST(0 AS INT) AS Nivel
    FROM Documento.DocumentosCarpetas c
    WHERE c.OrganizacionId = @OrganizacionId
      AND c.CarpetaPadreId IS NULL
      AND (@IncludeDeleted = 1 OR ISNULL(c.RegistroEliminado, 0) = 0)

    UNION ALL

    SELECT
      c2.CarpetaId,
      c2.OrganizacionId,
      c2.CarpetaPadreId,
      c2.NombreCarpeta,
      CAST(ISNULL(c2.CarpetaPrivada, 0) AS BIT) AS CarpetaPrivada,
      a.Nivel + 1
    FROM Documento.DocumentosCarpetas c2
    INNER JOIN ArbolCarpetas a ON c2.CarpetaPadreId = a.CarpetaId
    WHERE c2.OrganizacionId = @OrganizacionId
      AND (@IncludeDeleted = 1 OR ISNULL(c2.RegistroEliminado, 0) = 0)
  )
  SELECT
    CarpetaId,
    OrganizacionId,
    CarpetaPadreId,
    NombreCarpeta,
    CarpetaPrivada,
    Nivel
  FROM ArbolCarpetas
  ORDER BY Nivel, NombreCarpeta;
END;