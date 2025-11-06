// ============================================================================
// MENU UTILS
// ============================================================================
// Utilidades para gestionar menús en localStorage

import { MenuItem } from '../services/types/auth.types';

// Definición del menú de workflow
const WORKFLOW_MENU: MenuItem = {
  menuId: 999, // ID único que no conflicte con otros menús
  titulo: 'Workflows',
  ruta: '/workflow',
  tipoIcono: 'lucide',
  icono: 'GitBranch',
  clase: 'menu-workflow',
  esTituloGrupo: false,
  badge: null,
  badgeClase: null,
  menuPadreId: null,
  menusHijos: [],
  tituloMenuPadre: null
};

// Definición del menú de dominios de data
const DOMINIOS_DATA_MENU: MenuItem = {
  menuId: 998, // ID único que no conflicte con otros menús
  titulo: 'Dominios de Data',
  ruta: '/dominios-data',
  tipoIcono: 'lucide',
  icono: 'Database',
  clase: 'menu-dominios-data',
  esTituloGrupo: false,
  badge: null,
  badgeClase: null,
  menuPadreId: null,
  menusHijos: [],
  tituloMenuPadre: null
};

// Definición del menú de activos de data
const ACTIVOS_DATA_MENU: MenuItem = {
  menuId: 997, // ID único que no conflicte con otros menús
  titulo: 'Activos de Data',
  ruta: '/activos-data',
  tipoIcono: 'lucide',
  icono: 'HardDrive',
  clase: 'menu-activos-data',
  esTituloGrupo: false,
  badge: null,
  badgeClase: null,
  menuPadreId: null,
  menusHijos: [],
  tituloMenuPadre: null
};

/**
 * Verifica si el menú de workflow ya existe en localStorage
 */
export const hasWorkflowMenu = (): boolean => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return false;
    
    const session = JSON.parse(userSession);
    const menus: MenuItem[] = session.menu || [];
    
    return menus.some(menu => 
      menu.titulo === 'Workflows' || 
      menu.ruta === '/workflow' ||
      menu.icono === 'GitBranch'
    );
  } catch (error) {
    console.error('Error al verificar menú de workflow:', error);
    return false;
  }
};

/**
 * Verifica si el menú de dominios de data ya existe en localStorage
 */
export const hasDominiosDataMenu = (): boolean => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return false;
    
    const session = JSON.parse(userSession);
    const menus: MenuItem[] = session.menu || [];
    
    return menus.some(menu => 
      menu.titulo === 'Dominios de Data' || 
      menu.ruta === '/dominios-data' ||
      menu.icono === 'Database'
    );
  } catch (error) {
    console.error('Error al verificar menú de dominios de data:', error);
    return false;
  }
};

/**
 * Agrega el menú de workflow al localStorage si no existe
 */
export const addWorkflowMenuToStorage = (): boolean => {
  try {
    // Verificar si ya existe
    if (hasWorkflowMenu()) {
  
      return true;
    }

    const userSession = localStorage.getItem('userSession');
    if (!userSession) {

      return false;
    }
    
    const session = JSON.parse(userSession);
    const currentMenus: MenuItem[] = session.menu || [];
    
    // Agregar el menú de workflow al final
    const updatedMenus = [...currentMenus, WORKFLOW_MENU];
    
    // Actualizar la sesión
    const updatedSession = {
      ...session,
      menu: updatedMenus
    };
    
    localStorage.setItem('userSession', JSON.stringify(updatedSession));
    

    return true;
    
  } catch (error) {
    console.error('Error al agregar menú de workflow:', error);
    return false;
  }
};

/**
 * Agrega el menú de dominios de data al localStorage si no existe
 */
export const addDominiosDataMenuToStorage = (): boolean => {
  try {
    // Verificar si ya existe
    if (hasDominiosDataMenu()) {
      return true;
    }

    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      return false;
    }
    
    const session = JSON.parse(userSession);
    const currentMenus: MenuItem[] = session.menu || [];
    
    // Agregar el menú de dominios de data al final
    const updatedMenus = [...currentMenus, DOMINIOS_DATA_MENU];
    
    // Actualizar la sesión
    const updatedSession = {
      ...session,
      menu: updatedMenus
    };
    
    localStorage.setItem('userSession', JSON.stringify(updatedSession));
    
    return true;
    
  } catch (error) {
    console.error('Error al agregar menú de dominios de data:', error);
    return false;
  }
};

/**
 * Remueve el menú de workflow del localStorage
 */
export const removeWorkflowMenuFromStorage = (): boolean => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return true; // No hay nada que remover
    
    const session = JSON.parse(userSession);
    const currentMenus: MenuItem[] = session.menu || [];
    
    // Filtrar el menú de workflow
    const filteredMenus = currentMenus.filter(menu => 
      menu.titulo !== 'Workflows' && 
      menu.ruta !== '/workflow' &&
      menu.icono !== 'GitBranch'
    );
    
    // Actualizar la sesión
    const updatedSession = {
      ...session,
      menu: filteredMenus
    };
    
    localStorage.setItem('userSession', JSON.stringify(updatedSession));
    

    return true;
    
  } catch (error) {
    console.error('Error al remover menú de workflow:', error);
    return false;
  }
};

/**
 * Remueve el menú de dominios de data del localStorage
 */
export const removeDominiosDataMenuFromStorage = (): boolean => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return true; // No hay nada que remover
    
    const session = JSON.parse(userSession);
    const currentMenus: MenuItem[] = session.menu || [];
    
    // Filtrar el menú de dominios de data
    const filteredMenus = currentMenus.filter(menu => 
      menu.titulo !== 'Dominios de Data' && 
      menu.ruta !== '/dominios-data' &&
      menu.icono !== 'Database'
    );
    
    // Actualizar la sesión
    const updatedSession = {
      ...session,
      menu: filteredMenus
    };
    
    localStorage.setItem('userSession', JSON.stringify(updatedSession));
    
    return true;
    
  } catch (error) {
    console.error('Error al remover menú de dominios de data:', error);
    return false;
  }
};

/**
 * Obtiene todos los menús del localStorage
 */
export const getMenusFromStorage = (): MenuItem[] => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return [];
    
    const session = JSON.parse(userSession);
    return session.menu || [];
    
  } catch (error) {
    console.error('Error al obtener menús del localStorage:', error);
    return [];
  }
};

/**
 * Lista información básica de todos los menús en localStorage
 */
export const listMenusInfo = (): void => {
  try {
    const menus = getMenusFromStorage();

    
  } catch (error) {
    console.error('Error al listar menús:', error);
  }
};

/**
 * Inicializa el menú de workflow si es necesario
 * Se debe llamar cuando la aplicación carga
 */
export const initializeWorkflowMenu = (): void => {
  // Esperar un poco para que el localStorage esté completamente cargado
  setTimeout(() => {
    if (!hasWorkflowMenu()) {

      addWorkflowMenuToStorage();
      
      // Disparar evento para que el sidebar se actualice
      window.dispatchEvent(new Event('storage'));
    }
  }, 1000);
};

/**
 * Verifica si el menú de activos de data ya existe en localStorage
 */
export const hasActivosDataMenu = (): boolean => {
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return false;
    
    const session = JSON.parse(userSession);
    const menus: MenuItem[] = session.menu || [];
    
    return menus.some(menu => 
      menu.titulo === 'Activos de Data' || 
      menu.ruta === '/activos-data' ||
      menu.icono === 'HardDrive'
    );
  } catch (error) {
    console.error('Error al verificar menú de activos de data:', error);
    return false;
  }
};

/**
 * Agrega el menú de activos de data al localStorage si no existe
 */
export const addActivosDataMenuToStorage = (): boolean => {
  try {
    // Verificar si ya existe
    if (hasActivosDataMenu()) {
      return true;
    }

    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      return false;
    }
    
    const session = JSON.parse(userSession);
    const currentMenus: MenuItem[] = session.menu || [];
    
    // Agregar el menú de activos de data al final
    const updatedMenus = [...currentMenus, ACTIVOS_DATA_MENU];
    
    // Actualizar la sesión
    const updatedSession = {
      ...session,
      menu: updatedMenus
    };
    
    localStorage.setItem('userSession', JSON.stringify(updatedSession));
    
    return true;
    
  } catch (error) {
    console.error('Error al agregar menú de activos de data:', error);
    return false;
  }
};

/**
 * Inicializa el menú de dominios de data si es necesario
 * Se debe llamar cuando la aplicación carga
 */
export const initializeDominiosDataMenu = (): void => {
  // Esperar un poco para que el localStorage esté completamente cargado
  setTimeout(() => {
    if (!hasDominiosDataMenu()) {
      addDominiosDataMenuToStorage();
      
      // Disparar evento para que el sidebar se actualice
      window.dispatchEvent(new Event('storage'));
    }
  }, 1000);
};

/**
 * Inicializa el menú de activos de data si es necesario
 * Se debe llamar cuando la aplicación carga
 */
export const initializeActivosDataMenu = (): void => {
  // Esperar un poco para que el localStorage esté completamente cargado
  setTimeout(() => {
    if (!hasActivosDataMenu()) {
      addActivosDataMenuToStorage();
      
      // Disparar evento para que el sidebar se actualice
      window.dispatchEvent(new Event('storage'));
    }
  }, 1000);
};

/**
 * Inicializa todos los menús personalizados si es necesario
 * Se debe llamar cuando la aplicación carga
 */
export const initializeCustomMenus = (): void => {
  initializeWorkflowMenu();
  initializeDominiosDataMenu();
  initializeActivosDataMenu();
};