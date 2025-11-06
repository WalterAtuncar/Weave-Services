namespace FileServer.Api.Models;

public record UploadResponse(string Id, string Bucket, string KeyDocument, string ContentType, long Size);