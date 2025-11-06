using MediatR;

namespace Shared.Application.Queries;

public class GetEntityByIdQuery<T> : IRequest<T?> where T : class
{
    public long Id { get; }

    public GetEntityByIdQuery(long id)
    {
        Id = id;
    }
}