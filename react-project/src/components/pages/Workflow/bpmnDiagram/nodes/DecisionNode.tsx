import React from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { BpmnNodeData } from '../BpmnDiagram';
import styles from '../BpmnDiagram.module.css';

const DecisionNode: React.FC<NodeProps<BpmnNodeData>> = ({ data, selected }) => {
  const { colors } = useTheme();

  return (
    <div
      className={`${styles.bpmnNode} ${styles.decisionNode} ${selected ? styles.selected : ''}`}
      style={{
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        color: '#FFFFFF',
      }}
      data-node-type="decision"
      data-resizable="true"
    >
      {/* Handle de entrada (arriba) */}
      <Handle
        type="target"
        position={Position.Top}
        className={styles.nodeHandle}
        style={{ 
          background: colors.primary,
          border: `2px solid ${colors.surface}`,
          transform: 'rotate(-45deg) translate(-50%, -50%)',
          top: '10px',
          left: '50%'
        }}
      />

      {/* Contenido rotado para contrarrestar la rotación del contenedor */}
      <div className={`${styles.decisionNodeContent} drag-handle`}>
        {data.label}
      </div>

      {/* Controles de resize - Configuración mínima */}
      <NodeResizer 
        isVisible={selected}
        minWidth={80}
        minHeight={80}
        keepAspectRatio={true}
      />

      {/* Handle de salida izquierda (Sí) */}
      <Handle
        type="source"
        position={Position.Left}
        id="yes"
        className={styles.nodeHandle}
        style={{ 
          background: colors.primary,
          border: `2px solid ${colors.surface}`,
          transform: 'rotate(-45deg) translate(-50%, -50%)',
          left: '10px',
          top: '50%'
        }}
      />

      {/* Handle de salida derecha (No) */}
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        className={styles.nodeHandle}
        style={{ 
          background: colors.primary,
          border: `2px solid ${colors.surface}`,
          transform: 'rotate(-45deg) translate(-50%, -50%)',
          right: '10px',
          top: '50%'
        }}
      />
    </div>
  );
};

export default DecisionNode;