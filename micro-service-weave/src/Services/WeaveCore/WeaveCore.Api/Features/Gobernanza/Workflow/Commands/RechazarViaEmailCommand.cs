using MediatR;
using WeaveCore.Api.Features.Gobernanza.Workflow.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Commands
{
    public class RechazarViaEmailCommand : IRequest<EmailActionResultDto>
    {
        public string Token { get; set; } = string.Empty;
        public string MotivoRechazo { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}