import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Square } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { BpmnNodeData } from '../BpmnDiagram';
import styles from '../BpmnDiagram.module.css';

const EndNode: React.FC<NodeProps<BpmnNodeData>> = ({ data, selected }) => {
  const { colors } = useTheme();

  return (
    <div
      className={`${styles.bpmnNode} ${styles.endNode} ${selected ? styles.selected : ''}`}
      style={{
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        color: '#FFFFFF',
      }}
      data-node-type="end"
      data-resizable="true"
    >
      <div className="drag-handle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <Square size={16} fill="currentColor" />
        <span style={{ fontSize: '10px', fontWeight: '600' }}>
          {data.label}
        </span>
      </div>
      
      {/* Controles de resize - Configuración mínima */}
      <NodeResizer 
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        keepAspectRatio={true}
      />
      
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
    </div>
  );
};

export default EndNode;