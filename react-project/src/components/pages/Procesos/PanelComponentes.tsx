import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Procesos.module.css';

interface PanelComponentesProps {
  isVisible: boolean;
  onToggle: () => void;
  onComponentSelect: (component: BpmnComponent) => void;
}

interface BpmnComponent {
  id: string;
  name: string;
  type: string;
  category: string;
  icon?: string;
}

const BPMN_COMPONENTS: { [category: string]: BpmnComponent[] } = {
  'Básicos': [
    { id: 'task', name: 'Tarea', type: 'task', category: 'Básicos' },
    { id: 'subprocess', name: 'Subproceso', type: 'subprocess', category: 'Básicos' },
    { id: 'call-activity', name: 'Actividad de llamada', type: 'call-activity', category: 'Básicos' }
  ],
  'Compuertas': [
    { id: 'exclusive-gateway', name: 'Compuerta exclusiva', type: 'gateway', category: 'Compuertas' },
    { id: 'parallel-gateway', name: 'Compuerta paralela', type: 'gateway', category: 'Compuertas' },
    { id: 'inclusive-gateway', name: 'Compuerta inclusiva', type: 'gateway', category: 'Compuertas' },
    { id: 'complex-gateway', name: 'Compuerta compleja', type: 'gateway', category: 'Compuertas' }
  ],
  'Eventos': [
    { id: 'start-event', name: 'Evento de inicio', type: 'event', category: 'Eventos' },
    { id: 'intermediate-event', name: 'Evento intermedio', type: 'event', category: 'Eventos' },
    { id: 'end-event', name: 'Evento de fin', type: 'event', category: 'Eventos' },
    { id: 'boundary-event', name: 'Evento límite', type: 'event', category: 'Eventos' }
  ],
  'Formas': [
    { id: 'pool', name: 'Pool', type: 'container', category: 'Formas' },
    { id: 'lane', name: 'Lane', type: 'container', category: 'Formas' },
    { id: 'text-annotation', name: 'Anotación de texto', type: 'annotation', category: 'Formas' }
  ],
  'Entidades': [
    { id: 'data-object', name: 'Objeto de datos', type: 'data', category: 'Entidades' },
    { id: 'data-store', name: 'Almacén de datos', type: 'data', category: 'Entidades' },
    { id: 'message', name: 'Mensaje', type: 'message', category: 'Entidades' }
  ]
};

export const PanelComponentes: React.FC<PanelComponentesProps> = ({
  isVisible,
  onToggle,
  onComponentSelect
}) => {
  const { colors } = useTheme();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Básicos', 'Compuertas'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleComponentClick = (component: BpmnComponent) => {
    onComponentSelect(component);
  };

  const getComponentIcon = (component: BpmnComponent): string => {
    switch (component.type) {
      case 'task':
        return '□';
      case 'gateway':
        return '◊';
      case 'event':
        return component.id.includes('start') ? '●' : 
               component.id.includes('end') ? '●' : '○';
      case 'container':
        return '▢';
      case 'data':
        return '📄';
      case 'message':
        return '✉';
      default:
        return '○';
    }
  };

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        right: '1rem',
        transform: 'translateY(-50%)',
        zIndex: 1000
      }}>
        <button
          onClick={onToggle}
          style={{
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '0.875rem',
            fontWeight: '500',
            writingMode: 'vertical-rl' as const,
            textOrientation: 'mixed' as const
          }}
        >
          Componentes
        </button>
      </div>
    );
  }

  return (
    <div className={styles.componentsPanel} style={{ 
      backgroundColor: colors.surface,
      borderColor: colors.border
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 className={styles.componentsTitle} style={{ color: colors.text }}>
          Componentes BPMN
        </h3>
        <button
          onClick={onToggle}
          className={styles.toolbarButton}
          style={{ color: colors.textSecondary }}
          title="Ocultar panel"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ 
        backgroundColor: colors.background,
        padding: '0.75rem',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
        border: `1px solid ${colors.border}`
      }}>
        <p style={{ 
          color: colors.textSecondary,
          margin: 0,
          fontSize: '0.75rem',
          lineHeight: '1.4'
        }}>
          Arrastra los componentes al área de diseño para construir tu diagrama BPMN.
        </p>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(BPMN_COMPONENTS).map(([category, components]) => (
          <div key={category} className={styles.componentCategory}>
            <button
              onClick={() => toggleCategory(category)}
              className={styles.categoryTitle}
              style={{ 
                color: colors.textSecondary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 0'
              }}
            >
              {expandedCategories.has(category) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              {category}
            </button>

            {expandedCategories.has(category) && (
              <div className={styles.categoryContent}>
                {components.map((component) => (
                  <div
                    key={component.id}
                    className={styles.componentItem}
                    style={{ 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                    onClick={() => handleComponentClick(component)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(component));
                    }}
                  >
                    <div style={{ 
                      fontSize: '1.2rem',
                      marginBottom: '0.25rem',
                      color: colors.primary
                    }}>
                      {getComponentIcon(component)}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                      {component.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: colors.background,
        borderRadius: '0.375rem',
        border: `1px solid ${colors.border}`
      }}>
        <h4 style={{ 
          color: colors.text,
          margin: '0 0 0.5rem 0',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          Acciones rápidas
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className={styles.actionButton}
            style={{ 
              backgroundColor: colors.primary,
              color: 'white',
              fontSize: '0.75rem',
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => {}}
          >
            Limpiar canvas
          </button>
          <button
            className={styles.actionButton}
            style={{ 
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontSize: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => {}}
          >
            Validar diagrama
          </button>
          <button
            className={styles.actionButton}
            style={{ 
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontSize: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => {}}
          >
            Exportar XML
          </button>
        </div>
      </div>
    </div>
  );
};