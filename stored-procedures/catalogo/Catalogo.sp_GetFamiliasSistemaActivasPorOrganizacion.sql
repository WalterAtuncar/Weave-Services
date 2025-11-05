/*
Contrato del SP: Catalogo.sp_GetFamiliasSistemaActivasPorOrganizacion

Parámetros:
  - @OrganizacionId BIGINT (obligatorio)

Columnas de salida:
  - FamiliaSistemaId BIGINT
  - FamiliaSistemaCodigo NVARCHAR/VARCHAR(50)
  - FamiliaSistemaNombre NVARCHAR/VARCHAR(100)
  - FamiliaSistemaDescripcion NVARCHAR/VARCHAR(500) NULL
  - Estado BIT
  - FechaCreacion DATETIME/DATETIME2
  - FechaActualizacion DATETIME/DATETIME2 NULL

Errores:
  - Si @OrganizacionId es NULL, THROW 50001

Notas:
  - Usa SET NOCOUNT ON
  - Selección con columnas explícitas y ORDER BY por nombre
*/

CREATE OR ALTER PROCEDURE Catalogo.sp_GetFamiliasSistemaActivasPorOrganizacion
  @OrganizacionId BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  IF (@OrganizacionId IS NULL)
  BEGIN
    THROW 50001, 'OrganizacionId es requerido', 1;
  END;

  SELECT DISTINCT
      fs.FamiliaSistemaId,
      fs.FamiliaSistemaCodigo,
      fs.FamiliaSistemaNombre,
      fs.FamiliaSistemaDescripcion,
      fs.Estado,
      fs.FechaCreacion,
      fs.FechaActualizacion
  FROM Catalogo.FamiliaSistema fs
  INNER JOIN Catalogo.OrganizacionFamiliaSistema ofs ON fs.FamiliaSistemaId = ofs.FamiliaSistemaId
  WHERE fs.Estado = 1
    AND ofs.OrganizacionId = @OrganizacionId
  ORDER BY fs.FamiliaSistemaNombre;
END;