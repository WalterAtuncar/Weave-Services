# Checkbox "Puede Editar" en Formulario de Gobernanza

## Descripción

Se ha agregado un nuevo checkbox **"Puede Editar"** al formulario de Gobernanza que permite indicar si un usuario asignado a un rol específico tiene permisos para editar la entidad asociada.

## Funcionalidad

### Campo Agregado

- **Campo**: `puedeEditar`
- **Tipo**: `boolean`
- **Valor por defecto**: `false`
- **Ubicación**: En cada rol de gobernanza dentro del formulario

### Comportamiento

1. **Estado Activo**: Indica si el rol está activo en la gobernanza
2. **Puede Editar**: Indica si el usuario puede modificar la entidad asociada

### Interfaz de Usuario

- **Checkbox con ícono**: Cada checkbox incluye un ícono descriptivo
  - ✅ **Estado Activo**: Ícono de check verde cuando está activo
  - ✏️ **Puede Editar**: Ícono de lápiz azul cuando tiene permisos de edición
- **Estilos mejorados**: Los checkboxes tienen un diseño moderno con hover effects
- **Estados visuales**: Los íconos cambian de color según el estado

## Implementación Técnica

### Frontend

#### Tipos TypeScript
```typescript
interface GobernanzaRolFormItem {
  // ... otros campos
  puedeEditar: boolean; // ✅ Nuevo campo
}

interface GobernanzaRolDto {
  // ... otros campos
  puedeEditar?: number; // ✅ 1=si, 0=no
}
```

#### Componente React
```tsx
<div className={styles.checkboxItem}>
  <input
    type="checkbox"
    id={`puedeEditar_${role.id}`}
    checked={role.puedeEditar}
    onChange={(e) => handleRoleChange(role.id, 'puedeEditar', e.target.checked)}
    disabled={isDisabled}
  />
  <label htmlFor={`puedeEditar_${role.id}`}>
    <Edit size={16} color={role.puedeEditar ? "#3b82f6" : "#6b7280"} />
    Puede Editar
  </label>
</div>
```

#### Estilos CSS
```css
.checkboxItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.checkboxItem:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-primary);
}
```

### Backend

#### Comando de Creación/Actualización
```typescript
const gobernanzaRoles = state.formData.gobernanzaRoles.map(role => ({
  // ... otros campos
  puedeEditar: role.puedeEditar ? 1 : 0 // ✅ Convertir a número
}));
```

## Casos de Uso

### 1. Rol de Solo Lectura
- **Estado Activo**: ✅ Activado
- **Puede Editar**: ❌ Desactivado
- **Resultado**: Usuario puede ver pero no modificar la entidad

### 2. Rol de Edición Completa
- **Estado Activo**: ✅ Activado
- **Puede Editar**: ✅ Activado
- **Resultado**: Usuario puede ver y modificar la entidad

### 3. Rol Inactivo
- **Estado Activo**: ❌ Desactivado
- **Puede Editar**: ❌ Desactivado (automático)
- **Resultado**: Usuario no tiene acceso a la entidad

## Validaciones

- El campo `puedeEditar` solo es relevante cuando `estadoActivo` es `true`
- Si `estadoActivo` es `false`, `puedeEditar` se establece automáticamente en `false`
- El valor se envía al backend como `number` (1 = true, 0 = false)

## Beneficios

1. **Control Granular**: Permite asignar permisos específicos por rol
2. **Seguridad**: Separa permisos de visualización de permisos de edición
3. **Flexibilidad**: Diferentes niveles de acceso según las necesidades
4. **UX Mejorada**: Interfaz clara con íconos descriptivos
5. **Auditoría**: Registra qué usuarios pueden modificar qué entidades

## Ejemplo de Uso

```json
{
  "gobernanzaRoles": [
    {
      "rolGobernanzaId": 1,
      "usuarioId": 123,
      "fechaAsignacion": "2024-01-15",
      "estadoActivo": 1,
      "puedeEditar": 1  // ✅ Usuario puede editar
    },
    {
      "rolGobernanzaId": 2,
      "usuarioId": 456,
      "fechaAsignacion": "2024-01-15",
      "estadoActivo": 1,
      "puedeEditar": 0  // ❌ Usuario solo puede ver
    }
  ]
}
``` 