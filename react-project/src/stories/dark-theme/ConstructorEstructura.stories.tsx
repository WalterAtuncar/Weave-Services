import type { Meta, StoryObj } from '@storybook/react';
import { ConstructorEstructura } from '../../components/pages/UnidadesPosiciones/ConstructorEstructura';
import { constructorEstructuraMockData } from '../../mocks/constructorEstructuraMocks';
import { ThemeProvider } from '../../contexts/ThemeContext';

const meta = {
  title: 'Dark Theme/Constructor de Estructura',
  component: ConstructorEstructura,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Constructor visual e interactivo para crear y gestionar la estructura organizacional - Tema Oscuro'
      }
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: 'hsl(224, 71%, 4%)' }
      ]
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark">
        <div className="dark" style={{ 
          height: '100vh',
          background: 'hsl(224, 71%, 4%)',
          color: 'hsl(213, 31%, 91%)',
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

// Historia principal con organización completa - Tema Oscuro
export const OrganizacionCompletaDark: Story = {
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
        story: 'Vista principal del constructor en tema oscuro con una organización completa.'
      }
    }
  }
};

// Historia con organización vacía - Tema Oscuro
export const OrganizacionVaciaDark: Story = {
  args: {
    organizacionData: {
      organizacionId: 999,
      codigo: 'ORG-DARK',
      razonSocial: 'Empresa Nocturna S.A.C.',
      logoUrl: '/public/logo/logow-light.svg'
    },
    readOnly: false,
    onSave: (estructura) => {
      // Nueva estructura creada
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado inicial en tema oscuro para crear la estructura de una nueva organización.'
      }
    }
  }
};

// Historia en modo solo lectura - Tema Oscuro
export const ModoSoloLecturaDark: Story = {
  args: {
    organizacionData: constructorEstructuraMockData.organizacionesConstructor[2],
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Vista en modo solo lectura con tema oscuro.'
      }
    }
  }
};

// Historia para mostrar los colores y themes
export const ColoresYThemesDark: Story = {
  args: {
    organizacionData: {
      organizacionId: 1,
      codigo: 'COLORS-001',
      razonSocial: 'Empresa de Colores y Themes',
      logoUrl: '/public/logo/logoww2-light.svg'
    },
    readOnly: false,
    onSave: (estructura) => {
      // Colores y themes aplicados
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Demostración de los colores y themes aplicados en el constructor.'
      }
    }
  }
};