using MediatR;

namespace Shared.Application.Commands;

public class UpdateEntityCommand<T> : IRequest<int> where T : class
{
    public T Entity { get; }

    public UpdateEntityCommand(T entity)
    {
        Entity = entity;
    }
}