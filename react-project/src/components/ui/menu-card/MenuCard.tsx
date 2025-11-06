import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './MenuCard.module.css';
import { useTheme } from '../../../contexts/ThemeContext';
import { CardActionButton, type CardActionButtonProps } from './card-action/CardActionButton';

export interface MenuCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  /** Acciones internas; si no se provee, el card emite onCardClick */
  actions?: CardActionButtonProps[];
  /** Si true, al hacer click en el card se expanden/colapsan las acciones */
  expandable?: boolean;
  /** Evento de click del card (modo sin acciones) */
  onCardClick?: () => void;
  /** Deshabilitar el card completo */
  disabled?: boolean;
  className?: string;
  /** Tamaño del card: small | medium | large | auto
   *  - auto: con acciones -> colapsado large, expandido medium; sin acciones -> large
   */
  size?: 'small' | 'medium' | 'large' | 'auto';
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  icon,
  actions,
  expandable = true,
  onCardClick,
  disabled = false,
  className = '',
  size = 'auto'
}) => {
  const { colors, theme } = useTheme();
  const [expanded, setExpanded] = useState<boolean>(false);

  // Variantes de animación para el icono, profesionales y sutiles
  const iconVariants = {
    rest: { scale: 1, y: 0, rotate: 0 },
    hover: {
      scale: 1.06,
      y: -2,
      // Giro sutil: 45° a la izquierda y regreso a 0
      rotate: [-45, 0],
      transition: {
        // Transición spring para escala y desplazamiento
        scale: { type: 'spring', stiffness: 340, damping: 20, mass: 0.5 },
        y: { type: 'spring', stiffness: 340, damping: 20, mass: 0.5 },
        // Giro más lento con tween para sensación limpia
        rotate: { duration: 0.8, ease: 'easeOut' }
      }
    }
  } as const;

  const clickable = !!onCardClick || (expandable && actions && actions.length > 0);

  const handleCardClick = () => {
    if (disabled) return;
    if (actions && actions.length > 0 && expandable) setExpanded(prev => !prev);
    if (onCardClick && (!actions || actions.length === 0)) onCardClick();
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.surface,
    borderColor: expanded ? colors.primary : colors.border,
    boxShadow: theme === 'dark'
      ? '0 6px 20px rgba(0,0,0,.35)'
      : '0 4px 12px rgba(0,0,0,.08)'
  };

  const iconStyle: React.CSSProperties = {
    backgroundColor: `${colors.primary}15`,
    border: `1px solid ${colors.border}`
  };

  // Tamaño calculado para experiencia UX:
  // - Si size === 'auto' y hay acciones: colapsado large, expandido medium
  // - Si size === 'auto' y NO hay acciones: large
  // - Si size fue especificado, respetarlo
  const computedSizeClass = (() => {
    if (size !== 'auto') return styles[size];
    if (actions && actions.length > 0 && expandable) {
      return expanded ? styles.medium : styles.large;
    }
    return styles.large;
  })();

  const centerClass = !expanded ? styles.vcenter : '';

  return (
    <motion.article
      className={[styles.card, computedSizeClass, centerClass, clickable ? styles.clickable : '', className].join(' ')}
      onClick={handleCardClick}
      aria-disabled={disabled}
      style={cardStyle}
      initial="rest"
      animate="rest"
      whileHover={disabled ? undefined : 'hover'}
    >
      <header className={styles.header}>
        {icon && (
          <motion.span
            className={styles.icon}
            style={iconStyle}
            variants={iconVariants}
          >
            {icon}
          </motion.span>
        )}
        <h3 className={styles.title} style={{ color: colors.text }}>{title}</h3>
      </header>
      {description && (
        <p className={styles.description} style={{ color: colors.textSecondary }}>
          {description}
        </p>
      )}

      {actions && actions.length > 0 && expandable && (
        <div className={styles.footer}>
          <span className={styles.expandHint} style={{ color: colors.textSecondary }}>
            {expanded ? 'Selecciona una opción' : 'Haz clic para ver opciones'}
          </span>
        </div>
      )}

      {expanded && actions && actions.length > 0 && (
        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          {actions.map((a) => (
            <CardActionButton key={a.label} {...a} />
          ))}
        </div>
      )}
    </motion.article>
  );
};