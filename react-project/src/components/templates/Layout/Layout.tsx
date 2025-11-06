import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { AlertProvider } from '../../ui/alerts/AlertProvider';
import { ChatProvider } from '../../../contexts/ChatContext';
import { GlobalChat } from '../../ui/floating-chat/GlobalChat';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  user?: {
    name: string;
    avatar?: string | null;
    email?: string;
  };
  onSidebarItemClick?: (item: any) => void;
  onLogout?: () => void;
  isMobileSidebarOpen?: boolean;
  setIsMobileSidebarOpen?: (open: boolean) => void;
  currentPage?: string; // Página actual para sincronizar el sidebar
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  user = { name: 'Erick', avatar: null },
  onSidebarItemClick,
  onLogout,
  isMobileSidebarOpen = false,
  setIsMobileSidebarOpen,
  currentPage
}) => {
  const { colors } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const enableChat = true;

  // Detectar si es mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile && setIsMobileSidebarOpen) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  const handleSidebarItemClick = (item: any) => {
    console.log('🔍 Layout handleSidebarItemClick - Item recibido:', item);
    console.log('🔍 Layout - onSidebarItemClick existe:', !!onSidebarItemClick);
    
    if (onSidebarItemClick) {
      console.log('🚀 Layout - Pasando item a onSidebarItemClick');
      onSidebarItemClick(item);
    } else {
      console.log('❌ Layout - onSidebarItemClick no está definido');
    }
    
    // Cerrar sidebar en mobile después de hacer clic
    if (isMobile && setIsMobileSidebarOpen) {
      console.log('📱 Layout - Cerrando sidebar mobile');
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <AlertProvider>
      <ChatProvider>
      <div 
        className={`${styles.goldenBeltLayout} ${isMobile ? styles.mobile : ''}`}
        style={{ backgroundColor: colors.background }}
      >
        {/* Goldenbelt Sidebar - Siempre visible */}
        <Sidebar
          onItemClick={handleSidebarItemClick}
          isMobile={isMobile}
          currentPage={currentPage}
        />

        {/* Main Content Area - Ajustado para el nuevo patrón */}
        <div className={styles.mainContentArea}>
          {/* Header (opcional) */}
          {showHeader && (
            <Header
              user={user}
              onLogout={onLogout}
              onMenuToggle={isMobile ? handleSidebarToggle : undefined}
              isMobile={isMobile}
            />
          )}

          {/* Content */}
          <main 
            className={styles.pageContent}
            style={{ backgroundColor: colors.background }}
          >
            {children}
          </main>
        </div>
      </div>
      {enableChat && <GlobalChat />}
      </ChatProvider>
    </AlertProvider>
  );
};