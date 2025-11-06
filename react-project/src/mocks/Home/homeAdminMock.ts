import { HomeAdminData } from '../../models/Home';

/**
 * Mock data para la página HomeAdmin (Super Admin)
 * 
 * Dashboard específico para el perfil 1 (Super Admin) con métricas administrativas
 * del sistema completo: organizaciones, planes, roles, contratos, documentos, etc.
 */

export const homeAdminDataMock: HomeAdminData = {
  user: {
    name: 'Erick',
    avatar: null,
    role: 'Super Admin',
    lastLogin: '2024-01-15 08:30:00'
  },
  metrics: [
    {
      id: 'organizations',
      title: 'Organizaciones',
      count: 12,
      icon: 'Building',
      color: '#3B82F6',
      href: '/admin/organizations#organizaciones',
      description: 'Organizaciones activas en el sistema',
      trend: {
        value: 8,
        isPositive: true,
        period: 'último mes'
      }
    },
    {
      id: 'active-plans',
      title: 'Planes Vigentes',
      count: 6,
      icon: 'Calendar',
      color: '#10B981',
      href: '/admin/organizations#planes',
      description: 'Planes de suscripción activos',
      trend: {
        value: 2,
        isPositive: true,
        period: 'último mes'
      }
    },
    {
      id: 'roles',
      title: 'Roles',
      count: 4,
      icon: 'Shield',
      color: '#8B5CF6',
      href: '/admin/roles',
      description: 'Roles configurados en el sistema',
      trend: {
        value: 0,
        isPositive: true,
        period: 'sin cambios'
      }
    },
    {
      id: 'contracts',
      title: 'Contratos',
      count: 12,
      icon: 'FileText',
      color: '#F59E0B',
      href: '/admin/contracts',
      description: 'Contratos activos y vigentes',
      trend: {
        value: 15,
        isPositive: true,
        period: 'último mes'
      }
    },
    {
      id: 'documents',
      title: 'Documentos / Manuales',
      count: 8,
      icon: 'BookOpen',
      color: '#06B6D4',
      href: '/admin/documents',
      description: 'Documentos y manuales del sistema',
      trend: {
        value: 3,
        isPositive: true,
        period: 'última semana'
      }
    },
    {
      id: 'reports',
      title: 'Reportes',
      count: 25,
      icon: 'BarChart3',
      color: '#EF4444',
      href: '/admin/reports',
      description: 'Reportes generados del sistema',
      trend: {
        value: 12,
        isPositive: true,
        period: 'último mes'
      }
    }
  ],
  systemAlerts: [
    {
      id: 'alert-1',
      title: 'Licencia próxima a vencer',
      message: 'La licencia de la organización "TechCorp" vence en 5 días',
      type: 'warning',
      timestamp: '2024-01-15 09:15:00',
      isRead: false,
      action: {
        label: 'Renovar licencia',
        href: '/admin/licenses/techcorp'
      }
    },
    {
      id: 'alert-2',
      title: 'Backup fallido',
      message: 'El backup automático del sistema falló esta madrugada',
      type: 'critical',
      timestamp: '2024-01-15 03:30:00',
      isRead: false,
      action: {
        label: 'Ver logs',
        href: '/admin/system/logs'
      }
    },
    {
      id: 'alert-3',
      title: 'Nuevo usuario registrado',
      message: 'Se registró un nuevo usuario administrador en "GlobalTech"',
      type: 'info',
      timestamp: '2024-01-14 16:45:00',
      isRead: true,
      action: {
        label: 'Revisar usuario',
        href: '/admin/users/new'
      }
    },
    {
      id: 'alert-4',
      title: 'Actualización disponible',
      message: 'Nueva versión del sistema disponible v2.1.3',
      type: 'info',
      timestamp: '2024-01-14 14:20:00',
      isRead: false,
      action: {
        label: 'Ver detalles',
        href: '/admin/system/updates'
      }
    }
  ],
  systemActivities: [
    {
      id: 'activity-1',
      title: 'Organización creada',
      description: 'Nueva organización "InnovaSoft" agregada al sistema',
      type: 'organization',
      timestamp: '2024-01-15 10:30:00',
      user: 'Erick Machuca',
      icon: 'Building'
    },
    {
      id: 'activity-2',
      title: 'Contrato renovado',
      description: 'Contrato de "TechCorp" renovado por 12 meses',
      type: 'contract',
      timestamp: '2024-01-15 09:45:00',
      user: 'Sistema Automático',
      icon: 'FileText'
    },
    {
      id: 'activity-3',
      title: 'Usuario suspendido',
      description: 'Usuario "juan.perez@globaltech.com" suspendido por inactividad',
      type: 'user',
      timestamp: '2024-01-15 08:20:00',
      user: 'Erick Machuca',
      icon: 'UserX'
    },
    {
      id: 'activity-4',
      title: 'Backup completado',
      description: 'Backup semanal completado exitosamente',
      type: 'system',
      timestamp: '2024-01-14 23:00:00',
      user: 'Sistema Automático',
      icon: 'Database'
    },
    {
      id: 'activity-5',
      title: 'Nuevo rol creado',
      description: 'Rol "Auditor Senior" creado para "FinanceGroup"',
      type: 'organization',
      timestamp: '2024-01-14 17:30:00',
      user: 'Erick Machuca',
      icon: 'Shield'
    },
    {
      id: 'activity-6',
      title: 'Documento actualizado',
      description: 'Manual de usuario v3.2 actualizado',
      type: 'system',
      timestamp: '2024-01-14 16:15:00',
      user: 'Liliana León',
      icon: 'BookOpen'
    }
  ],
  quickReports: [
    {
      id: 'report-1',
      title: 'Usuarios Activos',
      description: 'Reporte de usuarios activos por organización',
      icon: 'Users',
      color: '#3B82F6',
      href: '/admin/reports/active-users',
      lastGenerated: '2024-01-15 08:00:00'
    },
    {
      id: 'report-2',
      title: 'Licencias',
      description: 'Estado de licencias y renovaciones',
      icon: 'Award',
      color: '#10B981',
      href: '/admin/reports/licenses',
      lastGenerated: '2024-01-15 07:30:00'
    },
    {
      id: 'report-3',
      title: 'Facturación',
      description: 'Reporte de facturación mensual',
      icon: 'CreditCard',
      color: '#F59E0B',
      href: '/admin/reports/billing',
      lastGenerated: '2024-01-14 23:45:00'
    },
    {
      id: 'report-4',
      title: 'Uso del Sistema',
      description: 'Estadísticas de uso por módulo',
      icon: 'Activity',
      color: '#8B5CF6',
      href: '/admin/reports/usage',
      lastGenerated: '2024-01-14 22:00:00'
    }
  ],
  systemHealth: {
    status: 'healthy',
    uptime: '99.95%',
    activeUsers: 247,
    systemLoad: 23
  },
  notifications: {
    alerts: 2,
    pendingApprovals: 5,
    systemMessages: 3
  }
}; 