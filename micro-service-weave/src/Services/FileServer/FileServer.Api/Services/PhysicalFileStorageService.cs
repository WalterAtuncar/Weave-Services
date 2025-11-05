using System.Text.RegularExpressions;
using FileServer.Api.Models;
using FileServer.Api.Options;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.StaticFiles;

namespace FileServer.Api.Services;

public class PhysicalFileStorageService : IFileStorageService
{
    private readonly FileStorageOptions _options;
    private readonly IWebHostEnvironment _env;
    private readonly Regex _bucketRegex = new("^[a-z0-9-_/]{3,64}$", RegexOptions.Compiled);
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public PhysicalFileStorageService(IOptions<FileStorageOptions> options, IWebHostEnvironment env)
    {
        _options = options.Value;
        _env = env;
    }

    private string GetRoot() => Path.IsPathRooted(_options.StorageRoot)
        ? _options.StorageRoot
        : Path.Combine(_env.ContentRootPath, _options.StorageRoot);

    public bool IsBucketAllowed(string bucket)
        => _bucketRegex.IsMatch(bucket) && _options.AllowedBuckets.Contains(bucket, StringComparer.OrdinalIgnoreCase);

    public bool EnsureBucketExists(string bucket)
    {
        if (!IsBucketAllowed(bucket)) return false;
        var path = Path.Combine(GetRoot(), bucket.Replace("/", Path.DirectorySeparatorChar.ToString()));
        if (!Directory.Exists(path)) Directory.CreateDirectory(path);
        return true;
    }

    public async Task<UploadResponse> SaveAsync(IFormFile file, string bucket, CancellationToken ct)
    {
        if (!IsBucketAllowed(bucket)) throw new ArgumentException("Bucket no permitido");
        if (file.Length <= 0) throw new ArgumentException("Archivo vacío");
        if (file.Length > _options.MaxFileSizeBytes) throw new ArgumentException("Archivo excede el tamaño máximo");

        EnsureBucketExists(bucket);

        var id = Guid.NewGuid().ToString("N");
        var contentType = NormalizeContentType(file);
        var ext = ExtensionFromContentType(contentType) ?? Path.GetExtension(file.FileName).TrimStart('.').ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(ext)) ext = "bin";

        var bucketPath = Path.Combine(GetRoot(), bucket.Replace("/", Path.DirectorySeparatorChar.ToString()));
        var filePath = Path.Combine(bucketPath, $"{id}.{ext}");

        await using var stream = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write, FileShare.Read);
        await file.CopyToAsync(stream, ct);

        var fi = new FileInfo(filePath);
        var keyDocument = $"files/{bucket}/{id}";
        return new UploadResponse(id, bucket, keyDocument, contentType, fi.Length);
    }

    public string? GetFilePath(string bucket, string id)
    {
        if (!IsBucketAllowed(bucket)) return null;
        var bucketPath = Path.Combine(GetRoot(), bucket.Replace("/", Path.DirectorySeparatorChar.ToString()));
        if (!Directory.Exists(bucketPath)) return null;
        var files = Directory.EnumerateFiles(bucketPath, id + ".*");
        return files.FirstOrDefault();
    }

    public async Task<FileMetadata?> GetMetadataAsync(string bucket, string id, CancellationToken ct)
    {
        var path = GetFilePath(bucket, id);
        if (path is null) return null;
        var fi = new FileInfo(path);
        if (!fi.Exists) return null;
        var contentType = ContentTypeFromExtension(Path.GetExtension(path));
        return await Task.FromResult(new FileMetadata(id, bucket, contentType ?? "application/octet-stream", fi.Length, fi.LastWriteTimeUtc, null));
    }

    public async Task<bool> DeleteAsync(string bucket, string id, CancellationToken ct)
    {
        var path = GetFilePath(bucket, id);
        if (path is null) return false;
        File.Delete(path);
        return await Task.FromResult(true);
    }

    private string NormalizeContentType(IFormFile file)
    {
        // Preferimos el ContentType si está permitido, de lo contrario octet-stream
        var ct = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType.ToLowerInvariant();
        if (_options.AllowedMimeTypes.Length > 0 && !_options.AllowedMimeTypes.Contains(ct))
        {
            // Intentar detectar por extensión
            var detected = ContentTypeFromExtension(Path.GetExtension(file.FileName));
            return detected ?? "application/octet-stream";
        }
        return ct;
    }

    private string? ContentTypeFromExtension(string? ext)
    {
        if (string.IsNullOrWhiteSpace(ext)) return null;
        var e = ext!.TrimStart('.');
        if (_contentTypeProvider.TryGetContentType($"file.{e}", out var ct)) return ct;
        return e switch
        {
            "jpg" => "image/jpeg",
            "jpeg" => "image/jpeg",
            "png" => "image/png",
            "gif" => "image/gif",
            "pdf" => "application/pdf",
            _ => null
        };
    }

    private string? ExtensionFromContentType(string? contentType) => contentType switch
    {
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/gif" => "gif",
        "application/pdf" => "pdf",
        _ => null
    };
}