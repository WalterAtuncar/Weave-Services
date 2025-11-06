import React, { useMemo, useState } from 'react';
import EntityManagementTemplate from '../components/templates/EntityManagementTemplate';
import { Button } from '../components/ui/button';
import { ThemeProvider } from '../contexts/ThemeContext';

interface DemoItem {
  id: number;
  name: string;
  description: string;
}

const useDemoData = (): { items: DemoItem[]; loading: boolean; error: string | null } => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const items = useMemo(
    () => Array.from({ length: 8 }).map((_, i) => ({ id: i + 1, name: `Item ${i + 1}`, description: 'Descripción del item' })),
    []
  );
  return { items, loading, error };
};

export default {
  title: 'Templates/EntityManagementTemplate',
  component: EntityManagementTemplate,
  argTypes: {
    primaryVariant: {
      options: ['default', 'outline', 'ghost', 'destructive', 'action', 'custom'],
      control: { type: 'select' },
    },
    secondaryVariant: {
      options: ['default', 'outline', 'ghost', 'destructive'],
      control: { type: 'select' },
    },
    size: {
      options: ['s', 'm', 'l', 'xl'],
      control: { type: 'select' },
    },
    showIcons: { control: 'boolean' },
  },
};

export const Basico = () => {
  const dataHook = () => useDemoData();
  const gridHook = () => useDemoData();

  return (
    <ThemeProvider initialTheme="light">
      <div style={{ padding: 16 }}>
        <EntityManagementTemplate<DemoItem>
          title="Gestión de Entidades"
          subtitle="Ejemplo de template reusable"
          contextBadge={{ text: 'Demo', colorClassName: 'bg-indigo-100 text-indigo-700' }}
          headerActions={
            <>
              <Button iconName="Plus">Nuevo</Button>
              <Button variant="outline" iconName="Upload">Importar</Button>
            </>
          }
          toolbarLeft={
            <input
              placeholder="Buscar..."
              className="border rounded-md px-3 py-1 h-8 text-sm"
              onChange={() => {}}
            />
          }
          toolbarRight={
            <>
              <Button variant="outline" iconName="Download">Exportar</Button>
              <Button variant="outline" iconName="BarChart3">Analytics</Button>
            </>
          }
          toolbarActionsExtra={
            <>
              <Button variant="outline" iconName="SlidersHorizontal">Filtros</Button>
              <Button variant="outline" iconName="Settings">Ajustes</Button>
            </>
          }
          toolbarActionsCollapsible={true}
          toolbarActionsInitiallyExpanded={false}
          useCardsData={dataHook}
          useGridData={gridHook}
          renderCard={(item) => (
            <div className="p-4 rounded-xl border bg-white">
              <div className="text-slate-800 font-medium">{item.name}</div>
              <div className="text-slate-500 text-sm">{item.description}</div>
            </div>
          )}
          renderGrid={(items) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border bg-white rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600 text-sm">
                    <th className="px-4 py-2 border-b">ID</th>
                    <th className="px-4 py-2 border-b">Nombre</th>
                    <th className="px-4 py-2 border-b">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="text-sm">
                      <td className="px-4 py-2 border-b">{i.id}</td>
                      <td className="px-4 py-2 border-b">{i.name}</td>
                      <td className="px-4 py-2 border-b">{i.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      </div>
    </ThemeProvider>
  );
};

// Story con variantes de botones en la cabecera
export const CabeceraConVariantes = (args: {
  primaryVariant: 'default' | 'outline' | 'ghost' | 'destructive' | 'action' | 'custom';
  secondaryVariant: 'default' | 'outline' | 'ghost' | 'destructive';
  size: 's' | 'm' | 'l' | 'xl';
  showIcons: boolean;
}) => {
  const dataHook = () => useDemoData();
  const gridHook = () => useDemoData();

  const { primaryVariant = 'default', secondaryVariant = 'outline', size = 'm', showIcons = true } = args;

  return (
    <ThemeProvider initialTheme="light">
      <div style={{ padding: 16 }}>
        <EntityManagementTemplate<DemoItem>
          title="Gestión de Entidades"
          subtitle="Variantes del botón en cabecera"
          contextBadge={{ text: 'Demo', colorClassName: 'bg-indigo-100 text-indigo-700' }}
          headerActions={
            <>
              <Button variant={primaryVariant as any} size={size} iconName={showIcons ? 'Plus' : undefined}>Nuevo</Button>
              <Button variant={secondaryVariant as any} size={size} iconName={showIcons ? 'Upload' : undefined}>Importar</Button>
            </>
          }
          toolbarLeft={
            <input
              placeholder="Buscar..."
              className="border rounded-md px-3 py-1 h-8 text-sm"
              onChange={() => {}}
            />
          }
          useCardsData={dataHook}
          useGridData={gridHook}
          renderCard={(item) => (
            <div className="p-4 rounded-xl border bg-white">
              <div className="text-slate-800 font-medium">{item.name}</div>
              <div className="text-slate-500 text-sm">{item.description}</div>
            </div>
          )}
          renderGrid={(items) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border bg-white rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600 text-sm">
                    <th className="px-4 py-2 border-b">ID</th>
                    <th className="px-4 py-2 border-b">Nombre</th>
                    <th className="px-4 py-2 border-b">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="text-sm">
                      <td className="px-4 py-2 border-b">{i.id}</td>
                      <td className="px-4 py-2 border-b">{i.name}</td>
                      <td className="px-4 py-2 border-b">{i.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      </div>
    </ThemeProvider>
  );
};

CabeceraConVariantes.args = {
  primaryVariant: 'default',
  secondaryVariant: 'outline',
  size: 'm',
  showIcons: true,
};