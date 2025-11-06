import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, Moon, Sun, Menu, Building2 } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { authService } from '../../../../services';
import { Avatar } from '../../../ui/avatar';
import styles from './Header.module.css';

export interface HeaderProps {
  user?: {
    name: string;
    avatar?: string | null;
    email?: string;
  };
  onLogout?: () => void;
  onMenuToggle?: () => void;
  isMobile?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user = { name: 'Usuario', avatar: null },
  onLogout,
  onMenuToggle,
  isMobile = false
}) => {
  const { theme, colors, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Obtener organización actual
  const currentOrganization = authService.getCurrentOrganization();



  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className={`${styles.header} ${isMobile ? styles.mobile : ''}`}>
      {/* Mobile Menu Button */}
      {isMobile && onMenuToggle && (
        <button
          className={styles.menuButton}
          onClick={onMenuToggle}
          title="Abrir menú"
        >
          <Menu size={24} />
        </button>
      )}
      
      {/* Spacer para empujar el contenido a la derecha */}
      <div className={styles.spacer} />
      
      {/* Organization Info */}
      <div className={styles.organizationInfo}>
        <Building2 size={16} />
        {currentOrganization ? (
          <>
            <span className={styles.organizationName}>
              {currentOrganization.nombreComercial || currentOrganization.razonSocial}
            </span>            
          </>
        ) : (
          <>
            <span className={styles.organizationName}>
              Sin organización
            </span>
            <span className={styles.organizationCode}>
              (N/A)
            </span>
          </>
        )}
      </div>
      
      {/* Theme Toggle Button */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        title={theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
      >
        {theme === 'light' ? (
          <Moon size={20} />
        ) : (
          <Sun size={20} />
        )}
      </button>
      
      {/* User Section */}
      <div className={styles.userSection} ref={dropdownRef}>
        <button
          className={styles.userButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Avatar
            src={user.avatar}
            alt={user.name}
            size={32}
            className={styles.userAvatar}
            name={user.name}
          />
          <span className={styles.userName}>{user.name}</span>
          <ChevronDown 
            size={16} 
            className={`${styles.chevronIcon} ${isDropdownOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={styles.dropdown}>
            <button
              className={styles.dropdownItem}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}; 