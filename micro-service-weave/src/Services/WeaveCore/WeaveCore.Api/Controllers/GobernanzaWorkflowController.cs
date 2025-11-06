using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Shared.Application.Services;
using WeaveCore.Api.Features.Gobernanza.Workflow.Commands;
using WeaveCore.Api.Features.Gobernanza.Workflow.Dtos;
using WeaveCore.Api.Features.Gobernanza.Workflow.Queries;

namespace WeaveCore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GobernanzaWorkflowController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IUserContextService _userContext;

        public GobernanzaWorkflowController(IMediator mediator, IUserContextService userContext)
        {
            _mediator = mediator;
            _userContext = userContext;
        }

        /// <summary>
        /// Obtiene la bandeja de tareas de un usuario específico
        /// </summary>
        [HttpGet("bandeja-tareas/{usuarioId}")]
        public async Task<IEnumerable<BandejaTareasDto>> GetBandejaTareasUsuario(
            long usuarioId,
            [FromQuery] bool incluirPendientes = true,
            [FromQuery] bool incluirEnProceso = true,
            [FromQuery] bool incluirCompletadas = true,
            [FromQuery] bool incluirRechazadas = false,
            [FromQuery] System.DateTime? fechaInicioDesde = null,
            [FromQuery] System.DateTime? fechaInicioHasta = null,
            [FromQuery] System.DateTime? fechaCompletadoDesde = null,
            [FromQuery] System.DateTime? fechaCompletadoHasta = null,
            [FromQuery] string? accionWorkflow = null,
            [FromQuery] long? gobernanzaId = null,
            [FromQuery] long? workflowGrupoId = null,
            [FromQuery] int? limitePendientes = 50,
            [FromQuery] int? limiteCompletadas = 20,
            [FromQuery] string ordenarPor = "FechaInicioTarea",
            [FromQuery] bool ordenDescendente = true)
        {
            var query = new GetBandejaTareasUsuarioQuery
            {
                UsuarioId = usuarioId,
                IncluirPendientes = incluirPendientes,
                IncluirEnProceso = incluirEnProceso,
                IncluirCompletadas = incluirCompletadas,
                IncluirRechazadas = incluirRechazadas,
                FechaInicioDesde = fechaInicioDesde,
                FechaInicioHasta = fechaInicioHasta,
                FechaCompletadoDesde = fechaCompletadoDesde,
                FechaCompletadoHasta = fechaCompletadoHasta,
                AccionWorkflow = accionWorkflow,
                GobernanzaId = gobernanzaId,
                WorkflowGrupoId = workflowGrupoId,
                LimitePendientes = limitePendientes,
                LimiteCompletadas = limiteCompletadas,
                OrdenarPor = ordenarPor,
                OrdenDescendente = ordenDescendente
            };

            var result = await _mediator.Send(query);
            return result;
        }

        /// <summary>
        /// Aprueba/avanza una tarea del workflow
        /// </summary>
        [HttpPost("aprobar")]
        public async Task<IActionResult> Aprobar([FromBody] AvanzarWorkflowCommand command)
        {
            // Capturar UsuarioId desde gateway (header X-User-Id) si está disponible
            var userId = _userContext.GetUserId();
            if (userId.HasValue) command.UsuarioId = userId.Value;
            var ok = await _mediator.Send(command);
            return ok ? Ok() : BadRequest("No se pudo aprobar la tarea");
        }

        /// <summary>
        /// Rechaza una tarea del workflow
        /// </summary>
        [HttpPost("rechazar")]
        public async Task<IActionResult> Rechazar([FromBody] RechazarWorkflowCommand command)
        {
            // Capturar UsuarioId desde gateway (header X-User-Id) si está disponible
            var userId = _userContext.GetUserId();
            if (userId.HasValue) command.UsuarioId = userId.Value;
            var ok = await _mediator.Send(command);
            return ok ? Ok() : BadRequest("No se pudo rechazar la tarea");
        }

        // ================================
        // Endpoints vía Email (AllowAnonymous)
        // ================================

        /// <summary>
        /// Página de aprobación por email a partir de un token.
        /// </summary>
        [HttpGet("email/aprobar/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> AprobarViaEmail([FromRoute] string token)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var ua = Request.Headers["User-Agent"].ToString();

            var result = await _mediator.Send(new AprobarViaEmailCommand
            {
                Token = token,
                IpAddress = ip,
                UserAgent = ua
            });

            var html = BuildActionHtmlPage(result);
            return Content(html, "text/html");
        }

        /// <summary>
        /// Página con formulario para rechazo por email.
        /// </summary>
        [HttpGet("email/rechazar/{token}")]
        [AllowAnonymous]
        public IActionResult RechazarViaEmailForm([FromRoute] string token)
        {
            var formHtml = $@"<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1' />
  <title>Rechazar tarea</title>
  <style>
    body {{ font-family: Arial, sans-serif; background:#0b0f1a; color:#eef2ff; margin:0; }}
    .wrap {{ max-width: 640px; margin: 40px auto; padding: 24px; background:#111631; border:1px solid #1f2748; border-radius:12px; }}
    h1 {{ font-size: 20px; margin: 0 0 12px; }}
    p {{ color:#c7d2fe; }}
    label {{ display:block; margin: 16px 0 8px; }}
    textarea {{ width:100%; min-height: 100px; padding:12px; border-radius:8px; background:#0e142b; color:#eef2ff; border:1px solid #1f2748; }}
    .actions {{ margin-top: 16px; display:flex; gap:12px; }}
    button {{ background:#4f46e5; color:#fff; border:none; padding:10px 18px; border-radius:8px; cursor:pointer; }}
    a {{ color:#93c5fd; }}
  </style>
  </head>
  <body>
    <div class='wrap'>
      <h1>Rechazar tarea de workflow</h1>
      <p>Complete el motivo del rechazo y envíe el formulario.</p>
      <form method='post' action='/api/GobernanzaWorkflow/email/rechazar/{token}'>
        <label for='motivo'>Motivo del rechazo</label>
        <textarea id='motivo' name='motivoRechazo' placeholder='Explique la razón del rechazo'></textarea>
        <div class='actions'>
          <button type='submit'>Rechazar tarea</button>
        </div>
      </form>
      <p style='margin-top:12px;'>¿Cambió de opinión? Puede <a href='/api/GobernanzaWorkflow/email/aprobar/{token}'>aprobar</a> en su lugar.</p>
    </div>
  </body>
</html>";

            return Content(formHtml, "text/html");
        }

        /// <summary>
        /// Procesa el rechazo por email (form submit) y devuelve página de resultado.
        /// </summary>
        [HttpPost("email/rechazar/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> RechazarViaEmail([FromRoute] string token, [FromForm] string? motivoRechazo)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            var ua = Request.Headers["User-Agent"].ToString();

            var result = await _mediator.Send(new RechazarViaEmailCommand
            {
                Token = token,
                MotivoRechazo = motivoRechazo,
                IpAddress = ip,
                UserAgent = ua
            });

            var html = BuildActionHtmlPage(result);
            return Content(html, "text/html");
        }

        private static string BuildActionHtmlPage(EmailActionResultDto result)
        {
            var title = result.Status switch
            {
                "APROBADO" => "Tarea aprobada",
                "RECHAZADO" => "Tarea rechazada",
                "EXPIRADO" => "Token expirado",
                "UTILIZADO" => "Token ya utilizado",
                "NO_ACTIVA" => "Tarea no activa",
                _ => "Acción de workflow"
            };

            var emoji = result.Status switch
            {
                "APROBADO" => "✅",
                "RECHAZADO" => "⛔",
                "EXPIRADO" => "⏰",
                "UTILIZADO" => "🔁",
                "NO_ACTIVA" => "🛈",
                _ => "ℹ"
            };

            var detail = (result.GobernanzaWorkflowId.HasValue || result.WorkflowEjecucionId.HasValue)
                ? $"<p style='color:#93c5fd'>WorkflowId: <strong>{result.GobernanzaWorkflowId}</strong> · Ejecución: <strong>{result.WorkflowEjecucionId}</strong></p>"
                : string.Empty;

            var html = $@"<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1' />
  <title>{title}</title>
  <style>
    body {{ font-family: Arial, sans-serif; background:#0b0f1a; color:#eef2ff; margin:0; }}
    .wrap {{ max-width: 640px; margin: 40px auto; padding: 24px; background:#111631; border:1px solid #1f2748; border-radius:12px; }}
    h1 {{ font-size: 20px; margin: 0 0 8px; }}
    .status {{ font-size: 48px; line-height: 1; margin-bottom: 4px; }}
    p {{ color:#c7d2fe; }}
    .ok {{ color:#22c55e; }}
    .err {{ color:#ef4444; }}
  </style>
</head>
<body>
  <div class='wrap'>
    <div class='status'>{emoji}</div>
    <h1>{title}</h1>
    <p class='{(result.Success ? "ok" : "err")}'>{result.Message}</p>
    {detail}
  </div>
</body>
</html>";

            return html;
        }
    }
}