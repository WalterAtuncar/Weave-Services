// ============================================================================
// DEBUG MENU UTILS
// ============================================================================
// Utilidades para debugging del sistema de menús

import { 
  hasWorkflowMenu, 
  addWorkflowMenuToStorage, 
  removeWorkflowMenuFromStorage, 
  listMenusInfo,
  getMenusFromStorage
} from './menuUtils';

/**
 * Función de debugging para verificar y gestionar menús
 * Disponible en la consola del navegador como window.debugMenu
 */
export const debugMenu = {
  
  /**
   * Lista todos los menús actuales
   */
  list: () => {
    listMenusInfo();
  },

  /**
   * Verifica si existe el menú de workflow
   */
  hasWorkflow: () => {
    const exists = hasWorkflowMenu();
    return exists;
  },

  /**
   * Agrega el menú de workflow manualmente
   */
  addWorkflow: () => {
    const result = addWorkflowMenuToStorage();
    return result;
  },

  /**
   * Remueve el menú de workflow
   */
  removeWorkflow: () => {
    const result = removeWorkflowMenuFromStorage();
    return result;
  },

  /**
   * Muestra el localStorage completo
   */
  showStorage: () => {
    try {
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
      } else {
      }
    } catch (error) {
      console.error('Error al mostrar localStorage:', error);
    }
  },

  /**
   * Reinicia el menú de workflow (lo remueve y lo agrega de nuevo)
   */
  resetWorkflow: () => {
    removeWorkflowMenuFromStorage();
    const result = addWorkflowMenuToStorage();
    listMenusInfo();
    return result;
  },

  /**
   * Recarga los menús forzando al sidebar a actualizarse
   */
  reloadSidebar: () => {
    window.dispatchEvent(new Event('storage'));
  },

  /**
   * Muestra ayuda de comandos disponibles
   */
  help: () => {
  }
};

/**
 * Exponer debugMenu en window para uso en consola del navegador
 */
if (typeof window !== 'undefined') {
  (window as any).debugMenu = debugMenu;

}