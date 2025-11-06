import React, { useState } from 'react';
import { StepIndicator } from '../../ui/stepper/StepIndicator';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertService } from '../../ui/alerts/AlertService';
import { authService } from '@/services';
import { ArrowLeft, Mail, Shield, Lock } from 'lucide-react';
import './Login.css';

interface ForgotPasswordProps {
  onBack: () => void;
}

interface StepData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stepData, setStepData] = useState<StepData>({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Configuración de los pasos
  const steps = [
    {
      id: 'email',
      label: 'Correo Electrónico',
      icon: Mail,
      isCompleted: false
    },
    {
      id: 'verification',
      label: 'Verificación',
      icon: Shield,
      isCompleted: false
    },
    {
      id: 'password',
      label: 'Nueva Contraseña',
      icon: Lock,
      isCompleted: false
    }
  ];

  // Validaciones
  const isEmailValid = stepData.email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stepData.email);
  const isCodeValid = stepData.code.trim() !== '' && stepData.code.length >= 4;
  const isPasswordValid = stepData.newPassword.length >= 6;
  const isConfirmPasswordValid = stepData.confirmPassword === stepData.newPassword && stepData.confirmPassword.trim() !== '';
  const isNewPasswordStepValid = isPasswordValid && isConfirmPasswordValid;

  // Handlers para cada paso
  const handleEmailSubmit = async () => {
    if (!isEmailValid) {
      AlertService.error('Por favor ingrese un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.solicitarCodigoRecuperacion({
        email: stepData.email
      });
      
      if (response.success) {
        AlertService.success(response.message || 'Código de verificación enviado a su correo');
        setCurrentStep(1);
      } else {
        // 🔧 FIX: Manejo específico para correo no existente
        let errorMessage = response.message || 'Error al enviar el código';
        
        // Si hay errores específicos del backend, usarlos
        if (response.errors?.length > 0) {
          errorMessage = response.errors.join(', ');
        }
        
        // 🔧 FIX: Mostrar alerta específica para correo no existente
        if (response.statusCode === 404 || errorMessage.includes('no existe')) {
          AlertService.error('El correo electrónico no existe en nuestro sistema. Verifique el correo ingresado.');
        } else {
          AlertService.error(errorMessage);
        }
      }
    } catch (error) {
      AlertService.error('Error inesperado al enviar el código. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!isCodeValid) {
      AlertService.error('Por favor ingrese un código válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.validarCodigoRecuperacion({
        email: stepData.email,
        codigo: stepData.code
      });
      
      if (response.success && response.data) {
        AlertService.success('Código verificado correctamente');
        setCurrentStep(2);
      } else {
        const errorMessage = response.errors?.length > 0 
          ? response.errors.join(', ') 
          : response.message || 'Código incorrecto';
        AlertService.error(errorMessage);
      }
    } catch (error) {
      AlertService.error('Error inesperado al validar el código. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!isNewPasswordStepValid) {
      AlertService.error('Las contraseñas deben coincidir y tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.cambiarContrasena({
        email: stepData.email,
        nuevaContrasena: stepData.newPassword,
        confirmarContrasena: stepData.confirmPassword
      });
      
      if (response.success && response.data) {
        AlertService.success('Contraseña actualizada exitosamente');
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        const errorMessage = response.errors?.length > 0 
          ? response.errors.join(', ') 
          : response.message || 'Error al actualizar la contraseña';
        AlertService.error(errorMessage);
      }
    } catch (error) {
      AlertService.error('Error inesperado al actualizar la contraseña. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof StepData, value: string) => {
    setStepData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="forgot-password-step">
            <div 
              className="step-content"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              <h2 className="step-title" style={{ color: colors.text }}>
                Recuperar Contraseña
              </h2>
              <p className="step-description" style={{ color: colors.textSecondary }}>
                Ingrese su correo electrónico y le enviaremos un código de verificación
              </p>
              
              <div className="step-form">
                <Input
                  label="Correo Electrónico"
                  icon="Mail"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  requiredText={true}
                  value={stepData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                />
                
                <Button 
                  type="button"
                  variant="default"
                  iconName="Send"
                  className="step-button"
                  disabled={isLoading || !isEmailValid}
                  onClick={handleEmailSubmit}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Código'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="forgot-password-step">
            <div 
              className="step-content"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              <h2 className="step-title" style={{ color: colors.text }}>
                Verificar Código
              </h2>
              <p className="step-description" style={{ color: colors.textSecondary }}>
                Ingrese el código de verificación que enviamos a <strong>{stepData.email}</strong>
              </p>
              
              <div className="step-form">
                <Input
                  label="Código de Verificación"
                  icon="Shield"
                  type="text"
                  placeholder="Ingrese el código"
                  requiredText={true}
                  value={stepData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                />
                
                <Button 
                  type="button"
                  variant="default"
                  iconName="CheckCircle"
                  className="step-button"
                  disabled={isLoading || !isCodeValid}
                  onClick={handleCodeSubmit}
                >
                  {isLoading ? 'Verificando...' : 'Verificar Código'}
                </Button>
                
                <button 
                  type="button"
                  className="resend-button"
                  style={{ color: colors.primary }}
                  onClick={() => AlertService.info('Código reenviado')}
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="forgot-password-step">
            <div 
              className="step-content"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              <h2 className="step-title" style={{ color: colors.text }}>
                Nueva Contraseña
              </h2>
              <p className="step-description" style={{ color: colors.textSecondary }}>
                Ingrese su nueva contraseña. Debe tener al menos 6 caracteres.
              </p>
              
              <div className="step-form">
                <Input
                  label="Nueva Contraseña"
                  icon="Lock"
                  type="password"
                  placeholder="Ingrese su nueva contraseña"
                  requiredText={true}
                  value={stepData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  disabled={isLoading}
                />
                
                <Input
                  label="Confirmar Contraseña"
                  icon="Lock"
                  type="password"
                  placeholder="Confirme su nueva contraseña"
                  requiredText={true}
                  value={stepData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={isLoading}
                />
                
                {stepData.confirmPassword && !isConfirmPasswordValid && (
                  <p className="password-error" style={{ color: '#EF4444' }}>
                    Las contraseñas no coinciden
                  </p>
                )}
                
                <Button 
                  type="button"
                  variant="default"
                  iconName="Save"
                  className="step-button"
                  disabled={isLoading || !isNewPasswordStepValid}
                  onClick={handlePasswordSubmit}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Contraseña'}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="login-container" style={{ backgroundColor: colors.background }}>
      <div 
        className="login-card forgot-password-card"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text
        }}
      >
        {/* Header con botón de regreso */}
        <div className="forgot-password-header">
          <button 
            className="back-button"
            onClick={onBack}
            style={{ color: colors.primary }}
          >
            <ArrowLeft size={20} />
            <span>Volver al Login</span>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator-container">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            showNumbers={false}
            allowClick={false}
          />
        </div>

        {/* Contenido del paso actual */}
        <div className="step-container">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}; 