using System.Globalization;
using FileServer.Api.Models;
using FileServer.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FileServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _storage;

    public FilesController(IFileStorageService storage)
    {
        _storage = storage;
    }

    [HttpPost]
    [RequestSizeLimit(long.MaxValue)]
    public async Task<ActionResult<UploadResponse>> Upload([FromForm] IFormFile file, [FromForm] string bucket, CancellationToken ct)
    {
        var resp = await _storage.SaveAsync(file, bucket, ct);
        var url = Url.ActionLink(nameof(Get), values: new { bucket = resp.Bucket, id = resp.Id });
        return Created(url!, resp);
    }

    [HttpGet("{bucket}/{id}")]
    public async Task<IActionResult> Get(string bucket, string id, [FromQuery] bool download = false, CancellationToken ct = default)
    {
        var path = _storage.GetFilePath(bucket, id);
        if (path is null) return NotFound();
        var meta = await _storage.GetMetadataAsync(bucket, id, ct);
        if (meta is null) return NotFound();

        Response.Headers["ETag"] = GenerateETag(meta);
        Response.Headers["Accept-Ranges"] = "bytes";
        Response.Headers["Last-Modified"] = meta.LastModified.ToString("R", CultureInfo.InvariantCulture);

        // If Range header present, serve partial content
        if (Request.Headers.TryGetValue("Range", out var rangeValue))
        {
            var range = rangeValue.ToString();
            return ServePartialContent(path, meta.ContentType, range);
        }

        var fileName = download ? Path.GetFileName(path) : null;
        if (download && fileName != null)
            return PhysicalFile(path, meta.ContentType, fileName);
        return PhysicalFile(path, meta.ContentType);
    }

    [HttpHead("{bucket}/{id}")]
    public async Task<IActionResult> Head(string bucket, string id, CancellationToken ct)
    {
        var meta = await _storage.GetMetadataAsync(bucket, id, ct);
        if (meta is null) return NotFound();
        Response.Headers["Content-Type"] = meta.ContentType;
        Response.Headers["Content-Length"] = meta.Size.ToString(CultureInfo.InvariantCulture);
        Response.Headers["ETag"] = GenerateETag(meta);
        Response.Headers["Last-Modified"] = meta.LastModified.ToString("R", CultureInfo.InvariantCulture);
        return Ok();
    }

    [HttpGet("{bucket}/{id}/metadata")]
    public async Task<ActionResult<FileMetadata>> Metadata(string bucket, string id, CancellationToken ct)
    {
        var meta = await _storage.GetMetadataAsync(bucket, id, ct);
        if (meta is null) return NotFound();
        return Ok(meta);
    }

    [HttpDelete("{bucket}/{id}")]
    public async Task<IActionResult> Delete(string bucket, string id, CancellationToken ct)
    {
        var ok = await _storage.DeleteAsync(bucket, id, ct);
        return ok ? NoContent() : NotFound();
    }

    private static string GenerateETag(FileMetadata meta)
        => $"\"{meta.Size}-{meta.LastModified.ToUnixTimeSeconds()}\"";

    private IActionResult ServePartialContent(string path, string contentType, string rangeHeader)
    {
        var fi = new FileInfo(path);
        var totalLength = fi.Length;
        // Expected format: bytes=start-end
        if (!rangeHeader.StartsWith("bytes=")) return PhysicalFile(path, contentType);
        var range = rangeHeader[6..];
        var parts = range.Split('-', 2);
        if (!long.TryParse(parts[0], out var from)) return PhysicalFile(path, contentType);
        var to = (parts.Length > 1 && long.TryParse(parts[1], out var parsedTo)) ? parsedTo : totalLength - 1;
        from = Math.Clamp(from, 0, totalLength - 1);
        to = Math.Clamp(to, from, totalLength - 1);
        var length = (to - from) + 1;

        var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        stream.Seek(from, SeekOrigin.Begin);
        var partial = new FileStreamResult(stream, contentType)
        {
            EnableRangeProcessing = false
        };
        Response.StatusCode = StatusCodes.Status206PartialContent;
        Response.Headers["Content-Range"] = $"bytes {from}-{to}/{totalLength}";
        Response.Headers["Content-Length"] = length.ToString(CultureInfo.InvariantCulture);
        return partial;
    }
}