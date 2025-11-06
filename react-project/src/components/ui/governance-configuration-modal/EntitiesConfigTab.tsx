import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../button';
import { Input } from '../input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Settings
} from 'lucide-react';
import { 
  getConfiguracionTiposEntidad, 
  ConfiguracionTipoEntidad 
} from '../../../mocks/gobernanzaMocks';
import { AlertService } from '../alerts/AlertService';

interface EntitiesConfigTabProps {
  onDataChange: (hasChanges: boolean) => void;
}

export const EntitiesConfigTab: React.FC<EntitiesConfigTabProps> = ({ onDataChange }) => {
  const { colors } = useTheme();
  const [entidades, setEntidades] = useState<ConfiguracionTipoEntidad[]>([]);
  const [editingEntity, setEditingEntity] = useState<ConfiguracionTipoEntidad | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ConfiguracionTipoEntidad>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    version: '1.0',
    camposObligatorios: ['nombre', 'descripcion'],
    flujoAprobacion: true,
    plantillaMetadata: {},
    activo: true
  });

  useEffect(() => {
    loadEntidades();
  }, []);

  const loadEntidades = () => {
    const entidadesData = getConfiguracionTiposEntidad();
    setEntidades(entidadesData);
  };

  const handleAddEntity = () => {
    setEditingEntity(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      version: '1.0',
      camposObligatorios: ['nombre', 'descripcion'],
      flujoAprobacion: true,
      plantillaMetadata: {},
      activo: true
    });
    setShowForm(true);
  };

  const handleEditEntity = (entity: ConfiguracionTipoEntidad) => {
    setEditingEntity(entity);
    setFormData(entity);
    setShowForm(true);
  };

  const handleSaveEntity = async () => {
    try {
      if (!formData.codigo || !formData.nombre) {
        AlertService.error('Código y nombre son requeridos');
        return;
      }

      if (editingEntity) {
        // Simular actualización
        const updatedEntity = { ...editingEntity, ...formData };
        setEntidades(prev => prev.map(e => e.id === editingEntity.id ? updatedEntity : e));
        AlertService.success('Tipo de entidad actualizado exitosamente');
      } else {
        // Simular creación
        const newEntity = {
          ...formData,
          id: Math.max(...entidades.map(e => e.id)) + 1,
          fechaCreacion: new Date().toISOString(),
          creadoPor: 'Usuario actual'
        } as ConfiguracionTipoEntidad;
        setEntidades(prev => [...prev, newEntity]);
        AlertService.success('Tipo de entidad creado exitosamente');
      }

      setShowForm(false);
      setEditingEntity(null);
      onDataChange(true);
    } catch (error) {
      AlertService.error('Error al guardar el tipo de entidad');
    }
  };

  const handleDeleteEntity = async (entityId: number) => {
    try {
      setEntidades(prev => prev.filter(e => e.id !== entityId));
      AlertService.success('Tipo de entidad eliminado exitosamente');
      onDataChange(true);
    } catch (error) {
      AlertService.error('Error al eliminar el tipo de entidad');
    }
  };

  const renderEntitiesList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{ color: colors.text, margin: 0 }}>Tipos de Entidades</h4>
        <Button 
          variant="default" 
          onClick={handleAddEntity}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          Nuevo Tipo
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {entidades.map(entity => (
          <div
            key={entity.id}
            style={{
              padding: '20px',
              backgroundColor: colors.surface,
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: colors.primary,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: '16px',
                  marginBottom: '4px'
                }}>
                  {entity.nombre}
                </div>
                <div style={{ 
                  color: colors.textSecondary,
                  fontSize: '12px'
                }}>
                  {entity.codigo} • v{entity.version}
                </div>
              </div>
            </div>

            <div style={{ 
              color: colors.textSecondary,
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {entity.descripcion}
            </div>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '4px',
              marginTop: '8px'
            }}>
              {entity.camposObligatorios.map(campo => (
                <span
                  key={campo}
                  style={{
                    backgroundColor: colors.primary + '20',
                    color: colors.primary,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}
                >
                  {campo}
                </span>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: colors.textSecondary
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: entity.activo ? '#10b981' : '#ef4444'
                }} />
                {entity.activo ? 'Activo' : 'Inactivo'}
                {entity.flujoAprobacion && (
                  <>
                    <span>•</span>
                    <span>Requiere aprobación</span>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="ghost"
                  onClick={() => handleEditEntity(entity)}
                  style={{ 
                    padding: '6px',
                    minWidth: 'auto',
                    height: '32px'
                  }}
                >
                  <Edit size={14} color="#F59E0B" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteEntity(entity.id)}
                  style={{ 
                    padding: '6px',
                    minWidth: 'auto',
                    height: '32px'
                  }}
                >
                  <Trash2 size={14} color="#EF4444" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEntityForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{ color: colors.text, margin: 0 }}>
          {editingEntity ? 'Editar Tipo de Entidad' : 'Nuevo Tipo de Entidad'}
        </h4>
        <Button 
          variant="ghost" 
          onClick={() => setShowForm(false)}
          style={{ padding: '6px', minWidth: 'auto' }}
        >
          <X size={16} />
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Código *
          </label>
          <Input
            value={formData.codigo || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
            placeholder="Ej: SISTEMA"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Nombre *
          </label>
          <Input
            value={formData.nombre || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            placeholder="Ej: Sistema"
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Descripción
          </label>
          <Input
            value={formData.descripcion || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Descripción del tipo de entidad"
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            color: colors.text, 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            Versión
          </label>
          <Input
            value={formData.version || '1.0'}
            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            placeholder="1.0"
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.flujoAprobacion || false}
              onChange={(e) => setFormData(prev => ({ ...prev, flujoAprobacion: e.target.checked }))}
            />
            Requiere flujo de aprobación
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text, 
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.activo || false}
              onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
            />
            Activo
          </label>
        </div>
      </div>

      <div>
        <label style={{ 
          display: 'block', 
          color: colors.text, 
          fontSize: '14px',
          marginBottom: '8px'
        }}>
          Campos Obligatorios
        </label>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px',
          padding: '12px',
          backgroundColor: colors.surface,
          borderRadius: '6px',
          border: `1px solid ${colors.border}`,
          minHeight: '44px'
        }}>
          {(formData.camposObligatorios || []).map(campo => (
            <span
              key={campo}
              style={{
                backgroundColor: colors.primary + '20',
                color: colors.primary,
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {campo}
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  camposObligatorios: prev.camposObligatorios?.filter(c => c !== campo) || []
                }))}
                style={{
                  border: 'none',
                  background: 'none',
                  color: colors.primary,
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ marginTop: '8px' }}>
          <Input
            placeholder="Agregar campo obligatorio"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && !formData.camposObligatorios?.includes(value)) {
                  setFormData(prev => ({
                    ...prev,
                    camposObligatorios: [...(prev.camposObligatorios || []), value]
                  }));
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button
          variant="outline"
          onClick={() => setShowForm(false)}
        >
          Cancelar
        </Button>
        <Button
          variant="default"
          onClick={handleSaveEntity}
        >
          <Save size={16} />
          Guardar
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      {showForm ? renderEntityForm() : renderEntitiesList()}
    </div>
  );
}; 