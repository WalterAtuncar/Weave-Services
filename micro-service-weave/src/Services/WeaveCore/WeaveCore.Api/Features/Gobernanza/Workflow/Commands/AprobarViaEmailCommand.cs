using MediatR;
using WeaveCore.Api.Features.Gobernanza.Workflow.Dtos;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Commands
{
    public class AprobarViaEmailCommand : IRequest<EmailActionResultDto>
    {
        public string Token { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}