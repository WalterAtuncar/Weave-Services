/**
 * 🎨 Utilidad para adaptar colores según el tema
 * Convierte colores fijos a versiones adaptadas para modo claro y oscuro
 */

export interface ThemeColorMapping {
  light: string;
  dark: string;
}

/**
 * Mapeo de colores para diferentes temas
 * Los colores originales funcionan bien en modo claro,
 * pero necesitan versiones más suaves para modo oscuro
 */
const colorMappings: Record<string, ThemeColorMapping> = {
  // Azul
  '#3B82F6': {
    light: '#3B82F6', // Azul original
    dark: '#60A5FA'   // Azul más claro para dark mode
  },
  
  // Verde
  '#10B981': {
    light: '#10B981', // Verde original
    dark: '#34D399'   // Verde más claro para dark mode
  },
  
  // Púrpura
  '#8B5CF6': {
    light: '#8B5CF6', // Púrpura original
    dark: '#A78BFA'   // Púrpura más claro para dark mode
  },
  
  // Amarillo/Naranja
  '#F59E0B': {
    light: '#F59E0B', // Amarillo original
    dark: '#FBBF24'   // Amarillo más claro para dark mode
  },
  
  // Cian
  '#06B6D4': {
    light: '#06B6D4', // Cian original
    dark: '#22D3EE'   // Cian más claro para dark mode
  },
  
  // Rojo
  '#EF4444': {
    light: '#EF4444', // Rojo original
    dark: '#F87171'   // Rojo más claro para dark mode
  },
  
  // Índigo
  '#6366F1': {
    light: '#6366F1', // Índigo original
    dark: '#818CF8'   // Índigo más claro para dark mode
  }
};

/**
 * Adapta un color según el tema actual
 * @param originalColor - Color original del mock data
 * @param theme - Tema actual ('light' | 'dark')
 * @returns Color adaptado para el tema
 */
export const adaptColorForTheme = (originalColor: string, theme: 'light' | 'dark'): string => {
  const mapping = colorMappings[originalColor];
  
  if (!mapping) {
    // Si no hay mapeo específico, devolver el color original
    console.warn(`No hay mapeo de color para: ${originalColor}`);
    return originalColor;
  }
  
  return mapping[theme];
};

/**
 * Crea los estilos de icono adaptados al tema
 * @param originalColor - Color original del icono
 * @param theme - Tema actual
 * @returns Objeto con backgroundColor y color adaptados
 */
export const getAdaptedIconStyles = (originalColor: string, theme: 'light' | 'dark') => {
  const adaptedColor = adaptColorForTheme(originalColor, theme);
  
  return {
    backgroundColor: `${adaptedColor}20`, // 20% opacity para el fondo
    color: adaptedColor
  };
};

/**
 * Función helper para usar en componentes
 * @param originalColor - Color original
 * @param theme - Tema actual
 * @returns Color adaptado
 */
export const useAdaptedColor = (originalColor: string, theme: 'light' | 'dark'): string => {
  return adaptColorForTheme(originalColor, theme);
};