import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    logo: {
      main: string;
      secondary: string;
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme || 'light');

  // Helper para aplicar el tema de forma consistente en html y body
  const applyTheme = (t: Theme) => {
    const html = document.documentElement;
    const body = document.body;

    // Quitar clases previas
    html.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Agregar clases actuales
    html.classList.add(t);
    body.classList.add(t);

    // Sincronizar atributo data-theme para CSS que usa [data-theme="dark"]
    html.setAttribute('data-theme', t);
    body.setAttribute('data-theme', t);
  };

  // Aplicar tema inicial al body inmediatamente
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Cargar tema desde localStorage solo si no se especifica un tema inicial
  useEffect(() => {
    if (!initialTheme) {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [initialTheme]);

  // Guardar tema en localStorage y aplicar clase al body
  useEffect(() => {
    if (!initialTheme) {
      localStorage.setItem('theme', theme);
    }
    // Remover clases de tema anteriores y agregar la nueva
    applyTheme(theme);
  }, [theme, initialTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Configuración de colores por tema
  const colors = {
    light: {
      primary: '#414976',
      background: '#F5F7FA',
      surface: '#FFFFFF',
      text: '#414976',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      logo: {
        main: '/logo/logow.svg',
        secondary: '/logo/logoww2.svg'
      }
    },
    dark: {
      primary: '#F3F4F8',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F3F4F8',
      textSecondary: '#94A3B8',
      border: '#334155',
      logo: {
        main: '/logo/logow-light.svg',
        secondary: '/logo/logoww2-light.svg'
      }
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    colors: colors[theme]
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};