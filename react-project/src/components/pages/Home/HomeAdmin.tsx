import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, MessageCircle, Inbox, User, Menu, Settings, Shield, AlertTriangle, Activity, TrendingUp, Database, Users, Building, FileText, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { HomeAdminData } from '../../../models/Home';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { LogoutButton } from '../../ui/LogoutButton';
import { FloatingChatBot } from '../../ui/floating-chat';
import { Avatar } from '../../ui/avatar';
import { useProfileImageUpdate } from '../../../hooks/useProfileImageUpdate';
import { getAdaptedIconStyles, useAdaptedColor } from '../../../utils/themeColors';
import styles from './Home.module.css';

export interface HomeAdminProps {
  data: HomeAdminData;
  onMenuToggle?: () => void;
  onNavigate?: (page: string) => void;
}

export const HomeAdmin: React.FC<HomeAdminProps> = ({ data, onMenuToggle, onNavigate }) => {
  const { theme, colors } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  // Función para obtener el ícono dinámicamente
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  // Función para manejar la navegación de los cards
  const handleCardClick = (href: string) => {
    if (!onNavigate) return;
    
    // Separar la URL del fragmento
    const [url, fragment] = href.split('#');
    
    // Mapear los hrefs del mock a las páginas correspondientes del sistema
    const pageMapping: { [key: string]: string } = {
      '/admin/organizations': 'organizaciones',
      '/admin/plans': 'organizaciones', // Los planes están en la misma página de organizaciones
      '/admin/roles': 'roles',
      '/admin/contracts': 'home', // Por ahora redirige a home
      '/admin/users': 'usuarios',
      '/admin/documents': 'home', // Por ahora redirige a home
      '/admin/reports': 'home', // Por ahora redirige a home
      '/admin/settings': 'home' // Por ahora redirige a home
    };

    const targetPage = pageMapping[url];
    if (targetPage) {
      // Si hay un fragmento, lo pasamos como parámetro adicional
      if (fragment) {
        onNavigate(`${targetPage}#${fragment}`);
      } else {
        onNavigate(targetPage);
      }
    }
  };

  // Función para obtener el color de estado del sistema adaptado al tema
  const getSystemHealthColor = () => {
    switch (data.systemHealth.status) {
      case 'healthy':
        return useAdaptedColor('#10B981', theme);
      case 'warning':
        return useAdaptedColor('#F59E0B', theme);
      case 'critical':
        return useAdaptedColor('#EF4444', theme);
      default:
        return colors.textSecondary;
    }
  };

  // Función para obtener el texto de estado del sistema
  const getSystemHealthText = () => {
    switch (data.systemHealth.status) {
      case 'healthy':
        return 'Sistema Saludable';
      case 'warning':
        return 'Sistema con Alertas';
      case 'critical':
        return 'Sistema Crítico';
      default:
        return 'Estado Desconocido';
    }
  };

  // Función para verificar si un card debe ser navegable
  const isCardNavigable = (href: string) => {
    // Separar la URL del fragmento para verificar
    const [url] = href.split('#');
    
    const navigableCards = [
      '/admin/organizations',
      '/admin/plans', 
      '/admin/roles'
    ];
    return navigableCards.includes(url);
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
                Panel de Administración del Sistema
              </p>
              <div className={styles.adminBadge} style={{ 
                backgroundColor: `${colors.primary}15`, 
                color: colors.primary,
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px'
              }}>
                <Shield size={12} />
                {data.user.role}
              </div>
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
            placeholder="Buscar en el sistema..."
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

      {/* Admin Metrics Cards para móvil - aparecen primero */}
      {isMobile && (
        <div className={styles.dashboardGrid}>
          {data.metrics.map((metric) => {
            const IconComponent = getIcon(metric.icon);
            const isNavigable = isCardNavigable(metric.href);
            
            return (
              <div
                key={metric.id}
                className={`${styles.dashboardCard} ${isNavigable ? styles.navigableCard : ''}`}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  cursor: isNavigable ? 'pointer' : 'default'
                }}
                onClick={() => isNavigable && handleCardClick(metric.href)}
                title={isNavigable ? `Ir a ${metric.title}` : metric.title}
              >
                <div className={styles.cardContent}>
                  <div
                    className={styles.cardIcon}
                    style={getAdaptedIconStyles(metric.color, theme)}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div className={styles.cardInfo}>
                    <h3 className={styles.cardTitle} style={{ color: colors.text }}>
                      {metric.title}
                    </h3>
                    <span className={styles.cardCount} style={{ color: useAdaptedColor(metric.color, theme) }}>
                      ({metric.count})
                    </span>
                    {metric.trend && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <TrendingUp 
                          size={12} 
                          style={{ 
                            color: metric.trend.isPositive 
                              ? useAdaptedColor('#10B981', theme) 
                              : useAdaptedColor('#EF4444', theme),
                            transform: metric.trend.isPositive ? 'none' : 'rotate(180deg)'
                          }} 
                        />
                        <span style={{ 
                          fontSize: '12px',
                          color: metric.trend.isPositive 
                            ? useAdaptedColor('#10B981', theme) 
                            : useAdaptedColor('#EF4444', theme)
                        }}>
                          {metric.trend.value}% {metric.trend.period}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* System Alerts para móvil */}
      {isMobile && data.systemAlerts.length > 0 && (
        <div className={styles.systemAlerts} style={{ marginBottom: '24px' }}>
          <h3 style={{ color: colors.text, marginBottom: '16px' }}>Alertas del Sistema</h3>
          {data.systemAlerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={styles.alertItem}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: '1px solid',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <AlertTriangle 
                size={16} 
                style={{ 
                  color: alert.type === 'critical' ? '#EF4444' : alert.type === 'warning' ? '#F59E0B' : '#10B981' 
                }} 
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: colors.text, fontSize: '14px' }}>
                  {alert.title}
                </h4>
                <p style={{ margin: '2px 0 0', color: colors.textSecondary, fontSize: '12px' }}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
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
                    Panel de Administración del Sistema
                  </p>
                  <div className={styles.adminBadge} style={{ 
                    backgroundColor: `${colors.primary}15`, 
                    color: colors.primary,
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px'
                  }}>
                    <Shield size={12} />
                    {data.user.role}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Metrics Cards - Solo en desktop */}
          {!isMobile && (
            <div className={styles.dashboardGrid}>
              {data.metrics.map((metric) => {
                const IconComponent = getIcon(metric.icon);
                const isNavigable = isCardNavigable(metric.href);
                
                return (
                  <div
                    key={metric.id}
                    className={`${styles.dashboardCard} ${isNavigable ? styles.navigableCard : ''}`}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      cursor: isNavigable ? 'pointer' : 'default'
                    }}
                    onClick={() => isNavigable && handleCardClick(metric.href)}
                    title={isNavigable ? `Ir a ${metric.title}` : metric.title}
                  >
                    <div className={styles.cardContent}>
                      <div
                        className={styles.cardIcon}
                        style={getAdaptedIconStyles(metric.color, theme)}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle} style={{ color: colors.text }}>
                          {metric.title}
                        </h3>
                        <span className={styles.cardCount} style={{ color: useAdaptedColor(metric.color, theme) }}>
                          ({metric.count})
                        </span>
                        {metric.trend && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px'
                          }}>
                            <TrendingUp 
                              size={12} 
                              style={{ 
                                color: metric.trend.isPositive 
                                  ? useAdaptedColor('#10B981', theme) 
                                  : useAdaptedColor('#EF4444', theme),
                                transform: metric.trend.isPositive ? 'none' : 'rotate(180deg)'
                              }} 
                            />
                            <span style={{ 
                              fontSize: '12px',
                              color: metric.trend.isPositive 
                                ? useAdaptedColor('#10B981', theme) 
                                : useAdaptedColor('#EF4444', theme)
                            }}>
                              {metric.trend.value}% {metric.trend.period}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notificaciones */}
          <div className={styles.recentUpdates}>
            <div className={styles.agendaHeader}>
              <Inbox size={20} style={{ color: colors.primary }} />
              <h2 className={styles.sectionTitle} style={{ color: colors.text }}>
                Notificaciones ({data.notifications.alerts + data.notifications.pendingApprovals})
              </h2>
            </div>
            <div
              className={styles.updatesList}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              {data.systemAlerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className={styles.updateItem}>
                  <div className={styles.updateIcon}>
                    <AlertTriangle 
                      size={16} 
                      style={{ 
                        color: alert.type === 'critical' 
                          ? useAdaptedColor('#EF4444', theme) 
                          : alert.type === 'warning' 
                          ? useAdaptedColor('#F59E0B', theme) 
                          : useAdaptedColor('#10B981', theme)
                      }} 
                    />
                  </div>
                  <div className={styles.updateContent}>
                    <h4 className={styles.updateTitle} style={{ color: colors.text }}>
                      {alert.title}
                    </h4>
                    <p className={styles.updateMeta} style={{ color: colors.textSecondary }}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reportes Rápidos */}
          <div className={styles.recentUpdates}>
            <div className={styles.agendaHeader}>
              <BarChart3 size={20} style={{ color: colors.primary }} />
              <h2 className={styles.sectionTitle} style={{ color: colors.text }}>
                Reportes Rápidos
              </h2>
            </div>
            <div
              className={styles.updatesList}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border
              }}
            >
              {data.quickReports.map((report) => {
                const IconComponent = getIcon(report.icon);
                return (
                  <div key={report.id} className={styles.updateItem}>
                    <div className={styles.updateIcon}>
                      <IconComponent size={16} style={{ color: useAdaptedColor(report.color, theme) }} />
                    </div>
                    <div className={styles.updateContent}>
                      <h4 className={styles.updateTitle} style={{ color: colors.text }}>
                        {report.title}
                      </h4>
                      <p className={styles.updateMeta} style={{ color: colors.textSecondary }}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Solo en desktop - Información del Sistema */}
        {!isMobile && (
          <div className={styles.rightSidebar}>
            {/* Estado del Sistema Expandido */}
            <div className={styles.systemStatusSection}>
              <div className={styles.agendaHeader}>
                <Activity size={20} style={{ color: getSystemHealthColor() }} />
                <h3 className={styles.agendaTitle} style={{ color: colors.text }}>
                  Estado del Sistema
                </h3>
              </div>
              <div
                className={styles.chatList}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }}
              >
                <div className={styles.systemMetric}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: `${colors.primary}05`,
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: colors.textSecondary, fontSize: '14px' }}>Tiempo Activo</span>
                    <span style={{ color: colors.text, fontWeight: 'bold' }}>{data.systemHealth.uptime}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: `${colors.primary}05`,
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: colors.textSecondary, fontSize: '14px' }}>Usuarios Activos</span>
                    <span style={{ color: colors.text, fontWeight: 'bold' }}>{data.systemHealth.activeUsers}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px',
                    padding: '12px',
                    backgroundColor: `${colors.primary}05`,
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: colors.textSecondary, fontSize: '14px' }}>Carga del Sistema</span>
                    <span style={{ color: colors.text, fontWeight: 'bold' }}>{data.systemHealth.systemLoad}%</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px',
                    backgroundColor: `${getSystemHealthColor()}15`,
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: colors.textSecondary, fontSize: '14px' }}>Estado General</span>
                    <span style={{ color: getSystemHealthColor(), fontWeight: 'bold' }}>
                      {getSystemHealthText()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Flotante */}
      <FloatingChatBot 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
}; 