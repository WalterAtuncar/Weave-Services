namespace FileServer.Api.Models;

public record FileMetadata(string Id, string Bucket, string ContentType, long Size, DateTimeOffset LastModified, string? OriginalName);