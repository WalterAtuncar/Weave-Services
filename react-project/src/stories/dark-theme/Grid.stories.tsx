import type { Meta, StoryObj } from '@storybook/react';
import { Grid, GridColumn, GridAction } from '../../components/ui/grid/Grid';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AlertProvider, AlertService } from '../../components/ui/alerts';
import React from 'react';

// Datos de ejemplo para las historias
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  department: string;
  salary: number;
  avatar?: string | null; // Nueva propiedad para avatar
}

const sampleUsers: User[] = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'Administrador',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00',
    department: 'IT',
    salary: 5000,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    role: 'Usuario',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00',
    department: 'Ventas',
    salary: 3500,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b287?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 3,
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    role: 'Supervisor',
    status: 'inactive',
    lastLogin: '2023-12-20T11:15:00',
    department: 'Marketing',
    salary: 4200,
    avatar: null // Sin imagen para mostrar fallback
  },
  {
    id: 4,
    name: 'Ana Martínez',
    email: 'ana.martinez@empresa.com',
    role: 'Usuario',
    status: 'pending',
    lastLogin: '2024-01-13T09:30:00',
    department: 'RRHH',
    salary: 3800,
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkY2QjM1Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkE8L3RleHQ+Cjwvc3ZnPgo=' // Base64 ejemplo
  },
  {
    id: 5,
    name: 'Luis Rodríguez',
    email: 'luis.rodriguez@empresa.com',
    role: 'Administrador',
    status: 'active',
    lastLogin: '2024-01-15T08:00:00',
    department: 'IT',
    salary: 5200,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  // Agregar más usuarios para demostrar la paginación
  ...Array.from({ length: 45 }, (_, i) => ({
    id: i + 6,
    name: `Usuario ${i + 6}`,
    email: `usuario${i + 6}@empresa.com`,
    role: ['Usuario', 'Supervisor', 'Administrador'][i % 3],
    status: (['active', 'inactive', 'pending'] as const)[i % 3],
    lastLogin: new Date(2024, 0, Math.floor(Math.random() * 15) + 1).toISOString(),
    department: ['IT', 'Ventas', 'Marketing', 'RRHH'][i % 4],
    salary: Math.floor(Math.random() * 3000) + 3000,
    avatar: i % 4 === 0 ? null : `https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop&crop=face` // Mezcla de con y sin imagen
  }))
];

// Funciones de ejemplo para las acciones
const handleEdit = (row: User) => {
  AlertService.info(`Editando usuario: ${row.name}`, {
    title: 'Editar Usuario',
    duration: 5000
  });
};

const handleDelete = async (row: User) => {
  const confirmed = await AlertService.confirm(`¿Estás seguro de que deseas eliminar a ${row.name}?`, {
    title: 'Confirmar Eliminación',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar'
  });

  if (confirmed) {
    AlertService.success(`Usuario ${row.name} eliminado correctamente`);
  } else {
    AlertService.info('Eliminación cancelada');
  }
};

const handleView = (row: User) => {
  AlertService.info(`Viendo detalles de: ${row.name}`, {
    title: 'Detalles del Usuario',
    duration: 5000
  });
};

// Definición de acciones
const userActions: GridAction<User>[] = [
  {
    icon: 'Eye',
    color: '#3B82F6', // Azul
    onClick: handleView,
    tooltip: 'Ver detalles'
  },
  {
    icon: 'Edit2',
    color: '#F97316', // Orange
    onClick: handleEdit,
    tooltip: 'Editar usuario'
  },
  {
    icon: 'Trash2',
    color: '#EF4444', // Rojo
    onClick: handleDelete,
    tooltip: 'Eliminar usuario',
    disabled: (row) => row.status === 'inactive' // Deshabilitar delete para usuarios inactivos
  }
];

// Componente Badge personalizado para estados (adaptado para tema oscuro)
const StatusBadge: React.FC<{ status: User['status'] }> = ({ status }) => {
  const getStatusConfig = (status: User['status']) => {
    switch (status) {
      case 'active':
        return { text: 'Activo', color: '#10b981', bg: '#064e3b' };
      case 'inactive':
        return { text: 'Inactivo', color: '#9ca3af', bg: '#374151' };
      case 'pending':
        return { text: 'Pendiente', color: '#f59e0b', bg: '#78350f' };
      default:
        return { text: status, color: '#9ca3af', bg: '#374151' };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bg,
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }}
    >
      {config.text}
    </span>
  );
};

// Definición de columnas
const userColumns: GridColumn<User>[] = [
  {
    id: 'avatar',
    header: 'IMG',
    accessor: 'avatar',
    width: 60,
    align: 'center',
    type: 'image'
  },
  {
    id: 'name',
    header: 'Nombre',
    accessor: 'name',
    width: 200,
    sortable: true,
    align: 'center'
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    width: 250,
    sortable: true,
    align: 'center'
  },
  {
    id: 'role',
    header: 'Rol',
    accessor: 'role',
    width: 120,
    align: 'center',
    render: (value) => (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '12px', 
        backgroundColor: '#374151', 
        color: '#e5e7eb',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {value}
      </span>
    )
  },
  {
    id: 'status',
    header: 'Estado',
    accessor: 'status',
    width: 100,
    align: 'center',
    render: (value) => <StatusBadge status={value} />
  },
  {
    id: 'department',
    header: 'Departamento',
    accessor: 'department',
    width: 120,
    align: 'center'
  },
  {
    id: 'salary',
    header: 'Salario',
    accessor: 'salary',
    width: 120,
    align: 'center',
    render: (value) => `$${value.toLocaleString()}`
  },
  {
    id: 'lastLogin',
    header: 'Último Acceso',
    accessor: 'lastLogin',
    width: 150,
    align: 'center',
    render: (value) => new Date(value).toLocaleDateString('es-ES')
  },
  {
    id: 'actions',
    header: 'Acciones',
    accessor: () => '', // No necesita accessor real
    width: 120,
    align: 'center',
    actions: userActions
  }
];

const meta: Meta<typeof Grid<User>> = {
  title: 'Dark Theme/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componente Grid moderno con paginador profesional para el tema dark. Incluye funcionalidades completas de tabla y paginación.'
      }
    }
  },
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark">
        <AlertProvider>
          <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100vh' }}>
            <Story />
          </div>
        </AlertProvider>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    data: {
      description: 'Array de datos a mostrar en la tabla'
    },
    columns: {
      description: 'Definición de las columnas de la tabla'
    },
    pageSize: {
      control: { type: 'select' },
      options: [5, 10, 20, 50],
      description: 'Número de elementos por página'
    },
    showPagination: {
      control: 'boolean',
      description: 'Mostrar o ocultar el paginador'
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga'
    },
    emptyMessage: {
      control: 'text',
      description: 'Mensaje cuando no hay datos'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Grid<User>>;

// Historia básica
export const Default: Story = {
  args: {
    columns: userColumns as GridColumn<any>[],
    data: sampleUsers,
    pageSize: 10,
    showPagination: true,
    onRowClick: (row, index) => {
      // Row clicked
    }
  }
};

 