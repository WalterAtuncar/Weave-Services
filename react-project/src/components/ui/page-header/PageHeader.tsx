import React from 'react';
import { Button } from '../button';
import styles from './PageHeader.module.css';

export interface PageHeaderAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
  primary?: boolean;
  excelStyle?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions = [],
  className = ''
}) => {

  return (
    <div className={`${styles.pageHeader} ${className}`}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {description && (
            <p className={styles.pageDescription}>{description}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className={styles.headerActions}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? 'default' : (action.variant || 'default')}
                size="m"
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.primary ? styles.primaryButton : styles.actionButton}
                iconName={action.icon as any}
                iconPosition="left"
                backgroundColor={action.excelStyle ? '#217346' : action.backgroundColor}
                textColor={action.excelStyle ? '#ffffff' : action.textColor}
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