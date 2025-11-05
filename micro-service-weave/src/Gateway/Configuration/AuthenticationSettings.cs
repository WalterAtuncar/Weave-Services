namespace Gateway.Api.Configuration;

public class AuthenticationSettings
{
    public const string SectionName = "Authentication";
    
    public bool EnableJwtValidation { get; set; } = true;
    public DevelopmentModeSettings DevelopmentMode { get; set; } = new();
}

public class DevelopmentModeSettings
{
    public int DefaultUserId { get; set; } = 1;
    public int DefaultPersonalId { get; set; } = 1;
    public int DefaultRolId { get; set; } = 1;
    public string DefaultUserName { get; set; } = "dev-user";
    public string DefaultEmail { get; set; } = "dev@erpmedico.com";
}