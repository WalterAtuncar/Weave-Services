using System;

namespace Shared.Domain.Attributes;

[AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
public sealed class TableAttribute : Attribute
{
    public string Schema { get; }
    public string Name { get; }
    public string IdColumn { get; }
    public string? IdSequence { get; }

    public TableAttribute(string schema, string name, string idColumn, string? idSequence = null)
    {
        Schema = schema;
        Name = name;
        IdColumn = idColumn;
        IdSequence = idSequence;
    }
}