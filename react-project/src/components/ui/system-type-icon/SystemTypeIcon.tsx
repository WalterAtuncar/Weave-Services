import React from 'react';
import { 
  Package, Users, MessageSquare, BarChart3, Briefcase, 
  FileText, Cog, Layers, DollarSign, Megaphone, Shield, 
  Settings, Code, Archive, Truck, LucideIcon 
} from 'lucide-react';
import { FamiliaSistema } from '../../../models/Sistemas';
import styles from './SystemTypeIcon.module.css';

export interface SystemTypeIconProps {
  familia: FamiliaSistema;
  size?: number;
  className?: string;
  title?: string;
}

// Mapeo de familias a iconos
const FAMILY_ICON_MAP: Record<FamiliaSistema, LucideIcon> = {
  [FamiliaSistema.ERP]: Package,
  [FamiliaSistema.CRM]: Users,
  [FamiliaSistema.GESTION_RRHH]: Briefcase,
  [FamiliaSistema.COLABORACION]: MessageSquare,
  [FamiliaSistema.GESTION_DOCUMENTAL]: FileText,
  [FamiliaSistema.BI]: BarChart3,
  [FamiliaSistema.GESTION_PROYECTOS]: Cog,
  [FamiliaSistema.OPERACIONES]: Settings,
  [FamiliaSistema.FINANCIERO_CONTABLE]: DollarSign,
  [FamiliaSistema.MARKETING_DIGITAL]: Megaphone,
  [FamiliaSistema.SEGURIDAD_INFORMACION]: Shield,
  [FamiliaSistema.GESTION_PROCESOS]: Layers,
  [FamiliaSistema.CONTROL_MONITOREO]: BarChart3,
  [FamiliaSistema.DESARROLLO_SW]: Code,
  [FamiliaSistema.LEGACY]: Archive,
  [FamiliaSistema.GESTION_ACTIVOS]: Truck
};

// Mapeo de familias a colores
const FAMILY_COLOR_MAP: Record<FamiliaSistema, string> = {
  [FamiliaSistema.ERP]: 'blue',
  [FamiliaSistema.CRM]: 'green',
  [FamiliaSistema.GESTION_RRHH]: 'pink',
  [FamiliaSistema.COLABORACION]: 'purple',
  [FamiliaSistema.GESTION_DOCUMENTAL]: 'indigo',
  [FamiliaSistema.BI]: 'orange',
  [FamiliaSistema.GESTION_PROYECTOS]: 'teal',
  [FamiliaSistema.OPERACIONES]: 'cyan',
  [FamiliaSistema.FINANCIERO_CONTABLE]: 'emerald',
  [FamiliaSistema.MARKETING_DIGITAL]: 'yellow',
  [FamiliaSistema.SEGURIDAD_INFORMACION]: 'red',
  [FamiliaSistema.GESTION_PROCESOS]: 'violet',
  [FamiliaSistema.CONTROL_MONITOREO]: 'amber',
  [FamiliaSistema.DESARROLLO_SW]: 'lime',
  [FamiliaSistema.LEGACY]: 'gray',
  [FamiliaSistema.GESTION_ACTIVOS]: 'stone'
};

export const SystemTypeIcon: React.FC<SystemTypeIconProps> = ({
  familia,
  size = 20,
  className = '',
  title
}) => {
  const IconComponent = FAMILY_ICON_MAP[familia] || Package; // Usar Package como icono por defecto
  const colorClass = FAMILY_COLOR_MAP[familia] || 'blue'; // Usar azul como color por defecto

  // Validación adicional: asegurar que el componente sea válido
  if (!IconComponent) {
    console.warn(`SystemTypeIcon: No se encontró icono para familia ${familia}, usando icono por defecto`);
    return (
      <div 
        className={`${styles.iconContainer} ${styles.blue} ${className}`}
        title={title}
      >
        <Package size={size} />
      </div>
    );
  }

  return (
    <div 
      className={`${styles.iconContainer} ${styles[colorClass]} ${className}`}
      title={title}
    >
      <IconComponent size={size} />
    </div>
  );
}; 