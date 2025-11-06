using Microsoft.AspNetCore.Http;
using Shared.Application.Services;

namespace Catalogo.Api.Services;

public class UserContextService : IUserContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private IHeaderDictionary? Headers => _httpContextAccessor.HttpContext?.Request?.Headers;

    private static long? ParseLong(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return long.TryParse(value, out var l) ? l : null;
    }

    public long? GetUserId() => ParseLong(Headers?[("X-User-Id")]);
    public long? GetPersonalId() => ParseLong(Headers?[("X-Personal-Id")]);
    public long? GetRolId() => ParseLong(Headers?[("X-Rol-Id")]);
    public string? GetUserName() => Headers?[("X-User-Name")];
    public string? GetUserEmail() => Headers?[("X-User-Email")];
    public string? GetAuthMode() => Headers?[("X-Auth-Mode")];
}