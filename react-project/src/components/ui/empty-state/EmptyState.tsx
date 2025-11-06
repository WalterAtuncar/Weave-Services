import React from 'react';
import { Button } from '../button';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './EmptyState.module.css';

export interface EmptyStateAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  primary?: boolean;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actions = [],
  className = ''
}) => {
  const { colors } = useTheme();

  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && (
        <div className={styles.iconContainer}>
          {/* Renderizar icono dinámicamente */}
          <div className={styles.icon}>
            {/* Placeholder para icono */}
            <div className={styles.iconPlaceholder}>
              📦
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        {actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? 'default' : (action.variant || 'outline')}
                size="m"
                onClick={action.onClick}
                className={action.primary ? styles.primaryAction : styles.secondaryAction}
                iconName={action.icon as any}
                iconPosition="left"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 