import React from 'react';
import { ArrowDown, ArrowUp, Link, Layers } from 'lucide-react';
import styles from './HierarchyIndicator.module.css';

export type HierarchyType = 'parent' | 'child' | 'independent' | 'connected';

export interface HierarchyIndicatorProps {
  type: HierarchyType;
  dependencyName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  title?: string;
}

const HIERARCHY_CONFIG = {
  parent: {
    icon: ArrowDown,
    label: 'Sistema Padre',
    color: 'blue'
  },
  child: {
    icon: ArrowUp,
    label: 'Depende de',
    color: 'orange'
  },
  independent: {
    icon: Layers,
    label: 'Independiente',
    color: 'green'
  },
  connected: {
    icon: Link,
    label: 'Conectado',
    color: 'purple'
  }
};

export const HierarchyIndicator: React.FC<HierarchyIndicatorProps> = ({
  type,
  dependencyName,
  size = 'md',
  showLabel = false,
  className = '',
  title
}) => {
  const config = HIERARCHY_CONFIG[type];
  const IconComponent = config.icon;

  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20
  }[size];

  return (
    <div 
      className={`${styles.hierarchyIndicator} ${styles[size]} ${className}`}
      title={title}
    >
      <div className={`${styles.iconContainer} ${styles[config.color]}`}>
        <IconComponent size={iconSize} />
      </div>
      
      {showLabel && (
        <div className={styles.labelContainer}>
          <span className={styles.label}>
            {config.label}
          </span>
          {dependencyName && type === 'child' && (
            <span className={styles.dependencyName}>
              {dependencyName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 