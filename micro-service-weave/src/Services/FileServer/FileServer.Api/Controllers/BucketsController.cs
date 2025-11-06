using FileServer.Api.Options;
using FileServer.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace FileServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BucketsController : ControllerBase
{
    private readonly IFileStorageService _storage;
    private readonly FileStorageOptions _options;

    public BucketsController(IFileStorageService storage, IOptions<FileStorageOptions> options)
    {
        _storage = storage;
        _options = options.Value;
    }

    [HttpGet]
    public ActionResult<IEnumerable<object>> List()
    {
        var root = Path.GetFullPath(_options.StorageRoot);
        var result = _options.AllowedBuckets.Select(b => new
        {
            bucket = b,
            exists = Directory.Exists(Path.Combine(root, b.Replace("/", Path.DirectorySeparatorChar.ToString())))
        });
        return Ok(result);
    }

    [HttpPost("{bucket}/ensure")]
    public ActionResult Ensure(string bucket)
    {
        if (!_storage.IsBucketAllowed(bucket)) return BadRequest("Bucket no permitido");
        var created = _storage.EnsureBucketExists(bucket);
        return created ? StatusCode(StatusCodes.Status201Created) : Ok();
    }
}