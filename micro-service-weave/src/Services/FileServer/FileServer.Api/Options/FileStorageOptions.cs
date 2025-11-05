namespace FileServer.Api.Options;

public class FileStorageOptions
{
    public string StorageRoot { get; set; } = "storage";
    public string[] AllowedBuckets { get; set; } = new[] { "public", "images", "docs" };
    public long MaxFileSizeBytes { get; set; } = 104_857_600; // 100MB
    public string[] AllowedMimeTypes { get; set; } = new[] { "image/jpeg", "image/png", "image/gif", "application/pdf" };
}