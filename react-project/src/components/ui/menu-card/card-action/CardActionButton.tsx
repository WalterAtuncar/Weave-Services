import React from 'react';
import styles from './CardActionButton.module.css';
import { useTheme } from '../../../../contexts/ThemeContext';

export type CardActionVariant = 'primary' | 'outline' | 'ghost';
export type CardActionSize = 'small' | 'medium' | 'large';

export interface CardActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: CardActionVariant;
  size?: CardActionSize;
  disabled?: boolean;
}

export const CardActionButton: React.FC<CardActionButtonProps> = ({
  label,
  icon,
  onClick,
  href,
  variant = 'outline',
  size = 'medium',
  disabled = false
}) => {
  const { colors, theme } = useTheme();

  const style: React.CSSProperties = {
    backgroundColor: variant === 'primary'
      ? colors.primary
      : theme === 'dark' ? 'transparent' : '#ffffff',
    color: variant === 'primary'
      ? (theme === 'dark' ? '#0f172a' : '#ffffff')
      : colors.text,
    borderColor: variant === 'outline' || variant === 'ghost'
      ? colors.border
      : 'transparent',
    boxShadow: theme === 'dark'
      ? '0 2px 10px rgba(0,0,0,.3)'
      : '0 1px 2px rgba(0,0,0,.06)'
  };

  const className = [
    styles.btn,
    styles[variant],
    styles[size]
  ].join(' ');

  const Comp: any = href ? 'a' : 'button';

  return (
    <Comp
      className={className}
      style={style}
      onClick={onClick}
      href={href}
      aria-label={label}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </Comp>
  );
};