import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, MessageCircle, Inbox, User, Menu } from 'lucide-react';
import * as Icons from 'lucide-react';
import { HomeData } from '../../../models/Home';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { LogoutButton } from '../../ui/LogoutButton';
// import { FloatingChatBot } from '../../ui/floating-chat';
import { useChat } from '../../../contexts/ChatContext';
import { Avatar } from '../../ui/avatar';
import { useProfileImageUpdate } from '../../../hooks/useProfileImageUpdate';
import { getCurrentDatePeru } from '../../../utils/dateUtils';
import { getAdaptedIconStyles, useAdaptedColor } from '../../../utils/themeColors';
import styles from './Home.module.css';

export interface HomeProps {
  data: HomeData;
  onMenuToggle?: () => void;
}

export const Home: React.FC<HomeProps> = ({ data, onMenuToggle }) => {
  const { theme, colors } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  // Chat global
  const { openChat } = useChat();
  const [currentDate, setCurrentDate] = useState(getCurrentDatePeru());
  
  // Hook para actualización de imagen de perfil
  const { isUploading, updateProfileImage } = useProfileImageUpdate();

  // Detectar si es mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Actualizar fecha correctamente para zona horaria de Perú
  useEffect(() => {
    const updateDate = () => {
      const newDate = getCurrentDatePeru();
      setCurrentDate(newDate);
    };

    // 🔄 Actualizar inmediatamente al montar
    updateDate();

    // Actualizar cada 30 segundos para mayor precisión
    const interval = setInterval(updateDate, 30000);
    
    // También verificar al cambio de foco de la ventana (usuario regresa a la pestaña)
    const handleFocus = () => {
      updateDate();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []); // 🔧 Removido currentDate de las dependencias para evitar loops

  // 🆕 NUEVO: Efecto separado para detectar cambios de día
  useEffect(() => {
    const checkDateChange = () => {
      const newDate = getCurrentDatePeru();
      if (newDate !== currentDate) {
        setCurrentDate(newDate);
      }
    };

    // Verificar cambio de fecha cada minuto
    const dateCheckInterval = setInterval(checkDateChange, 60000);

    return () => clearInterval(dateCheckInterval);
  }, [currentDate]);

  // Función para obtener el ícono dinámicamente
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  return (
    <div className={styles.homeContainer} style={{ backgroundColor: colors.background }}>
      {/* Mobile Header - Solo visible en móvil */}
      {isMobile && (
        <div className={styles.mobileHeader}>
          {/* Hamburger Menu - Superior Izquierda */}
          {onMenuToggle && (
            <button
              className={styles.mobileMenuButton}
              onClick={onMenuToggle}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Logout y Theme Toggle - Superior Derecha */}
          <LogoutButton />
          <ThemeToggle />
        </div>
      )}

      {/* Logout y Theme Toggle - Solo visible en desktop, posición original */}
      {!isMobile && (
        <>
          <LogoutButton />
          <ThemeToggle />
        </>
      )}

      {/* Welcome Section - Solo primero en mobile */}
      {isMobile && (
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <div className={styles.userAvatar}>
              <Avatar
                src={data.user.avatar}
                alt={data.user.name}
                size={data.user.avatar ? 94 : 75}
                name={data.user.name}
                clickable={true}
                onClick={updateProfileImage}
                loading={isUploading}
              />
            </div>
            <div className={styles.welcomeText}>
              <h1 className={styles.welcomeTitle} style={{ color: colors.text }}>
                ¡Hola {data.user.name}!
              </h1>
              <p className={styles.welcomeSubtitle} style={{ color: colors.textSecondary }}>
                ¿Qué quieres hacer hoy?
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with Search */}
      <div className={styles.header}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className={styles.searchInput}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          />
          <button className={styles.searchButton}>
            <User size={16} />
            <span>IA</span>
          </button>
        </div>
      </div>

      {/* KPI Cards para móvil - aparecen primero */}
      {isMobile && (
        <div className={styles.dashboardGrid}>
          {data.dashboardCards.map((card) => {
            const IconComponent = getIcon(card.icon);
            return (
              <div
                key={card.id}
                className={styles.dashboardCard}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }}
              >
                <div className={styles.cardContent}>
                  <div
                    className={styles.cardIcon}
                    style={getAdaptedIconStyles(card.color, theme)}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle} style={{ color: colors.text }}>
                      {card.title}
                    </h3>
                    <span className={styles.cardCount} style={{ color: useAdaptedColor(card.color, theme) }}>
                      ({card.count})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Link para móvil - después de los KPI */}
      {isMobile && (
        <div className={styles.mobileChatLink}>
          <button 
            className={styles.chatLinkButton}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
            onClick={openChat}
          >
            <MessageCircle size={20} style={{ color: colors.primary }} />
            <span>Ver Chat ({data.chatMessages.length} mensajes)</span>
            <span style={{ color: colors.textSecondary }}>→</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Content */}
        <div className={styles.leftContent}>
          {/* Welcome Section - Posición original en desktop */}
          {!isMobile && (
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeContent}>
              <div className={styles.userAvatar}>
                <Avatar
                  src={data.user.avatar}
                  alt={data.user.name}
                  size={data.user.avatar ? 94 : 75}
                  name={data.user.name}
                  clickable={true}
                  onClick={updateProfileImage}
                  loading={isUploading}
                />
              </div>
              <div className={styles.welcomeText}>
                <h1 className={styles.welcomeTitle} style={{ color: colors.text }}>
                  ¡Hola {data.user.name}!
                </h1>
                <p className={styles.welcomeSubtitle} style={{ color: colors.textSecondary }}>
                  ¿Qué quieres hacer hoy?
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Dashboard Cards - Solo en desktop */}
          {!isMobile && (
          <div className={styles.dashboardGrid}>
            {data.dashboardCards.map((card) => {
              const IconComponent = getIcon(card.icon);
              return (
                <div
                  key={card.id}
                  className={styles.dashboardCard}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                >
                  <div className={styles.cardContent}>
                    <div
                      className={styles.cardIcon}
                      style={getAdaptedIconStyles(card.color, theme)}
                    >
                      <IconComponent size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardTitle} style={{ color: colors.text }}>
                        {card.title}
                      </h3>
                      <span className={styles.cardCount} style={{ color: useAdaptedColor(card.color, theme) }}>
                        ({card.count})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Recent Updates */}
          <div className={styles.recentUpdates}>
            <h2 className={styles.sectionTitle} style={{ color: colors.text }}>
              Últimas actualizaciones
            </h2>
            <div
              className={styles.updatesList}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              {data.recentUpdates.map((update) => {
                const IconComponent = getIcon(update.icon);
                return (
                  <div key={update.id} className={styles.updateItem}>
                    <div className={styles.updateIcon}>
                      <IconComponent size={16} style={{ color: colors.primary }} />
                    </div>
                    <div className={styles.updateContent}>
                      <h4 className={styles.updateTitle} style={{ color: colors.text }}>
                        {update.title}
                      </h4>
                      <p className={styles.updateMeta} style={{ color: colors.textSecondary }}>
                        {update.author} • {update.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Solo en desktop */}
        {!isMobile && (
        <div className={styles.rightSidebar}>
          {/* Notifications */}
          <div 
            className={styles.notificationBadge} 
            style={{ 
              backgroundColor: theme === 'light' ? '#414976' : '#0f172a'
            }}
          >
            <Inbox size={16} />
            <span>Bandeja de entrada ({data.notifications.inbox})</span>
          </div>

          {/* Agenda */}
          <div className={styles.agendaSection}>
            <div className={styles.agendaHeader}>
              <Calendar size={20} style={{ color: colors.primary }} />
              <h3 className={styles.agendaTitle} style={{ color: colors.text }}>
                Agenda
              </h3>
            </div>
            <div className={styles.agendaCalendar}>
              <div className={styles.calendarIcon}>
                <Calendar size={32} style={{ color: colors.textSecondary }} />
              </div>
              <p className={styles.agendaDate} style={{ color: colors.textSecondary }}>
                {currentDate}
              </p>
              <button className={styles.addEventButton} style={{ color: colors.primary }}>
                + Agregar evento
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className={styles.chatSection}>
            <div className={styles.chatHeader}>
              <MessageCircle size={20} style={{ color: colors.primary }} />
              <h3 className={styles.chatTitle} style={{ color: colors.text }}>
                Chat
              </h3>
            </div>
            <div
              className={styles.chatList}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              {data.chatMessages.map((message) => (
                <div key={message.id} className={styles.chatItem}>
                  <div className={styles.chatAvatar}>
                    <Avatar
                      src={message.avatar}
                      alt={message.user}
                      size={40}
                      name={message.user}
                      showOnlineIndicator={true}
                      isOnline={message.isOnline}
                    />
                  </div>
                  <div className={styles.chatContent}>
                    <h4 className={styles.chatUser} style={{ color: colors.text }}>
                      {message.user}
                    </h4>
                    <p className={styles.chatMessage} style={{ color: colors.textSecondary }}>
                      {message.message.length > 30 
                        ? `${message.message.substring(0, 30)}...` 
                        : message.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Chat Flotante se renderiza globalmente en Layout */}
    </div>
  );
};