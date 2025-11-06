import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button/button';
import { 
  Shield, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Crown,
  Clock,
  Eye,
  Edit3,
  MoreVertical
} from 'lucide-react';
import styles from './GovernanceCard.module.css';

// =============================================
// INTERFACES
// =============================================

export interface GovernanceCardProps {
  entidadId: number;
  organizacionId?: number;
  nombreEntidad?: string;
  nombreEmpresa?: string;
  tipoEntidadNombre?: string;
  nombre: string;
  tipo: string;
  codigo?: string;
  descripcion?: string;
  responsables?: string;
  alertas: number;
  propietario?: string;
  supervisor?: string;
  ejecutor?: string;
  activo: boolean;
  tieneGobernanza?: boolean;
  fechaUltimaActualizacion?: string;
  vencimientoProximo?: boolean;
  onViewDetails: () => void;
  onEdit?: () => void;
  onAssignGovernance?: () => void;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const GovernanceCard: React.FC<GovernanceCardProps> = ({
  entidadId,
  organizacionId,
  nombreEntidad,
  nombreEmpresa,
  tipoEntidadNombre,
  nombre,
  tipo,
  codigo,
  descripcion,
  responsables,
  alertas,
  propietario,
  supervisor,
  ejecutor,
  activo,
  tieneGobernanza = false,
  fechaUltimaActualizacion,
  vencimientoProximo = false,
  onViewDetails,
  onEdit,
  onAssignGovernance
}) => {
  const { colors } = useTheme();

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const getStatusColor = () => {
    if (!activo) return '#6b7280'; // Gris para inactivo
    if (!tieneGobernanza) return '#f59e0b'; // Ámbar para sin gobernanza
    if (vencimientoProximo) return '#f97316'; // Naranja para vencimiento próximo
    if (alertas > 0) return '#ef4444'; // Rojo para alertas
    return '#10b981'; // Verde para todo bien
  };

  const getStatusText = () => {
    if (!activo) return 'Inactivo';
    if (!tieneGobernanza) return 'Sin Gobernanza';
    if (vencimientoProximo) return 'Vence Pronto';
    if (alertas > 0) return `${alertas} Alerta${alertas > 1 ? 's' : ''}`;
    return 'Completo';
  };

  const getStatusIcon = () => {
    if (!activo) return <Clock size={16} />;
    if (!tieneGobernanza) return <AlertTriangle size={16} />;
    if (vencimientoProximo) return <Clock size={16} />;
    if (alertas > 0) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // =============================================
  // HANDLERS
  // =============================================

  const handleCardClick = (e: React.MouseEvent) => {
    // Solo abrir detalles si no se hizo clic en un botón
    if (!(e.target as HTMLElement).closest('button')) {
      onViewDetails();
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <div 
      className={styles.card}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${getStatusColor()}`
      }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className={styles.header}>
        {/* Nombre del gobierno - Ocupa todo el ancho */}
        <div className={styles.titleSection}>
          <h3 className={styles.title} style={{ color: colors.text }}>
            {nombre}
            {codigo && (
              <span className={styles.code} style={{ color: colors.textSecondary, marginLeft: '8px' }}>
                {codigo}
              </span>
            )}
          </h3>
        </div>
        
        {/* Segunda fila: Tipo y Status */}
        <div className={styles.secondaryInfo}>
          <div className={styles.type} style={{ color: colors.textSecondary }}>
            {tipo}
          </div>
          <div className={styles.status}>
            <div 
              className={styles.statusBadge}
              style={{
                backgroundColor: `${getStatusColor()}15`,
                color: getStatusColor()
              }}
            >
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción (si existe) */}
      {descripcion && (
        <div className={styles.description} style={{ color: colors.textSecondary }}>
          {descripcion}
        </div>
      )}

      {/* Información de Empresa y Entidad */}
      <div className={styles.idsInfo} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2px', 
        padding: '4px 0',
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: '500' }}>
            Empresa:
          </span>
          <span style={{ fontSize: '12px', color: colors.text, fontWeight: '600' }}>
            {nombreEmpresa || 'N/A'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: '500' }}>
            Tipo de Entidad:
          </span>
          <span style={{ fontSize: '12px', color: colors.text, fontWeight: '600' }}>
            {tipoEntidadNombre || 'N/A'}
          </span>
        </div>
      </div>

      {/* Información de Gobernanza */}
      <div className={styles.governanceInfo}>
        {/* Propietario */}
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>
            <Crown size={16} color={colors.textSecondary} />
          </div>
          <div className={styles.infoContent}>
            <span className={styles.infoLabel} style={{ color: colors.textSecondary }}>
              👑 Propietario:
            </span>
            <span className={styles.infoValue} style={{ color: colors.text }}>
              {propietario || 'Sin asignar'}
            </span>
          </div>
        </div>

        {/* Supervisor */}
        {supervisor && (
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <User size={16} color={colors.textSecondary} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel} style={{ color: colors.textSecondary }}>
                👨‍💼 Supervisor:
              </span>
              <span className={styles.infoValue} style={{ color: colors.text }}>
                {supervisor}
              </span>
            </div>
          </div>
        )}

        {/* Ejecutor */}
        {ejecutor && (
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <Shield size={16} color={colors.textSecondary} />
            </div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel} style={{ color: colors.textSecondary }}>
                ⚙️ Ejecutor:
              </span>
              <span className={styles.infoValue} style={{ color: colors.text }}>
                {ejecutor}
              </span>
            </div>
          </div>
        )}


      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.lastUpdate} style={{ color: colors.textSecondary }}>
          Actualización: {formatDate(fechaUltimaActualizacion)}
        </div>

        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="s"
            iconName="Eye"
            onClick={onViewDetails}
            title="Ver detalles"
          />

          {onEdit && (
            <button
              onClick={onEdit}
              title="Editar"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit3 size={16} color="#F59E0B" />
            </button>
          )}

          {!tieneGobernanza && onAssignGovernance && (
            <Button
              variant="outline"
              size="s"
              iconName="Shield"
              onClick={onAssignGovernance}
              title="Asignar gobierno"
            >
              Asignar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};