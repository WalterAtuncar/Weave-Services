import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Modal } from '../modal/Modal';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select } from '../select';
import { Textarea } from '../textarea/textarea';
import { Badge } from '../badge/badge';
import { 
  Shield, 
  User, 
  Crown, 
  Clock, 
  History, 
  Bell, 
  Plus,
  Edit3, 
  Trash2,
  UserPlus,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail
} from 'lucide-react';
import styles from './GovernanceDetailModal.module.css';

// =============================================
// INTERFACES
// =============================================

export interface GovernanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entidad: {
    entidadId: number;
    nombre: string;
    tipo: string;
    activo: boolean;
  };
  roles: Array<{
    gobernanzaId: number;
    rolId: number;
    rolNombre: string;
    rolCodigo: string;
    color: string;
    nivel: number;
    usuarioId: number;
    usuarioNombre: string;
    usuarioEmail: string;
    fechaAsignacion: string;
    fechaVencimiento?: string;
    observaciones: string;
    activo: boolean;
  }>;
  historial: Array<{
    historialId: number;
    tipoMovimiento: string;
    descripcion: string;
    fechaMovimiento: string;
    usuarioNombre: string;
  }>;
  notificaciones: Array<{
    notificacionId: number;
    tipo: string;
    mensaje: string;
    fechaCreacion: string;
    leida: boolean;
  }>;
  usuariosDisponibles: Array<{
    usuarioId: number;
    nombreCompleto: string;
    email: string;
  }>;
  rolesDisponibles: Array<{
    rolGobernanzaId: number;
    rolGobernanzaNombre: string;
    rolGobernanzaCodigo: string;
    color: string;
    nivel: number;
  }>;
  onAsignarRol: (rolId: number, usuarioId: number, fechaVencimiento?: string, observaciones?: string) => void;
  onTransferirRol: (gobernanzaId: number, nuevoUsuarioId: number, motivoTransferencia: string) => void;
  onRevocarRol: (gobernanzaId: number, motivoRevocacion: string) => void;
  onRenovarRol: (gobernanzaId: number, nuevaFechaVencimiento: string) => void;
  onMarcarNotificacionLeida: (notificacionId: number) => void;
}

interface TabType {
  id: 'roles' | 'historial' | 'notificaciones';
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface AsignacionForm {
  rolId: string;
  usuarioId: string;
  fechaVencimiento: string;
  observaciones: string;
}

interface TransferenciaForm {
  gobernanzaId: number;
  nuevoUsuarioId: string;
  motivoTransferencia: string;
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export const GovernanceDetailModal: React.FC<GovernanceDetailModalProps> = ({
  isOpen,
  onClose,
  entidad,
  roles,
  historial,
  notificaciones,
  usuariosDisponibles,
  rolesDisponibles,
  onAsignarRol,
  onTransferirRol,
  onRevocarRol,
  onRenovarRol,
  onMarcarNotificacionLeida
}) => {
  const { colors } = useTheme();

  // =============================================
  // ESTADO LOCAL
  // =============================================

  const [activeTab, setActiveTab] = useState<TabType['id']>('roles');
  const [showAsignacionForm, setShowAsignacionForm] = useState(false);
  const [showTransferenciaForm, setShowTransferenciaForm] = useState(false);
  const [selectedRolForTransfer, setSelectedRolForTransfer] = useState<number | null>(null);

  const [asignacionForm, setAsignacionForm] = useState<AsignacionForm>({
    rolId: '',
    usuarioId: '',
    fechaVencimiento: '',
    observaciones: ''
  });

  const [transferenciaForm, setTransferenciaForm] = useState<TransferenciaForm>({
    gobernanzaId: 0,
    nuevoUsuarioId: '',
    motivoTransferencia: ''
  });

  // =============================================
  // EFECTOS
  // =============================================

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('roles');
      setShowAsignacionForm(false);
      setShowTransferenciaForm(false);
      resetForms();
    }
  }, [isOpen]);

  // =============================================
  // FUNCIONES AUXILIARES
  // =============================================

  const resetForms = () => {
    setAsignacionForm({
      rolId: '',
      usuarioId: '',
      fechaVencimiento: '',
      observaciones: ''
    });
    setTransferenciaForm({
      gobernanzaId: 0,
      nuevoUsuarioId: '',
      motivoTransferencia: ''
    });
    setSelectedRolForTransfer(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRolVencido = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return false;
    return new Date(fechaVencimiento) < new Date();
  };

  const isRolPorVencer = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return false;
    const fechaVenc = new Date(fechaVencimiento);
    const hoy = new Date();
    const diferenciaDias = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diferenciaDias <= 30 && diferenciaDias > 0;
  };

  // =============================================
  // HANDLERS
  // =============================================

  const handleAsignarRol = () => {
    if (!asignacionForm.rolId || !asignacionForm.usuarioId) return;
    
    onAsignarRol(
      parseInt(asignacionForm.rolId),
      parseInt(asignacionForm.usuarioId),
      asignacionForm.fechaVencimiento || undefined,
      asignacionForm.observaciones || undefined
    );
    
    setShowAsignacionForm(false);
    resetForms();
  };

  const handleTransferirRol = () => {
    if (!transferenciaForm.nuevoUsuarioId || !transferenciaForm.motivoTransferencia) return;
    
    onTransferirRol(
      transferenciaForm.gobernanzaId,
      parseInt(transferenciaForm.nuevoUsuarioId),
      transferenciaForm.motivoTransferencia
    );
    
    setShowTransferenciaForm(false);
    resetForms();
  };

  const handleRevocarRol = (gobernanzaId: number) => {
    const motivo = prompt('Ingrese el motivo de la revocación:');
    if (motivo) {
      onRevocarRol(gobernanzaId, motivo);
    }
  };

  const handleRenovarRol = (gobernanzaId: number) => {
    const fechaInput = prompt('Ingrese la nueva fecha de vencimiento (YYYY-MM-DD):');
    if (fechaInput) {
      onRenovarRol(gobernanzaId, fechaInput);
    }
  };

  const iniciarTransferencia = (rol: any) => {
    setTransferenciaForm({
      gobernanzaId: rol.gobernanzaId,
      nuevoUsuarioId: '',
      motivoTransferencia: ''
    });
    setSelectedRolForTransfer(rol.gobernanzaId);
    setShowTransferenciaForm(true);
  };

  // =============================================
  // DEFINICIÓN DE TABS
  // =============================================

  const tabs: TabType[] = [
    {
      id: 'roles',
      label: 'Roles Asignados',
      icon: <Shield size={16} />,
      count: roles.length
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <History size={16} />,
      count: historial.length
    },
    {
      id: 'notificaciones',
      label: 'Notificaciones',
      icon: <Bell size={16} />,
      count: notificaciones.filter(n => !n.leida).length
    }
  ];

  // =============================================
  // RENDERIZADO DE CONTENIDO
  // =============================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return renderRolesTab();
      case 'historial':
        return renderHistorialTab();
      case 'notificaciones':
        return renderNotificacionesTab();
      default:
        return null;
    }
  };

  const renderRolesTab = () => (
    <div className={styles.tabContent}>
      {/* Header con botón de asignar */}
      <div className={styles.tabHeader}>
        <div>
          <h4 style={{ margin: 0, color: colors.text }}>Roles de Gobernanza</h4>
          <p style={{ margin: '4px 0 0 0', color: colors.textSecondary, fontSize: '14px' }}>
            Gestiona los roles asignados a esta entidad
          </p>
        </div>
        <Button
          variant="primary"
          size="s"
          iconName="Plus"
          onClick={() => setShowAsignacionForm(true)}
        >
          Asignar Rol
        </Button>
      </div>

      {/* Lista de roles */}
      <div className={styles.rolesList}>
        {roles.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield size={32} color={colors.textSecondary} />
            <p style={{ color: colors.textSecondary }}>No hay roles asignados</p>
          </div>
        ) : (
          roles.map((rol) => (
            <div key={rol.gobernanzaId} className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <div className={styles.roleInfo}>
                  <Badge
                    label={rol.rolNombre}
                    color={rol.color}
                    size="m"
                  />
                  <div className={styles.roleDetails}>
                    <span style={{ color: colors.text, fontWeight: '500' }}>
                      {rol.usuarioNombre}
                    </span>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      {rol.usuarioEmail}
                    </span>
                  </div>
                </div>
                
                <div className={styles.roleStatus}>
                  {isRolVencido(rol.fechaVencimiento) && (
                    <Badge label="Vencido" color="#ef4444" size="s" />
                  )}
                  {isRolPorVencer(rol.fechaVencimiento) && (
                    <Badge label="Por vencer" color="#f59e0b" size="s" />
                  )}
                  {rol.activo && !isRolVencido(rol.fechaVencimiento) && !isRolPorVencer(rol.fechaVencimiento) && (
                    <Badge label="Activo" color="#10b981" size="s" />
                  )}
                </div>
              </div>

              <div className={styles.roleMeta}>
                <div className={styles.roleMetaItem}>
                  <Calendar size={14} color={colors.textSecondary} />
                  <span>Asignado: {formatDate(rol.fechaAsignacion)}</span>
                </div>
                {rol.fechaVencimiento && (
                  <div className={styles.roleMetaItem}>
                    <Clock size={14} color={colors.textSecondary} />
                    <span>Vence: {formatDate(rol.fechaVencimiento)}</span>
                  </div>
                )}
              </div>

              {rol.observaciones && (
                <div className={styles.roleObservaciones}>
                  <strong>Observaciones:</strong> {rol.observaciones}
                </div>
              )}

              <div className={styles.roleActions}>
                <Button
                  variant="ghost"
                  size="s"
                  iconName="RotateCcw"
                  onClick={() => handleRenovarRol(rol.gobernanzaId)}
                  title="Renovar"
                />
                <Button
                  variant="ghost"
                  size="s"
                  iconName="UserPlus"
                  onClick={() => iniciarTransferencia(rol)}
                  title="Transferir"
                />
                <button
                  onClick={() => handleRevocarRol(rol.gobernanzaId)}
                  title="Revocar"
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
                  <Trash2 size={16} color="#EF4444" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario de asignación */}
      {showAsignacionForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formCard}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.text }}>Asignar Nuevo Rol</h4>
            
            <div className={styles.formGrid}>
              <Select
                label="Rol"
                value={asignacionForm.rolId}
                onChange={(value) => setAsignacionForm({ ...asignacionForm, rolId: value })}
                options={rolesDisponibles.map(rol => ({
                  value: rol.rolGobernanzaId.toString(),
                  label: rol.rolGobernanzaNombre
                }))}
                placeholder="Seleccionar rol"
              />

              <Select
                label="Usuario"
                value={asignacionForm.usuarioId}
                onChange={(value) => setAsignacionForm({ ...asignacionForm, usuarioId: value })}
                options={usuariosDisponibles.map(usuario => ({
                  value: usuario.usuarioId.toString(),
                  label: `${usuario.nombreCompleto} (${usuario.email})`
                }))}
                placeholder="Seleccionar usuario"
              />

              <Input
                label="Fecha de Vencimiento (opcional)"
                type="date"
                value={asignacionForm.fechaVencimiento}
                onChange={(e) => setAsignacionForm({ ...asignacionForm, fechaVencimiento: e.target.value })}
              />

              <Textarea
                label="Observaciones (opcional)"
                value={asignacionForm.observaciones}
                onChange={(e) => setAsignacionForm({ ...asignacionForm, observaciones: e.target.value })}
                rows={3}
              />
            </div>

            <div className={styles.formActions}>
              <Button
                variant="outline"
                onClick={() => setShowAsignacionForm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAsignarRol}
                disabled={!asignacionForm.rolId || !asignacionForm.usuarioId}
              >
                Asignar Rol
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de transferencia */}
      {showTransferenciaForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formCard}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.text }}>Transferir Rol</h4>
            
            <div className={styles.formGrid}>
              <Select
                label="Nuevo Usuario"
                value={transferenciaForm.nuevoUsuarioId}
                onChange={(value) => setTransferenciaForm({ ...transferenciaForm, nuevoUsuarioId: value })}
                options={usuariosDisponibles.map(usuario => ({
                  value: usuario.usuarioId.toString(),
                  label: `${usuario.nombreCompleto} (${usuario.email})`
                }))}
                placeholder="Seleccionar nuevo usuario"
              />

              <Textarea
                label="Motivo de la Transferencia"
                value={transferenciaForm.motivoTransferencia}
                onChange={(e) => setTransferenciaForm({ ...transferenciaForm, motivoTransferencia: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className={styles.formActions}>
              <Button
                variant="outline"
                onClick={() => setShowTransferenciaForm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleTransferirRol}
                disabled={!transferenciaForm.nuevoUsuarioId || !transferenciaForm.motivoTransferencia}
              >
                Transferir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistorialTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <h4 style={{ margin: 0, color: colors.text }}>Historial de Cambios</h4>
          <p style={{ margin: '4px 0 0 0', color: colors.textSecondary, fontSize: '14px' }}>
            Registro completo de movimientos de gobernanza
          </p>
        </div>
      </div>

      <div className={styles.historialList}>
        {historial.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={32} color={colors.textSecondary} />
            <p style={{ color: colors.textSecondary }}>No hay historial disponible</p>
          </div>
        ) : (
          historial.map((item) => (
            <div key={item.historialId} className={styles.historialItem}>
              <div className={styles.historialIcon}>
                <History size={16} color={colors.primary} />
              </div>
              <div className={styles.historialContent}>
                <div className={styles.historialDescription}>
                  {item.descripcion}
                </div>
                <div className={styles.historialMeta}>
                  <span>{item.usuarioNombre}</span>
                  <span>•</span>
                  <span>{formatDateTime(item.fechaMovimiento)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderNotificacionesTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <h4 style={{ margin: 0, color: colors.text }}>Notificaciones</h4>
          <p style={{ margin: '4px 0 0 0', color: colors.textSecondary, fontSize: '14px' }}>
            Alertas y notificaciones relacionadas con la gobernanza
          </p>
        </div>
      </div>

      <div className={styles.notificacionesList}>
        {notificaciones.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={32} color={colors.textSecondary} />
            <p style={{ color: colors.textSecondary }}>No hay notificaciones</p>
          </div>
        ) : (
          notificaciones.map((notificacion) => (
            <div
              key={notificacion.notificacionId}
              className={`${styles.notificacionItem} ${notificacion.leida ? styles.leida : styles.noLeida}`}
            >
              <div className={styles.notificacionIcon}>
                <Bell size={16} color={notificacion.leida ? colors.textSecondary : colors.primary} />
              </div>
              <div className={styles.notificacionContent}>
                <div className={styles.notificacionMensaje}>
                  {notificacion.mensaje}
                </div>
                <div className={styles.notificacionMeta}>
                  <span>{formatDateTime(notificacion.fechaCreacion)}</span>
                  {!notificacion.leida && (
                    <Button
                      variant="ghost"
                      size="s"
                      onClick={() => onMarcarNotificacionLeida(notificacion.notificacionId)}
                    >
                      Marcar como leída
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // =============================================
  // RENDER PRINCIPAL
  // =============================================

  return (
    <Modal
      title={`Gobernanza - ${entidad.nombre}`}
      subtitle={`${entidad.tipo} • ${entidad.activo ? 'Activo' : 'Inactivo'}`}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      hideFooter={true}
    >
      <div className={styles.container}>
        {/* Navegación de tabs */}
        <div className={styles.tabNavigation}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                borderBottomColor: activeTab === tab.id ? colors.primary : 'transparent'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {(tab.count ?? 0) > 0 && (
                <span className={styles.tabCount}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido del tab activo */}
        <div className={styles.tabContentContainer}>
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
}; 