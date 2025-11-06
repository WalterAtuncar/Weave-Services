import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { Layout } from "../../components/templates/Layout";
import { Home } from "../../components/pages/Home";
import { Roles } from "../../components/pages/Roles";
import { homeDataMock } from "../../mocks/Home";
import { mockRolesData } from "../../mocks/Roles";
import { action } from "@storybook/addon-actions";

// Componente wrapper para el tema dark con Header (usa Roles)
const DarkThemeWithHeader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Forzar Dark Theme
    localStorage.removeItem('theme');
    document.body.className = '';
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-background', 'text-foreground');
    localStorage.setItem('theme', 'dark');
    document.body.style.backgroundColor = '#0F172A';
    document.body.style.color = '#F3F4F8';
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

// Componente wrapper para el tema dark sin Header (usa Home)
const DarkThemeWithoutHeader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Forzar Dark Theme
    localStorage.removeItem('theme');
    document.body.className = '';
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-background', 'text-foreground');
    localStorage.setItem('theme', 'dark');
    document.body.style.backgroundColor = '#0F172A';
    document.body.style.color = '#F3F4F8';
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

const meta: Meta<typeof DarkThemeWithHeader> = {
  title: "Dark Theme/Layout",
  component: DarkThemeWithHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Sistema de Layout completo para el tema oscuro que incluye Sidebar, Header opcional y área de contenido para las páginas."
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHeader: Story = {
  render: () => <DarkThemeWithHeader />,
  name: "Layout con Header",
  parameters: {
    docs: {
      description: {
        story: "Layout completo con Header que incluye el avatar del usuario y dropdown de logout, Sidebar con navegación y página de Roles en tema oscuro."
      }
    }
  }
};

export const WithoutHeader: Story = {
  render: () => <DarkThemeWithoutHeader />,
  name: "Layout sin Header",
  parameters: {
    docs: {
      description: {
        story: "Layout sin Header mostrando solo el Sidebar con navegación y página Home en tema oscuro. Útil para pantallas que no requieren información del usuario."
      }
    }
  }
};