using MediatR;

namespace Shared.Application.Commands;

public class DeleteEntityCommand<T> : IRequest<bool> where T : class
{
    public long Id { get; }

    public DeleteEntityCommand(long id)
    {
        Id = id;
    }
}