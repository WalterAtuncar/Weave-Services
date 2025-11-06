// Tipos para las tarjetas de estadísticas del dashboard
export interface DashboardCard {
  id: string;
  title: string;
  count: number;
  icon: string;
  color: string;
  href: string;
}

// Tipos específicos para las métricas administrativas del super admin
export interface AdminMetricCard {
  id: string;
  title: string;
  count: number;
  icon: string;
  color: string;
  href: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
}

// Tipos para las alertas del sistema (super admin)
export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  action?: {
    label: string;
    href: string;
  };
}

// Tipos para las actividades recientes del sistema
export interface SystemActivity {
  id: string;
  title: string;
  description: string;
  type: 'user' | 'organization' | 'contract' | 'system';
  timestamp: string;
  user: string;
  icon: string;
}

// Tipos para los reportes rápidos
export interface QuickReport {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  lastGenerated?: string;
}

// Tipos para los elementos de la agenda
export interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'meeting' | 'task' | 'event';
}

// Tipos para los mensajes del chat
export interface ChatMessage {
  id: string;
  user: string;
  avatar: string | null;
  message: string;
  time: string;
  isOnline?: boolean;
}

// Tipos para las últimas actualizaciones
export interface RecentUpdate {
  id: string;
  title: string;
  type: 'process' | 'document' | 'policy' | 'management';
  author: string;
  date: string;
  icon: string;
}

// Tipo principal para los datos del Home (usuario institucional)
export interface HomeData {
  user: {
    name: string;
    avatar?: string | null;
  };
  dashboardCards: DashboardCard[];
  agendaItems: AgendaItem[];
  chatMessages: ChatMessage[];
  recentUpdates: RecentUpdate[];
  notifications: {
    inbox: number;
  };
}

// Tipo principal para los datos del HomeAdmin (super admin)
export interface HomeAdminData {
  user: {
    name: string;
    avatar?: string | null;
    role: string;
    lastLogin?: string;
  };
  metrics: AdminMetricCard[];
  systemAlerts: SystemAlert[];
  systemActivities: SystemActivity[];
  quickReports: QuickReport[];
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    activeUsers: number;
    systemLoad: number;
  };
  notifications: {
    alerts: number;
    pendingApprovals: number;
    systemMessages: number;
  };
} 