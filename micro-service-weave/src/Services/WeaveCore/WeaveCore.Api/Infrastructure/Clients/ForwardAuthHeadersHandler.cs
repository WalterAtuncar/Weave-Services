using Microsoft.AspNetCore.Http;

namespace WeaveCore.Api.Infrastructure.Clients;

public class ForwardAuthHeadersHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ForwardAuthHeadersHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx != null)
        {
            // Forward Authorization header if present
            var authHeader = ctx.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader))
            {
                request.Headers.TryAddWithoutValidation("Authorization", authHeader);
            }

            // Forward custom user context headers used across services
            var customHeaders = new[]
            {
                "X-User-Id",
                "X-Personal-Id",
                "X-Rol-Id",
                "X-User-Name",
                "X-Email",
                "X-Auth-Mode"
            };

            foreach (var h in customHeaders)
            {
                var val = ctx.Request.Headers[h].FirstOrDefault();
                if (!string.IsNullOrEmpty(val))
                {
                    request.Headers.TryAddWithoutValidation(h, val);
                }
            }
        }

        return base.SendAsync(request, cancellationToken);
    }
}