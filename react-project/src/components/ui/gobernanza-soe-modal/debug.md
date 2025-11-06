# Debug de Integración Gobernanza

## Problemas Identificados y Solucionados

### ❌ Error 1: UsuarioId no mapeado correctamente
**Problema**: En la función `handleSaveEdit`, no se estaba mapeando correctamente el `usuarioId` para encontrar el `gobernanzaRolId` correcto.

**Solución**: 
```typescript
// ANTES (INCORRECTO)
const response = await gobernanzaRolService.actualizarFechaAsignacion(
  gobernanza.rolesGobernanza
    .flatMap(r => r.usuariosAsignados)
    .find(u => u.usuarioId === editingUsuario.usuarioId)?.gobernanzaRolId || 0, // ❌ Podía ser 0
  editingUsuario.fechaAsignacion + 'T00:00:00Z'
);

// DESPUÉS (CORRECTO)
const usuarioEnGobernanza = gobernanza.rolesGobernanza
  .flatMap(r => r.usuariosAsignados)
  .find(u => u.usuarioId === editingUsuario.usuarioId);

if (!usuarioEnGobernanza) {
  AlertService.error('Usuario no encontrado en la gobernanza');
  return;
}

if (!usuarioEnGobernanza.gobernanzaRolId || usuarioEnGobernanza.gobernanzaRolId <= 0) {
  AlertService.error('ID de gobernanza rol inválido');
  return;
}

const response = await gobernanzaRolService.actualizarFechaAsignacion(
  usuarioEnGobernanza.gobernanzaRolId, // ✅ ID válido garantizado
  editingUsuario.fechaAsignacion + 'T00:00:00Z'
);
```

### ❌ Error 2: RolGobernanzaId hardcodeado
**Problema**: En `handleAddEjecutor`, se estaba usando un valor hardcodeado `|| 3` para el rol de ejecutor.

**Solución**:
```typescript
// ANTES (INCORRECTO)
const response = await gobernanzaRolService.agregarEjecutor(
  gobernanza.gobernanzaId!,
  gobernanza.rolesGobernanza.find(r => r.rolGobernanzaCodigo === 'EJ')?.rolGobernanzaId || 3, // ❌ Hardcodeado
  usuario.usuarioId,
  newEjecutorForm.fechaAsignacion + 'T00:00:00Z'
);

// DESPUÉS (CORRECTO)
const rolEjecutor = gobernanza.rolesGobernanza.find(r => r.rolGobernanzaCodigo === 'EJ');

if (!rolEjecutor) {
  AlertService.error('No se encontró el rol de ejecutor en la gobernanza');
  return;
}

if (!rolEjecutor.rolGobernanzaId || rolEjecutor.rolGobernanzaId <= 0) {
  AlertService.error('ID de rol de gobernanza inválido');
  return;
}

const response = await gobernanzaRolService.agregarEjecutor(
  gobernanza.gobernanzaId,
  rolEjecutor.rolGobernanzaId, // ✅ ID real del backend
  usuario.usuarioId,
  newEjecutorForm.fechaAsignacion + 'T00:00:00Z'
);
```

### ❌ Error 3: Falta de validaciones
**Problema**: No se validaban los IDs antes de enviarlos al backend.

**Solución**: Agregar validaciones completas:
```typescript
// Validar que todos los IDs sean válidos
if (!gobernanza.gobernanzaId || gobernanza.gobernanzaId <= 0) {
  AlertService.error('ID de gobernanza inválido');
  return;
}

if (!rolEjecutor.rolGobernanzaId || rolEjecutor.rolGobernanzaId <= 0) {
  AlertService.error('ID de rol de gobernanza inválido');
  return;
}

if (!usuario.usuarioId || usuario.usuarioId <= 0) {
  AlertService.error('ID de usuario inválido');
  return;
}
```

### ❌ Error 4: Falta de logging para debug
**Problema**: No había forma de ver qué datos se estaban enviando al backend.

**Solución**: Agregar console.log para debug:
```typescript
console.log('Enviando datos al backend:', {
  gobernanzaId: gobernanza.gobernanzaId,
  rolGobernanzaId: rolEjecutor.rolGobernanzaId,
  usuarioId: usuario.usuarioId,
  fechaAsignacion: newEjecutorForm.fechaAsignacion + 'T00:00:00Z'
});
```

## Estado Actual
- ✅ **UsuarioId**: Correctamente mapeado
- ✅ **RolGobernanzaId**: Obtenido dinámicamente del backend
- ✅ **GobernanzaId**: Validado antes del envío
- ✅ **Validaciones**: Completas para todos los IDs
- ✅ **Logging**: Agregado para debug

## Próximos Pasos
1. Probar la integración con el backend
2. Verificar que los logs muestren IDs válidos
3. Confirmar que las operaciones CRUD funcionen correctamente
