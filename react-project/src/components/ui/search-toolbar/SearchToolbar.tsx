import React from 'react';
import { Search, Settings } from 'lucide-react';
import { Button } from '../button';
import { Input } from '../input';
import { ViewToggle, ViewMode } from '../view-toggle';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './SearchToolbar.module.css';

export interface ToolbarAction {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

export interface SearchToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ToolbarAction[];
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  className?: string;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  actions = [],
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = false,
  className = ''
}) => {
  const { colors } = useTheme();

  return (
    <div className={`${styles.searchToolbar} ${className}`}>
      <div className={styles.toolbarLeft}>
        <div className={styles.searchContainer}>
          <Input
            icon="Search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            size="m"
            className={styles.actionButton}
            onClick={action.onClick}
            disabled={action.disabled}
            iconName={action.icon as any}
            iconPosition="left"
            backgroundColor={action.backgroundColor}
            textColor={action.textColor}
            borderColor={action.borderColor}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {showViewToggle && onViewModeChange && (
        <div className={styles.toolbarRight}>
          <ViewToggle
            currentView={viewMode}
            onViewChange={onViewModeChange}
          />
        </div>
      )}
    </div>
  );
}; 