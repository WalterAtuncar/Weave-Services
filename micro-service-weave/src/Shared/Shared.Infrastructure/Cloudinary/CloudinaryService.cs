using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.Cloudinary;

public class CloudinaryService : ICloudinaryService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<CloudinaryService> _logger;

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task<string> UploadAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default)
    {
        // Placeholder: sin paquete CloudinaryDotNet y configuración concreta, lanzamos excepción clara.
        var cloudName = _configuration["Cloudinary:CloudName"];
        var apiKey = _configuration["Cloudinary:ApiKey"];
        var apiSecret = _configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
        {
            _logger.LogWarning("Cloudinary no está configurado. CloudName/ApiKey/ApiSecret faltan.");
            throw new InvalidOperationException("Cloudinary no configurado. Configure Cloudinary:CloudName/ApiKey/ApiSecret.");
        }

        // Implementación real pendiente: agregar paquete CloudinaryDotNet y realizar upload.
        throw new NotImplementedException("Carga a Cloudinary pendiente de implementación con CloudinaryDotNet.");
    }
}