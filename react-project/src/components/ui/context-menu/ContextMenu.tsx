import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './ContextMenu.module.css';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose
}) => {
  const { theme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = position.x;
    let newY = position.y;

    // Ajustar posición horizontal si se sale del viewport
    if (position.x + menuRect.width > viewportWidth) {
      newX = viewportWidth - menuRect.width - 10;
    }
    if (newX < 10) {
      newX = 10;
    }

    // Ajustar posición vertical si se sale del viewport
    if (position.y + menuRect.height > viewportHeight) {
      newY = viewportHeight - menuRect.height - 10;
    }
    if (newY < 10) {
      newY = 10;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      onClose();
    }
  };

  return createPortal(
    <div
      ref={menuRef}
      className={`${styles.contextMenu} ${styles[theme]}`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.separator && index > 0 && (
            <div className={styles.separator} />
          )}
          <div
            className={`${styles.menuItem} ${
              item.disabled ? styles.disabled : ''
            }`}
            onClick={() => handleItemClick(item)}
          >
            {item.icon && (
              <span className={styles.menuIcon}>{item.icon}</span>
            )}
            <span className={styles.menuLabel}>{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>,
    document.body
  );
};