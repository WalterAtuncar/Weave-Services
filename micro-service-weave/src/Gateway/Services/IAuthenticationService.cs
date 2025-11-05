using Gateway.Api.Models;

namespace Gateway.Api.Services;

public interface IAuthenticationService
{
    Task<LoginResponse?> AuthenticateAsync(LoginRequest request);
}