using FileServer.Api.Services;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace FileServer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThumbnailsController : ControllerBase
{
    private readonly IFileStorageService _storage;

    public ThumbnailsController(IFileStorageService storage)
    {
        _storage = storage;
    }

    [HttpGet("{bucket}/{id}")]
    public IActionResult Get(string bucket, string id, [FromQuery] int width = 200, [FromQuery] int height = 200)
    {
        var path = _storage.GetFilePath(bucket, id);
        if (path is null) return NotFound();
        var ext = Path.GetExtension(path).ToLowerInvariant();
        if (ext is not ".jpg" and not ".jpeg" and not ".png" and not ".gif") return BadRequest("No es una imagen soportada");

        using var image = Image.Load(path);
        image.Mutate(x => x.Resize(new ResizeOptions
        {
            Mode = ResizeMode.Max,
            Size = new Size(width, height)
        }));

        using var ms = new MemoryStream();
        image.Save(ms, new JpegEncoder { Quality = 80 });
        ms.Position = 0;
        return File(ms.ToArray(), "image/jpeg");
    }
}