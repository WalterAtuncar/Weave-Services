import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services';
import { UsuarioAuth, OrganizacionLogin, MenuItem, UsuarioGobernanzaRol } from '../services/types/auth.types';

interface UseAuthReturn {
  // Estado de autenticación
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Datos del usuario
  user: UsuarioAuth | null;
  organization: OrganizacionLogin | null;
  gobernanzaRol: UsuarioGobernanzaRol | null;
  menu: MenuItem[];
  token: string | null;
  
  // 🔧 AGREGADO: Información de organización procesada
  organizationInfo: {
    id: number | null;
    hasOrganization: boolean;
    displayName: string;
    name: string;
    code: string;
    document: string;
    address: string;
    location: string;
  };
  
  // Información de visualización
  displayInfo: {
    name: string;
    fullName: string;
    photoUrl: string | null;
  } | null;
  
  // Métodos de autenticación
  login: (credentials: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuthState: () => void;
  
  // Utilidades
  hasPermission: (permission: string) => boolean;
  isInRole: (role: string) => boolean;
}

/**
 * 🔐 Hook de Autenticación Mejorado
 * 
 * Características:
 * - Estado de autenticación reactivo
 * - Auto-refresh en cambios de token
 * - Métodos de utilidad para permisos
 * - Manejo de eventos de logout forzado
 * - Loading states
 */
export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UsuarioAuth | null>(null);
  const [organization, setOrganization] = useState<OrganizacionLogin | null>(null);
  const [gobernanzaRol, setGobernanzaRol] = useState<UsuarioGobernanzaRol | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Guardas para evitar refrescos reentrantes y demasiadas llamadas consecutivas
  const isRefreshingRef = useRef<boolean>(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  // ✅ Función para actualizar el estado desde el servicio
  const refreshAuthState = useCallback(() => {
    if (isRefreshingRef.current) return; // Evitar reentradas
    isRefreshingRef.current = true;
    try {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      const currentOrg = authService.getCurrentOrganization();
      const currentGobernanzaRol = authService.getCurrentGobernanzaRol();
      const currentMenu = authService.getUserMenu();
      const currentToken = authService.getStoredToken();

      // Actualizaciones condicionadas para evitar renders innecesarios
      setIsAuthenticated(prev => (prev !== authenticated ? authenticated : prev));
      setUser(prev => (prev !== currentUser ? currentUser : prev));
      setOrganization(prev => (prev !== currentOrg ? currentOrg : prev));
      setGobernanzaRol(prev => (prev !== currentGobernanzaRol ? currentGobernanzaRol : prev));
      setMenu(prev => (prev !== currentMenu ? currentMenu : prev));
      setToken(prev => (prev !== currentToken ? currentToken : prev));
      
    } catch (error) {
      console.error('Error al actualizar estado de autenticación:', error);
      setIsAuthenticated(false);
      setUser(null);
      setOrganization(null);
      setGobernanzaRol(null);
      setMenu([]);
      setToken(null);
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, []);

  // ✅ Inicializar estado al montar el hook
  useEffect(() => {
    // Primera carga al montar
    refreshAuthState();

    // 🔄 Escuchar eventos de logout forzado
    const handleForceLogout = () => {
      // Debounce sencillo para evitar ráfagas de refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = window.setTimeout(() => {
        refreshAuthState();
      }, 50);
    };

    // 🔄 Escuchar cambios en localStorage (logout en otra pestaña)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken' || event.key === 'userSession') {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        refreshTimeoutRef.current = window.setTimeout(() => {
          refreshAuthState();
        }, 50);
      }
    };

    // Registrar listeners
    window.addEventListener('auth:forceLogout', handleForceLogout);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      window.removeEventListener('auth:forceLogout', handleForceLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ✅ Función de login
  const login = useCallback(async (credentials: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        // Actualizar estado después del login exitoso
        refreshAuthState();
        return true;
      } else {
        console.error('Login fallido:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuthState]);

  // ✅ Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      // Limpiar estado local
      setIsAuthenticated(false);
      setUser(null);
      setOrganization(null);
      setMenu([]);
      setToken(null);
      
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Información de visualización del usuario
  const displayInfo = user ? {
    name: user.nombre || user.nombreUsuario,
    fullName: user.nombreCompleto || user.nombreUsuario,
    photoUrl: user.fotoUrl && user.fotoUrl.trim() !== '' ? user.fotoUrl : null
  } : null;

  // 🔧 AGREGADO: Información de organización procesada
  const organizationInfo = {
    id: organization?.organizacionId || null,
    hasOrganization: !!organization,
    displayName: organization?.nombreComercial || organization?.razonSocial || 'Sin organización',
    name: organization?.razonSocial || '',
    code: organization?.codigo || '',
    document: organization?.numeroDocumento || '',
    address: organization?.direccion || '',
    location: organization?.ubicacionCompleta || ''
  };

  // 🔧 FIX: Ensure organization data is loaded from localStorage if not available
  const orgLoadedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!isAuthenticated) {
      orgLoadedRef.current = false; // reset al desautenticar
      return;
    }
    if (!organization && isAuthenticated && !orgLoadedRef.current) {
      try {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          if (session?.organizacion) {
            setOrganization(session.organizacion);
            orgLoadedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Error loading organization from localStorage:', error);
      }
    }
  }, [organization, isAuthenticated]);

  // ✅ Verificar si el usuario tiene un permiso específico
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || !menu.length) return false;
    
    // Buscar el permiso en el menú (recursivamente)
    const searchPermission = (items: MenuItem[]): boolean => {
      return items.some(item => {
        // Verificar si el item actual tiene el permiso
        if (item.ruta === permission || item.titulo === permission) {
          return true;
        }
        
        // Buscar en submenús si existen
        if (item.menusHijos && item.menusHijos.length > 0) {
          return searchPermission(item.menusHijos);
        }
        
        return false;
      });
    };
    
    return searchPermission(menu);
  }, [isAuthenticated, menu]);

  // ✅ Verificar si el usuario tiene un rol específico
  const isInRole = useCallback((role: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Verificar rol en el perfil del usuario
    // Esto dependerá de cómo esté estructurado tu sistema de roles
    return user.perfilId?.toString().includes(role.toLowerCase()) || false;
  }, [isAuthenticated, user]);

  return {
    // Estado
    isAuthenticated,
    isLoading,
    
    // Datos
    user,
    organization,
    gobernanzaRol,
    menu,
    token,
    organizationInfo, // 🔧 AGREGADO
    displayInfo,
    
    // Métodos
    login,
    logout,
    refreshAuthState,
    
    // Utilidades
    hasPermission,
    isInRole
  };
};

export default useAuth;