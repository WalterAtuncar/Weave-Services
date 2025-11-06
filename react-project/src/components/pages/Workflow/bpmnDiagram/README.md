# 🎯 BpmnDiagram Component

Un componente React profesional para crear y editar diagramas BPMN usando React Flow. Diseñado para ser reutilizable, flexible y fácil de integrar.

## ✨ Características

- **4 Tipos de Nodos BPMN**: Inicio, Fin, Tarea y Decisión
- **Editor Visual**: Drag & drop intuitivo para crear diagramas
- **Propiedades Editables**: Panel lateral para configurar cada elemento
- **Validación Automática**: Validación de estructura y completitud
- **Serialización JSON**: Guardar/cargar diagramas completos
- **Gestión de Tareas**: Asignar responsables y fechas de vencimiento
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Temas**: Integrado con el sistema de colores del proyecto

## 🚀 Uso Básico

```tsx
import { BpmnDiagram } from './bpmnDiagram';

function MyComponent() {
  const [diagramData, setDiagramData] = useState<string>('');

  const handleSave = (data: string) => {
    setDiagramData(data);
    // Enviar al backend
    saveDiagramToServer(data);
  };

  return (
    <BpmnDiagram
      initialData={diagramData}
      onSave={handleSave}
      height="600px"
      showToolbar={true}
      showPropertiesPanel={true}
    />
  );
}
```

## 📋 Props del Componente

### BpmnDiagramProps

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `initialData` | `string \| BpmnDiagramData` | `undefined` | Datos iniciales del diagrama |
| `readOnly` | `boolean` | `false` | Modo solo lectura |
| `height` | `string` | `'600px'` | Altura del componente |
| `width` | `string` | `'100%'` | Ancho del componente |
| `showToolbar` | `boolean` | `true` | Mostrar barra de herramientas |
| `showPropertiesPanel` | `boolean` | `true` | Mostrar panel de propiedades |
| `showMiniMap` | `boolean` | `true` | Mostrar minimapa |
| `onSave` | `(data: string) => void` | `undefined` | Callback al guardar |
| `onChange` | `(data: BpmnDiagramData) => void` | `undefined` | Callback al cambiar |
| `onValidation` | `(isValid: boolean, errors: string[]) => void` | `undefined` | Callback de validación |
| `allowedNodeTypes` | `NodeType[]` | `['start', 'end', 'task', 'decision']` | Tipos de nodos permitidos |

## 🎨 Tipos de Nodos

### 🟢 Inicio (Start)
- **Propósito**: Punto de inicio del proceso
- **Forma**: Círculo verde
- **Propiedades**: Label, Descripción

### 🔴 Fin (End)
- **Propósito**: Punto final del proceso
- **Forma**: Círculo rojo con borde grueso
- **Propiedades**: Label, Descripción

### 📋 Tarea (Task)
- **Propósito**: Actividad a realizar
- **Forma**: Rectángulo redondeado
- **Propiedades**: Label, Descripción, Responsable, Fecha de vencimiento
- **Características especiales**:
  - Color de borde basado en fecha de vencimiento
  - Iconos para responsable y fecha
  - Validación de campos requeridos

### 🔶 Decisión (Decision)
- **Propósito**: Punto de decisión binaria
- **Forma**: Diamante amarillo
- **Propiedades**: Label, Descripción, Condiciones
- **Conexiones**: Múltiples salidas (Sí/No)

## 💾 Formato de Datos

### Estructura JSON

```typescript
interface BpmnDiagramData {
  nodes: Node<BpmnNodeData>[];
  edges: Edge[];
  metadata: {
    name: string;
    description?: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### Ejemplo de Nodo de Tarea

```json
{
  "id": "task-1",
  "type": "task",
  "position": { "x": 100, "y": 200 },
  "data": {
    "id": "task-1",
    "type": "task",
    "label": "Revisar Documento",
    "description": "Revisar y validar el documento",
    "assignee": "Juan Pérez",
    "dueDate": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-08T10:00:00Z",
    "updatedAt": "2024-01-08T10:00:00Z"
  }
}
```

## ✅ Validaciones

El componente incluye validaciones automáticas:

- **Estructura**: Al menos un nodo de inicio y uno de fin
- **Conectividad**: Todos los nodos deben estar conectados
- **Tareas**: Deben tener responsable y fecha de vencimiento
- **Unicidad**: Solo un nodo de inicio permitido

## 🎛️ Callbacks y Eventos

### onSave
Se ejecuta cuando el usuario guarda el diagrama:
```tsx
const handleSave = (jsonData: string) => {
  // Guardar en localStorage
  localStorage.setItem('bpmnDiagram', jsonData);
  
  // Enviar al servidor
  await fetch('/api/diagrams', {
    method: 'POST',
    body: jsonData,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### onChange
Se ejecuta en cada cambio del diagrama:
```tsx
const handleChange = (data: BpmnDiagramData) => {
  // Auto-guardado
  if (data.nodes.length > 0) {
    autoSave(data);
  }
};
```

### onValidation
Se ejecuta después de cada validación:
```tsx
const handleValidation = (isValid: boolean, errors: string[]) => {
  if (!isValid) {
    showErrorNotification(errors);
  }
};
```

## 🎨 Personalización de Estilos

### CSS Modules
Los estilos están organizados en módulos CSS:
- `BpmnDiagram.module.css` - Estilos principales
- `Toolbar.module.css` - Barra de herramientas
- `PropertiesPanel.module.css` - Panel de propiedades

### Integración con Temas
El componente utiliza automáticamente los colores del contexto de tema:
```tsx
const { colors } = useTheme();
// colors.primary, colors.surface, colors.text, etc.
```

## 📱 Responsive Design

El componente es completamente responsive:
- **Desktop**: Layout completo con toolbar y panel
- **Tablet**: Tamaños reducidos manteniendo funcionalidad
- **Mobile**: Layout optimizado para touch

## 🔧 Uso Avanzado

### Modo Solo Lectura
```tsx
<BpmnDiagram
  initialData={diagramData}
  readOnly={true}
  showToolbar={false}
  showPropertiesPanel={false}
/>
```

### Tipos de Nodos Limitados
```tsx
<BpmnDiagram
  allowedNodeTypes={['start', 'task', 'end']}
  // Solo permite estos tipos
/>
```

### Integración con Backend
```tsx
const MyWorkflowEditor = () => {
  const [diagramData, setDiagramData] = useState('');
  
  // Cargar desde API
  useEffect(() => {
    loadDiagramFromApi().then(setDiagramData);
  }, []);
  
  // Guardar en API
  const handleSave = async (data: string) => {
    await saveDiagramToApi(data);
    setDiagramData(data);
  };
  
  return (
    <BpmnDiagram
      initialData={diagramData}
      onSave={handleSave}
    />
  );
};
```

## 📦 Archivos del Componente

```
bpmnDiagram/
├── BpmnDiagram.tsx              # Componente principal
├── BpmnDiagram.module.css       # Estilos principales
├── index.ts                     # Exports
├── nodes/                       # Nodos personalizados
│   ├── StartNode.tsx           
│   ├── EndNode.tsx             
│   ├── TaskNode.tsx            
│   └── DecisionNode.tsx        
├── components/                  # Componentes auxiliares
│   ├── Toolbar.tsx             
│   ├── Toolbar.module.css      
│   ├── PropertiesPanel.tsx     
│   └── PropertiesPanel.module.css
└── examples/                    # Ejemplos de uso
    └── BpmnDiagramExample.tsx   
```

## 🚀 Casos de Uso

1. **Editor de Procesos de Negocio**: Crear workflows empresariales
2. **Sistema de Aprobaciones**: Definir flujos de aprobación
3. **Gestión de Tareas**: Asignar responsabilidades y fechas
4. **Documentación de Procesos**: Visualizar procedimientos
5. **Automatización**: Base para sistemas de BPM

¡El componente está listo para ser utilizado en cualquier aplicación que requiera edición de diagramas BPMN! 🎉