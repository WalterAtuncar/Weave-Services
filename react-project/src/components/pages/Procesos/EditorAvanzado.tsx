import React, { useState } from 'react';
import { 
  X, 
  Type, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Highlighter,
  Tag,
  Smile,
  MessageCircle,
  Printer,
  MoreHorizontal,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { ConfiguracionData } from './ConfiguracionCabecera';
import { ActividadesData } from './DefinicionActividades';
import styles from './Procesos.module.css';

interface EditorAvanzadoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { configuracion: ConfiguracionData; actividades: ActividadesData }) => void;
  configuracionData: ConfiguracionData;
  actividadesData: ActividadesData;
}

export const EditorAvanzado: React.FC<EditorAvanzadoProps> = ({
  isOpen,
  onClose,
  onSave,
  configuracionData,
  actividadesData
}) => {
  const { colors } = useTheme();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const toolbarButtons = [
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'bold', icon: Bold, label: 'Negrita' },
    { id: 'italic', icon: Italic, label: 'Cursiva' },
    { id: 'separator1', type: 'separator' },
    { id: 'align-left', icon: AlignLeft, label: 'Alinear izquierda' },
    { id: 'align-center', icon: AlignCenter, label: 'Centrar' },
    { id: 'align-right', icon: AlignRight, label: 'Alinear derecha' },
    { id: 'separator2', type: 'separator' },
    { id: 'link', icon: Link, label: 'Enlace' },
    { id: 'highlight', icon: Highlighter, label: 'Resaltar' },
    { id: 'tag', icon: Tag, label: 'Etiqueta' },
    { id: 'separator3', type: 'separator' },
    { id: 'emoji', icon: Smile, label: 'Emoji' },
    { id: 'comment', icon: MessageCircle, label: 'Comentario' },
    { id: 'print', icon: Printer, label: 'Imprimir' },
    { id: 'more', icon: MoreHorizontal, label: 'Más opciones' }
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId === selectedTool ? null : toolId);
  };

  const handleUndo = () => {
    setCanRedo(true);
  };

  const handleRedo = () => {
    setCanUndo(true);
  };

  const handleSave = () => {
    onSave({
      configuracion: configuracionData,
      actividades: actividadesData
    });
    setHasChanges(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ backgroundColor: colors.surface, maxWidth: '1400px' }}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ color: colors.text }}>
            Editor Avanzado - {configuracionData.nombre}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {/* Contenido del editor */}
          <div className={styles.toolbar}>
            <button className={styles.toolbarButton}><Bold size={16} /></button>
            <button className={styles.toolbarButton}><Italic size={16} /></button>
            <button className={styles.toolbarButton}><Link size={16} /></button>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.actionButton}>Cerrar</button>
          <button onClick={() => onSave({ configuracion: configuracionData, actividades: actividadesData })} className={styles.actionButton}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}; 