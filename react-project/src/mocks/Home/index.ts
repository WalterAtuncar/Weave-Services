import { HomeData } from '../../models/Home';

/**
 * Mock data para la página Home
 * 
 * SERVICIOS DE AVATARES UTILIZADOS:
 * 
 * 1. RandomUser.me - https://randomuser.me/
 *    - Fotos reales de personas
 *    - Formato: https://randomuser.me/api/portraits/[men|women]/[0-99].jpg
 *    - Gratuito, sin límites
 * 
 * 2. UI Avatars - https://ui-avatars.com/ (alternativa)
 *    - Avatares con iniciales
 *    - Formato: https://ui-avatars.com/api/?name=Nombre+Apellido&background=color&color=fff
 * 
 * 3. DiceBear - https://www.dicebear.com/ (alternativa)
 *    - Avatares ilustrados
 *    - Formato: https://api.dicebear.com/7.x/avataaars/svg?seed=NombreUsuario
 */

export const homeDataMock: HomeData = {
  user: {
    name: 'Erick',
    avatar: null
  },
  dashboardCards: [
    {
      id: 'processes',
      title: 'Procesos',
      count: 14,
      icon: 'RefreshCw',
      color: '#3B82F6',
      href: '/processes'
    },
    {
      id: 'risks',
      title: 'Riesgos',
      count: 3,
      icon: 'AlertTriangle',
      color: '#F59E0B',
      href: '/risks'
    },
    {
      id: 'audit',
      title: 'Auditoría',
      count: 2,
      icon: 'Zap',
      color: '#8B5CF6',
      href: '/audit'
    },
    {
      id: 'management-system',
      title: 'Sist. Gestión',
      count: 2,
      icon: 'Grid3x3',
      color: '#06B6D4',
      href: '/management-system'
    },
    {
      id: 'action-plans',
      title: 'Planes de acción',
      count: 5,
      icon: 'BarChart3',
      color: '#10B981',
      href: '/action-plans'
    },
    {
      id: 'documents',
      title: 'Documentos',
      count: 12,
      icon: 'FileText',
      color: '#6366F1',
      href: '/documents'
    }
  ],
  agendaItems: [
    {
      id: 'agenda-1',
      title: 'Reunión de procesos',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'meeting'
    },
    {
      id: 'agenda-2',
      title: 'Revisión de documentos',
      date: '2024-01-16',
      time: '2:00 PM',
      type: 'task'
    },
    {
      id: 'agenda-3',
      title: 'Auditoría interna',
      date: '2024-01-18',
      time: '9:00 AM',
      type: 'event'
    }
  ],
  chatMessages: [
    {
      id: 'chat-1',
      user: 'Enrique Suarez',
      avatar: null,
      message: 'Hola, ¿cómo va el proyecto?',
      time: '10:30 AM',
      isOnline: true
    },
    {
      id: 'chat-2',
      user: 'Liliana León',
      avatar: null,
      message: 'Necesito revisar los documentos',
      time: '11:15 AM',
      isOnline: false
    },
    {
      id: 'chat-3',
      user: 'Macarena Zapateta',
      avatar: null,
      message: 'La reunión será a las 3 PM',
      time: '12:00 PM',
      isOnline: true
    },
    {
      id: 'chat-4',
      user: 'Renzo Schuller',
      avatar: null,
      message: 'Perfecto, ahí estaré',
      time: '12:30 PM',
      isOnline: true
    }
  ],
  recentUpdates: [
    {
      id: 'update-1',
      title: 'Proceso de nueva Póliza de seguros vehicular',
      type: 'process',
      author: 'Juan Solomon',
      date: 'Hace 2 min',
      icon: 'RefreshCw'
    },
    {
      id: 'update-2',
      title: 'Documentación de reglamento interno',
      type: 'document',
      author: 'Erick Machuca',
      date: 'Hace 30 min',
      icon: 'FileText'
    },
    {
      id: 'update-3',
      title: 'Proceso de nueva Póliza de seguros vehicular',
      type: 'process',
      author: 'Liliana León',
      date: '11/03/2025',
      icon: 'RefreshCw'
    },
    {
      id: 'update-4',
      title: 'Proceso de nueva Póliza de seguros vehicular',
      type: 'process',
      author: 'Enrique Montenegro',
      date: '10/03/2025',
      icon: 'RefreshCw'
    },
    {
      id: 'update-5',
      title: 'Gestión de Pólizas de seguros vehicular',
      type: 'management',
      author: 'Enrique Montenegro',
      date: '10/03/2025',
      icon: 'Grid3x3'
    },
    {
      id: 'update-6',
      title: 'Proceso de nueva Póliza de seguros vehicular',
      type: 'process',
      author: 'Enrique Montenegro',
      date: '10/03/2025',
      icon: 'RefreshCw'
    }
  ],
  notifications: {
    inbox: 5
  }
}; 

// Exportar también el mock del HomeAdmin
export { homeAdminDataMock } from './homeAdminMock'; 