using FileServer.Api.Models;

namespace FileServer.Api.Services;

public interface IFileStorageService
{
    Task<UploadResponse> SaveAsync(IFormFile file, string bucket, CancellationToken ct);
    string? GetFilePath(string bucket, string id);
    Task<FileMetadata?> GetMetadataAsync(string bucket, string id, CancellationToken ct);
    Task<bool> DeleteAsync(string bucket, string id, CancellationToken ct);
    bool EnsureBucketExists(string bucket);
    bool IsBucketAllowed(string bucket);
}