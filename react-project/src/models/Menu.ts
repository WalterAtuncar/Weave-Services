export interface Menu {
  menuId: number;
  menuPadreId?: number;
  titulo: string;
  ruta?: string;
  tipoIcono?: string;
  icono?: string;
  clase?: string;
  esTituloGrupo: boolean;
  badge?: string;
  badgeClass?: string;
  children?: Menu[];
}

export interface MenuData {
  menus: Menu[];
}

export interface MenuTreeNode extends Menu {
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
} 