import React, { useState } from 'react';
import styles from './InlineDetailsSidebar.module.css';
import { useTheme } from '../../../contexts/ThemeContext';
import type { DocumentFormData } from './types';
import { ChevronRight } from 'lucide-react';
import { Button } from '../button/button';
import { AnimatePresence, motion } from 'framer-motion';

export interface InlineDetailsSidebarProps {
  data?: DocumentFormData;
  open?: boolean;
  onToggle?: () => void;
}

export const InlineDetailsSidebar: React.FC<InlineDetailsSidebarProps> = ({ data, open = false, onToggle }) => {
  const { colors } = useTheme();
  const [sections, setSections] = useState({ generales: false, versiones: false, atributos: false });

  if (!open) {
    return (
      <button
        className={styles.handle}
        onClick={onToggle}
        style={{
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          color: '#FFFFFF'
        }}
      >
        Detalles
      </button>
    );
  }

  return (
    <aside className={styles.sidebarContainer} style={{ backgroundColor: colors.surface }}>
      <div className={styles.sidebarHeader} style={{ borderColor: colors.border, backgroundColor: colors.background }}>
        <div className={styles.title} style={{ color: colors.text }}>Detalles</div>
        <Button
          variant="secondary"
          size="s"
          iconName="X"
          onClick={onToggle}
        >
          Cerrar
        </Button>
      </div>
      <div className={styles.content}>
        {/* Datos Generales */}
        <div className={styles.accordion} style={{ borderColor: colors.border }}>
          <button 
            className={styles.accordionHeader}
            onClick={() => setSections(s => ({ ...s, generales: !s.generales }))}
            aria-expanded={sections.generales}
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            <span>Datos Generales</span>
            <ChevronRight size={16} className={`${styles.chevron} ${sections.generales ? styles.chevronOpen : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {sections.generales && (
              <motion.div
                className={styles.accordionBody}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <div className={styles.propRow}><div className={styles.muted}>Título</div><div>{data?.titulo || '-'}</div></div>
                <div className={styles.propRow}><div className={styles.muted}>Tipo</div><div>{data?.tipo || '-'}</div></div>
                <div className={styles.propRow}><div className={styles.muted}>Objetivo</div><div>{data?.objetivo || '-'}</div></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Versiones */}
        <div className={styles.accordion} style={{ borderColor: colors.border }}>
          <button 
            className={styles.accordionHeader}
            onClick={() => setSections(s => ({ ...s, versiones: !s.versiones }))}
            aria-expanded={sections.versiones}
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            <span>Versiones</span>
            <ChevronRight size={16} className={`${styles.chevron} ${sections.versiones ? styles.chevronOpen : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {sections.versiones && (
              <motion.div
                className={styles.accordionBody}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <div className={styles.propRow}><div className={styles.muted}>Versión</div><div>{data?.version || '-'}</div></div>
                <div className={styles.propRow}><div className={styles.muted}>Estado</div><div>{data?.estadoVersion || '-'}</div></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Atributos */}
        <div className={styles.accordion} style={{ borderColor: colors.border }}>
          <button 
            className={styles.accordionHeader}
            onClick={() => setSections(s => ({ ...s, atributos: !s.atributos }))}
            aria-expanded={sections.atributos}
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            <span>Atributos</span>
            <ChevronRight size={16} className={`${styles.chevron} ${sections.atributos ? styles.chevronOpen : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {sections.atributos && (
              <motion.div
                className={styles.accordionBody}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <div className={styles.muted}>Sin atributos adicionales</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

export default InlineDetailsSidebar;