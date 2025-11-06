/**
 * Utilidades para generar avatares de usuarios
 * 
 * Este archivo proporciona funciones para generar URLs de avatares
 * usando diferentes servicios gratuitos disponibles
 */

export interface AvatarOptions {
  name?: string;
  size?: number;
  background?: string;
  color?: string;
  style?: 'initials' | 'random' | 'illustrated';
}

/**
 * Genera una URL de avatar usando RandomUser.me
 * @param gender 'men' | 'women'
 * @param id número del 0-99
 */
export const getRandomUserAvatar = (gender: 'men' | 'women' = 'men', id: number = 1): string => {
  const avatarId = Math.max(0, Math.min(99, id)); // Asegurar que esté entre 0-99
  return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
};

/**
 * Genera una URL de avatar con iniciales usando UI Avatars
 * @param options configuración del avatar
 */
export const getInitialsAvatar = (options: AvatarOptions): string => {
  const {
    name = 'Usuario',
    size = 40,
    background = '414976',
    color = 'ffffff'
  } = options;
  
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=${background}&color=${color}&bold=true&rounded=true`;
};

/**
 * Genera una URL de avatar ilustrado usando DiceBear
 * @param seed semilla para generar el avatar (puede ser el nombre del usuario)
 * @param style estilo del avatar
 */
export const getIllustratedAvatar = (seed: string = 'default', style: string = 'avataaars'): string => {
  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}`;
};

/**
 * Genera un avatar automáticamente basado en el nombre del usuario
 * @param name nombre del usuario
 * @param options opciones adicionales
 */
export const generateUserAvatar = (name: string, options: AvatarOptions = {}): string => {
  const { style = 'random' } = options;
  
  switch (style) {
    case 'initials':
      return getInitialsAvatar({ ...options, name });
    
    case 'illustrated':
      return getIllustratedAvatar(name);
    
    case 'random':
    default:
      // Usar el hash del nombre para determinar género e ID de manera consistente
      const hash = name.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const gender = Math.abs(hash) % 2 === 0 ? 'men' : 'women';
      const id = Math.abs(hash) % 100;
      
      return getRandomUserAvatar(gender, id);
  }
};

/**
 * Lista de avatares predefinidos para usar como ejemplos
 */
export const SAMPLE_AVATARS = {
  men: [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/men/45.jpg',
    'https://randomuser.me/api/portraits/men/15.jpg',
    'https://randomuser.me/api/portraits/men/67.jpg',
    'https://randomuser.me/api/portraits/men/28.jpg'
  ],
  women: [
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/women/22.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/women/76.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg'
  ]
};

/**
 * Obtiene un avatar aleatorio de la lista de muestras
 * @param gender género preferido
 */
export const getRandomSampleAvatar = (gender?: 'men' | 'women'): string => {
  if (gender) {
    const avatars = SAMPLE_AVATARS[gender];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }
  
  // Seleccionar género aleatoriamente
  const allAvatars = [...SAMPLE_AVATARS.men, ...SAMPLE_AVATARS.women];
  return allAvatars[Math.floor(Math.random() * allAvatars.length)];
}; 