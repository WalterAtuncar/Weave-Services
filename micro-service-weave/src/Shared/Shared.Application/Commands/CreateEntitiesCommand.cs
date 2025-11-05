using MediatR;
using System.Collections.Generic;

namespace Shared.Application.Commands;

public class CreateEntitiesCommand<T> : IRequest<IReadOnlyList<long>> where T : class
{
    public IReadOnlyCollection<T> Entities { get; }

    public CreateEntitiesCommand(IReadOnlyCollection<T> entities)
    {
        Entities = entities ?? throw new ArgumentNullException(nameof(entities));
    }
}