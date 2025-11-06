import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { CheckSquare, User, Calendar } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { BpmnNodeData } from '../BpmnDiagram';
import styles from '../BpmnDiagram.module.css';

const TaskNode: React.FC<NodeProps<BpmnNodeData>> = ({ data, selected }) => {
  const { colors } = useTheme();

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Determinar color de estado basado en fecha de vencimiento
  const getStatusColor = () => {
    if (!data.dueDate) return colors.border;
    
    const today = new Date();
    const dueDate = new Date(data.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#EF4444'; // Vencido - Rojo
    if (diffDays <= 3) return '#F59E0B'; // Próximo a vencer - Amarillo
    return '#10B981'; // En tiempo - Verde
  };

  return (
    <div
      className={`${styles.bpmnNode} ${styles.taskNode} ${selected ? styles.selected : ''}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: getStatusColor(),
        color: colors.text,
        borderWidth: '2px',
      }}
      data-node-type="task"
      data-resizable="true"
    >
      {/* Handle de entrada */}
      <Handle
        type="target"
        position={Position.Top}
        className={styles.nodeHandle}
        style={{ 
          background: colors.primary,
          border: `2px solid ${colors.surface}`
        }}
      />

      {/* Contenido del nodo */}
      <div className={`${styles.taskNodeHeader} drag-handle`}>
        <CheckSquare size={16} color={colors.primary} />
        <span className={styles.taskNodeLabel}>
          {data.label}
        </span>
      </div>

      {/* Información adicional */}
      <div className={styles.taskNodeMeta}>
        {data.assignee && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            marginBottom: '2px',
            justifyContent: 'center'
          }}>
            <User size={10} />
            <span style={{ fontSize: '10px' }}>
              {data.assignee}
            </span>
          </div>
        )}
        
        {data.dueDate && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            justifyContent: 'center'
          }}>
            <Calendar size={10} />
            <span style={{ 
              fontSize: '10px',
              color: getStatusColor(),
              fontWeight: '500'
            }}>
              {formatDate(data.dueDate)}
            </span>
          </div>
        )}

        {!data.assignee && !data.dueDate && (
          <span style={{ 
            fontSize: '10px', 
            color: colors.textSecondary,
            fontStyle: 'italic'
          }}>
            Sin configurar
          </span>
        )}
      </div>

      {/* Controles de resize - Configuración específica para task */}
      <NodeResizer 
        isVisible={selected}
        minWidth={120}
        minHeight={50}
        keepAspectRatio={false}
        handleClassName="task-resize-handle"
        lineClassName="task-resize-line"
      />

      {/* Handle de salida */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.nodeHandle}
        style={{ 
          background: colors.primary,
          border: `2px solid ${colors.surface}`
        }}
      />
    </div>
  );
};

export default TaskNode;