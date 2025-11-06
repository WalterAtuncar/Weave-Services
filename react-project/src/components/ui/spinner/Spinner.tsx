import React, { useState, useEffect } from 'react';
import { HashLoader } from 'react-spinners';
import { useTheme } from '../../../contexts/ThemeContext';
import { spinnerService } from '../../../services/spinnerService';
import './Spinner.css';

export const Spinner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const { colors, theme } = useTheme();

  useEffect(() => {
    // Suscribirse al servicio de spinner
    const unsubscribe = spinnerService.subscribe((visible, text) => {
      setIsVisible(visible);
      setLoadingText(text || '');
    });

    // Sincronizar estado inicial
    setIsVisible(spinnerService.getState());
    setLoadingText(spinnerService.getLoadingText());

    // Cleanup al desmontar
    return unsubscribe;
  }, []);

  if (!isVisible) {
    return null;
  }

  // Usar textSecondary para light theme, primary para dark theme
  const spinnerColor = theme === 'light' ? colors.background : colors.primary;
  const textColor = theme === 'light' ? colors.background : colors.primary;
  const logoSrc = '/logo/logow-light.svg';

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner-content">
          <img 
            src={logoSrc}
            alt="Logo"
            className="spinner-logo"
          />
          <HashLoader
            color={spinnerColor}
            loading={isVisible}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          {loadingText && (
            <p className="spinner-text" style={{ color: textColor }}>
              {loadingText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 