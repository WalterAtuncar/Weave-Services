import React from 'react';
import styles from './MenuGrid.module.css';
import { useTheme } from '@/contexts/ThemeContext';
import * as Lucide from 'lucide-react';

export type GridPreset = '3x3' | '4x3';

export interface MenuGridProps {
  /** Items a renderizar dentro del grid */
  children: React.ReactNode;
  /** Preajuste rápido: '3x3' o '4x3' */
  preset?: GridPreset;
  /** Columnas explícitas (tiene prioridad sobre preset) */
  columns?: number;
  className?: string;
  /** Título opcional de la sección del menú */
  title?: string;
  /** Nombre del ícono Lucide a mostrar junto al título */
  titleIconName?: string;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  children,
  preset = '3x3',
  columns,
  className = '',
  title,
  titleIconName
}) => {
  const { colors } = useTheme();
  const cols = columns ?? (preset === '4x3' ? 4 : 3);
  const gridClass = `${styles.grid} ${
    cols === 1 ? styles.cols1 : cols === 2 ? styles.cols2 : cols === 3 ? styles.cols3 : styles.cols4
  }`;
  const IconComp: any = titleIconName ? (Lucide as any)[titleIconName] : undefined;

  return (
    <div>
      {title && (
        <div
          className={styles.sectionHeader}
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className={styles.sectionLeft}>
            {IconComp && (
              <span className={styles.sectionIcon} style={{ color: colors.text }}>
                <IconComp size={22} />
              </span>
            )}
            <h2 className={styles.sectionTitle} style={{ color: colors.text }}>{title}</h2>
          </div>
        </div>
      )}
      <div className={[gridClass, className].join(' ')}>
        {children}
      </div>
    </div>
  );
};