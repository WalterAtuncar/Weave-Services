import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { MenuGrid, MenuCard } from "../../components/ui/menu-card";
import * as Icons from "lucide-react";
import { AlertProvider } from "../../components/ui/alerts/AlertProvider";
import { AlertService } from "../../components/ui/alerts";
import { SelectorItemsModal } from "../../components/ui/menu-card/selector-items/SelectorItemsModal";
import type { GridColumn } from "../../components/ui/grid/Grid";

const DarkThemeMenuShowcase = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    setMounted(true);
  }, []);
  if (!mounted) return <div>Loading...</div>;

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', padding: 24, background: '#0f1419' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', color: '#E5E7EB', marginBottom: 24 }}>Menu Cards – Dark</h1>
        <MenuGrid preset="4x3">
          <MenuCard
            title="Crear Proceso"
            description="¿Cómo deseas crear el proceso?"
            icon={<Icons.Plus />}
            actions={[
              { label: 'Con ayuda de asistente', icon: <Icons.Bot /> , href: '/procesos/crear/asistente' },
              { label: 'Importando un archivo', icon: <Icons.Upload /> , href: '/procesos/crear/importar' },
              { label: 'Desde cero', icon: <Icons.FilePlus /> , href: '/procesos/crear/nuevo' }
            ]}
          />
          <MenuCard
            title="Consultar Proceso"
            description="Ver, descargar, imprimir o compartir proceso"
            icon={<Icons.Search />}
            onCardClick={() => console.log('Consultar Proceso')}
          />
          <MenuCard
            title="Actualizar Proceso"
            description="Realizar cambios, versionar y enviar a aprobación"
            icon={<Icons.Edit3 />}
            onCardClick={() => console.log('Actualizar Proceso')}
          />
          <MenuCard
            title="Eliminar Proceso"
            description="Desde cero, importando o con asistente"
            icon={<Icons.Trash2 />}
            onCardClick={() => console.log('Eliminar Proceso')}
          />
          <MenuCard
            title="Aprender"
            description="Conceptos y mejores prácticas de gestión de procesos"
            icon={<Icons.BookOpen />}
            onCardClick={() => console.log('Aprender')}
          />
        </MenuGrid>
      </div>
    </ThemeProvider>
  );
};

const meta: Meta<typeof DarkThemeMenuShowcase> = {
  title: "Dark Theme/MenuCard",
  component: DarkThemeMenuShowcase,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Menú de tarjetas para el tema oscuro, demostrando presets 4x3 y acciones internas."
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MenuShowcase: Story = {
  name: "Menu Cards",
};

// Nueva historia: MenuCard con SelectorItemsModal en tema oscuro
type Item = { id: number; nombre: string; categoria: string; codigo: string };

const mockData: Item[] = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  nombre: `Proceso ${i + 1}`,
  categoria: i % 2 === 0 ? 'Operativo' : 'Estratégico',
  codigo: `PR-${String(i + 1).padStart(3, '0')}`,
}));

const columns: GridColumn<Item>[] = [
  { id: 'nombre', header: 'Nombre', accessor: (r) => r.nombre, sortable: true },
  { id: 'categoria', header: 'Categoría', accessor: (r) => r.categoria, width: '140px' },
  { id: 'codigo', header: 'Código', accessor: (r) => r.codigo, width: '120px' },
];

const DarkMenuWithSelector = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null);

  useEffect(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    setMounted(true);
  }, []);
  if (!mounted) return <div>Loading...</div>;

  const onEdit = (row: Item) => { console.log('Editar:', row); AlertService.success(`Editando: ${row.nombre}`); };
  const onDelete = (row: Item) => { console.log('Eliminar:', row); AlertService.success(`Eliminando: ${row.nombre}`); };
  const onSelect = (row: Item) => { if (mode === 'edit') onEdit(row); if (mode === 'delete') onDelete(row); setOpen(false); };

  return (
    <ThemeProvider>
      <AlertProvider>
        <div style={{ minHeight: '100vh', padding: 24, background: '#0f1419' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', color: '#E5E7EB', marginBottom: 16 }}>Acciones con Selector</h1>
          <MenuGrid preset="4x3">
            <MenuCard title="Actualizar Proceso" description="Selecciona y edita" icon={<Icons.Edit3 />} onCardClick={() => { setMode('edit'); setOpen(true); }} />
            <MenuCard title="Eliminar Proceso" description="Selecciona y elimina" icon={<Icons.Trash2 />} onCardClick={() => { setMode('delete'); setOpen(true); }} />
          </MenuGrid>

          {open && (
            <SelectorItemsModal<Item>
              isOpen={open}
              onClose={() => setOpen(false)}
              title={mode === 'edit' ? 'Selecciona proceso a actualizar' : 'Selecciona proceso a eliminar'}
              description={mode === 'edit' ? 'Busca y elige el proceso para editar' : 'Busca y elige el proceso para eliminar'}
              data={mockData}
              columns={columns}
              getRowId={(row) => row.id}
              onEdit={mode === 'edit' ? onEdit : undefined}
              onDelete={mode === 'delete' ? onDelete : undefined}
              onSelect={onSelect}
              defaultPageSize={10}
            />
          )}
        </div>
      </AlertProvider>
    </ThemeProvider>
  );
};

export const ConSelectorItemsModalDark: Story = {
  name: 'MenuCard – Selector Actions (Dark)',
  render: () => <DarkMenuWithSelector />,
};