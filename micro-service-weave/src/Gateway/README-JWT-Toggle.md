# JWT Validation Toggle - Development/Production

Este documento explica cómo funciona el sistema de toggle para validación JWT entre modo desarrollo y producción.

## Configuración

### Modo Desarrollo (appsettings.json)
```json
{
  "Authentication": {
    "EnableJwtValidation": false,
    "DevelopmentMode": {
      "DefaultUserId": 1,
      "DefaultPersonalId": 1,
      "DefaultRolId": 1,
      "DefaultUserName": "dev-user",
      "DefaultEmail": "dev@erpmedico.com"
    }
  }
}
```

### Modo Producción (appsettings.Production.json)
```json
{
  "Authentication": {
    "EnableJwtValidation": true
  }
}
```

## Funcionamiento

### Modo Desarrollo (`EnableJwtValidation: false`)
- **No requiere JWT tokens** en las peticiones
- Automáticamente agrega headers con datos de usuario por defecto:
  - `X-User-Id: 1`
  - `X-Personal-Id: 1`
  - `X-Rol-Id: 1`
  - `X-User-Name: dev-user`
  - `X-User-Email: dev@erpmedico.com`
  - `X-Auth-Mode: development`

### Modo Producción (`EnableJwtValidation: true`)
- **Requiere JWT tokens válidos** en el header `Authorization: Bearer <token>`
- Valida el token JWT completamente
- Extrae claims del token y los convierte en headers:
  - `X-User-Id: {usuario_id del token}`
  - `X-Personal-Id: {personal_id del token}`
  - `X-Rol-Id: {rol_id del token}`
  - `X-User-Name: {name del token}`
  - `X-User-Email: {email del token}`
  - `X-Auth-Mode: production`

## Headers Enviados a Servicios Downstream

Todos los servicios (Admin, Farmacia, Contabilidad, Médico) reciben automáticamente estos headers:

```
X-User-Id: <usuario_id>
X-Personal-Id: <personal_id>
X-Rol-Id: <rol_id>
X-User-Name: <nombre_usuario>
X-User-Email: <email_usuario>
X-Auth-Mode: <development|production>
```

## Uso en Controladores Downstream

Los controladores en los servicios pueden acceder a esta información:

```csharp
[ApiController]
public class MiController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var userId = Request.Headers["X-User-Id"].FirstOrDefault();
        var personalId = Request.Headers["X-Personal-Id"].FirstOrDefault();
        var rolId = Request.Headers["X-Rol-Id"].FirstOrDefault();
        var authMode = Request.Headers["X-Auth-Mode"].FirstOrDefault();
        
        // Usar para auditoría, logging, etc.
        return Ok($"Usuario: {userId}, Modo: {authMode}");
    }
}
```

## Deployment

### Desarrollo Local
```bash
# El appsettings.json ya tiene EnableJwtValidation: false
dotnet run
```

### Producción
```bash
# Usar variable de entorno o appsettings.Production.json
export ASPNETCORE_ENVIRONMENT=Production
dotnet run
```

### Docker
```yaml
# docker-compose.yml
services:
  gateway:
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - Authentication__EnableJwtValidation=true
```

## Seguridad

- ⚠️ **NUNCA** usar `EnableJwtValidation: false` en producción
- El middleware valida que no se pueda deshabilitar JWT en entornos de producción
- Todos los logs incluyen el modo de autenticación para auditoría

## Endpoints que NO requieren autenticación

Los siguientes endpoints siempre están excluidos de la validación:
- `/health`
- `/swagger`
- `/api/auth/login`
- `/api/auth/register`