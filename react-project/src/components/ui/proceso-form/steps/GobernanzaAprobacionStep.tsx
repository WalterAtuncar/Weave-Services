import React, { useMemo, useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { SelectWrapper, SelectContent, SelectItem } from '../../../ui/select';
import { Search, GitBranch, ChevronDown, ChevronRight, Plus, Trash2, Shield, Users, Info } from 'lucide-react';

type AprobadorItem = {
  id: string;
  nombre: string;
  rol: string;
  cargo?: string;
  area?: string;
  orden?: number;
  expanded?: boolean;
};

const ROL_OPTIONS = [
  { value: 'aprobador', label: 'Aprobador' },
  { value: 'revisor', label: 'Revisor' },
  { value: 'gobernante', label: 'Gobernante' }
];

const UBICACIONES_MOCK = [
  { id: 'venta', label: 'Venta' },
  { id: 'operaciones', label: 'Operaciones' },
  { id: 'finanzas', label: 'Finanzas' },
];

export const GobernanzaAprobacionStep: React.FC = () => {
  const { colors, theme } = useTheme();
  const [ubicacionBusqueda, setUbicacionBusqueda] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<string>('');
  const [tipoGobierno, setTipoGobierno] = useState<string>('');
  const [roles, setRoles] = useState<AprobadorItem[]>([]);

  const ubicacionesFiltradas = useMemo(() => {
    const q = ubicacionBusqueda.trim().toLowerCase();
    if (!q) return UBICACIONES_MOCK;
    return UBICACIONES_MOCK.filter(u => u.label.toLowerCase().includes(q));
  }, [ubicacionBusqueda]);

  const addRole = () => {
    const nextIndex = roles.length + 1;
    const nuevo: AprobadorItem = {
      id: String(Date.now()),
      nombre: '',
      rol: 'aprobador',
      cargo: '',
      area: '',
      orden: nextIndex,
      expanded: true,
    };
    setRoles(prev => [...prev, nuevo]);
  };

  const removeRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const toggleExpand = (id: string) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r));
  };

  const updateRole = (id: string, changes: Partial<AprobadorItem>) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r));
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Gobierno y aprobación</CardTitle>
          <CardDescription>
            Define la ubicación en el mapa de procesos, el tipo de gobierno y los roles aprobadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Ubicación en mapa de procesos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <GitBranch size={18} color={colors.primary} />
              <span style={{ fontWeight: 600, color: colors.text }}>Ubicación en mapa de procesos</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Buscar o escribir ubicación"
                  value={ubicacionBusqueda}
                  onChange={(e) => setUbicacionBusqueda(e.target.value)}
                  icon="Search"
                />
              </div>
              <Button
                variant="outline"
                size="m"
                iconName={mostrarMapa ? 'ChevronUp' : 'ChevronDown'}
                onClick={() => setMostrarMapa(s => !s)}
                title={mostrarMapa ? 'Ocultar mapa' : 'Mostrar mapa'}
              >
                {mostrarMapa ? 'Ocultar' : 'Mapa'}
              </Button>

              {mostrarMapa && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    boxShadow: theme === 'dark'
                      ? '0 4px 12px rgba(0,0,0,.4)'
                      : '0 4px 12px rgba(0,0,0,.08)',
                    marginTop: 6,
                    padding: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Info size={16} color={colors.primary} />
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>
                      La ubicación en el mapa de procesos ayuda a contextualizar y gobernar correctamente.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ubicacionesFiltradas.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setUbicacionSeleccionada(u.label); setMostrarMapa(false); }}
                        style={{
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: `1px solid ${colors.border}`,
                          background: theme === 'dark' ? 'transparent' : '#fff',
                          color: colors.text,
                          cursor: 'pointer'
                        }}
                      >
                        <ChevronRight size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gobierno para la ubicación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color={colors.primary} />
                <span style={{ fontWeight: 600, color: colors.text }}>Gobierno para la ubicación del proceso</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    placeholder="Ubicación seleccionada"
                    value={ubicacionSeleccionada}
                    onChange={(e) => setUbicacionSeleccionada(e.target.value)}
                    icon="GitBranch"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectWrapper value={tipoGobierno} onValueChange={(v) => setTipoGobierno(v)}>
                    <SelectContent>
                      <SelectItem value="" disabled>Seleccione tipo de gobierno</SelectItem>
                      <SelectItem value="dominio">Gobierno por dominio</SelectItem>
                      <SelectItem value="area">Gobierno por área</SelectItem>
                      <SelectItem value="proceso">Gobierno por proceso</SelectItem>
                    </SelectContent>
                  </SelectWrapper>
                </div>
              </div>
            </div>

            {/* Roles Aprobadores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={18} color={colors.primary} />
                  <span style={{ fontWeight: 600, color: colors.text }}>Roles Aprobadores</span>
                  <Badge variant="outline">{roles.length}</Badge>
                </div>
                <Button variant="primary" size="s" iconName="Plus" onClick={addRole}>
                  Añadir rol
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {roles.length === 0 && (
                  <div style={{
                    padding: '12px',
                    border: `1px dashed ${colors.border}`,
                    borderRadius: 8,
                    color: colors.textSecondary,
                  }}>
                    No hay roles aún. Usa “Añadir rol” para comenzar.
                  </div>
                )}

                {roles.map((r) => (
                  <div key={r.id} style={{ border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: theme === 'dark' ? 'transparent' : '#fafafa',
                      borderBottom: r.expanded ? `1px solid ${colors.border}` : 'none'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => toggleExpand(r.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={r.expanded ? 'Colapsar' : 'Expandir'}
                        >
                          {r.expanded ? (
                            <ChevronDown size={16} color={colors.textSecondary} />
                          ) : (
                            <ChevronRight size={16} color={colors.textSecondary} />
                          )}
                        </button>
                        <span style={{ fontWeight: 600, color: colors.text }}>{r.nombre || 'Nuevo aprobador'}</span>
                        <span style={{ color: colors.textSecondary }}>({ROL_OPTIONS.find(o => o.value === r.rol)?.label || 'Aprobador'})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge variant="outline">Orden: {r.orden ?? '-'}</Badge>
                        <Button variant="ghost" size="s" iconName="Trash2" title="Eliminar" onClick={() => removeRole(r.id)} />
                      </div>
                    </div>

                    {r.expanded && (
                      <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        <Input
                          placeholder="Nombre"
                          value={r.nombre}
                          onChange={(e) => updateRole(r.id, { nombre: e.target.value })}
                          icon="User"
                        />
                        <SelectWrapper value={r.rol} onValueChange={(v) => updateRole(r.id, { rol: v })}>
                          <SelectContent>
                            {ROL_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </SelectWrapper>

                        <Input
                          placeholder="Cargo"
                          value={r.cargo}
                          onChange={(e) => updateRole(r.id, { cargo: e.target.value })}
                          icon="Briefcase"
                        />
                        <Input
                          placeholder="Área"
                          value={r.area}
                          onChange={(e) => updateRole(r.id, { area: e.target.value })}
                          icon="Building"
                        />

                        <Input
                          placeholder="Orden"
                          value={String(r.orden ?? '')}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            updateRole(r.id, { orden: Number.isFinite(n) ? n : undefined });
                          }}
                          icon="ListOrdered"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GobernanzaAprobacionStep;