import React from 'react';
import { Grid, List, TreePine } from 'lucide-react';
import { Button } from '../button';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './DocumentViewToggle.module.css';

export type DocumentViewMode = 'list' | 'thumbnails' | 'hierarchy';

export interface DocumentViewToggleProps {
  currentView: DocumentViewMode;
  onViewChange: (view: DocumentViewMode) => void;
  className?: string;
  disabled?: boolean;
}

export const DocumentViewToggle: React.FC<DocumentViewToggleProps> = ({
  currentView,
  onViewChange,
  className = '',
  disabled = false
}) => {
  const { colors } = useTheme();

  return (
    <div className={`${styles.viewToggle} ${className}`}>
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
      <Button
        variant={currentView === 'thumbnails' ? 'default' : 'outline'}
        size="m"
        onClick={() => onViewChange('thumbnails')}
        className={styles.viewButton}
        disabled={disabled}
        aria-label="Vista en miniaturas"
        title="Vista en miniaturas"
      >
        <Grid size={16} />
      </Button>
      <Button
        variant={currentView === 'hierarchy' ? 'default' : 'outline'}
        size="m"
        onClick={() => onViewChange('hierarchy')}
        className={styles.viewButton}
        disabled={disabled}
        aria-label="Vista jerárquica"
        title="Vista jerárquica"
      >
        <TreePine size={16} />
      </Button>
    </div>
  );
};