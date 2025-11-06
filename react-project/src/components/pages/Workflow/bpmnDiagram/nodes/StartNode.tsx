import React, { useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Play } from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { BpmnNodeData } from '../BpmnDiagram';
import styles from '../BpmnDiagram.module.css';

const StartNode: React.FC<NodeProps<BpmnNodeData>> = ({ data, selected }) => {
  const { colors } = useTheme();

  const onResizeStart = useCallback(() => {
  }, []);

  const onResize = useCallback((event: any, data: any) => {
  }, []);

  const onResizeEnd = useCallback(() => {
  }, []);

  return (
    <div
      className={`${styles.bpmnNode} ${styles.startNode} ${selected ? styles.selected : ''}`}
      style={{
        backgroundColor: '#10B981',
        borderColor: '#059669',
        color: '#FFFFFF',
      }}
      data-node-type="start"
      data-resizable="true"
    >
      <div className="drag-handle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <Play size={16} fill="currentColor" />
        <span style={{ fontSize: '10px', fontWeight: '600' }}>
          {data.label}
        </span>
      </div>
      
      {/* Controles de resize - Con handlers explícitos */}
      <NodeResizer 
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        keepAspectRatio={true}
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        shouldResize={() => {
          return true;
        }}
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

export default StartNode;