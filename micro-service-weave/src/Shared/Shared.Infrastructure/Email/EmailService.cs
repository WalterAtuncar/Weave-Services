using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

namespace Shared.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        var host = _configuration["Email:Smtp:Host"];
        var portStr = _configuration["Email:Smtp:Port"];
        var sslStr = _configuration["Email:Smtp:Ssl"];
        var user = _configuration["Email:Smtp:User"];
        var pass = _configuration["Email:Smtp:Password"];
        var from = _configuration["Email:From"] ?? user;

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
            throw new InvalidOperationException("SMTP no configurado correctamente (Email:Smtp:Host/User/Password)");

        int port = int.TryParse(portStr, out var p) ? p : 587;
        bool ssl = bool.TryParse(sslStr, out var s) ? s : true;

        using var message = new MailMessage(from!, toEmail)
        {
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };

        using var client = new SmtpClient(host!, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = ssl
        };

        _logger.LogInformation("Enviando email a {To} con asunto {Subject}", toEmail, subject);
        await client.SendMailAsync(message, cancellationToken);
    }
}