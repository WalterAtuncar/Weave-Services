import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button';
import { Input } from '../input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../select';
import { 
  Save, 
  Globe, 
  Shield, 
  Bell, 
  Settings,
  Database,
  Zap
} from 'lucide-react';
import { 
  getConfiguracionGeneral, 
  actualizarConfiguracionGeneral,
  ConfiguracionGeneral 
} from '../../../mocks/gobernanzaMocks';
import { AlertService } from '../alerts/AlertService';

interface GeneralConfigTabProps {
  onDataChange: (hasChanges: boolean) => void;
}

export const GeneralConfigTab: React.FC<GeneralConfigTabProps> = ({ onDataChange }) => {
  const { colors } = useTheme();
  const [config, setConfig] = useState<ConfiguracionGeneral | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<'sistema' | 'gobernanza' | 'seguridad' | 'notificaciones' | 'integraciones'>('sistema');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = () => {
    const configData = getConfiguracionGeneral();
    setConfig(configData);
  };

  const handleConfigChange = (section: string, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => {
      const newConfig = { ...prev! };
      const sectionConfig = { ...newConfig.configuracion[section as keyof typeof newConfig.configuracion] };
      (sectionConfig as any)[field] = value;
      
      return {
        ...newConfig,
        configuracion: {
          ...newConfig.configuracion,
          [section]: sectionConfig
        }
      };
    });
    
    setHasChanges(true);
    onDataChange(true);
  };

  const handleSaveConfiguration = async () => {
    if (!config) return;
    
    try {
      actualizarConfiguracionGeneral(config.configuracion);
      setHasChanges(false);
      onDataChange(false);
      AlertService.success('Configuración guardada exitosamente');
    } catch (error) {
      AlertService.error('Error al guardar la configuración');
    }
  };

  const sections = [
    { id: 'sistema', label: 'Sistema', icon: <Settings size={16} />, description: 'Configuración general del sistema' },
    { id: 'gobernanza', label: 'Gobierno', icon: <Shield size={16} />, description: 'Configuración de gobierno' },
    { id: 'seguridad', label: 'Seguridad', icon: <Shield size={16} />, description: 'Configuración de seguridad' },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={16} />, description: 'Configuración de notificaciones' },
    { id: 'integraciones', label: 'Integraciones', icon: <Zap size={16} />, description: 'Configuración de integraciones' }
  ];

  const renderSectionNavigation = () => (
    <div style={{ 
      display: 'flex', 
      gap: '4px',
      marginBottom: '20px',
      borderBottom: `1px solid ${colors.border}`,
      paddingBottom: '12px'
    }}>
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id as any)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: activeSection === section.id ? colors.primary + '10' : 'transparent',
            color: activeSection === section.id ? colors.primary : colors.text,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (activeSection !== section.id) {
              e.currentTarget.style.backgroundColor = colors.surface;
            }
          }}
          onMouseLeave={(e) => {
            if (activeSection !== section.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {section.icon}
          {section.label}
        </button>
      ))}
    </div>
  );

  const renderSistemaConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Nombre del Sistema
          </label>
          <Input
            value={config?.configuracion.sistema.nombre || ''}
            onChange={(e) => handleConfigChange('sistema', 'nombre', e.target.value)}
            placeholder="Nombre del sistema"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Versión
          </label>
          <Input
            value={config?.configuracion.sistema.version || ''}
            onChange={(e) => handleConfigChange('sistema', 'version', e.target.value)}
            placeholder="1.0.0"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Idioma
          </label>
          <Select
            value={config?.configuracion.sistema.idioma || 'ES'}
            onValueChange={(value) => handleConfigChange('sistema', 'idioma', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ES">Español</SelectItem>
              <SelectItem value="EN">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Tema
          </label>
          <Select
            value={config?.configuracion.sistema.tema || 'CLARO'}
            onValueChange={(value) => handleConfigChange('sistema', 'tema', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLARO">Claro</SelectItem>
              <SelectItem value="OSCURO">Oscuro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Zona Horaria
          </label>
          <Input
            value={config?.configuracion.sistema.timezone || ''}
            onChange={(e) => handleConfigChange('sistema', 'timezone', e.target.value)}
            placeholder="America/Lima"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Formato de Fecha
          </label>
          <Select
            value={config?.configuracion.sistema.fechaFormato || 'DD/MM/YYYY'}
            onValueChange={(value) => handleConfigChange('sistema', 'fechaFormato', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderGobernanzaConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.gobernanza.requiereAprobacion || false}
              onChange={(e) => handleConfigChange('gobernanza', 'requiereAprobacion', e.target.checked)}
            />
            Requiere aprobación para asignaciones
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.gobernanza.permiteDelegacion || false}
              onChange={(e) => handleConfigChange('gobernanza', 'permiteDelegacion', e.target.checked)}
            />
            Permite delegación de roles
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Tiempo límite para asignación (horas)
          </label>
          <Input
            type="number"
            value={config?.configuracion.gobernanza.limiteTiempoAsignacion || 72}
            onChange={(e) => handleConfigChange('gobernanza', 'limiteTiempoAsignacion', parseInt(e.target.value))}
            placeholder="72"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Días de alerta antes del vencimiento
          </label>
          <Input
            type="number"
            value={config?.configuracion.gobernanza.diasAlertaVencimiento || 30}
            onChange={(e) => handleConfigChange('gobernanza', 'diasAlertaVencimiento', parseInt(e.target.value))}
            placeholder="30"
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.gobernanza.alertasVencimiento || false}
              onChange={(e) => handleConfigChange('gobernanza', 'alertasVencimiento', e.target.checked)}
            />
            Alertas de vencimiento activas
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.gobernanza.escalamientoAutomatico || false}
              onChange={(e) => handleConfigChange('gobernanza', 'escalamientoAutomatico', e.target.checked)}
            />
            Escalamiento automático
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Horas para escalamiento
          </label>
          <Input
            type="number"
            value={config?.configuracion.gobernanza.horasEscalamiento || 48}
            onChange={(e) => handleConfigChange('gobernanza', 'horasEscalamiento', parseInt(e.target.value))}
            placeholder="48"
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.gobernanza.permiteMultiplesRoles || false}
              onChange={(e) => handleConfigChange('gobernanza', 'permiteMultiplesRoles', e.target.checked)}
            />
            Permite múltiples roles por usuario
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Retención de historial (días)
          </label>
          <Input
            type="number"
            value={config?.configuracion.gobernanza.retencionHistorial || 365}
            onChange={(e) => handleConfigChange('gobernanza', 'retencionHistorial', parseInt(e.target.value))}
            placeholder="365"
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.gobernanza.logHistorial || false}
              onChange={(e) => handleConfigChange('gobernanza', 'logHistorial', e.target.checked)}
            />
            Registrar historial de cambios
          </label>
        </div>
      </div>
    </div>
  );

  const renderSeguridadConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Timeout de sesión (minutos)
          </label>
          <Input
            type="number"
            value={config?.configuracion.seguridad.sesionTimeout || 480}
            onChange={(e) => handleConfigChange('seguridad', 'sesionTimeout', parseInt(e.target.value))}
            placeholder="480"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Máximo intentos de login
          </label>
          <Input
            type="number"
            value={config?.configuracion.seguridad.intentosLoginMax || 3}
            onChange={(e) => handleConfigChange('seguridad', 'intentosLoginMax', parseInt(e.target.value))}
            placeholder="3"
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.seguridad.passwordComplexidad || false}
              onChange={(e) => handleConfigChange('seguridad', 'passwordComplexidad', e.target.checked)}
            />
            Contraseña compleja requerida
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.seguridad.dobleFactorAuth || false}
              onChange={(e) => handleConfigChange('seguridad', 'dobleFactorAuth', e.target.checked)}
            />
            Autenticación de doble factor
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.seguridad.auditoria || false}
              onChange={(e) => handleConfigChange('seguridad', 'auditoria', e.target.checked)}
            />
            Auditoría activada
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.seguridad.encriptacion || false}
              onChange={(e) => handleConfigChange('seguridad', 'encriptacion', e.target.checked)}
            />
            Encriptación de datos
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificacionesConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Servidor de Email
          </label>
          <Input
            value={config?.configuracion.notificaciones.emailServidor || ''}
            onChange={(e) => handleConfigChange('notificaciones', 'emailServidor', e.target.value)}
            placeholder="smtp.empresa.com"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Puerto de Email
          </label>
          <Input
            type="number"
            value={config?.configuracion.notificaciones.emailPuerto || 587}
            onChange={(e) => handleConfigChange('notificaciones', 'emailPuerto', parseInt(e.target.value))}
            placeholder="587"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Usuario de Email
          </label>
          <Input
            value={config?.configuracion.notificaciones.emailUsuario || ''}
            onChange={(e) => handleConfigChange('notificaciones', 'emailUsuario', e.target.value)}
            placeholder="notificaciones@empresa.com"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Contraseña de Email
          </label>
          <Input
            type="password"
            value={config?.configuracion.notificaciones.emailPassword || ''}
            onChange={(e) => handleConfigChange('notificaciones', 'emailPassword', e.target.value)}
            placeholder="***"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Proveedor SMS
          </label>
          <Input
            value={config?.configuracion.notificaciones.smsProveedor || ''}
            onChange={(e) => handleConfigChange('notificaciones', 'smsProveedor', e.target.value)}
            placeholder="TwilioSMS"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            API Key SMS
          </label>
          <Input
            type="password"
            value={config?.configuracion.notificaciones.smsApiKey || ''}
            onChange={(e) => handleConfigChange('notificaciones', 'smsApiKey', e.target.value)}
            placeholder="***"
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.notificaciones.pushNotifications || false}
              onChange={(e) => handleConfigChange('notificaciones', 'pushNotifications', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegracionesConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.integraciones.activeDirectory || false}
              onChange={(e) => handleConfigChange('integraciones', 'activeDirectory', e.target.checked)}
            />
            Active Directory
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.integraciones.ldap || false}
              onChange={(e) => handleConfigChange('integraciones', 'ldap', e.target.checked)}
            />
            LDAP
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.integraciones.sso || false}
              onChange={(e) => handleConfigChange('integraciones', 'sso', e.target.checked)}
            />
            Single Sign-On (SSO)
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.integraciones.api || false}
              onChange={(e) => handleConfigChange('integraciones', 'api', e.target.checked)}
            />
            API REST
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={config?.configuracion.integraciones.webhook || false}
              onChange={(e) => handleConfigChange('integraciones', 'webhook', e.target.checked)}
            />
            Webhooks
          </label>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'sistema':
        return renderSistemaConfig();
      case 'gobernanza':
        return renderGobernanzaConfig();
      case 'seguridad':
        return renderSeguridadConfig();
      case 'notificaciones':
        return renderNotificacionesConfig();
      case 'integraciones':
        return renderIntegracionesConfig();
      default:
        return null;
    }
  };

  if (!config) {
    return <div style={{ color: colors.text }}>Cargando configuración...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h4 style={{ color: colors.text, margin: 0 }}>Configuración General</h4>
        {hasChanges && (
          <Button 
            variant="default" 
            onClick={handleSaveConfiguration}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            Guardar Cambios
          </Button>
        )}
      </div>

      {renderSectionNavigation()}
      
      <div style={{ 
        backgroundColor: colors.surface,
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h5 style={{ 
            color: colors.text, 
            margin: '0 0 4px 0',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {sections.find(s => s.id === activeSection)?.label}
          </h5>
          <p style={{ 
            color: colors.textSecondary, 
            margin: '0',
            fontSize: '14px'
          }}>
            {sections.find(s => s.id === activeSection)?.description}
          </p>
        </div>

        {renderActiveSection()}
      </div>
    </div>
  );
};