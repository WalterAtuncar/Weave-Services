import React, { useState } from 'react';
import { User, Camera, Loader2 } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

// Agregar la animación del spinner como CSS global si no existe
if (typeof document !== 'undefined') {
  const spinKeyframes = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  
  // Verificar si ya existe la animación
  let styleSheet = document.getElementById('avatar-spinner-animation');
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = 'avatar-spinner-animation';
    styleSheet.textContent = spinKeyframes;
    document.head.appendChild(styleSheet);
  }
}

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  fallbackIcon?: React.ComponentType<{ size?: number }>;
  clickable?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 40,
  name,
  className = '',
  style = {},
  showOnlineIndicator = false,
  isOnline = false,
  fallbackIcon: FallbackIcon = User,
  clickable = false,
  onClick,
  loading = false
}) => {
  const { colors, theme } = useTheme();
  const [hasError, setHasError] = useState(false);

  // Función simple para obtener colores del avatar según el tema
  const getAvatarColors = () => {
    if (theme === 'dark') {
      // En modo oscuro: usar un color que contraste bien con fondo oscuro
      return {
        backgroundColor: '#6366F1', // Púrpura que se ve bien en oscuro
        textColor: 'white'
      };
    } else {
      // En modo claro: usar el color primario normal
      return {
        backgroundColor: colors.primary,
        textColor: 'white'
      };
    }
  };

  const avatarColors = getAvatarColors();

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
    cursor: clickable ? 'pointer' : 'default',
    transition: clickable ? 'transform 0.2s ease, opacity 0.2s ease' : 'none',
    opacity: loading ? 0.7 : 1,
    ...style
  };

  const handleClick = () => {
    if (clickable && !loading && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable && !loading) {
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clickable) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const shouldShowImage = src && !hasError && src.trim() !== '';

  return (
    <div 
      className={className} 
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={clickable ? 'Clic para cambiar foto de perfil' : alt}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: avatarColors.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: avatarColors.textColor
          }}
        >
          <FallbackIcon size={Math.floor(size * 0.5)} />
        </div>
      )}

      {/* Overlay para estado clickeable */}
      {clickable && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.opacity = '0';
            }
          }}
        >
          {loading ? (
            <Loader2 
              size={Math.floor(size * 0.35)} 
              color="white" 
              style={{ 
                animation: 'spin 1s linear infinite',
                animationDuration: '1s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear'
              }} 
            />
          ) : (
            <Camera 
              size={Math.floor(size * 0.35)} 
              color="white" 
            />
          )}
        </div>
      )}
      
      {showOnlineIndicator && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: Math.floor(size * 0.25),
            height: Math.floor(size * 0.25),
            borderRadius: '50%',
            backgroundColor: isOnline ? '#10B981' : '#6B7280',
            border: `2px solid ${colors.surface}`,
            minWidth: '8px',
            minHeight: '8px'
          }}
        />
      )}
    </div>
  );
}; 