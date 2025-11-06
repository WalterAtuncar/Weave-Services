// Exportar el componente principal
export { default } from './BpmnDiagram';
export { default as BpmnDiagram } from './BpmnDiagram';

// Exportar tipos para uso externo
export type {
  BpmnNodeData,
  BpmnDiagramData,
  BpmnDiagramProps
} from './BpmnDiagram';

// Exportar componentes auxiliares si se necesitan usar por separado
export { default as Toolbar } from './components/Toolbar';
export { default as PropertiesPanel } from './components/PropertiesPanel';

// Exportar nodos personalizados si se necesitan extender
export { default as StartNode } from './nodes/StartNode';
export { default as EndNode } from './nodes/EndNode';
export { default as TaskNode } from './nodes/TaskNode';
export { default as DecisionNode } from './nodes/DecisionNode';