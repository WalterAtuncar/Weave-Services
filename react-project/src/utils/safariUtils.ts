/**
 * Utilidades específicas para Safari
 * Centraliza funciones para manejar problemas específicos del navegador Safari
 */

/**
 * Detecta si el navegador es Safari
 * @returns boolean - true si es Safari, false en caso contrario
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  return /^((?!chrome|android).)*safari/i.test(ua);
};

/**
 * Detecta si es Safari en iOS
 * @returns boolean - true si es Safari en iOS
 */
export const isSafariIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
  return iOSSafari;
};

/**
 * Detecta si es Safari en macOS
 * @returns boolean - true si es Safari en macOS
 */
export const isSafariMacOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator?.userAgent || '';
  const isMac = ua.indexOf('Mac') !== -1;
  const isWebKit = ua.indexOf('WebKit') !== -1;
  const isChrome = ua.indexOf('Chrome') !== -1;
  return isMac && isWebKit && !isChrome;
};

/**
 * Aplica prevención de eventos específica para Safari
 * @param event - Evento del mouse/touch
 */
export const preventSafariEvents = (event: React.MouseEvent | React.TouchEvent) => {
  if (isSafari()) {
    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * Configuración de estilos específicos para Safari
 * @returns objeto con estilos CSS específicos para Safari
 */
export const getSafariStyles = (): React.CSSProperties => {
  if (!isSafari()) return {};
  
  return {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent'
  };
};

/**
 * Delays específicos para Safari
 */
export const SAFARI_DELAYS = {
  CLICK_PROTECTION: 100, // ms para proteger contra clicks múltiples
  STATE_PROCESSING: 50,  // ms para procesamiento de estado
  DEBOUNCE: 50,          // ms para debounce de eventos
  INIT: 100,             // ms para inicialización de Safari
  PANEL_CLOSE: 25,       // ms para cierre de panel
  STATE_UPDATE: 25,      // ms para actualización de estado
  NAVIGATION: 50,        // ms para navegación
  SUB_ITEM: 25,          // ms para sub-items del menú
  RENDERING: 30          // ms para rendering optimizado
};

/**
 * Hook personalizado para debounce específico para Safari
 */
export const getSafariDelay = (operation: 'click' | 'state' | 'debounce' | 'init' | 'panelClose' | 'stateUpdate' | 'navigation' | 'subItem' | 'rendering'): number => {
  if (!isSafari()) return 0;
  
  switch (operation) {
    case 'click':
      return SAFARI_DELAYS.CLICK_PROTECTION;
    case 'state':
      return SAFARI_DELAYS.STATE_PROCESSING;
    case 'debounce':
      return SAFARI_DELAYS.DEBOUNCE;
    case 'init':
      return SAFARI_DELAYS.INIT;
    case 'panelClose':
      return SAFARI_DELAYS.PANEL_CLOSE;
    case 'stateUpdate':
      return SAFARI_DELAYS.STATE_UPDATE;
    case 'navigation':
      return SAFARI_DELAYS.NAVIGATION;
    case 'subItem':
      return SAFARI_DELAYS.SUB_ITEM;
    case 'rendering':
      return SAFARI_DELAYS.RENDERING;
    default:
      return 0;
  }
};

/**
 * Función para agregar event listeners con configuración específica para Safari
 * @param element - Elemento DOM
 * @param event - Tipo de evento
 * @param handler - Handler del evento
 * @param options - Opciones adicionales
 */
export const addSafariEventListener = (
  element: Document | Element,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
) => {
  if (isSafari()) {
    // Para Safari, usar capture phase para mejor control
    const safariOptions = typeof options === 'boolean' 
      ? options 
      : { capture: true, ...options };
    element.addEventListener(event, handler, safariOptions);
  } else {
    element.addEventListener(event, handler, options);
  }
};

/**
 * Función para remover event listeners con configuración específica para Safari
 * @param element - Elemento DOM
 * @param event - Tipo de evento
 * @param handler - Handler del evento
 * @param options - Opciones adicionales
 */
export const removeSafariEventListener = (
  element: Document | Element,
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
) => {
  if (isSafari()) {
    const safariOptions = typeof options === 'boolean' 
      ? options 
      : { capture: true, ...options };
    element.removeEventListener(event, handler, safariOptions);
  } else {
    element.removeEventListener(event, handler, options);
  }
};

/**
 * Configuración de atributos específicos para Safari en elementos clickeables
 * @returns objeto con atributos para elementos clickeables en Safari
 */
export const getSafariClickableAttributes = () => {
  if (!isSafari()) return {};
  
  return {
    'data-safari-clickable': 'true',
    role: 'button',
    tabIndex: 0
  };
}; 