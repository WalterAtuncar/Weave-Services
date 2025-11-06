import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { 
  bandejaTareasService, 
  BandejaTareasDto, 
  BandejaTareasFilters 
} from '../../services/bandeja-tareas.service';
import { 
  gobernanzaWorkflowGrupoService,
  GobernanzaWorkflowGrupo 
} from '../../services/gobernanza-workflow-grupo.service';
import { toast } from '../ui/use-toast';
import GrupoWorkflowProgress from './GrupoWorkflowProgress';

interface BandejaTareasParalelasProps {
  usuarioId?: string;
  showFilters?: boolean;
  showGroupProgress?: boolean;
}

const BandejaTareasParalelas: React.FC<BandejaTareasParalelasProps> = ({
  usuarioId,
  showFilters = true,
  showGroupProgress = true
}) => {
  const [tareas, setTareas] = useState<BandejaTareasDto[]>([]);
  const [grupos, setGrupos] = useState<GobernanzaWorkflowGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<BandejaTareasFilters>({
    incluirPendientes: true,
    incluirEnProceso: true,
    incluirCompletadas: false
  });
  const [busqueda, setBusqueda] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null);

  useEffect(() => {
    loadTareas();
  }, [filtros, usuarioId]);

  useEffect(() => {
    if (selectedWorkflowId) {
      loadGruposWorkflow(selectedWorkflowId);
    }
  }, [selectedWorkflowId]);

  const loadTareas = async () => {
    try {
      setLoading(true);
      const response = await bandejaTareasService.getBandejaTareasUsuario(filtros);
      if (response.success && response.data) {
        setTareas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las tareas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGruposWorkflow = async (workflowId: number) => {
    try {
      const response = await gobernanzaWorkflowGrupoService.getGruposByWorkflowId(workflowId);
      if (response.success && response.data) {
        setGrupos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    }
  };

  const handleFiltroChange = (campo: keyof BandejaTareasFilters, valor: any) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleWorkflowSelect = (workflowId: number) => {
    setSelectedWorkflowId(workflowId);
    setSelectedGrupoId(null);
  };

  const getEstadoBadge = (estado: number) => {
    switch (estado) {
      case 0:
        return <Badge variant="secondary" icon={<Clock className="h-3 w-3" />}>Pendiente</Badge>;
      case 1:
        return <Badge variant="default" icon={<Play className="h-3 w-3" />}>En Proceso</Badge>;
      case 2:
        return <Badge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Completada</Badge>;
      case 3:
        return <Badge variant="destructive" icon={<AlertCircle className="h-3 w-3" />}>Rechazada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getTipoFlujoBadge = (tipoFlujo: number) => {
    return tipoFlujo === 1 
      ? <Badge variant="outline" icon={<Users className="h-3 w-3" />}>Paralelo</Badge>
      : <Badge variant="outline">Secuencial</Badge>;
  };

  const tareasFiltradas = tareas.filter(tarea => {
    const matchBusqueda = !busqueda || 
      tarea.nombreProceso?.toLowerCase().includes(busqueda.toLowerCase()) ||
      tarea.nombreActividad?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchGrupo = !selectedGrupoId || tarea.workflowGrupoId === selectedGrupoId;
    
    return matchBusqueda && matchGrupo;
  });

  const tareasAgrupadas = tareasFiltradas.reduce((acc, tarea) => {
    const key = tarea.workflowId || 'sin-workflow';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tarea);
    return acc;
  }, {} as Record<string, BandejaTareasDto[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando tareas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Buscar tareas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pendientes"
                  checked={filtros.incluirPendientes || false}
                  onChange={(e) => handleFiltroChange('incluirPendientes', e.target.checked)}
                />
                <label htmlFor="pendientes" className="text-sm">Pendientes</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="en-proceso"
                  checked={filtros.incluirEnProceso || false}
                  onChange={(e) => handleFiltroChange('incluirEnProceso', e.target.checked)}
                />
                <label htmlFor="en-proceso" className="text-sm">En Proceso</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="completadas"
                  checked={filtros.incluirCompletadas || false}
                  onChange={(e) => handleFiltroChange('incluirCompletadas', e.target.checked)}
                />
                <label htmlFor="completadas" className="text-sm">Completadas</label>
              </div>
            </div>
            
            {grupos.length > 0 && (
              <div className="mt-4">
                <Select onValueChange={(value) => setSelectedGrupoId(value ? parseInt(value) : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los grupos</SelectItem>
                    {grupos.map(grupo => (
                      <SelectItem key={grupo.workflowGrupoId} value={grupo.workflowGrupoId.toString()}>
                        Grupo {grupo.ordenEjecucion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenido principal */}
      <Tabs defaultValue="tareas" className="w-full">
        <TabsList>
          <TabsTrigger value="tareas">Mis Tareas</TabsTrigger>
          {showGroupProgress && <TabsTrigger value="progreso">Progreso de Grupos</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="tareas" className="space-y-4">
          {Object.keys(tareasAgrupadas).length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron tareas con los filtros aplicados.
              </AlertDescription>
            </Alert>
          ) : (
            Object.entries(tareasAgrupadas).map(([workflowId, tareasWorkflow]) => {
              const primeraTarea = tareasWorkflow[0];
              const esWorkflowParalelo = primeraTarea.tipoFlujo === 1;
              
              return (
                <Card key={workflowId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{primeraTarea.nombreProceso || 'Proceso sin nombre'}</span>
                        {getTipoFlujoBadge(primeraTarea.tipoFlujo || 0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {tareasWorkflow.length} tarea{tareasWorkflow.length !== 1 ? 's' : ''}
                        </Badge>
                        {esWorkflowParalelo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWorkflowSelect(parseInt(workflowId))}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Progreso
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tareasWorkflow.map(tarea => (
                        <div key={tarea.ejecucionId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{tarea.nombreActividad}</span>
                              {getEstadoBadge(tarea.estado || 0)}
                              {tarea.workflowGrupoId && (
                                <Badge variant="secondary" className="text-xs">
                                  Grupo {tarea.workflowGrupoId}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tarea.fechaCreacion && new Date(tarea.fechaCreacion).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {tarea.descripcion && (
                            <p className="text-sm text-gray-600 mb-2">{tarea.descripcion}</p>
                          )}
                          
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-500">
                              ID: {tarea.ejecucionId}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </Button>
                              {(tarea.estado === 0 || tarea.estado === 1) && (
                                <Button size="sm">
                                  <Play className="h-4 w-4 mr-2" />
                                  Procesar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        {showGroupProgress && (
          <TabsContent value="progreso">
            {selectedWorkflowId ? (
              <GrupoWorkflowProgress 
                workflowId={selectedWorkflowId}
                grupoId={selectedGrupoId || undefined}
                showActions={true}
                onGrupoFinalized={() => {
                  loadTareas();
                  toast({
                    title: 'Grupo finalizado',
                    description: 'El grupo ha sido finalizado exitosamente',
                    variant: 'default'
                  });
                }}
              />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Seleccione un workflow con flujos paralelos para ver el progreso de grupos.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BandejaTareasParalelas;