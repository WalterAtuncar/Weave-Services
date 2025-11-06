using System.Data;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Dapper;
using MediatR;
using Shared.Infrastructure.StoredProcedures;
using WeaveCore.Api.Features.Gobernanza.Workflow.Dtos;
using WeaveCore.Api.Features.Gobernanza.Workflow.Queries;

namespace WeaveCore.Api.Features.Gobernanza.Workflow.Handlers
{
    public class GetBandejaTareasUsuarioHandler : IRequestHandler<GetBandejaTareasUsuarioQuery, IEnumerable<BandejaTareasDto>>
    {
        private readonly IStoredProcedureExecutor _spExecutor;

        public GetBandejaTareasUsuarioHandler(IStoredProcedureExecutor spExecutor)
        {
            _spExecutor = spExecutor;
        }

        public async Task<IEnumerable<BandejaTareasDto>> Handle(GetBandejaTareasUsuarioQuery request, CancellationToken cancellationToken)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@UsuarioId", request.UsuarioId, DbType.Int64);
            parameters.Add("@IncluirPendientes", request.IncluirPendientes, DbType.Boolean);
            parameters.Add("@IncluirEnProceso", request.IncluirEnProceso, DbType.Boolean);
            parameters.Add("@IncluirCompletadas", request.IncluirCompletadas, DbType.Boolean);
            parameters.Add("@IncluirRechazadas", request.IncluirRechazadas, DbType.Boolean);
            parameters.Add("@FechaInicioDesde", request.FechaInicioDesde, DbType.DateTime2);
            parameters.Add("@FechaInicioHasta", request.FechaInicioHasta, DbType.DateTime2);
            parameters.Add("@FechaCompletadoDesde", request.FechaCompletadoDesde, DbType.DateTime2);
            parameters.Add("@FechaCompletadoHasta", request.FechaCompletadoHasta, DbType.DateTime2);
            parameters.Add("@AccionWorkflow", request.AccionWorkflow, DbType.String);
            parameters.Add("@GobernanzaId", request.GobernanzaId, DbType.Int64);
            parameters.Add("@WorkflowGrupoId", request.WorkflowGrupoId, DbType.Int64);
            parameters.Add("@LimitePendientes", request.LimitePendientes, DbType.Int32);
            parameters.Add("@LimiteCompletadas", request.LimiteCompletadas, DbType.Int32);

            var tareas = await _spExecutor.QueryAsync<BandejaTareasDto>(
                "Proceso.sp_GetBandejaTareasUsuario",
                parameters,
                cancellationToken: cancellationToken);

            return tareas;
        }
    }
}