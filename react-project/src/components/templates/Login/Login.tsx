import { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { authService, federatedAuthService } from '@/services';
import { LoginRequest, ValidarAdResponseData } from '../../../services/types/auth.types';
import { AlertService } from '../../ui/alerts/AlertService';
import { ErrorHandler } from '../../../utils/errorHandler';
import './Login.css';

interface LoginProps {
  onSuccess: () => void;
  onForgotPassword?: () => void;
}

export const Login = ({ onSuccess, onForgotPassword }: LoginProps) => {
  const { colors } = useTheme();
  const [credentials, setCredentials] = useState({
    nombreUsuario: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFederatedLoading, setIsFederatedLoading] = useState(false);
  const [authAD, setAuthAD] = useState(false);
  const [adConfig, setAdConfig] = useState<ValidarAdResponseData | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Validación del formulario
  const isFormValid = authAD 
    ? credentials.nombreUsuario.trim() !== '' // Solo requiere usuario para AD
    : credentials.nombreUsuario.trim() !== '' && credentials.password.trim() !== ''; // Requiere ambos para login tradicional

  // Función para validar dominio AD cuando el usuario sale del campo
  const handleUsuarioBlur = async () => {
    const usuario = credentials.nombreUsuario.trim();
    
    // Verificar si el valor contiene '@' (es un email)
    if (usuario.includes('@')) {
      const partes = usuario.split('@');
      
      // Tomar el segundo valor (dominio) si existe
      if (partes.length >= 2) {
        const dominio = partes[1].trim();
        
        if (dominio) {
    
          
          try {
            const response = await authService.validarConfiguracionAd(dominio);
    
            
            if (response.success && response.data && response.data.esValida) {
    
              setAuthAD(true);
              setAdConfig(response.data);
              
            } else {
    
              setAuthAD(false);
              setAdConfig(null);
              
            }
          } catch (error) {
            console.error('💥 Error inesperado validando dominio AD:', error);
            setAuthAD(false);
            setAdConfig(null);
            
          }
        } else {
    
          setAuthAD(false);
          setAdConfig(null);
        }
      } else {
  
        setAuthAD(false);
        setAdConfig(null);
      }
    } else {

      setAuthAD(false);
      setAdConfig(null);
    }
  };

  // Login tradicional (usuario/contraseña)
  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading || !isFormValid) return;
    
    setIsLoading(true);

    try {
      const loginRequest: LoginRequest = {
        nombreUsuario: credentials.nombreUsuario,
        password: credentials.password,
        authAD: false // Login tradicional
      };
      const response = await authService.login(loginRequest);
      
      if (response.success) {
        AlertService.success('¡Bienvenido! Login exitoso');
        onSuccess();
      } else {
        const errorMessage = response.errors?.length > 0 
          ? response.errors.join(', ') 
          : response.message || 'Error en el login';
        
        AlertService.error(errorMessage);
      }
    } catch (error: any) {
      await ErrorHandler.handleServiceError(error, 'iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Login federado con Azure AD
  const handleFederatedLogin = async () => {
    if (!adConfig || isFederatedLoading) return;
    
    setIsFederatedLoading(true);

    try {
      // Realizar autenticación federada completa usando el dominio
      const federatedResult = await federatedAuthService.autenticarFederado(adConfig.dominio);
      if (!federatedResult) {
        AlertService.error('Error en autenticación federada');
        return;
      }

      

      // Enviar el token de Azure AD al backend para validación
      const backendLoginRequest: LoginRequest = {
        nombreUsuario: federatedResult.account.username,
        password: federatedResult.idToken, // Usar el idToken como "password"
        authAD: true // Indicar que es login federado
      };

      const backendResponse = await authService.login(backendLoginRequest);
      
      if (backendResponse.success) {
        AlertService.success(`¡Bienvenido ${federatedResult.account.name}! Login federado exitoso`);
        onSuccess();
      } else {
        const errorMessage = backendResponse.errors?.length > 0 
          ? backendResponse.errors.join(', ') 
          : backendResponse.message || 'Error validando token federado';
        
        AlertService.error(errorMessage);
      }

    } catch (error: any) {
      console.error('Error en login federado:', error);
      
      // Manejo específico de errores de MSAL
      if (error.errorCode === 'user_cancelled') {
        AlertService.info('Login cancelado por el usuario');
      } else if (error.errorCode === 'consent_required') {
        AlertService.error('Se requiere consentimiento. Contacte al administrador.');
      } else if (error.errorCode === 'interaction_required') {
        AlertService.error('Se requiere interacción adicional. Intente nuevamente.');
      } else {
        AlertService.error('Error en autenticación federada. Intente nuevamente.');
      }
    } finally {
      setIsFederatedLoading(false);
    }
  };

  // Reset de estado cuando cambia el usuario
  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({ ...prev, nombreUsuario: e.target.value }));
    
    // Resetear estado AD cuando el usuario cambie el valor
    if (authAD) {
      setAuthAD(false);
      setAdConfig(null);
  
    }
  };

  return (
    <div className="login-container" style={{ backgroundColor: colors.background }}>
      <div 
        className="login-card"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text
        }}
      >
        <h1 
          className="login-title"
          style={{ color: colors.text }}
        >
          Inicia sesión
        </h1>
        
        <form onSubmit={handleTraditionalLogin} className="login-form">
          <div className="login-inputs">
            <Input
              label="Usuario"
              icon="User"
              type="text"
              placeholder="Ingrese su usuario o email"
              requiredText={true}
              value={credentials.nombreUsuario}
              onChange={handleUsuarioChange}
              className="login-input-field"
              disabled={isLoading || isFederatedLoading}
              onBlur={handleUsuarioBlur}
            />

            {/* Solo mostrar campo de contraseña si NO es login por AD */}
            {!authAD && (
              <Input
                label="Contraseña"
                icon="Lock"
                type="password"
                placeholder="Ingrese su contraseña"
                requiredText={true}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="login-input-field"
                disabled={isLoading || isFederatedLoading}
              />
            )}
          </div>

          {/* Checkbox Remember Me */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '20px'
          }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: colors.primary }}
            />
            <label 
              htmlFor="rememberMe" 
              style={{ 
                fontSize: '14px', 
                color: colors.textSecondary,
                cursor: 'pointer'
              }}
            >
              Recordarme
            </label>
          </div>

          {/* Sección condicional: Opciones de login */}
          {authAD && adConfig ? (
            // Opciones de login federado
            <div style={{ marginBottom: '20px' }}>
              {/* Información del dominio configurado */}
              <div style={{
                padding: '16px',
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <img 
                    src="/logo/microsoft_active_directory.png" 
                    alt="Microsoft Active Directory" 
                    style={{ 
                      height: '32px',
                      objectFit: 'contain'
                    }}
                  />
                  <div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: colors.text
                    }}>
                      {adConfig.razonSocial}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary
                    }}>
                      {adConfig.dominio}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: colors.textSecondary,
                  fontStyle: 'italic'
                }}>
                  {adConfig.mensaje}
                </div>
              </div>

              {/* Botones de login */}
              <div style={{ 
                display: 'grid', 
                gap: '12px',
                gridTemplateColumns: '1fr 1fr'
              }}>
                {/* Login Federado */}
                <Button 
                  type="button"
                  variant="default"
                  iconName="Shield"
                  onClick={handleFederatedLogin}
                  disabled={isFederatedLoading || isLoading}
                  style={{
                    backgroundColor: '#0078d4',
                    borderColor: '#0078d4',
                    color: 'white'
                  }}
                >
                  {isFederatedLoading ? 'Conectando...' : 'Azure AD'}
                </Button>

                {/* Login Tradicional */}
                <Button 
                  type="submit"
                  variant="outline"
                  iconName="LogIn"
                  disabled={isLoading || !isFormValid || isFederatedLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Usuario/Contraseña'}
                </Button>
              </div>
            </div>
          ) : (
            // Login tradicional único
          <div className="login-button-container">
            <Button 
              type="submit"
              variant="default"
              iconName="LogIn"
              className="login-submit-button"
                disabled={isLoading || !isFormValid || isFederatedLoading}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </div>
          )}

          {/* Forgot Password - solo mostrar si no hay AD configurado */}
          {!authAD && (
            <button 
              type="button"
              className="login-forgot-link"
              style={{ color: colors.primary }}
              onClick={onForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </form>
      </div>
    </div>
  );
};