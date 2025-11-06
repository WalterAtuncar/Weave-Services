import React from 'react';
import { Chip, ChipGroup } from './index';
import { Monitor, Server } from 'lucide-react';

export default {
  title: 'UI/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
};

// =============================================
// STORIES PARA CHIP INDIVIDUAL
// =============================================

export const Default = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <Chip label="Servidor Principal" />
    <Chip label="Base de Datos" variant="outline" />
    <Chip label="Web Server" variant="subtle" />
  </div>
);

export const WithDescription = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <Chip 
      label="Server Prueba" 
      description="192.168.1.2" 
      showServerIcon 
      type="server"
    />
    <Chip 
      label="Servidor Aplicaciones ERP" 
      description="192.168.1.12" 
      showServerIcon 
      type="server"
      variant="outline"
    />
  </div>
);

export const Removable = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <Chip 
      label="Servidor 1" 
      removable 
      onRemove={() => console.log('Removed')}
    />
    <Chip 
      label="Servidor 2" 
      removable 
      variant="outline"
      onRemove={() => console.log('Removed')}
    />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
    <Chip label="XS" size="xs" />
    <Chip label="Small" size="s" />
    <Chip label="Medium" size="m" />
    <Chip label="Large" size="l" />
  </div>
);

export const Types = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <Chip label="Servidor" type="server" showServerIcon />
    <Chip label="Sistema" type="system" />
    <Chip label="Default" type="default" />
  </div>
);

export const WithCustomIcon = () => (
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    <Chip 
      label="Servidor Web" 
      icon={<Server size={16} />}
      description="192.168.1.10"
    />
    <Chip 
      label="Servidor DB" 
      icon={<Monitor size={16} />}
      description="192.168.1.11"
      variant="outline"
    />
  </div>
);

// =============================================
// STORIES PARA CHIP GROUP
// =============================================

const sampleServers = [
  { id: 1, label: 'Server Prueba', description: '192.168.1.2', type: 'server' as const },
  { id: 2, label: 'Servidor Aplicaciones ERP', description: '192.168.1.12', type: 'server' as const },
  { id: 3, label: 'Servidor Base de Datos Principal', description: '192.168.1.11', type: 'server' as const },
  { id: 4, label: 'Servidor Web Principal', description: '192.168.1.10', type: 'server' as const },
];

export const ChipGroupDefault = () => (
  <ChipGroup 
    chips={sampleServers}
    showServerIcon
    removable
    onRemove={(id) => console.log('Removed:', id)}
  />
);

export const ChipGroupWithAddButton = () => (
  <ChipGroup 
    chips={sampleServers.slice(0, 2)}
    showServerIcon
    removable
    showAddButton
    addButtonText="Agregar Servidor"
    onRemove={(id) => console.log('Removed:', id)}
    onAddClick={() => console.log('Add clicked')}
  />
);

export const ChipGroupWithMaxChips = () => (
  <ChipGroup 
    chips={sampleServers}
    showServerIcon
    removable
    maxChips={2}
    moreText="servidores más"
    onRemove={(id) => console.log('Removed:', id)}
  />
);

export const ChipGroupOutline = () => (
  <ChipGroup 
    chips={sampleServers}
    showServerIcon
    variant="outline"
    removable
    onRemove={(id) => console.log('Removed:', id)}
  />
);

export const ChipGroupSubtle = () => (
  <ChipGroup 
    chips={sampleServers}
    showServerIcon
    variant="subtle"
    removable
    onRemove={(id) => console.log('Removed:', id)}
  />
); 