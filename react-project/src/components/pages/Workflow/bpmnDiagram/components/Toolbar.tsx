import React from 'react';
import { 
  Play, 
  Square, 
  CheckSquare, 
  Diamond,
  Save,
  CheckCircle,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { Button } from '../../../../ui/button';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  allowedNodeTypes: ('start' | 'end' | 'task' | 'decision')[];
  onSave: () => void;
  onValidate: () => void;
  onClear: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  allowedNodeTypes,
  onSave,
  onValidate,
  onClear,
  onExport,
  onImport
}) => {
  const { colors } = useTheme();

  // Configuración de nodos disponibles
  const nodeConfigs = {
    start: {
      type: 'start',
      icon: Play,
      label: 'Inicio',
      color: '#10B981',
      description: 'Punto de inicio del proceso'
    },
    end: {
      type: 'end',
      icon: Square,
      label: 'Fin',
      color: '#EF4444',
      description: 'Punto final del proceso'
    },
    task: {
      type: 'task',
      icon: CheckSquare,
      label: 'Tarea',
      color: '#3B82F6',
      description: 'Actividad a realizar'
    },
    decision: {
      type: 'decision',
      icon: Diamond,
      label: 'Decisión',
      color: '#F59E0B',
      description: 'Punto de decisión'
    }
  };

  // Manejar inicio de drag
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    
    // Agregar clase visual durante el drag
    event.currentTarget.classList.add('dragging');
  };

  // Manejar fin de drag
  const onDragEnd = (event: React.DragEvent) => {
    event.currentTarget.classList.remove('dragging');
  };

  return (
    <div 
      className={styles.toolbar}
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }}
    >
      {/* Sección de nodos */}
      <div className={styles.toolbarSection}>
        <h4 className={styles.sectionTitle} style={{ color: colors.text }}>
          Elementos BPMN
        </h4>
        <div className={styles.nodeList}>
          {allowedNodeTypes.map(nodeType => {
            const config = nodeConfigs[nodeType];
            const IconComponent = config.icon;
            
            return (
              <div
                key={nodeType}
                className={styles.nodeItem}
                draggable={true}
                onDragStart={(event) => onDragStart(event, nodeType)}
                onDragEnd={onDragEnd}
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }}
                title={config.description}
              >
                <div 
                  className={styles.nodeIcon}
                  style={{ backgroundColor: config.color }}
                >
                  <IconComponent size={16} color="white" />
                </div>
                <span 
                  className={styles.nodeLabel}
                  style={{ color: colors.text }}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Separador */}
      <div 
        className={styles.separator}
        style={{ backgroundColor: colors.border }}
      />

      {/* Sección de acciones */}
      <div className={styles.toolbarSection}>
        <h4 className={styles.sectionTitle} style={{ color: colors.text }}>
          Acciones
        </h4>
        <div className={styles.actionList}>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className={styles.actionButton}
          >
            <Save size={14} />
            Guardar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onValidate}
            className={styles.actionButton}
          >
            <CheckCircle size={14} />
            Validar
          </Button>

          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className={styles.actionButton}
            >
              <Download size={14} />
              Exportar
            </Button>
          )}

          {onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className={styles.actionButton}
            >
              <Upload size={14} />
              Importar
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className={`${styles.actionButton} ${styles.dangerButton}`}
            style={{ 
              borderColor: '#EF4444',
              color: '#EF4444'
            }}
          >
            <Trash2 size={14} />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className={styles.instructions} style={{ color: colors.textSecondary }}>
        <p className={styles.instructionText}>
          💡 Arrastra los elementos al canvas para crear tu diagrama
        </p>
      </div>
    </div>
  );
};

export default Toolbar;