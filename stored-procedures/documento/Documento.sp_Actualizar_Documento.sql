/*
Contrato: Documento.sp_Actualizar_Documento
Schema: Documento

Parámetros de entrada:
  @DocumentoId       BIGINT      -- ID del documento a actualizar
  @OrganizacionId    INT         -- Organización propietaria
  @NombreDocumento   NVARCHAR(200) = NULL
  @Descripcion       NVARCHAR(1000) = NULL
  @CarpetaId         BIGINT = NULL  -- Puede ser NULL para desasociar
  @Estado            INT            -- Estado del documento
  @UsuarioId         INT            -- Usuario que realiza la actualización (auditoría)

Salida:
  Afecta 1 fila del registro Documentos. No retorna resultset.

Errores (THROW):
  50001: Documento no existe
  50002: Carpeta no existe
  50003: Carpeta pertenece a otra organización

Notas:
  - Usa SET NOCOUNT ON
  - Actualiza auditoría: ActualizadoPor, FechaActualizacion y Version (+1)
  - No realiza cambios de gobernanza ni workflow; eso se orquesta desde la capa de aplicación
*/

CREATE OR ALTER PROCEDURE Documento.sp_Actualizar_Documento
  @DocumentoId BIGINT,
  @OrganizacionId INT,
  @NombreDocumento NVARCHAR(200) = NULL,
  @Descripcion NVARCHAR(1000) = NULL,
  @CarpetaId BIGINT = NULL,
  @Estado INT,
  @UsuarioId INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Validaciones de parámetros
  IF @DocumentoId IS NULL OR @DocumentoId <= 0
  BEGIN
    THROW 50001, 'DocumentoId inválido', 1;
  END

  IF @OrganizacionId IS NULL OR @OrganizacionId <= 0
  BEGIN
    THROW 50001, 'OrganizacionId inválido', 1;
  END

  -- Validar existencia del documento
  IF NOT EXISTS (
    SELECT 1
    FROM Documento.Documentos d
    WHERE d.DocumentoId = @DocumentoId AND d.OrganizacionId = @OrganizacionId
  )
  BEGIN
    THROW 50001, 'Documento no existe para la organización indicada', 1;
  END

  -- Si se especifica CarpetaId, validar que exista y sea de la misma organización
  IF @CarpetaId IS NOT NULL
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM Documento.DocumentosCarpetas c
      WHERE c.CarpetaId = @CarpetaId
    )
    BEGIN
      THROW 50002, 'CarpetaId no existe', 1;
    END

    IF NOT EXISTS (
      SELECT 1
      FROM Documento.DocumentosCarpetas c
      WHERE c.CarpetaId = @CarpetaId AND c.OrganizacionId = @OrganizacionId
    )
    BEGIN
      THROW 50003, 'La carpeta pertenece a otra organización', 1;
    END
  END

  -- Actualización principal (auditoría y versionado)
  UPDATE Documento.Documentos
  SET
    OrganizacionId = @OrganizacionId,
    NombreDocumento = COALESCE(@NombreDocumento, NombreDocumento),
    DescripcionDocumento = COALESCE(@Descripcion, DescripcionDocumento),
    CarpetaId = @CarpetaId,
    Estado = @Estado,
    ActualizadoPor = @UsuarioId,
    FechaActualizacion = SYSUTCDATETIME(),
    Version = ISNULL(Version, 0) + 1
  WHERE DocumentoId = @DocumentoId;

  RETURN 0;
END;