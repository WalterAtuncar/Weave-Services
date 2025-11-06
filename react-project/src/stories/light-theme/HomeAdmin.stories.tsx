import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useEffect } from "react";
import { action } from "@storybook/addon-actions";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { HomeAdmin } from "../../components/pages/Home/HomeAdmin";
import { HomeWrapper } from "../../components/pages/Home/HomeWrapper";
import { homeAdminDataMock, homeDataMock } from "../../mocks/Home";

// Componente wrapper que simula la aplicación principal con Light Theme
const LightThemeApp = ({ userProfile = 1 }: { userProfile?: number }) => {
  const [mounted, setMounted] = useState(false);

  // Simular inicialización de la aplicación
  useEffect(() => {
    // Limpiar cualquier tema previo
    localStorage.removeItem('theme');
    document.body.className = '';
    
    // Aplicar clases específicas para light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.add('bg-background', 'text-foreground');
    
    // Establecer en localStorage para garantizar persistencia
    localStorage.setItem('theme', 'light');
    
    // Aplicar estilos directos
    document.body.style.backgroundColor = '#F5F7FA';
    document.body.style.color = '#414976';
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#F5F7FA',
        color: '#414976',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        {userProfile === 1 ? (
          <HomeAdmin 
            data={homeAdminDataMock}
            onMenuToggle={() => action('menu-toggle')()}
          />
        ) : (
          <HomeWrapper
            userProfile={userProfile}
            homeData={homeDataMock}
            homeAdminData={homeAdminDataMock}
            onMenuToggle={() => action('menu-toggle')()}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

// Configuración del meta
const meta: Meta<typeof LightThemeApp> = {
  title: "Light Theme/HomeAdmin Dashboard",
  component: LightThemeApp,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
### HomeAdmin Dashboard - Super Admin

Dashboard administrativo específico para el perfil 1 (Super Admin) que incluye:

**🔧 Características principales:**
- Métricas administrativas del sistema (Organizaciones, Planes, Roles, Contratos, Documentos, Reportes)
- Indicador de salud del sistema con uptime y carga
- Alertas del sistema en tiempo real
- Actividades recientes del sistema
- Reportes rápidos administrativos
- Notificaciones específicas de administración

**👤 Perfil objetivo:**
- Super Admin (perfil = 1)
- Gestión completa del sistema
- Vista de todas las organizaciones y métricas globales

**🎨 Diseño:**
- Reutiliza el mismo CSS que Home.tsx para consistencia
- Responsive design para móvil y desktop
- Tema claro/oscuro compatible
- Floating chat bot integrado
        `
      }
    }
  },
  argTypes: {
    userProfile: {
      control: { type: 'select' },
      options: [1, 2, 3],
      description: 'Perfil del usuario (1 = Super Admin, otros = Usuario institucional)'
    }
  }
};

export default meta;
type Story = StoryObj<typeof LightThemeApp>;

// Story principal del Super Admin
export const SuperAdminDashboard: Story = {
  args: {
    userProfile: 1
  },
  parameters: {
    docs: {
      description: {
        story: `
Dashboard completo del Super Admin con todas las métricas administrativas.

**Datos mostrados:**
- 12 Organizaciones activas
- 6 Planes vigentes  
- 4 Roles configurados
- 12 Contratos activos
- 8 Documentos/Manuales
- 25 Reportes generados

**Estado del sistema:**
- 99.95% uptime
- 247 usuarios activos
- 23% carga del sistema
        `
      }
    }
  }
};

// Story de comparación con usuario institucional
export const UserProfileComparison: Story = {
  args: {
    userProfile: 2
  },
  parameters: {
    docs: {
      description: {
        story: `
Comparación: Dashboard de usuario institucional (perfil != 1) usando HomeWrapper.

**Diferencias clave:**
- Métricas operativas vs administrativas
- Agenda personal vs actividades del sistema
- Chat de usuarios vs alertas del sistema
- Enfoque en procesos vs gestión global
        `
      }
    }
  }
};

// Story mostrando estados de alerta
export const WithSystemAlerts: Story = {
  args: {
    userProfile: 1
  },
  parameters: {
    docs: {
      description: {
        story: `
Dashboard del Super Admin mostrando alertas críticas del sistema.

**Tipos de alertas:**
- 🟡 Warning: Licencia próxima a vencer
- 🔴 Critical: Backup fallido
- 🔵 Info: Nuevo usuario registrado
- 🔵 Info: Actualización disponible
        `
      }
    }
  }
}; 