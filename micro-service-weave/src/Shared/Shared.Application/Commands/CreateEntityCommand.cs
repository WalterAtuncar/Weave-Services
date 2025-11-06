using MediatR;

namespace Shared.Application.Commands;

public class CreateEntityCommand<T> : IRequest<long> where T : class
{
    public T Entity { get; }

    public CreateEntityCommand(T entity)
    {
        Entity = entity;
    }
}