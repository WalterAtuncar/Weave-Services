import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { 
  X, 
  Tag,
  User,
  Calendar,
  FileText,
  Trash2,
  Save
} from 'lucide-react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Textarea } from '../../../../ui/textarea';
import { BpmnNodeData } from '../BpmnDiagram';
import styles from './PropertiesPanel.module.css';

interface PropertiesPanelProps {
  selectedNode: Node<BpmnNodeData> | null;
  onUpdateNode: (updates: Partial<BpmnNodeData>) => void;
  onDeleteNode: () => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onClose
}) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState<Partial<BpmnNodeData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Actualizar form data cuando cambia el nodo seleccionado
  useEffect(() => {
    if (selectedNode) {
      setFormData({
        label: selectedNode.data.label || '',
        description: selectedNode.data.description || '',
        assignee: selectedNode.data.assignee || '',
        dueDate: selectedNode.data.dueDate || '',
      });
      setHasChanges(false);
    }
  }, [selectedNode]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof BpmnNodeData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Guardar cambios
  const handleSave = () => {
    if (selectedNode && hasChanges) {
      onUpdateNode(formData);
      setHasChanges(false);
    }
  };

  // Confirmar eliminación
  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      onDeleteNode();
    }
  };

  // Obtener configuración del tipo de nodo
  const getNodeTypeConfig = (type: string) => {
    switch (type) {
      case 'start':
        return {
          title: 'Nodo de Inicio',
          icon: '🟢',
          description: 'Punto de inicio del proceso',
          canEdit: ['label', 'description']
        };
      case 'end':
        return {
          title: 'Nodo de Fin',
          icon: '🔴',
          description: 'Punto final del proceso',
          canEdit: ['label', 'description']
        };
      case 'task':
        return {
          title: 'Tarea',
          icon: '📋',
          description: 'Actividad a realizar',
          canEdit: ['label', 'description', 'assignee', 'dueDate']
        };
      case 'decision':
        return {
          title: 'Decisión',
          icon: '🔶',
          description: 'Punto de decisión',
          canEdit: ['label', 'description']
        };
      default:
        return {
          title: 'Elemento',
          icon: '⚪',
          description: 'Elemento del diagrama',
          canEdit: ['label', 'description']
        };
    }
  };

  if (!selectedNode) {
    return (
      <div 
        className={styles.propertiesPanel}
        style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }}
      >
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3 className={styles.emptyTitle} style={{ color: colors.text }}>
            Selecciona un elemento
          </h3>
          <p className={styles.emptyDescription} style={{ color: colors.textSecondary }}>
            Haz clic en cualquier elemento del diagrama para ver y editar sus propiedades.
          </p>
        </div>
      </div>
    );
  }

  const nodeConfig = getNodeTypeConfig(selectedNode.data.type);

  return (
    <div 
      className={styles.propertiesPanel}
      style={{ 
        backgroundColor: colors.surface,
        borderColor: colors.border 
      }}
    >
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.headerContent}>
          <div className={styles.nodeTypeInfo}>
            <span className={styles.nodeTypeIcon}>{nodeConfig.icon}</span>
            <div>
              <h3 className={styles.nodeTypeTitle} style={{ color: colors.text }}>
                {nodeConfig.title}
              </h3>
              <p className={styles.nodeTypeDescription} style={{ color: colors.textSecondary }}>
                {nodeConfig.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className={styles.panelContent}>
        <div className={styles.formSection}>
          {/* Etiqueta */}
          {nodeConfig.canEdit.includes('label') && (
            <div className={styles.formField}>
              <label className={styles.fieldLabel} style={{ color: colors.text }}>
                <Tag size={14} />
                Etiqueta
              </label>
              <Input
                value={formData.label || ''}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="Ingresa la etiqueta..."
                className={styles.fieldInput}
              />
            </div>
          )}

          {/* Descripción */}
          {nodeConfig.canEdit.includes('description') && (
            <div className={styles.formField}>
              <label className={styles.fieldLabel} style={{ color: colors.text }}>
                <FileText size={14} />
                Descripción
              </label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe este elemento..."
                rows={3}
                className={styles.fieldInput}
              />
            </div>
          )}

          {/* Campos específicos para tareas */}
          {selectedNode.data.type === 'task' && (
            <>
              {/* Responsable */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel} style={{ color: colors.text }}>
                  <User size={14} />
                  Responsable
                </label>
                <Input
                  value={formData.assignee || ''}
                  onChange={(e) => handleInputChange('assignee', e.target.value)}
                  placeholder="Asignar responsable..."
                  className={styles.fieldInput}
                />
              </div>

              {/* Fecha de vencimiento */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel} style={{ color: colors.text }}>
                  <Calendar size={14} />
                  Fecha de vencimiento
                </label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={styles.fieldInput}
                />
              </div>
            </>
          )}
        </div>

        {/* Información del nodo */}
        <div className={styles.nodeInfo}>
          <h4 className={styles.infoTitle} style={{ color: colors.text }}>
            Información del elemento
          </h4>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel} style={{ color: colors.textSecondary }}>
              ID:
            </span>
            <span className={styles.infoValue} style={{ color: colors.text }}>
              {selectedNode.id}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel} style={{ color: colors.textSecondary }}>
              Tipo:
            </span>
            <span className={styles.infoValue} style={{ color: colors.text }}>
              {selectedNode.data.type}
            </span>
          </div>
          {selectedNode.data.createdAt && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel} style={{ color: colors.textSecondary }}>
                Creado:
              </span>
              <span className={styles.infoValue} style={{ color: colors.text }}>
                {new Date(selectedNode.data.createdAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con acciones */}
      <div className={styles.panelFooter}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges}
          className={styles.footerButton}
        >
          <Save size={14} />
          {hasChanges ? 'Guardar cambios' : 'Guardado'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className={`${styles.footerButton} ${styles.deleteButton}`}
          style={{ 
            borderColor: '#EF4444',
            color: '#EF4444'
          }}
        >
          <Trash2 size={14} />
          Eliminar
        </Button>
      </div>
    </div>
  );
};

export default PropertiesPanel;