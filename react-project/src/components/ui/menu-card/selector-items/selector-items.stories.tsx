import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../../../contexts/ThemeContext';
import { AlertProvider } from '../../alerts/AlertProvider';
import { AlertService } from '../../alerts';
import { SelectorItemsModal } from './SelectorItemsModal';
import type { GridColumn } from '../../grid/Grid';

type Item = {
  id: number;
  nombre: string;
  tipo: string;
  estado: 'activo' | 'inactivo';
  fecha: string; // ISO
};

const mockData: Item[] = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  nombre: `Elemento ${i + 1}`,
  tipo: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
  estado: i % 2 === 0 ? 'activo' : 'inactivo',
  fecha: new Date(Date.now() - i * 86400000).toISOString()
}));

const columns: GridColumn<Item>[] = [
  { id: 'nombre', header: 'Nombre', accessor: 'nombre', width: '30%', sortable: true },
  { id: 'tipo', header: 'Tipo', accessor: 'tipo', width: '15%', align: 'center', sortable: true },
  { id: 'estado', header: 'Estado', accessor: 'estado', width: '15%', align: 'center', sortable: true },
  { id: 'fecha', header: 'Fecha', accessor: (row) => new Date(row.fecha).toLocaleDateString(), width: '20%', align: 'center', sortable: true },
];

const Showcase = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading...</div>;

  const handleEdit = (row: Item) => {
    console.log('Editar row:', row);
    AlertService.success('Elemento editado correctamente');
  };

  const handleDelete = (row: Item) => {
    console.log('Eliminar row:', row);
    AlertService.success('Elemento eliminado correctamente');
  };

  const handleSelect = (row: Item) => {
    console.log('Seleccionado row:', row);
    AlertService.success(`Seleccionado: ${row.nombre}`);
    setOpen(false);
  };

  return (
    <ThemeProvider>
      <AlertProvider>
        <div style={{ minHeight: '100vh', padding: 24 }}>
          <SelectorItemsModal<Item>
            isOpen={open}
            onClose={() => setOpen(false)}
            title="Selector de Elementos"
            description="Busca, edita o elimina y selecciona un elemento."
            data={mockData}
            columns={columns}
            getRowId={(row) => row.id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
            defaultPageSize={10}
          />
          {!open && (
            <button onClick={() => setOpen(true)} style={{ marginTop: 16 }}>
              Reabrir modal
            </button>
          )}
        </div>
      </AlertProvider>
    </ThemeProvider>
  );
};

const meta = {
  title: 'UI/MenuCard/SelectorItemsModal',
  component: SelectorItemsModal as any,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<any>;

export default meta;

export const Default: StoryObj<any> = {
  render: () => <Showcase />,
};

export const DarkTheme: StoryObj<any> = {
  render: () => {
    const DarkShowcase = () => {
      const [mounted, setMounted] = useState(false);
      const [open, setOpen] = useState(true);
      useEffect(() => {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        setMounted(true);
      }, []);
      if (!mounted) return <div>Loading...</div>;
      const handleEdit = (row: Item) => { console.log('Editar row:', row); AlertService.success('Elemento editado correctamente'); };
      const handleDelete = (row: Item) => { console.log('Eliminar row:', row); AlertService.success('Elemento eliminado correctamente'); };
      const handleSelect = (row: Item) => { console.log('Seleccionado row:', row); AlertService.success(`Seleccionado: ${row.nombre}`); setOpen(false); };
      return (
        <ThemeProvider>
          <AlertProvider>
            <div style={{ minHeight: '100vh', padding: 24, background: '#0f1419' }}>
              <SelectorItemsModal<Item>
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Selector de Elementos (Dark)"
                description="Demostración en tema oscuro"
                data={mockData}
                columns={columns}
                getRowId={(row) => row.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={handleSelect}
                defaultPageSize={10}
              />
            </div>
          </AlertProvider>
        </ThemeProvider>
      );
    };
    return <DarkShowcase />;
  }
};