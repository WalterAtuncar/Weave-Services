import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X,
  ChevronRight
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { menuService } from '@/services';
import { MenuItem } from '@/services/types/auth.types';
import { 
  isSafari, 
  preventSafariEvents, 
  getSafariStyles, 
  getSafariDelay,
  addSafariEventListener,
  removeSafariEventListener
} from '@/utils/safariUtils';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Sidebar.module.css';

export interface SidebarProps {
  onItemClick?: (item: MenuItem) => void;
  className?: string;
  isMobile?: boolean;
  currentPage?: string; // Página actual para sincronizar el estado visual
}

// Función para obtener el icono dinámicamente
const getIconComponent = (iconName: string): React.ComponentType<any> => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Square;
};

// Hook personalizado para debounce optimizado para Safari
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export const Sidebar: React.FC<SidebarProps> = ({
  onItemClick,
  className,
  isMobile = false,
  currentPage
}) => {
  const { colors, theme } = useTheme();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeItem, setActiveItem] = useState<number>(1);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [isProcessingClick, setIsProcessingClick] = useState<boolean>(false);
  const [safariRenderingOptimized, setSafariRenderingOptimized] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastClickTimeRef = useRef<number>(0);
  const renderingTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimización específica para Safari - Inicializar rendering optimizado
  useEffect(() => {
    if (isSafari()) {
      // Delay inicial para permitir que Safari inicialice el DOM
      const initDelay = getSafariDelay('init');
      setTimeout(() => {
        setSafariRenderingOptimized(true);
      }, initDelay);
    } else {
      setSafariRenderingOptimized(true);
    }
  }, []);

  // Cargar menús desde localStorage al montar el componente
  useEffect(() => {
    const loadMenus = () => {
      try {
        const menus = menuService.getMenusHierarchyFromStorage();
        setMenuItems(menus);
        
        // Establecer Home como activo por defecto si existe
        const homeMenu = menus.find(menu => menu.titulo.toLowerCase() === 'home');
        if (homeMenu) {
          setActiveItem(homeMenu.menuId);
        }
      } catch (error) {
        console.error('Error al cargar menús:', error);
      }
    };

    loadMenus();
  }, []);

  // Sincronizar activeItem con currentPage cuando cambie
  useEffect(() => {
    if (!currentPage || menuItems.length === 0) return;
    // Mapeo de selectedOption a propiedades del menú para encontrar el menuId correcto
    const pageToMenuMapping = {
      'home': { titulo: 'home', ruta: '/home' },
      'mi-organizacion': { titulo: 'mi organización', ruta: '/mi-organizacion' },
      'gestion-organizacional': { titulo: 'organigrama', ruta: '/gestion-organizacional' },
      'organizaciones': { titulo: 'organizaciones', ruta: '/organizaciones' },
      'roles': { titulo: 'roles y permisos', ruta: '/roles' },
      'usuarios': { titulo: 'usuarios', ruta: '/usuarios' },
      'sistemas': { titulo: 'sistemas', ruta: '/sistemas' },
      'dominios-data': { titulo: 'dominios de data', ruta: '/dominios-data' },
      'gobernanza': { titulo: 'gobernanza', ruta: '/gobernanza' },
      'servidores': { titulo: 'servidores', ruta: '/servidores' },
      'ubigeo': { titulo: 'ubigeo', ruta: '/ubigeo' },
      'unidades-posiciones': { titulo: 'unidades y posiciones', ruta: '/unidades-posiciones' },
      'workflow': { titulo: 'workflow', ruta: '/workflow' },
      'procesos': { titulo: 'procesos', ruta: '/procesos' }
    };

    const mapping = pageToMenuMapping[currentPage as keyof typeof pageToMenuMapping];
    if (!mapping) {
      console.warn('🚫 No se encontró mapeo para currentPage:', currentPage);
      return;
    }

    // Buscar el menú por título o ruta
    const targetMenu = menuItems.find(menu => {
      const tituloMatch = menu.titulo.toLowerCase().trim() === mapping.titulo;
      const rutaMatch = menu.ruta === mapping.ruta;
      
      // También buscar en sub-menús
      const subMenuMatch = menu.menusHijos?.some(subMenu => {
        const subTituloMatch = subMenu.titulo.toLowerCase().trim() === mapping.titulo;
        const subRutaMatch = subMenu.ruta === mapping.ruta;
        return subTituloMatch || subRutaMatch;
      });

      return tituloMatch || rutaMatch || subMenuMatch;
    });

    if (targetMenu) {
      setActiveItem(targetMenu.menuId);
    } else {
      console.warn('🚫 No se encontró menú para:', mapping);
    }
  }, [currentPage, menuItems]);

  // Memoizar el handler de click fuera del componente con optimización Safari
  const handleClickOutside = useCallback((event: Event) => {
    if (!safariRenderingOptimized) return;
    
    const mouseEvent = event as MouseEvent;
    if (
      isPanelOpen && 
      panelRef.current && 
      sidebarRef.current &&
      !panelRef.current.contains(mouseEvent.target as Node) &&
      !sidebarRef.current.contains(mouseEvent.target as Node)
    ) {
      // Optimización Safari: Delay antes de cerrar panel
      if (isSafari()) {
        const closeDelay = getSafariDelay('panelClose');
        setTimeout(() => {
          setIsPanelOpen(false);
        }, closeDelay);
      } else {
        setIsPanelOpen(false);
      }
    }
  }, [isPanelOpen, safariRenderingOptimized]);

  useEffect(() => {
    // Usar utilidades Safari para event listeners
    addSafariEventListener(document, 'mousedown', handleClickOutside);
    return () => {
      removeSafariEventListener(document, 'mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // State batching optimizado para Safari
  const updatePanelState = useCallback((menuId: number, shouldOpen: boolean) => {
    if (!safariRenderingOptimized) return;
    
    if (isSafari()) {
      // Para Safari, usar setTimeout para evitar conflictos de rendering
      const stateUpdateDelay = getSafariDelay('stateUpdate');
      setTimeout(() => {
        setActiveItem(menuId);
        setIsPanelOpen(shouldOpen);
      }, stateUpdateDelay);
    } else {
      setActiveItem(menuId);
      setIsPanelOpen(shouldOpen);
    }
  }, [safariRenderingOptimized]);

  // Función principal de manejo de clicks con protección específica para Safari
  const handleItemClick = useCallback((item: MenuItem, event?: React.MouseEvent) => {
    console.log('🔍 Sidebar handleItemClick - Item recibido:', item);
    console.log('🔍 Sidebar - Item.ruta:', item.ruta);
    console.log('🔍 Sidebar - Item.titulo:', item.titulo);
    console.log('🔍 Sidebar - Item.menuId:', item.menuId);
    console.log('🔍 Sidebar - safariRenderingOptimized:', safariRenderingOptimized);
    
    if (!safariRenderingOptimized) {
      console.log('❌ Sidebar - safariRenderingOptimized es false, saliendo');
      return;
    }
    
    // Prevenir propagación de eventos (crítico para Safari)
    if (event) {
      preventSafariEvents(event);
    }

    // Protección contra clicks múltiples rápidos (especialmente necesario en Safari)
    const now = Date.now();
    const clickProtectionDelay = getSafariDelay('click');
    if (now - lastClickTimeRef.current < clickProtectionDelay) {
      console.log('❌ Sidebar - Click demasiado rápido, ignorando');
      return;
    }
    lastClickTimeRef.current = now;

    // Prevenir procesamiento concurrente
    if (isProcessingClick) {
      console.log('❌ Sidebar - Ya procesando un click, ignorando');
      return;
    }

    console.log('✅ Sidebar - Iniciando procesamiento del click');
    setIsProcessingClick(true);

    try {
      // Si tiene ruta (navegación directa), navegar independientemente de si es título de grupo
      if (item.ruta && onItemClick) {
        console.log('🚀 Sidebar - Item tiene ruta, llamando onItemClick:', item.ruta);
        onItemClick(item);
        // Optimización Safari: Delay antes de cerrar panel
        if (isSafari()) {
          const navigationDelay = getSafariDelay('navigation');
          setTimeout(() => {
            setIsPanelOpen(false);
          }, navigationDelay);
        } else {
          setIsPanelOpen(false);
        }
        return;
      }

      // Si es un grupo con hijos pero sin ruta, mostrar/ocultar panel
      if (item.esTituloGrupo && item.menusHijos.length > 0 && !item.ruta) {
        console.log('🔍 Sidebar - Item es grupo con hijos, toggling panel');
        if (activeItem === item.menuId && isPanelOpen) {
          updatePanelState(item.menuId, false);
        } else {
          updatePanelState(item.menuId, true);
        }
      } else {
        console.log('❌ Sidebar - Item no tiene ruta ni es grupo válido:', {
          esTituloGrupo: item.esTituloGrupo,
          menusHijos: item.menusHijos?.length,
          ruta: item.ruta
        });
      }
    } finally {
      // Usar setTimeout para dar tiempo a Safari a procesar el cambio de estado
      const stateDelay = getSafariDelay('state');
      setTimeout(() => {
        console.log('✅ Sidebar - Finalizando procesamiento del click');
        setIsProcessingClick(false);
      }, stateDelay);
    }
  }, [activeItem, isPanelOpen, isProcessingClick, onItemClick, updatePanelState, safariRenderingOptimized]);

  // Debounce específico para Safari
  const debounceDelay = getSafariDelay('debounce');
  const debouncedHandleItemClick = useDebounce(handleItemClick, debounceDelay);

  // Handler optimizado para sub-items del menú
  const handleSubItemClick = useCallback((subItem: MenuItem, event?: React.MouseEvent) => {
    if (!safariRenderingOptimized) return;
    
    if (event) {
      preventSafariEvents(event);
    }

    if (onItemClick) {
      onItemClick(subItem);
    }
    
    // Optimización Safari: Delay antes de cerrar panel
    if (isSafari()) {
      const subItemDelay = getSafariDelay('subItem');
      setTimeout(() => {
        setIsPanelOpen(false);
      }, subItemDelay);
    } else {
      setIsPanelOpen(false);
    }
  }, [onItemClick, safariRenderingOptimized]);

  const handlePanelClose = useCallback((event?: React.MouseEvent) => {
    if (event) {
      preventSafariEvents(event);
    }
    setIsPanelOpen(false);
  }, []);

  const getActiveItemContent = useCallback(() => {
    const activeItemData = menuItems.find(item => item.menuId === activeItem);
    if (!activeItemData || !activeItemData.esTituloGrupo) {
      return null;
    }

    return (
      <div className={`${styles.panelContent} ${isSafari() ? styles.safariTextOptimized : ''}`}>
        <h3 style={{ color: colors.text, margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
          {activeItemData.titulo}
        </h3>
        {activeItemData.menusHijos.length > 0 && (
          <div className={`${styles.configSections} ${isSafari() ? styles.safariOptimized : ''}`}>
            {activeItemData.menusHijos.map((subItem) => {
              const IconComponent = getIconComponent(subItem.icono);
              return (
                <div 
                  key={subItem.menuId}
                  className={`${styles.configSection} ${isSafari() ? styles.safariTransitionOptimized : ''}`}
                  onClick={(e) => handleSubItemClick(subItem, e)}
                  onMouseDown={(e) => isSafari() && preventSafariEvents(e)}
                  style={{
                    ...isSafari() ? getSafariStyles() : {},
                    backgroundColor: colors.surface,
                    borderColor: colors.border
                  }}
                >
                  <IconComponent 
                    className={styles.sectionIcon} 
                    size={18} 
                    style={{ color: colors.primary }}
                  />
                  <div className={styles.sectionInfo}>
                    <span 
                      className={styles.sectionTitle}
                      style={{ color: colors.text }}
                    >
                      {subItem.titulo}
                    </span>
                    <span 
                      className={styles.sectionDesc}
                      style={{ color: colors.textSecondary }}
                    >
                      {getMenuDescription(subItem.titulo)}
                    </span>
                  </div>
                  <ChevronRight size={16} style={{ color: colors.textSecondary }} />
                </div>
              );
            })}
          </div>
        )}
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: colors.surface, 
          borderRadius: '6px', 
          border: `1px solid ${colors.border}` 
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: colors.primary 
          }}>
            💡 <strong>Selecciona una opción</strong> para navegar a la sección correspondiente
          </p>
        </div>
      </div>
    );
  }, [activeItem, menuItems, handleSubItemClick, safariRenderingOptimized, colors]);

  // Función para obtener descripciones dinámicas
  const getMenuDescription = useCallback((titulo: string): string => {
    const descriptions: { [key: string]: string } = {
      'Roles y Permisos': 'Gestionar roles y permisos del sistema',
      'Usuarios': 'Administrar usuarios del sistema',
      'Clientes': 'Gestionar clientes, suscripciones y planes',
      'Organizaciones': 'Gestionar clientes, suscripciones y planes',
      'Organigrama': 'Constructor y gestor de organigrama empresarial',
      'Gestión de Sistemas': 'Configurar sistemas y módulos de la plataforma'
    };
    return descriptions[titulo] || `Gestionar ${titulo.toLowerCase()}`;
  }, []);

  // Construir clases CSS con optimizaciones Safari
  const sidebarClasses = `${styles.goldenBeltSidebar} ${className || ''} ${isSafari() ? styles.safariOptimized : ''}`;
  const panelClasses = `${styles.secondaryPanel} ${isPanelOpen ? styles.open : styles.closed} ${isMobile ? styles.mobile : ''} ${isSafari() ? styles.safariTransitionOptimized : ''}`;

  // Renderizar solo cuando Safari esté optimizado
  if (!safariRenderingOptimized) {
    return (
      <div style={{ 
        width: '60px', 
        height: '100vh', 
        background: '#414976',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      <div 
        ref={sidebarRef} 
        className={sidebarClasses}
        style={isSafari() ? getSafariStyles() : {}}
      >
        <div className={`${styles.mainSidebarLogo} ${isSafari() ? styles.safariOptimized : ''}`}>
          <img 
            src="/logo/logow-light.svg" 
            alt="Logo" 
            className={styles.logoIcon}
          />
        </div>

        <nav className={`${styles.mainSidebarNav} ${isSafari() ? styles.safariOptimized : ''}`}>
          {menuItems.map((item) => {
            const IconComponent = getIconComponent(item.icono);
            const hasNavigation = !!item.ruta;
            
            return (
              <div
                key={item.menuId}
                className={`${styles.mainSidebarItem} ${
                  activeItem === item.menuId ? styles.active : ''
                } ${hasNavigation ? styles.hasNavigation : ''} ${isSafari() ? styles.safariTransitionOptimized : ''}`}
                onClick={(e) => {
                  // Para Safari, usar el handler con debounce
                  if (isSafari()) {
                    debouncedHandleItemClick(item, e);
                  } else {
                    handleItemClick(item, e);
                  }
                }}
                onMouseDown={(e) => {
                  // Prevenir comportamiento de hover en Safari
                  if (isSafari()) {
                    preventSafariEvents(e);
                  }
                }}
                title={hasNavigation ? `${item.titulo} (Navegar)` : item.titulo}
                style={isSafari() ? getSafariStyles() : {}}
              >
                <IconComponent className={styles.mainSidebarIcon} size={22} />
                <div className={styles.activeIndicator} />
                {hasNavigation && <div className={styles.navigationIndicator} />}
              </div>
            );
          })}
        </nav>
      </div>

      <div 
        ref={panelRef} 
        className={panelClasses}
        style={{
          ...isSafari() ? getSafariStyles() : {},
          backgroundColor: colors.surface,
          borderColor: colors.border
        }}
      >
        <div className={`${styles.panelHeader} ${isSafari() ? styles.safariOptimized : ''}`}>
          <h2 
            className={styles.panelTitle}
            style={{ color: colors.text }}
          >
            {menuItems.find(item => item.menuId === activeItem)?.titulo}
          </h2>
          <button
            className={styles.panelCloseButton}
            onClick={handlePanelClose}
            onMouseDown={(e) => isSafari() && preventSafariEvents(e)}
            title="Cerrar panel"
            style={{ color: colors.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className={`${styles.panelBody} ${isSafari() ? styles.safariOptimized : ''}`}>
          {getActiveItemContent()}
        </div>
      </div>

      {isMobile && isPanelOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={handlePanelClose}
          onMouseDown={(e) => isSafari() && preventSafariEvents(e)}
        />
      )}
    </>
  );
};