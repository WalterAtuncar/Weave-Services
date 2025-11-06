import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.primary
      }}
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
}; 