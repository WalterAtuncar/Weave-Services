import React, { useEffect, useState } from 'react';

/**
 * 🔒 Componente de Gestión de Seguridad Empresarial
 * Maneja eventos de seguridad y alertas al usuario
 */
export const SecurityManager: React.FC = () => {
  const [securityAlert, setSecurityAlert] = useState<{
    show: boolean;
    type: 'warning' | 'danger';
    title: string;
    message: string;
    countdown?: number;
  }>({
    show: false,
    type: 'warning',
    title: '',
    message: ''
  });

  useEffect(() => {
    // 🔒 SEGURIDAD: Listener para eventos de logout forzado
    const handleForceLogout = (event: any) => {
      const { reason } = event.detail;
      
      let title = '🚨 Sesión Terminada';
      let message = '';
      
      switch (reason) {
        case 'token_expired':
          message = 'Su sesión ha expirado por seguridad. Debe iniciar sesión nuevamente.';
          break;
        case 'inactivity':
          message = 'Su sesión se cerró por inactividad (30 minutos). Por seguridad empresarial, debe autenticarse nuevamente.';
          break;
        case 'browser_session':
          message = 'Se detectó una nueva instancia del navegador. Por seguridad, debe iniciar sesión nuevamente.';
          break;
        case 'session_timeout':
          message = 'Su sesión excedió el tiempo máximo permitido (8 horas). Debe iniciar sesión nuevamente.';
          break;
        default:
          message = 'Su sesión se ha cerrado por razones de seguridad.';
      }
      
      setSecurityAlert({
        show: true,
        type: 'danger',
        title,
        message
      });

      // Auto-ocultar después de 10 segundos
      setTimeout(() => {
        setSecurityAlert(prev => ({ ...prev, show: false }));
      }, 10000);
    };

    // 🔒 SEGURIDAD: Listener para advertencias de inactividad
    const handleInactivityWarning = (event: any) => {
      const { timeRemaining } = event.detail;
      
      setSecurityAlert({
        show: true,
        type: 'warning',
        title: '⚠️ Advertencia de Inactividad',
        message: `Su sesión se cerrará en ${Math.ceil(timeRemaining / 60000)} minutos por inactividad. Realice alguna acción para mantener la sesión activa.`,
        countdown: timeRemaining
      });

      // Auto-ocultar después de 30 segundos
      setTimeout(() => {
        setSecurityAlert(prev => ({ ...prev, show: false }));
      }, 30000);
    };

    // Registrar event listeners
    window.addEventListener('auth:forceLogout', handleForceLogout);
    window.addEventListener('auth:inactivityWarning', handleInactivityWarning);

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('auth:forceLogout', handleForceLogout);
      window.removeEventListener('auth:inactivityWarning', handleInactivityWarning);
    };
  }, []);

  if (!securityAlert.show) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: securityAlert.type === 'danger' ? '#dc3545' : '#fd7e14',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            {securityAlert.title}
          </h4>
          <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
            {securityAlert.message}
          </p>
          {securityAlert.countdown && (
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
              <CountdownTimer 
                initialTime={securityAlert.countdown}
                onComplete={() => setSecurityAlert(prev => ({ ...prev, show: false }))}
              />
            </div>
          )}
        </div>
        <button
          onClick={() => setSecurityAlert(prev => ({ ...prev, show: false }))}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '12px',
            opacity: 0.8
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          ×
        </button>
      </div>
    </div>
  );
};

/**
 * Componente de contador regresivo
 */
const CountdownTimer: React.FC<{ 
  initialTime: number; 
  onComplete: () => void;
}> = ({ initialTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <span>
      Tiempo restante: {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};

export default SecurityManager;