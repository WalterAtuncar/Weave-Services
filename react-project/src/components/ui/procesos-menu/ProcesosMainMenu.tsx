import React from 'react';
import { GitBranch, Grid3x3, ListOrdered, Plus, Pencil, Trash2, Upload, Download, ShieldCheck, CheckCircle2, BarChart3 } from 'lucide-react';
import { MenuGrid, MenuCard, CardActionButton } from '../menu-card';
import { useTheme } from '../../../contexts/ThemeContext';

export interface ProcesosMainMenuProps {
  onExploreGrid: () => void;
  onExploreList: () => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onImport: () => void;
  onExport: () => void;
  onGovernance: () => void;
  onApproval: () => void;
  onAnalytics: () => void;
  className?: string;
}

export const ProcesosMainMenu: React.FC<ProcesosMainMenuProps> = ({
  onExploreGrid,
  onExploreList,
  onCreate,
  onUpdate,
  onDelete,
  onImport,
  onExport,
  onGovernance,
  onApproval,
  onAnalytics,
  className = ''
}) => {
  const { colors } = useTheme();

  return (
    <div className={className} style={{ padding: '16px 0' }}>
      <MenuGrid title="Gestión de Procesos" titleIconName="GitBranch" preset="3x3">
        <MenuCard
          title="Explorar procesos"
          description="Navega la colección de procesos por tarjetas o por lista"
          icon={<GitBranch size={24} color={colors.primary} />}
          actions={[
            { label: 'Vista Cards', icon: <Grid3x3 size={18} />, onClick: onExploreGrid, variant: 'primary' },
            { label: 'Vista Lista', icon: <ListOrdered size={18} />, onClick: onExploreList }
          ]}
        />

        <MenuCard
          title="Crear proceso"
          description="Inicia el formulario de nuevo proceso"
          icon={<Plus size={24} color={colors.primary} />}
          actions={[{ label: 'Crear', icon: <Plus size={18} />, onClick: onCreate, variant: 'primary' }]}
        />

        <MenuCard
          title="Actualizar proceso"
          description="Selecciona y edita procesos existentes"
          icon={<Pencil size={24} color={colors.primary} />}
          actions={[{ label: 'Actualizar', icon: <Pencil size={18} />, onClick: onUpdate }]}
        />

        <MenuCard
          title="Eliminar proceso"
          description="Gestiona la eliminación controlada de procesos"
          icon={<Trash2 size={24} color={colors.primary} />}
          actions={[{ label: 'Eliminar', icon: <Trash2 size={18} />, onClick: onDelete, variant: 'danger' }]}
        />

        <MenuCard
          title="Importar/Exportar"
          description="Carga masiva y exporta la estructura de procesos"
          icon={<Upload size={24} color={colors.primary} />}
          actions={[
            { label: 'Importar', icon: <Upload size={18} />, onClick: onImport, variant: 'success' },
            { label: 'Exportar', icon: <Download size={18} />, onClick: onExport }
          ]}
        />

        <MenuCard
          title="Gobernanza"
          description="Roles, responsables y políticas de procesos"
          icon={<ShieldCheck size={24} color={colors.primary} />}
          actions={[{ label: 'Abrir gobernanza', icon: <ShieldCheck size={18} />, onClick: onGovernance }]}
        />

        <MenuCard
          title="Aprobación"
          description="Seguimiento de aprobación y estados"
          icon={<CheckCircle2 size={24} color={colors.primary} />}
          actions={[{ label: 'Ver aprobación', icon: <CheckCircle2 size={18} />, onClick: onApproval }]}
        />

        <MenuCard
          title="Analítica"
          description="Métricas y gráficas de actividad"
          icon={<BarChart3 size={24} color={colors.primary} />}
          actions={[{ label: 'Abrir analítica', icon: <BarChart3 size={18} />, onClick: onAnalytics }]}
        />
      </MenuGrid>
    </div>
  );
};

export default ProcesosMainMenu;