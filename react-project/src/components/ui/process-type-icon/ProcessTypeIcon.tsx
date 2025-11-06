import React from 'react';
import { 
  Settings, 
  Users, 
  FileText, 
  Zap, 
  Shield, 
  Target, 
  Workflow,
  GitBranch,
  Database,
  Cog
} from 'lucide-react';
import { TipoProceso } from '../../../models/Procesos';

interface ProcessTypeIconProps {
  tipo: TipoProceso;
  size?: number;
  className?: string;
  title?: string;
}

export const ProcessTypeIcon: React.FC<ProcessTypeIconProps> = ({
  tipo,
  size = 20,
  className = '',
  title
}) => {
  const getIcon = () => {
    switch (tipo) {
      case TipoProceso.Estrategico:
        return <Target size={size} className={className} title={title} />;
      case TipoProceso.Operativo:
        return <Cog size={size} className={className} title={title} />;
      case TipoProceso.Apoyo:
        return <Users size={size} className={className} title={title} />;
      case TipoProceso.Gestion:
        return <Settings size={size} className={className} title={title} />;
      case TipoProceso.Calidad:
        return <Shield size={size} className={className} title={title} />;
      case TipoProceso.Mejora:
        return <Zap size={size} className={className} title={title} />;
      case TipoProceso.Documentacion:
        return <FileText size={size} className={className} title={title} />;
      case TipoProceso.Flujo:
        return <Workflow size={size} className={className} title={title} />;
      case TipoProceso.Subproceso:
        return <GitBranch size={size} className={className} title={title} />;
      case TipoProceso.Datos:
        return <Database size={size} className={className} title={title} />;
      default:
        return <Settings size={size} className={className} title={title} />;
    }
  };

  return getIcon();
};