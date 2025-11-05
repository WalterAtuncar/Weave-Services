using FileServer.Api.Clients;
using CoreModels = FileServer.Api.Clients.Models;
using VecModels = FileServer.Api.Features.DocumentoVectorial.Models;
using FileServer.Api.Features.DocumentoVectorial.Services;
using FileServer.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FileServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentoVectorialController : ControllerBase
{
    private readonly IDocumentoVectorialService _vectorSvc;
    private readonly IWeaveCoreClient _weaveCore;
    private readonly IFileStorageService _files;

    public DocumentoVectorialController(IDocumentoVectorialService vectorSvc, IWeaveCoreClient weaveCore, IFileStorageService files)
    {
        _vectorSvc = vectorSvc;
        _weaveCore = weaveCore;
        _files = files;
    }

    [HttpGet("sql/{documentoId:long}")]
    public async Task<ActionResult<VecModels.DocumentoCompletoDto>> GetSqlDocumento(long documentoId, CancellationToken ct)
    {
        var doc = await _weaveCore.GetDocumentoAsync(documentoId, ct);
        if (doc is null) return NotFound();

        var (bucket, id) = ParseRutaArchivo(doc.RutaArchivo);
        if (bucket is null || id is null) return BadRequest("RutaArchivo inválida");
        var path = _files.GetFilePath(bucket!, id!);
        if (path is null) return NotFound("Archivo no encontrado");
        var bytes = await System.IO.File.ReadAllBytesAsync(path, ct);
        var meta = await _files.GetMetadataAsync(bucket!, id!, ct);

        return Ok(new VecModels.DocumentoCompletoDto
        {
            DocumentoId = doc.DocumentoId,
            NombreDocumento = doc.NombreDocumento,
            NombreArchivoOriginal = doc.NombreArchivoOriginal,
            RutaArchivo = doc.RutaArchivo,
            TamanoArchivo = doc.TamanoArchivo,
            DescripcionDocumento = doc.DescripcionDocumento,
            ContenidoBase64 = Convert.ToBase64String(bytes),
            MimeType = meta?.ContentType ?? "application/octet-stream"
        });
    }

    [HttpGet("agregado")]
    public async Task<ActionResult<object>> GetAgregado([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var pagedSql = await _weaveCore.GetDocumentosAsync(page, pageSize, ct);
        var ids = pagedSql.Items.Select(i => i.DocumentoId).ToArray();
        var vectoriales = await _vectorSvc.GetByDocumentoIdsAsync(ids, ct);
        return Ok(new
        {
            documentosSql = pagedSql.Items,
            vectoriales,
            metadata = pagedSql.Metadata
        });
    }

    [HttpPost]
    public async Task<ActionResult<VecModels.DocumentoVectorial>> Insert([FromBody] VecModels.CreateDocumentoVectorialSinIdDto request, CancellationToken ct)
    {
        if (request is null) return BadRequest("Payload requerido");
        if (request.DocumentoId <= 0) return BadRequest("DocumentoId es requerido");

        var creado = await _vectorSvc.InsertAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
    }

    

    [HttpGet("{id}")]
    public async Task<ActionResult<VecModels.DocumentoVectorial>> GetById(string id, CancellationToken ct)
    {
        var d = await _vectorSvc.GetByIdAsync(id, ct);
        return d is null ? NotFound() : Ok(d);
    }

    [HttpGet("documento/{documentoId:long}")]
    public async Task<ActionResult<VecModels.DocumentoVectorial>> GetByDocumentoId(long documentoId, CancellationToken ct)
    {
        var d = await _vectorSvc.GetByDocumentoIdAsync(documentoId, ct);
        return d is null ? NotFound() : Ok(d);
    }

    [HttpPost("buscar-similares")]
    public async Task<ActionResult<IReadOnlyList<VecModels.ResultadoBusquedaVectorial>>> BuscarSimilares([FromBody] VecModels.BusquedaVectorialDto request, CancellationToken ct)
    {
        var res = await _vectorSvc.BuscarSimilaresAsync(request, ct);
        return Ok(res);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] VecModels.CreateDocumentoVectorialSinIdDto request, CancellationToken ct)
    {
        var ok = await _vectorSvc.UpdateAsync(id, request, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id, CancellationToken ct)
    {
        var ok = await _vectorSvc.DeleteAsync(id, ct);
        return ok ? NoContent() : NotFound();
    }

    [HttpGet]
    public async Task<ActionResult<VecModels.PagedResult<VecModels.DocumentoVectorial>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var res = await _vectorSvc.GetAsync(page, pageSize, ct);
        return Ok(res);
    }

    [HttpGet("buscar-metadatos")]
    public async Task<ActionResult<IReadOnlyList<VecModels.DocumentoVectorial>>> BuscarMetadatos([FromQuery] long? organizacionId, [FromQuery] long? tipoDocumentoId, [FromQuery] long? carpetaId, [FromQuery] DateTime? desde, [FromQuery] DateTime? hasta, CancellationToken ct)
    {
        var res = await _vectorSvc.BuscarPorMetadatosAsync(organizacionId, tipoDocumentoId, carpetaId, desde, hasta, ct);
        return Ok(res);
    }

    [HttpGet("verificar-hash/{hash}")]
    public async Task<ActionResult<object>> VerificarHash(string hash, CancellationToken ct)
    {
        var exists = await _vectorSvc.ExisteHashAsync(hash, ct);
        return Ok(new { exists });
    }

    private static (string? bucket, string? id) ParseRutaArchivo(string? ruta)
    {
        if (string.IsNullOrWhiteSpace(ruta)) return (null, null);
        var parts = ruta.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 3) return (null, null);
        if (!string.Equals(parts[0], "files", StringComparison.OrdinalIgnoreCase)) return (null, null);
        return (parts[1], parts[2]);
    }
}