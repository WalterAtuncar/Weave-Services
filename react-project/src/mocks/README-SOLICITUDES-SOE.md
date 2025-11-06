# Estructura JSON para Solicitudes SOE

## Descripción General

Este documento describe la estructura completa del JSON que se necesita para cargar el formulario de seguimiento SOE (Sponsor, Owner, Ejecutor) en el sistema.

## Estructura Principal

### SolicitudAprobacion

```typescript
interface SolicitudAprobacion {
  id: number;                    // ID único de la solicitud
  tipoOperacion: 'CREAR' | 'EDITAR' | 'ELIMINAR';
  entidadNombre: string;         // Nombre de la entidad (ej: "cvb")
  entidadTipo: string;           // Tipo de entidad (ej: "SISTEMA")
  solicitadoPor: UsuarioSOE;     // Usuario que solicita la aprobación
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaSolicitud: string;        // ISO string de la fecha
  motivoSolicitud: string;       // Descripción del motivo
  esBorrador?: boolean;          // Si es un borrador
  datosEntidad?: any;            // Datos específicos de la entidad
  aprobaciones: AprobacionSOE[]; // Lista de aprobaciones requeridas
}
```

### UsuarioSOE

```typescript
interface UsuarioSOE {
  id: number;
  nombre: string;
  email: string;
  rol: 'SPONSOR' | 'OWNER' | 'EJECUTOR';
  activo: boolean;
  fechaAsignacion: string;       // ISO string
  departamento?: string;
  cargo?: string;
}
```

### AprobacionSOE

```typescript
interface AprobacionSOE {
  id: number;                    // ID único de la aprobación
  solicitudId: number;           // ID de la solicitud padre
  aprobador: UsuarioSOE;         // Usuario que debe aprobar
  rolAprobador: 'SPONSOR' | 'OWNER';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaRespuesta?: string;       // ISO string (null si pendiente)
  comentarios?: string;          // Comentarios del aprobador
  orden: number;                 // Orden de aprobación (1=Owner, 2=Sponsor)
}
```

## Ejemplo Completo

```json
{
  "id": 1001,
  "tipoOperacion": "EDITAR",
  "entidadNombre": "cvb",
  "entidadTipo": "SISTEMA",
  "solicitadoPor": {
    "id": 4,
    "nombre": "Ana López",
    "email": "ana.lopez@empresa.com",
    "rol": "EJECUTOR",
    "activo": true,
    "fechaAsignacion": "2024-01-10T00:00:00Z",
    "departamento": "Desarrollo",
    "cargo": "Desarrolladora Frontend"
  },
  "estado": "PENDIENTE",
  "fechaSolicitud": "2024-01-15T10:30:00Z",
  "motivoSolicitud": "Actualización del sistema cvb - Nuevas funcionalidades de reportes",
  "esBorrador": false,
  "datosEntidad": {
    "sistemaId": 1,
    "nombreSistema": "cvb",
    "cambiosSolicitados": [
      "Módulo de reportes avanzados",
      "Dashboard de métricas",
      "Exportación de datos"
    ],
    "presupuestoAdicional": "$15,000 USD",
    "tipoSistema": "APLICACION",
    "familiaSistema": "GESTION",
    "descripcion": "Sistema de gestión cvb"
  },
  "aprobaciones": [
    {
      "id": 2001,
      "solicitudId": 1001,
      "aprobador": {
        "id": 2,
        "nombre": "Antonio Torre",
        "email": "antonio.torre@empresa.com",
        "rol": "OWNER",
        "activo": true,
        "fechaAsignacion": "2024-01-01T00:00:00Z",
        "departamento": "Ingeniería de Procesos",
        "cargo": "Ingeniero de Procesos Senior"
      },
      "rolAprobador": "OWNER",
      "estado": "APROBADO",
      "fechaRespuesta": "2024-01-16T14:20:00Z",
      "comentarios": "✅ Cambios para sistema cvb son necesarios. Aprobado técnicamente.",
      "orden": 1
    },
    {
      "id": 2002,
      "solicitudId": 1001,
      "aprobador": {
        "id": 1,
        "nombre": "Erick Machuca",
        "email": "erick.machuca@empresa.com",
        "rol": "SPONSOR",
        "activo": true,
        "fechaAsignacion": "2024-01-01T00:00:00Z",
        "departamento": "Dirección General",
        "cargo": "Director General"
      },
      "rolAprobador": "SPONSOR",
      "estado": "PENDIENTE",
      "fechaRespuesta": null,
      "comentarios": null,
      "orden": 2
    }
  ]
}
```

## Flujo de Aprobación

1. **Owner (Orden 1)**: Primera aprobación técnica
2. **Sponsor (Orden 2)**: Aprobación final estratégica

## Estados de Solicitud

- **PENDIENTE**: Esperando aprobaciones
- **APROBADO**: Todas las aprobaciones completadas positivamente
- **RECHAZADO**: Al menos una aprobación fue rechazada

## Estados de Aprobación

- **PENDIENTE**: Aún no ha revisado
- **APROBADO**: Aprobó la solicitud
- **RECHAZADO**: Rechazó la solicitud

## Tipos de Operación

- **CREAR**: Creación de nueva entidad
- **EDITAR**: Modificación de entidad existente
- **ELIMINAR**: Eliminación de entidad

## Campos Opcionales

- `esBorrador`: Para distinguir borradores de solicitudes en proceso
- `datosEntidad`: Datos específicos según el tipo de entidad
- `fechaRespuesta`: Solo presente cuando la aprobación ha sido respondida
- `comentarios`: Comentarios del aprobador (opcional) 