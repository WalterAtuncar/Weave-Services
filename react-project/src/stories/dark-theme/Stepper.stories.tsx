import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { User, UserCheck, FileCheck, Save } from 'lucide-react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AlertProvider } from '../../components/ui/alerts/AlertProvider';
import { AlertService } from '../../components/ui/alerts/AlertService';
import { Stepper } from '../../components/ui/stepper';
import { PersonaFormData } from '../../models/Personas';
import { UsuarioFormData } from '../../models/Usuarios';

const meta: Meta<typeof Stepper> = {
  title: 'Dark Theme/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente Stepper modal horizontal para procesos de múltiples pasos con navegación y validación - Tema Oscuro.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark">
        <AlertProvider>
          <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#111827' }}>
            <Story />
          </div>
        </AlertProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Stepper>;

// Story principal para Dark Theme
export const RegistroCompleto: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Estados de los formularios
    const [personaData, setPersonaData] = useState<PersonaFormData>({
      tipoDoc: '',
      nroDoc: '',
      codEmpleado: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      fotoUrl: null,
      estadoLaboral: 1,
      fechaNacimiento: '',
      fechaIngreso: '',
      emailPersonal: '',
      celular: '',
      direccion: '',
      ubigeo: '',
      organizacionId: null,
      sedeId: null,
      estado: 'ACTIVO'
    });

    const [usuarioData, setUsuarioData] = useState<UsuarioFormData>({
      personaId: 0,
      perfilId: 0,
      nombreUsuario: '',
      hashPassword: '',
      estado: 1,
      fechaExpiracion: null,
      esSuperAdmin: false,
      organizacionActual: null
    });

    // Configuración de pasos
    const steps = [
      {
        id: 'persona',
        label: 'Datos Personales',
        icon: User,
        isCompleted: currentStep > 0
      },
      {
        id: 'usuario',
        label: 'Datos Usuario',
        icon: UserCheck,
        isCompleted: currentStep > 1
      },
      {
        id: 'resumen',
        label: 'Resumen',
        icon: FileCheck,
        isCompleted: false
      }
    ];

    const handleFinish = async () => {
      setIsLoading(true);
      
      // Simular envío al backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      
      
      AlertService.success('¡Registro completado exitosamente!');
      setIsLoading(false);
      setIsOpen(false);
      setCurrentStep(0);
    };

    const renderStepContent = () => {
      switch (currentStep) {
        case 0:
          return (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#f9fafb' }}>
                  Nombres *
                </label>
                <input
                  type="text"
                  value={personaData.nombres}
                  onChange={(e) => setPersonaData({ ...personaData, nombres: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #4b5563',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb'
                  }}
                  placeholder="Nombres completos"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#f9fafb' }}>
                  Email Personal *
                </label>
                <input
                  type="email"
                  value={personaData.emailPersonal}
                  onChange={(e) => setPersonaData({ ...personaData, emailPersonal: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #4b5563',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb'
                  }}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
          );
        case 1:
          return (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#f9fafb' }}>
                  Nombre Usuario *
                </label>
                <input
                  type="text"
                  value={usuarioData.nombreUsuario}
                  onChange={(e) => setUsuarioData({ ...usuarioData, nombreUsuario: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #4b5563',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb'
                  }}
                  placeholder="usuario123"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#f9fafb' }}>
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={usuarioData.hashPassword}
                  onChange={(e) => setUsuarioData({ ...usuarioData, hashPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #4b5563',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: '#1f2937',
                    color: '#f9fafb'
                  }}
                  placeholder="Contraseña segura"
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#f9fafb', fontWeight: '600' }}>
                  📋 Datos de la Persona
                </h3>
                <div style={{ 
                  background: '#1f2937', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  border: '1px solid #374151',
                  color: '#d1d5db'
                }}>
                  <p><strong style={{ color: '#f9fafb' }}>Nombres:</strong> {personaData.nombres}</p>
                  <p><strong style={{ color: '#f9fafb' }}>Email:</strong> {personaData.emailPersonal}</p>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#f9fafb', fontWeight: '600' }}>
                  👤 Datos del Usuario
                </h3>
                <div style={{ 
                  background: '#0f172a', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  border: '1px solid #1e3a8a',
                  color: '#93c5fd'
                }}>
                  <p><strong style={{ color: '#dbeafe' }}>Usuario:</strong> {usuarioData.nombreUsuario}</p>
                  <p><strong style={{ color: '#dbeafe' }}>Contraseña:</strong> {'*'.repeat(usuarioData.hashPassword.length)}</p>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const canGoNext = (): boolean => {
      if (currentStep === 0) {
        return !!(personaData.nombres && personaData.emailPersonal);
      }
      if (currentStep === 1) {
        return !!(usuarioData.nombreUsuario && usuarioData.hashPassword);
      }
      return true;
    };

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Abrir Stepper de Registro
        </button>

        <Stepper
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Registro de Personal"
          subtitle="Complete todos los pasos para registrar una nueva persona y su usuario"
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onFinish={handleFinish}
          canGoNext={canGoNext()}
          isLoading={isLoading}
          nextButtonIcon={currentStep === 2 ? Save : undefined}
          allowStepClick={true}
          forcedClose={false} // Para demo, permitir cerrar con clic fuera
        >
          {renderStepContent()}
        </Stepper>
      </div>
    );
  },
};