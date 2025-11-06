namespace FileServer.Api.Options;

public class MongoDbOptions
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = "weave_files";
    public string CollectionName { get; set; } = "documento_vectorial";
}