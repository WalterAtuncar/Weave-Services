import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Sidebar } from "../../components/templates/Layout/Sidebar";
import { Home } from "../../components/pages/Home";
import { homeDataMock } from "../../mocks/Home";
import { action } from "@storybook/addon-actions";

// Componente wrapper que simula la aplicación principal con Dark Theme
const DarkThemeApp = () => {
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Forzar Dark Theme de manera más robusta
  useEffect(() => {
    // Limpiar cualquier tema previo
    localStorage.removeItem('theme');
    document.body.className = '';
    
    // Aplicar clases específicas para dark theme
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-background', 'text-foreground');
    
    // Establecer en localStorage para garantizar persistencia
    localStorage.setItem('theme', 'dark');
    
    // Aplicar estilos directos para mayor garantía
    document.body.style.backgroundColor = '#0F172A';
    document.body.style.color = '#F3F4F8';
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div style={{ 
        display: 'flex',
        height: '100vh',
        backgroundColor: '#0F172A',
        color: '#F3F4F8',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onItemClick={(item) => {
            action('sidebar-item-click')(item);
          }}
        />
        
        {/* Main Content Area with Home */}
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#0F172A',
          height: '100%'
        }}>
          <Home data={homeDataMock} />
        </div>
      </div>
    </ThemeProvider>
  );
};

// Componente específico para mostrar solo el sidebar colapsado
const CollapsedSidebar = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0F172A';
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return (
    <ThemeProvider>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0F172A' }}>
        <Sidebar 
          isCollapsed={true}
          onItemClick={action('collapsed-sidebar-item-click')}
        />
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#0F172A', height: '100%' }}>
          <Home data={homeDataMock} />
        </div>
      </div>
    </ThemeProvider>
  );
};

// Componente específico para mostrar solo el sidebar expandido
const ExpandedSidebar = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#0F172A';
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return (
    <ThemeProvider>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0F172A' }}>
        <Sidebar 
          isCollapsed={false}
          onItemClick={action('expanded-sidebar-item-click')}
        />
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#0F172A', height: '100%' }}>
          <Home data={homeDataMock} />
        </div>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof DarkThemeApp> = {
  title: "Dark Theme/Sidebar",
  component: DarkThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Componente de sidebar para el tema oscuro del sistema de gestión de procesos. Incluye funcionalidad de colapso/expansión, menús y submenús integrado con la página Home."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SidebarShowcase: Story = {
  name: "Sidebar Completo con Home",
  parameters: {
    docs: {
      description: {
        story: "Muestra el sidebar completo con funcionalidad de toggle, navegación y la página Home con dashboard completo."
      }
    }
  }
};

export const Collapsed: Story = {
  render: () => <CollapsedSidebar />,
  name: "Estado Colapsado con Home",
  parameters: {
    docs: {
      description: {
        story: "Sidebar en estado colapsado mostrando solo iconos con la página Home integrada."
      }
    }
  }
};

export const Expanded: Story = {
  render: () => <ExpandedSidebar />,
  name: "Estado Expandido con Home",
  parameters: {
    docs: {
      description: {
        story: "Sidebar en estado expandido mostrando iconos y etiquetas con la página Home integrada. Incluye navegación con submenús."
      }
    }
  }
};