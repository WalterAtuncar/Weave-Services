using VecModels = FileServer.Api.Features.DocumentoVectorial.Models;
using FileServer.Api.Options;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace FileServer.Api.Features.DocumentoVectorial.Services;

public class DocumentoVectorialService : IDocumentoVectorialService
{
    private readonly IMongoCollection<VecModels.DocumentoVectorial> _collection;

    public DocumentoVectorialService(IMongoDatabase database, IOptions<MongoDbOptions> opts)
    {
        var options = opts.Value;
        _collection = database.GetCollection<VecModels.DocumentoVectorial>(options.CollectionName);
    }

    public async Task EnsureIndexesAsync(CancellationToken ct = default)
    {
        var indexModels = new List<CreateIndexModel<VecModels.DocumentoVectorial>>
        {
            new(
                Builders<VecModels.DocumentoVectorial>.IndexKeys.Ascending(x => x.DocumentoId),
                new CreateIndexOptions { Unique = true, Name = "ux_documentoId" }
            ),
            new(
                Builders<VecModels.DocumentoVectorial>.IndexKeys.Ascending(x => x.HashContenido),
                new CreateIndexOptions { Unique = true, Name = "ux_hashContenido" }
            ),
            new(
                Builders<VecModels.DocumentoVectorial>.IndexKeys
                    .Ascending(x => x.Metadata.OrganizacionId)
                    .Ascending(x => x.Metadata.TipoDocumentoId)
                    .Ascending(x => x.Metadata.CarpetaId),
                new CreateIndexOptions { Name = "ix_meta_org_tipo_carpeta" }
            )
        };
        await _collection.Indexes.CreateManyAsync(indexModels, ct);
    }

    public async Task<VecModels.DocumentoVectorial> InsertAsync(VecModels.CreateDocumentoVectorialSinIdDto dto, CancellationToken ct = default)
    {
        var entity = new VecModels.DocumentoVectorial
        {
            DocumentoId = dto.DocumentoId,
            Metadata = dto.Metadata,
            Chunks = dto.Chunks,
            HashContenido = dto.HashContenido
        };
        await _collection.InsertOneAsync(entity, cancellationToken: ct);
        return entity;
    }

    public async Task<VecModels.DocumentoVectorial?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<VecModels.DocumentoVectorial?> GetByDocumentoIdAsync(long documentoId, CancellationToken ct = default)
    {
        return await _collection.Find(x => x.DocumentoId == documentoId).FirstOrDefaultAsync(ct);
    }

    public async Task<IReadOnlyList<VecModels.ResultadoBusquedaVectorial>> BuscarSimilaresAsync(VecModels.BusquedaVectorialDto dto, CancellationToken ct = default)
    {
        var filter = Builders<VecModels.DocumentoVectorial>.Filter.Eq(x => x.Metadata.OrganizacionId, dto.OrganizacionId);
        if (dto.TipoDocumentoId.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Eq(x => x.Metadata.TipoDocumentoId, dto.TipoDocumentoId.Value);
        if (dto.CarpetaId.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Eq(x => x.Metadata.CarpetaId, dto.CarpetaId.Value);

        var candidates = await _collection.Find(filter).ToListAsync(ct);
        var results = new List<VecModels.ResultadoBusquedaVectorial>();

        foreach (var doc in candidates)
        {
            double bestSim = 0;
            string bestText = string.Empty;
            foreach (var ch in doc.Chunks)
            {
                if (dto.FiltrarStopWords && IsLowContentChunk(ch.Texto))
                    continue;

                var sim = CosineSimilarity(dto.ConsultaVector, ch.Vector);
                if (sim > bestSim)
                {
                    bestSim = sim;
                    bestText = ch.Texto;
                }
            }

            results.Add(new VecModels.ResultadoBusquedaVectorial
            {
                Id = doc.Id,
                DocumentoId = doc.DocumentoId,
                NombreDocumento = doc.Metadata.NombreDocumento,
                FragmentoTexto = bestText,
                Similitud = bestSim
            });
        }

        var filtered = results
            .Where(r => r.Similitud >= dto.MinSimilitud)
            .OrderByDescending(r => r.Similitud)
            .Take(dto.TopK)
            .ToList();
        return filtered;
    }

    private static double CosineSimilarity(double[] a, double[] b)
    {
        if (a.Length == 0 || b.Length == 0 || a.Length != b.Length) return 0;
        double dot = 0, magA = 0, magB = 0;
        for (int i = 0; i < a.Length; i++)
        {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        var denom = Math.Sqrt(magA) * Math.Sqrt(magB);
        return denom == 0 ? 0 : dot / denom;
    }

    public async Task<bool> UpdateAsync(string id, VecModels.CreateDocumentoVectorialSinIdDto dto, CancellationToken ct = default)
    {
        var update = Builders<VecModels.DocumentoVectorial>.Update
            .Set(x => x.DocumentoId, dto.DocumentoId)
            .Set(x => x.Metadata, dto.Metadata)
            .Set(x => x.Chunks, dto.Chunks)
            .Set(x => x.HashContenido, dto.HashContenido)
            .Set(x => x.Metadata.FechaActualizacion, DateTime.UtcNow);

        var result = await _collection.UpdateOneAsync(x => x.Id == id, update, cancellationToken: ct);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id, ct);
        return result.DeletedCount > 0;
    }

    public async Task<VecModels.PagedResult<VecModels.DocumentoVectorial>> GetAsync(int page, int pageSize, CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        var total = await _collection.CountDocumentsAsync(FilterDefinition<VecModels.DocumentoVectorial>.Empty, cancellationToken: ct);
        var items = await _collection.Find(FilterDefinition<VecModels.DocumentoVectorial>.Empty)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);
        return new VecModels.PagedResult<VecModels.DocumentoVectorial>
        {
            Items = items,
            TotalCount = (int)total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IReadOnlyList<VecModels.DocumentoVectorial>> BuscarPorMetadatosAsync(long? organizacionId, long? tipoDocumentoId, long? carpetaId, DateTime? desde, DateTime? hasta, CancellationToken ct = default)
    {
        var filter = FilterDefinition<VecModels.DocumentoVectorial>.Empty;
        if (organizacionId.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Eq(x => x.Metadata.OrganizacionId, organizacionId.Value);
        if (tipoDocumentoId.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Eq(x => x.Metadata.TipoDocumentoId, tipoDocumentoId.Value);
        if (carpetaId.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Eq(x => x.Metadata.CarpetaId, carpetaId.Value);
        if (desde.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Gte(x => x.Metadata.FechaCreacion, desde.Value);
        if (hasta.HasValue)
            filter &= Builders<VecModels.DocumentoVectorial>.Filter.Lte(x => x.Metadata.FechaCreacion, hasta.Value);

        return await _collection.Find(filter).ToListAsync(ct);
    }

    public async Task<bool> ExisteHashAsync(string hashContenido, CancellationToken ct = default)
    {
        var count = await _collection.CountDocumentsAsync(x => x.HashContenido == hashContenido, cancellationToken: ct);
        return count > 0;
    }

    public async Task<IReadOnlyList<VecModels.DocumentoVectorial>> GetByDocumentoIdsAsync(IEnumerable<long> documentoIds, CancellationToken ct = default)
    {
        var ids = documentoIds?.ToArray() ?? Array.Empty<long>();
        if (ids.Length == 0) return Array.Empty<VecModels.DocumentoVectorial>();
        var filter = Builders<VecModels.DocumentoVectorial>.Filter.In(x => x.DocumentoId, ids);
        var list = await _collection.Find(filter).ToListAsync(ct);
        return list;
    }

    private static readonly HashSet<string> StopWordsEs = new(StringComparer.OrdinalIgnoreCase)
    {
        "a","acá","ahí","al","algo","algún","alguna","algunas","alguno","algunos","allí","allá","ante","antes","aquel","aquella","aquellas","aquello","aquellos","aqui","aquí","arriba","asi","así","atras","atrás","aun","aún","aunque","bajo","bien","cabe","cada","casi","como","con","contra","cual","cuales","cualquier","cualquiera","cualquieras","cuan","cuán","cuando","cuanta","cuantas","cuanto","cuantos","de","del","deber","dentro","desde","donde","dos","el","él","ella","ellas","ello","ellos","en","entre","era","erais","éramos","eran","eras","eres","es","esa","esas","ese","eso","esos","esta","estaba","estabais","estábamos","estaban","estabas","estad","estada","estadas","estado","estados","estais","estamos","estan","están","estar","estará","estas","este","esto","estos","estoy","fin","fue","fueron","fui","fuimos","ha","hace","haces","hacia","han","hasta","hay","incluso","intenta","intentas","intentais","intentamos","intentan","ir","jamás","junto","juntos","la","las","lo","los","luego","mas","más","me","menos","mi","mis","mientras","mio","míos","misma","mismas","mismo","mismos","nada","nadie","ni","ningún","ninguna","ningunas","ninguno","ningunos","no","nos","nosotras","nosotros","nuestra","nuestras","nuestro","nuestros","nunca","os","otra","otras","otro","otros","para","pero","poca","pocas","poco","pocos","por","porque","primero","puede","pueden","pues","que","qué","querer","quien","quién","quienes","quienesquiera","quienquiera","quiza","quizá","quizás","sabe","sabes","san","se","sea","sean","segun","según","ser","si","sí","sido","siempre","siendo","sin","sino","so","sobre","sois","solamente","solo","sólo","somos","son","soy","sr","sra","sres","sta","su","sus","suya","suyas","suyo","suyos","tal","tales","también","tampoco","tan","tanta","tantas","tanto","tantos","te","temprano","tendremos","tendrán","tened","teneis","tenemos","tenga","tengan","tengo","ti","tiempo","tiene","tienen","toda","todas","todavia","todavía","todo","todos","trabaja","trabajais","trabajamos","trabajan","trabajar","trabajas","tras","tu","tus","tuya","tuyas","tuyo","tuyos","ultimo","último","un","una","unas","uno","unos","usa","usais","usamos","usan","usar","usas","usted","ustedes","va","vais","valor","vamos","van","varias","varios","vaya","verdad","verdadera","verdadero","vosotras","vosotros","voy","ya","yo"
    };

    private static bool IsLowContentChunk(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return true;
        var tokens = Regex.Matches(text.ToLowerInvariant(), "[a-záéíóúñü]+", RegexOptions.CultureInvariant)
            .Select(m => m.Value)
            .ToArray();
        if (tokens.Length == 0) return true;
        var contentWords = tokens.Where(t => !StopWordsEs.Contains(t)).Count();
        var ratio = (double)contentWords / tokens.Length;
        return ratio < 0.30;
    }
}