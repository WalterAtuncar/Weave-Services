import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AlertProvider } from '../../components/ui/alerts';
import { Ubigeo } from '../../components/pages/Ubigeo/Ubigeo';

const meta = {
  title: 'Páginas/Ubigeo',
  component: Ubigeo,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <AlertProvider>
          <div style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--background)',
            color: 'var(--text)'
          }}>
            <Story />
          </div>
        </AlertProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Ubigeo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Selector de Ubigeo',
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo completo del selector de Ubigeo con todas las funcionalidades. Incluye jerarquización automática de los selects y emisión de datos al seleccionar.'
      }
    }
  }
};

export const Interactive: Story = {
  name: 'Ejemplo Interactivo',
  parameters: {
    docs: {
      description: {
        story: 'Versión interactiva del selector de Ubigeo. Prueba seleccionando diferentes ubicaciones y observa cómo se jerarquizan los niveles automáticamente.'
      }
    }
  }
}; 