import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Layout } from "../../components/templates/Layout";
import { Home } from "../../components/pages/Home";
import { Roles } from "../../components/pages/Roles";
import { homeDataMock } from "../../mocks/Home";
import { mockRolesData } from "../../mocks/Roles";
import { action } from "@storybook/addon-actions";

// Componente wrapper para el tema light con Header (usa Roles)
const LightThemeWithHeader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Forzar Light Theme
    localStorage.removeItem('theme');
    document.body.className = '';
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.add('bg-background', 'text-foreground');
    localStorage.setItem('theme', 'light');
    document.body.style.backgroundColor = '#F5F7FA';
    document.body.style.color = '#414976';
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Layout
        showHeader={true}
        user={{
          name: 'Erick Machuca',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          email: 'erick.machuca@company.com'
        }}
        onSidebarItemClick={(item) => {
        action('sidebar-item-click')(item);
      }}
      onLogout={() => {
        action('logout')();
      }}
      >
        <Roles data={mockRolesData} />
      </Layout>
    </ThemeProvider>
  );
};

// Componente wrapper para el tema light sin Header (usa Home)
const LightThemeWithoutHeader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Forzar Light Theme
    localStorage.removeItem('theme');
    document.body.className = '';
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.add('bg-background', 'text-foreground');
    localStorage.setItem('theme', 'light');
    document.body.style.backgroundColor = '#F5F7FA';
    document.body.style.color = '#414976';
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Layout
        showHeader={false}
        user={{
          name: 'Erick Machuca',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          email: 'erick.machuca@company.com'
        }}
        onSidebarItemClick={(item) => {
          action('sidebar-item-click')(item);
        }}
        onLogout={() => {
          action('logout')();
        }}
      >
        <Home data={homeDataMock} />
      </Layout>
    </ThemeProvider>
  );
};

const meta: Meta<typeof LightThemeWithHeader> = {
  title: "Light Theme/Layout",
  component: LightThemeWithHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Sistema de Layout completo para el tema claro que incluye Sidebar, Header opcional y área de contenido para las páginas."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHeader: Story = {
  render: () => <LightThemeWithHeader />,
  name: "Layout con Header",
  parameters: {
    docs: {
      description: {
        story: "Layout completo con Header que incluye el avatar del usuario y dropdown de logout, Sidebar con navegación y página de Roles."
      }
    }
  }
};

export const WithoutHeader: Story = {
  render: () => <LightThemeWithoutHeader />,
  name: "Layout sin Header",
  parameters: {
    docs: {
      description: {
        story: "Layout sin Header mostrando solo el Sidebar con navegación y página Home. Útil para pantallas que no requieren información del usuario."
      }
    }
  }
};