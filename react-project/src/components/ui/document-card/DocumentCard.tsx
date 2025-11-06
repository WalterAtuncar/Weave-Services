import React from 'react';
import { MoreVertical, Edit, Trash2, Copy, Eye, Download, Share, FileText, Clock, CheckCircle, XCircle, Star, Shield, Activity, BookOpen } from 'lucide-react';
import { Documento } from '../../pages/Documentos/Documentos';
import { StatusBadge } from '../status-badge';
import { Button } from '../button';

import styles from './DocumentCard.module.css';

export interface DocumentCardProps {
  documento: Documento;
  onEdit?: (documento: Documento) => void;
  onDelete?: (documento: Documento) => void;
  onView?: (documento: Documento) => void;
  onDownload?: (documento: Documento) => void;
  onShare?: (documento: Documento) => void;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  documento,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onShare,
  className = ''
}) => {
  const [showActions, setShowActions] = React.useState(false);

  // Efecto para cerrar el menú cuando se hace clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActions) {
        const target = event.target as Element;
        if (!target.closest(`.${styles.actionsContainer}`)) {
          setShowActions(false);
        }
      }
    };

    if (showActions) {
      // Usar setTimeout para evitar que el clic que abre el menú lo cierre inmediatamente
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  // Obtener icono según el tipo de documento
  const getDocumentTypeIcon = () => {
    switch (documento.tipo) {
      case 'manual':
        return <FileText size={24} color="#ffffff" />;
      case 'politica':
        return <Shield size={24} color="#ffffff" />;
      case 'procedimiento':
        return <Activity size={24} color="#ffffff" />;
      case 'instructivo':
        return <BookOpen size={24} color="#ffffff" />;
      default:
        return <FileText size={24} color="#ffffff" />;
    }
  };

  // Determinar estado de documento basado en el estado
  const getDocumentoEstadoInfo = () => {
    switch (documento.estado) {
      case 'nuevo':
        return { 
          estado: 'NUEVO', 
          color: '#3b82f6', 
          icon: <Star size={14} color="#3b82f6" />,
          tooltip: 'Documento nuevo - Recién agregado al sistema'
        };
      case 'reciente':
        return { 
          estado: 'RECIENTE', 
          color: '#10b981', 
          icon: <Clock size={14} color="#10b981" />,
          tooltip: 'Documento reciente - Actualizado recientemente'
        };
      case 'favorito':
        return { 
          estado: 'FAVORITO', 
          color: '#f59e0b', 
          icon: <Star size={14} color="#f59e0b" />,
          tooltip: 'Documento favorito - Marcado como importante'
        };
      case 'participo':
        return { 
          estado: 'PARTICIPO', 
          color: '#8b5cf6', 
          icon: <CheckCircle size={14} color="#8b5cf6" />,
          tooltip: 'Documento en el que participas - Tienes acceso colaborativo'
        };
      default:
        return { 
          estado: 'NORMAL', 
          color: '#6b7280', 
          icon: null,
          tooltip: 'Documento estándar'
        };
    }
  };

  const estadoInfo = getDocumentoEstadoInfo();

  // Generar tooltip detallado para el documento
  const getDocumentTooltip = () => {
    const baseInfo = `Documento: ${documento.titulo}`;
    const tipoInfo = `Tipo: ${documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1)}`;
    const categoriaInfo = `Categoría: ${documento.categoria}`;
    const propietarioInfo = `Propietario: ${documento.propietario}`;
    const fechaInfo = `Fecha: ${new Date(documento.fecha).toLocaleDateString()}`;
    const estadoText = `Estado: ${estadoInfo.estado}`;

    return `${baseInfo}\n${tipoInfo}\n${categoriaInfo}\n${propietarioInfo}\n${fechaInfo}\n${estadoText}`;
  };

  const handleCardClick = () => {
    if (onView) {
      onView(documento);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setShowActions(false);
  };

  return (
    <div 
      className={`${styles.documentCard} ${className}`}
      onClick={handleCardClick}
      title={getDocumentTooltip()}
    >
      {/* Header with icon and status */}
      <div className={styles.cardHeader}>
        <div className={styles.iconAndTitle}>
          {getDocumentTypeIcon()}
          <div className={styles.titleContainer}>
            <h3 className={styles.documentTitle}>{documento.titulo}</h3>
            <span className={styles.documentCategory}>{documento.categoria}</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <StatusBadge
            status="active"
            size="s"
            className={styles.headerStatusBadge}
            title={`Tipo: ${documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1)}`}
          />

          {/* Indicador de estado del documento */}
          {estadoInfo.estado !== 'NORMAL' && (
            <div 
              className={styles.documentStatus}
              style={{ 
                backgroundColor: `${estadoInfo.color}15`,
                borderColor: estadoInfo.color,
                color: estadoInfo.color
              }}
              title={estadoInfo.tooltip}
            >
              {estadoInfo.icon}
            </div>
          )}
          
          <div className={styles.actionsContainer}>
            <Button
              variant="ghost"
              size="s"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className={styles.actionsButton}
              title="Acciones del documento"
            >
              <MoreVertical size={16} />
            </Button>

            {showActions && (
              <div className={styles.actionsMenu}>
                {onView && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onView(documento))}
                  >
                    <Eye size={16} />
                    Ver detalles
                  </button>
                )}
                {onDownload && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onDownload(documento))}
                  >
                    <Download size={16} />
                    Descargar
                  </button>
                )}
                {onShare && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onShare(documento))}
                  >
                    <Share size={16} />
                    Compartir
                  </button>
                )}
                {onEdit && (
                  <button
                    className={styles.actionItem}
                    onClick={(e) => handleActionClick(e, () => onEdit(documento))}
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                )}
                <button
                  className={styles.actionItem}
                  onClick={(e) => handleActionClick(e, () => {})}
                >
                  <Copy size={16} />
                  Duplicar
                </button>
                {onDelete && (
                  <button
                    className={`${styles.actionItem} ${styles.deleteAction}`}
                    onClick={(e) => handleActionClick(e, () => onDelete(documento))}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.documentMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Propietario:</span>
            <span className={styles.metaValue} title={`Propietario: ${documento.propietario}`}>
              {documento.propietario}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Fecha:</span>
            <span className={styles.metaValue} title={`Fecha de creación: ${new Date(documento.fecha).toLocaleDateString()}`}>
              {new Date(documento.fecha).toLocaleDateString()}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tipo:</span>
            <span className={styles.metaValue} title={`Tipo de documento: ${documento.tipo}`}>
              {documento.tipo.charAt(0).toUpperCase() + documento.tipo.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with additional info */}
      <div className={styles.cardFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.footerLabel}>Estado:</span>
          <span 
            className={styles.footerBadge}
            style={{ 
              backgroundColor: `${estadoInfo.color}15`,
              borderColor: estadoInfo.color,
              color: estadoInfo.color
            }}
          >
            {estadoInfo.estado}
          </span>
        </div>
      </div>
    </div>
  );
};