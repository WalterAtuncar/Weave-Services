using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.Cloudinary;

public interface ICloudinaryService
{
    Task<string> UploadAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default);
}