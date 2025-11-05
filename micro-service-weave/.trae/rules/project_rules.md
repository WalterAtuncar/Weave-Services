# Reglas Backend: Verificación por Build

Estas reglas aplican a las tareas de backend del proyecto `micro-service-weave`.

## Política de ejecución
- Solo ejecutar `dotnet restore` y `dotnet build` para verificar y corregir errores de compilación.
- No ejecutar `dotnet run` durante la fase de verificación/corrección.

## Objetivo
- Garantizar que las validaciones se limiten al proceso de compilación y análisis estático, sin levantar servicios locales.

## Consejos de uso
- Para validar correcciones: `dotnet restore` y luego `dotnet build -c Debug`.
- Si hay advertencias críticas (nullable, API obsoleta), priorizar su resolución junto con errores.
- Cualquier prueba o ejecución de servidor debe realizarse fuera de este flujo y solo cuando se apruebe explícitamente.

---

# Lineamientos: Auditoría, Entidades, Controllers, CRUD y Middleware

Estos lineamientos formalizan el diseño implementado: auditoría y borrado lógico para tablas core; sin auditoría y borrado físico para tablas de catálogo. Aplica a la solución `micro-service-weave` y se complementa con `docs/auditoria-automatica.md` y `docs/crear_nuevo_api_y_controllers.md`.

## Definición de negocio
- Tablas core: requieren auditoría (creación/actualización) y borrado lógico.
- Tablas catálogo: NO llevan auditoría; el borrado es físico.

## Clasificación de entidades
- Core: deben heredar de `Shared.Domain.Entities.BaseEntity`.
- Catálogo: NO deben heredar de `BaseEntity`.

## Entidades (core) – requisitos y esquema
- Heredar de `BaseEntity` para habilitar auditoría y borrado lógico.
- Asegurar columnas en la tabla para los campos de auditoría:
  - `CreadoPor` (texto/cadena), `FechaCreacion` (fecha/hora)
  - `ActualizadoPor` (texto/cadena), `FechaActualizacion` (fecha/hora)
  - `RegistroEliminado` (boolean/bit), `Estado` (texto/cadena)
  - Opcional: `Version` (se recomienda `rowversion/timestamp` si se usa concurrencia optimista)
- Importante: el repositorio genérico mapea todas las propiedades públicas del modelo en `INSERT/UPDATE`. Si faltan columnas, el SQL fallará.

## Entidades (catálogo)
- No heredar de `BaseEntity`.
- CRUD clásico sin auditoría automática.
- `DELETE` realiza borrado físico.

## Servicios compartidos y cabeceras de usuario
- `src/Shared/Shared.Application/Services/IUserContextService.cs`: obtención de contexto de usuario.
- `src/Shared/Shared.Application/Services/IAuditService.cs`: operaciones de auditoría de creación, actualización y borrado lógico.
- Implementaciones por API (ej. `Catalogo.Api`):
  - `src/Services/Catalogo/Catalogo.Api/Services/UserContextService.cs`
  - `src/Services/Catalogo/Catalogo.Api/Services/AuditService.cs`
- Cabeceras esperadas del Gateway (propagadas por middleware del Gateway):
  - `X-User-Id`, `X-Personal-Id`, `X-Role-Id`, `X-Username`, `X-Email`, `X-Auth-Mode`

## Registro en Program.cs (DI)
- Registrar:
  - `IHttpContextAccessor`
  - `IUserContextService` (implementación de la API)
  - `IAuditService` (implementación de la API)
- Selección dinámica de handlers:
  - Para tipos que heredan `BaseEntity`: usar handlers auditables (`Create`, `Update`, `CreateMany`).
  - Para tipos sin `BaseEntity`: usar handlers genéricos estándar.

## Handlers y comandos (patrón genérico)
- Core (auditable):
  - `AuditableCreateEntityHandler<T>`, `AuditableUpdateEntityHandler<T>`, `AuditableCreateEntitiesHandler<T>`
  - Borrado lógico: se aplica en `Update` cuando `RegistroEliminado = true` y auditoría con `_auditService.ProcessDeleteAudit(...)`.
- Catálogo (no auditable):
  - `CreateEntityHandler<T>`, `UpdateEntityHandler<T>`, `DeleteEntityHandler<T>`
  - `DELETE` físico.

## Controladores – lineamientos CRUD
- Core:
  - `POST`: `CreateEntityCommand<T>`.
  - `PUT`: `UpdateEntityCommand<T>`.
  - `DELETE`: convertir a borrado lógico. Patrón recomendado:
    ```csharp
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var entity = await _mediator.Send(new GetEntityByIdQuery<Organizacion>(id));
        if (entity is null) return NotFound();
        entity.RegistroEliminado = true;
        var rows = await _mediator.Send(new UpdateEntityCommand<Organizacion>(entity));
        return rows > 0 ? NoContent() : StatusCode(StatusCodes.Status500InternalServerError);
    }
    ```
  - `GET` (listado): agregar filtro por defecto `RegistroEliminado = 0` cuando la UX requiera ocultar eliminados.
- Catálogo:
  - CRUD clásico. `DELETE` físico mediante `DeleteEntityCommand<T>`.
- Reutilización: cualquier controlador que use los comandos genéricos se beneficia de la selección automática de handlers descrita.

## Middleware y Gateway
- El Gateway debe propagar las cabeceras de usuario listadas para habilitar auditoría.
- En las APIs, `UserContextService` lee estas cabeceras desde el `HttpContext`.
- Si no hay cabeceras presentes, la política puede dejar campos de auditoría en `null` o aplicar valores por defecto (definir según necesidad del dominio).

## Gateway y Ocelot: registro de endpoints y rutas
- Cada vez que se registre un endpoint en cualquier API, actualizar la ruta correspondiente en todos los archivos de Ocelot del Gateway: `src/Gateway/ocelot.json`, `src/Gateway/ocelot.Development.json`, `src/Gateway/ocelot.Production.json`.
- Preferir patrón upstream con prefijo API: `/api/<ApiName>/{everything}`. Este patrón alinea con controllers que usan `[Route("api/[controller]")]`.
  - Ejemplo (plantilla):
    ```json
    {
      "UpstreamPathTemplate": "/api/<ApiName>/{everything}",
      "UpstreamHttpMethod": ["GET", "POST", "PUT", "DELETE"],
      "DownstreamPathTemplate": "/api/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [{ "Host": "<host>", "Port": <port> }],
      "Priority": 0
    }
    ```
- Si el endpoint es especializado y requiere otro nombre o comportamiento distinto, registrar la ruta completa y darle mayor prioridad frente al catch-all.
  - Ejemplo (ruta especializada):
    ```json
    {
      "UpstreamPathTemplate": "/api/<ApiName>/tipo-entidad/{id}",
      "UpstreamHttpMethod": ["GET"],
      "DownstreamPathTemplate": "/api/tipo-entidad/{id}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [{ "Host": "<host>", "Port": <port> }],
      "Priority": 1
    }
    ```
 - Análisis de compatibilidad con catch-all:
   - Antes de registrar explícitamente, evaluar si el nuevo endpoint funciona correctamente con el patrón upstream `"/api/<ApiName>/{everything}"` y el downstream `"/api/{everything}"` (métodos HTTP, plantilla `[Route("api/[controller]")]`, parámetros y rutas relativas).
   - Si funciona con el catch-all, no se requiere registro adicional.
   - Si no funciona (plantilla distinta, prefijo adicional, paths fuera de `api/[controller]`, requerimientos específicos de headers/métodos), registrar el endpoint explícitamente en `src/Gateway/ocelot.json`, `src/Gateway/ocelot.Development.json`, `src/Gateway/ocelot.Production.json` y asignar `Priority` mayor para sobrepasar el catch-all.
- Mantener consistencia entre ambientes (Development/Production) y validar que las rutas funcionen con las mismas plantillas y métodos.
- Asegurar que el middleware del Gateway continúe propagando las cabeceras `X-User-Id`, `X-Personal-Id`, `X-Role-Id`, `X-Username`, `X-Email`, `X-Auth-Mode` hacia los downstreams.

## Repositorio y consultas
- `Shared.Infrastructure` contiene el repositorio genérico que construye SQL a partir de las propiedades del modelo.
- Al heredar `BaseEntity`, validar que la tabla tiene todas las columnas de auditoría.
- Para excluir registros eliminados lógicamente en listados, aplicar filtro `RegistroEliminado = 0` en las consultas correspondientes.

## Convenciones y ubicaciones
- Entidades: `src/Services/<Api>/<Api>.Domain/Entities`
- Handlers compartidos: `src/Shared/Shared.Application/Handlers`
- Interfaces compartidas: `src/Shared/Shared.Application/Services`
- Servicios por API: `src/Services/<Api>/<Api>.Api/Services`
- Configuración de DI: `src/Services/<Api>/<Api>.Api/Program.cs`

## Documentación relacionada
- `docs/auditoria-automatica.md`
- `docs/crear_nuevo_api_y_controllers.md`

## Checklist al crear nuevos componentes
- Nueva entidad core:
  - Heredar `BaseEntity` y migrar la tabla con columnas de auditoría.
  - Implementar `DELETE` como borrado lógico en el controlador.
  - Revisar que listados excluyan `RegistroEliminado` si corresponde.
- Nueva entidad catálogo:
  - No heredar `BaseEntity`; CRUD clásico; `DELETE` físico.
- Nuevo controller:
  - Usar comandos genéricos (`Create`, `Update`, `Delete`) según clasificación core/catálogo.
  - Para core, aplicar patrón de borrado lógico en `DELETE`.
- Nueva API:
  - Registrar `IHttpContextAccessor`, `IUserContextService`, `IAuditService` en `Program.cs`.
  - Confirmar propagación de cabeceras desde el Gateway.

## Validación y calidad
- Seguir las reglas de verificación por build: `dotnet restore` y `dotnet build -c Debug`.
- Priorizar advertencias críticas (nullable, APIs obsoletas) junto con errores.

---

# Migración de Handlers con Lógica de Negocio

Estas reglas complementan la estrategia de migración: cuando un `Handler` del monolito contiene lógica de negocio, no se migra únicamente el SQL a un Stored Procedure; también se debe implementar la lógica en un `Service` (compartido o propio del API) y orquestarla desde el `Handler`.

## Principios
- Separación de responsabilidades:
  - Stored Procedures: operaciones de datos, transacciones, performance y consistencia; no deben contener reglas de negocio complejas u orquestaciones multientidad.
  - Services (negocio): validaciones, cálculos, reglas, orquestación de pasos, integración con otros servicios; exponen métodos claros consumidos por Handlers.
- No duplicar lógica dentro del SP y del Service; la lógica de negocio vive en el Service.

## Ubicación y diseño
- Service propio del API: para lógica específica de un bounded context (`Catalogo`, `Identity`, `WeaveCore`, `FileServer`).
  - Ubicación: `src/Services/<Api>/<Api>.Api/Services`.
  - Registro DI: en `Program.cs` del API correspondiente.
- Service compartido: usarlo solo si la lógica es transversal y no depende de esquemas/entidades específicas.
  - Contrato: `src/Shared/Shared.Application/Services`.
  - Implementación: evitar dependencias directas a tablas/schemas; centrarse en orquestación y utilitarios.
- Handlers en `Application` deben delegar la lógica al Service y usar `IStoredProcedureExecutor` para ejecutar SPs cuando corresponda.

## Criterios de decisión (Service compartido vs propio)
- Propio del API: la lógica toca entidades/tablas del schema del servicio, aplica reglas del dominio específico o requiere auditoría local.
- Compartido: la lógica es reutilizable, no acoplada a un schema, y sirve de utilitario u orquestador transversal.

## Contratos y SPs
- Mantener contratos de SP estables (parámetros y columnas explícitas), con errores via `THROW/RAISERROR` y `SET NOCOUNT ON`.
- Encapsular escrituras en el SP (atomicidad), mientras que las reglas de negocio y orquestación se implementan en el Service.

## Checklist por endpoint migrado
- Identificar si el `Handler` tiene lógica de negocio (validaciones, cálculos, side-effects, orquestación).
- Diseñar/actualizar el SP para operaciones de datos estrictas (lecturas/escrituras, transacciones).
- Implementar la lógica en un `Service` (compartido o propio) y registrarlo en DI.
- Actualizar el `Handler` para delegar en el `Service` y usar el ejecutor Dapper (`IStoredProcedureExecutor`).
- Exponer/ajustar el `Controller` y, si aplica, actualizar rutas en el Gateway (Ocelot).