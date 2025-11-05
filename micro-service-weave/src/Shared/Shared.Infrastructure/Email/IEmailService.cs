using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.Email;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
}