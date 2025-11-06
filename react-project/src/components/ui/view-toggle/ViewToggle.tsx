import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '../button';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './ViewToggle.module.css';

export type ViewMode = 'grid' | 'list';

export interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
  disabled?: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = '',
  disabled = false
}) => {
  const { colors } = useTheme();

  return (
    <div className={`${styles.viewToggle} ${className}`}>
      <Button
        variant={currentView === 'grid' ? 'default' : 'outline'}
        size="m"
        onClick={() => onViewChange('grid')}
        className={styles.viewButton}
        disabled={disabled}
        aria-label="Vista en grilla"
        title="Vista en grilla"
      >
        <Grid size={16} />
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'outline'}
        size="m"
        onClick={() => onViewChange('list')}
        className={styles.viewButton}
        disabled={disabled}
        aria-label="Vista en lista"
        title="Vista en lista"
      >
        <List size={16} />
      </Button>
    </div>
  );
};