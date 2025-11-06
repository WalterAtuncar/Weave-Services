using System;

namespace Shared.Application.Services;

public interface IUserContextService
{
    long? GetUserId();
    long? GetPersonalId();
    long? GetRolId();
    string? GetUserName();
    string? GetUserEmail();
    string? GetAuthMode();
}