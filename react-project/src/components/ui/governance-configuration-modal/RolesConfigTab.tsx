import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users, Shield } from 'lucide-react';
import { Button } from '../button/button';
import { Modal } from '../modal/Modal';
import { StatusBadge } from '../status-badge/StatusBadge';
import { AlertService } from '../alerts/AlertService';

interface RolesConfigTabProps {
  onDataChange: (hasChanges: boolean) => void;
}

interface ConfiguracionRol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
  nivelAcceso: 'alto' | 'medio' | 'bajo';
  activo: boolean;
}

export const RolesConfigTab: React.FC<RolesConfigTabProps> = ({ onDataChange }) => {
  const [configuracionesRoles, setConfiguracionesRoles] = useState<ConfiguracionRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolEditando, setRolEditando] = useState<ConfiguracionRol | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar configuraciones desde el backend
  useEffect(() => {
    cargarConfiguracionesRoles();
  }, []);

  const cargarConfiguracionesRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Reemplazar con llamada real al backend
      // const response = await gobernanzaService.getConfiguracionesRoles();
      
      // Mientras se implementa el backend, mostrar estado vacío
      setConfiguracionesRoles([]);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar configuraciones de roles:', error);
      setError('Error al cargar configuraciones de roles');
      setLoading(false);
    }
  };

  const handleCrearRol = () => {
    setRolEditando(null);
    setModalAbierto(true);
  };

  const handleEditarRol = (rol: ConfiguracionRol) => {
    setRolEditando(rol);
    setModalAbierto(true);
  };

  const handleEliminarRol = async (rolId: number) => {
    const confirmado = await AlertService.confirm(
      '¿Estás seguro de que deseas eliminar esta configuración de rol?',
      {
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar'
      }
    );

    if (!confirmado) return;

    try {
      // TODO: Reemplazar con llamada real al backend
      // await gobernanzaService.eliminarConfiguracionRol(rolId);
      
      // Simular eliminación exitosa
      setConfiguracionesRoles(prev => prev.filter(r => r.id !== rolId));
      setHasChanges(true);
      onDataChange(true);
      AlertService.success('Configuración de rol eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar configuración de rol:', error);
      AlertService.error('Error al eliminar configuración de rol');
    }
  };

  const handleGuardarRol = async (rolData: Partial<ConfiguracionRol>) => {
    try {
      if (rolEditando) {
        // Actualizar rol existente
        // TODO: Reemplazar con llamada real al backend
        // const response = await gobernanzaService.actualizarConfiguracionRol(rolEditando.id, rolData);
        
        // Simular actualización exitosa
        setConfiguracionesRoles(prev => 
          prev.map(r => r.id === rolEditando.id ? { ...r, ...rolData } : r)
        );
        AlertService.success('Configuración de rol actualizada exitosamente');
      } else {
        // Crear nuevo rol
        // TODO: Reemplazar con llamada real al backend
        // const response = await gobernanzaService.crearConfiguracionRol(rolData);
        
        // Simular creación exitosa
        const nuevoRol: ConfiguracionRol = {
          id: Date.now(), // ID temporal
          nombre: rolData.nombre || '',
          descripcion: rolData.descripcion || '',
          permisos: rolData.permisos || [],
          nivelAcceso: rolData.nivelAcceso || 'medio',
          activo: rolData.activo !== false
        };
        
        setConfiguracionesRoles(prev => [...prev, nuevoRol]);
        AlertService.success('Configuración de rol creada exitosamente');
      }
      
      setHasChanges(true);
      onDataChange(true);
      setModalAbierto(false);
      setRolEditando(null);
    } catch (error) {
      console.error('Error al guardar configuración de rol:', error);
      AlertService.error('Error al guardar configuración de rol');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando configuraciones de roles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Button onClick={cargarConfiguracionesRoles}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div>
          <h3>Configuración de Roles</h3>
          <p>Gestiona los roles y permisos del sistema de gobernanza</p>
        </div>
        <Button onClick={handleCrearRol}>
          <Plus size={16} />
          Nuevo Rol
        </Button>
      </div>

      {configuracionesRoles.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          border: '2px dashed #ccc',
          borderRadius: '8px'
        }}>
          <Users size={48} style={{ marginBottom: '16px', color: '#ccc' }} />
          <p>No hay configuraciones de roles definidas</p>
          <p>Haz clic en "Nuevo Rol" para comenzar</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {configuracionesRoles.map(rol => (
            <div 
              key={rol.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h4>{rol.nombre}</h4>
                <p style={{ margin: '4px 0', color: '#666' }}>{rol.descripcion}</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <StatusBadge 
                    status={rol.activo ? 'active' : 'inactive'}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Nivel: {rol.nivelAcceso}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Permisos: {rol.permisos.length}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="s"
                  onClick={() => handleEditarRol(rol)}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="s"
                  onClick={() => handleEliminarRol(rol.id)}
                  style={{ color: '#EF4444' }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar rol - implementación simplificada */}
      {modalAbierto && (
        <Modal 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          title={rolEditando ? 'Editar Rol' : 'Nuevo Rol'}
          size="m"
          cancelButtonText="Cancelar"
          saveButtonText="Guardar"
          onCancel={() => setModalAbierto(false)}
          onSave={() => setModalAbierto(false)}
        >
          <div style={{ padding: '20px' }}>
            <h3>{rolEditando ? 'Editar Rol' : 'Nuevo Rol'}</h3>
            <p>Esta funcionalidad será implementada cuando se conecte al backend real</p>
            {/* Acciones movidas al footer estándar del Modal */}
          </div>
        </Modal>
      )}
    </div>
  );
};