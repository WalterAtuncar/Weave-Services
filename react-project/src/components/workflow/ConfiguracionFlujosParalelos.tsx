import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button/button';
import { Input } from '../ui/input/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select/Select';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle, 
  Users, 
  ArrowRight,
  Settings,
  Info
} from 'lucide-react';
import { toast } from '../ui/use-toast';

interface GrupoConfiguracion {
  id: string;
  orden: number;
  nombre: string;
  descripcion: string;
  usuariosAsignados: string[];
  requiereCompletarAnterior: boolean;
}

interface ConfiguracionFlujosParalelosProps {
  workflowId: number;
  tipoFlujo: number;
  onTipoFlujoChange: (tipo: number) => void;
  onConfiguracionChange: (grupos: GrupoConfiguracion[]) => void;
  readonly?: boolean;
}

const ConfiguracionFlujosParalelos: React.FC<ConfiguracionFlujosParalelosProps> = ({
  workflowId,
  tipoFlujo,
  onTipoFlujoChange,
  onConfiguracionChange,
  readonly = false
}) => {
  const [grupos, setGrupos] = useState<GrupoConfiguracion[]>([]);
  const [usuariosDisponibles] = useState<string[]>([
    'usuario1@empresa.com',
    'usuario2@empresa.com',
    'usuario3@empresa.com',
    'supervisor@empresa.com',
    'gerente@empresa.com'
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Inicializar con un grupo por defecto si no hay grupos
    if (grupos.length === 0 && tipoFlujo === 1) {
      agregarGrupo();
    }
  }, [tipoFlujo]);

  useEffect(() => {
    onConfiguracionChange(grupos);
  }, [grupos, onConfiguracionChange]);

  const agregarGrupo = () => {
    const nuevoGrupo: GrupoConfiguracion = {
      id: `grupo_${Date.now()}`,
      orden: grupos.length + 1,
      nombre: `Grupo ${grupos.length + 1}`,
      descripcion: '',
      usuariosAsignados: [],
      requiereCompletarAnterior: grupos.length > 0
    };
    
    setGrupos([...grupos, nuevoGrupo]);
  };

  const eliminarGrupo = (id: string) => {
    const nuevosGrupos = grupos.filter(g => g.id !== id)
      .map((g, index) => ({ ...g, orden: index + 1 }));
    
    setGrupos(nuevosGrupos);
    
    // Limpiar errores del grupo eliminado
    const nuevosErrors = { ...errors };
    delete nuevosErrors[id];
    setErrors(nuevosErrors);
  };

  const actualizarGrupo = (id: string, campo: keyof GrupoConfiguracion, valor: any) => {
    setGrupos(grupos.map(g => 
      g.id === id ? { ...g, [campo]: valor } : g
    ));
    
    // Limpiar error del campo actualizado
    if (errors[`${id}_${campo}`]) {
      const nuevosErrors = { ...errors };
      delete nuevosErrors[`${id}_${campo}`];
      setErrors(nuevosErrors);
    }
  };

  const agregarUsuarioAGrupo = (grupoId: string, usuario: string) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (grupo && !grupo.usuariosAsignados.includes(usuario)) {
      actualizarGrupo(grupoId, 'usuariosAsignados', [...grupo.usuariosAsignados, usuario]);
    }
  };

  const removerUsuarioDeGrupo = (grupoId: string, usuario: string) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (grupo) {
      actualizarGrupo(grupoId, 'usuariosAsignados', 
        grupo.usuariosAsignados.filter(u => u !== usuario)
      );
    }
  };

  const validarConfiguracion = (): boolean => {
    const nuevosErrors: Record<string, string> = {};
    let esValido = true;

    if (tipoFlujo === 1) {
      if (grupos.length === 0) {
        nuevosErrors.general = 'Debe configurar al menos un grupo para flujos paralelos';
        esValido = false;
      }

      grupos.forEach(grupo => {
        if (!grupo.nombre.trim()) {
          nuevosErrors[`${grupo.id}_nombre`] = 'El nombre del grupo es requerido';
          esValido = false;
        }
        
        if (grupo.usuariosAsignados.length === 0) {
          nuevosErrors[`${grupo.id}_usuarios`] = 'Debe asignar al menos un usuario al grupo';
          esValido = false;
        }
      });

      // Verificar que no haya usuarios duplicados entre grupos
      const todosLosUsuarios = grupos.flatMap(g => g.usuariosAsignados);
      const usuariosDuplicados = todosLosUsuarios.filter((usuario, index) => 
        todosLosUsuarios.indexOf(usuario) !== index
      );
      
      if (usuariosDuplicados.length > 0) {
        nuevosErrors.general = 'Un usuario no puede estar asignado a múltiples grupos';
        esValido = false;
      }
    }

    setErrors(nuevosErrors);
    return esValido;
  };

  const guardarConfiguracion = () => {
    if (validarConfiguracion()) {
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de flujos paralelos se ha guardado exitosamente',
        variant: 'default'
      });
    } else {
      toast({
        title: 'Error de validación',
        description: 'Por favor corrija los errores antes de guardar',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuración del tipo de flujo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Flujo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="flujo-paralelo"
                checked={tipoFlujo === 1}
                onCheckedChange={(checked) => onTipoFlujoChange(checked ? 1 : 0)}
                disabled={readonly}
              />
              <Label htmlFor="flujo-paralelo" className="text-sm font-medium">
                Habilitar flujos paralelos
              </Label>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {tipoFlujo === 1 
                  ? 'Los usuarios podrán trabajar en paralelo organizados en grupos secuenciales.'
                  : 'El workflow seguirá un flujo secuencial tradicional usuario por usuario.'
                }
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de grupos (solo si está habilitado el flujo paralelo) */}
      {tipoFlujo === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Configuración de Grupos
              </div>
              {!readonly && (
                <Button onClick={agregarGrupo} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Grupo
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <Alert className="mb-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {grupos.map((grupo, index) => (
                <div key={grupo.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Orden {grupo.orden}</Badge>
                      {index > 0 && grupo.requiereCompletarAnterior && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    {!readonly && grupos.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarGrupo(grupo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`nombre-${grupo.id}`}>Nombre del Grupo</Label>
                      <Input
                        id={`nombre-${grupo.id}`}
                        value={grupo.nombre}
                        onChange={(e) => actualizarGrupo(grupo.id, 'nombre', e.target.value)}
                        placeholder="Ej: Revisores Técnicos"
                        disabled={readonly}
                        className={errors[`${grupo.id}_nombre`] ? 'border-red-500' : ''}
                      />
                      {errors[`${grupo.id}_nombre`] && (
                        <p className="text-sm text-red-500 mt-1">{errors[`${grupo.id}_nombre`]}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`descripcion-${grupo.id}`}>Descripción</Label>
                      <Input
                        id={`descripcion-${grupo.id}`}
                        value={grupo.descripcion}
                        onChange={(e) => actualizarGrupo(grupo.id, 'descripcion', e.target.value)}
                        placeholder="Descripción opcional del grupo"
                        disabled={readonly}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Usuarios Asignados</Label>
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {grupo.usuariosAsignados.map(usuario => (
                        <Badge key={usuario} variant="secondary" className="flex items-center gap-1">
                          {usuario}
                          {!readonly && (
                            <button
                              onClick={() => removerUsuarioDeGrupo(grupo.id, usuario)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {!readonly && (
                      <Select onValueChange={(usuario) => agregarUsuarioAGrupo(grupo.id, usuario)}>
                        <SelectTrigger className={errors[`${grupo.id}_usuarios`] ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar usuario" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuariosDisponibles
                            .filter(usuario => !grupo.usuariosAsignados.includes(usuario))
                            .map(usuario => (
                              <SelectItem key={usuario} value={usuario}>
                                {usuario}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                    
                    {errors[`${grupo.id}_usuarios`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`${grupo.id}_usuarios`]}</p>
                    )}
                  </div>

                  {index > 0 && (
                    <div className="mt-4 flex items-center space-x-2">
                      <Switch
                        id={`requiere-anterior-${grupo.id}`}
                        checked={grupo.requiereCompletarAnterior}
                        onCheckedChange={(checked) => 
                          actualizarGrupo(grupo.id, 'requiereCompletarAnterior', checked)
                        }
                        disabled={readonly}
                      />
                      <Label htmlFor={`requiere-anterior-${grupo.id}`} className="text-sm">
                        Requiere completar grupo anterior
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!readonly && grupos.length > 0 && (
              <div className="flex justify-end mt-6">
                <Button onClick={guardarConfiguracion}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConfiguracionFlujosParalelos;