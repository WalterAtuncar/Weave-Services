import type { Meta, StoryObj } from '@storybook/react';
import { ConstructorEstructura } from '../../components/pages/UnidadesPosiciones/ConstructorEstructura';
import { constructorEstructuraMockData } from '../../mocks/constructorEstructuraMocks';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AlertService } from '../../components/ui/alerts/AlertService';

const meta = {
  title: 'Components/Constructor de Estructura',
  component: ConstructorEstructura,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Constructor visual e interactivo para crear y gestionar la estructura organizacional de una empresa con jerarquía de unidades y posiciones.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ 
          height: '100vh',
          background: 'hsl(var(--background))',
          padding: '20px'
        }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    organizacionData: {
      description: 'Datos de la organización para la que se construye la estructura',
    },
    readOnly: {
      control: 'boolean',
      description: 'Si está en modo solo lectura (sin posibilidad de editar)',
    },
    onSave: {
      action: 'onSave',
      description: 'Callback cuando se guarda la estructura',
    },
  },
} satisfies Meta<typeof ConstructorEstructura>;

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal con organización completa
export const OrganizacionCompleta: Story = {
  args: {
    organizacionData: constructorEstructuraMockData.organizacionesConstructor[0],
    readOnly: false,
    onSave: (estructura) => {
      // Estructura guardada
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Vista principal del constructor con una organización que ya tiene unidades y posiciones definidas.'
      }
    }
  }
};

// Historia con organización vacía
export const OrganizacionVacia: Story = {
  args: {
    organizacionData: {
      organizacionId: 999,
      codigo: 'ORG-NUEVA',
      razonSocial: 'Nueva Empresa S.A.C.',
      logoUrl: '/public/logo/logow.svg'
    },
    readOnly: false,
    onSave: (estructura) => {
      // Nueva estructura creada
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado inicial cuando se va a crear la estructura de una nueva organización.'
      }
    }
  }
};

// Historia en modo solo lectura
export const ModoSoloLectura: Story = {
  args: {
    organizacionData: constructorEstructuraMockData.organizacionesConstructor[1],
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Vista del constructor en modo solo lectura, sin posibilidad de editar la estructura.'
      }
    }
  }
};

// Historia con organización tecnológica
export const OrganizacionTecnologica: Story = {
  args: {
    organizacionData: constructorEstructuraMockData.organizacionesConstructor[1],
    readOnly: false,
    onSave: (estructura) => {
      // Estructura tecnológica guardada
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de estructura organizacional para una empresa de tecnología.'
      }
    }
  }
};

// Historia interactiva para demos
export const Demo: Story = {
  args: {
    organizacionData: {
      organizacionId: 1,
      codigo: 'DEMO-001',
      razonSocial: 'Empresa Demo para Pruebas',
      logoUrl: '/public/logo/logoww2.svg'
    },
    readOnly: false,
    onSave: (estructura) => {
      AlertService.success(`¡Estructura guardada exitosamente!\n\nUnidades creadas: ${estructura.length}\nPosiciones totales: ${estructura.reduce((total, u) => total + u.posiciones.length, 0)}`);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Versión interactiva para demostraciones, con alertas de confirmación al guardar.'
      }
    }
  }
};