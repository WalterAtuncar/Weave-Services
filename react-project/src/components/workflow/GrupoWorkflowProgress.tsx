import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Play, 
  Pause, 
  XCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  gobernanzaWorkflowGrupoService, 
  GobernanzaWorkflowGrupo, 
  ResumenGrupoDto 
} from '../../services/gobernanza-workflow-grupo.service';
import { toast } from '../ui/use-toast';

interface GrupoWorkflowProgressProps {
  workflowId: number;
  grupoId?: number;
  showActions?: boolean;
  onGrupoFinalized?: (grupoId: number) => void;
}

const GrupoWorkflowProgress: React.FC<GrupoWorkflowProgressProps> = ({
  workflowId,
  grupoId,
  showActions = false,
  onGrupoFinalized
}) => {
  const [grupos, setGrupos] = useState<GobernanzaWorkflowGrupo[]>([]);
  const [resumenGrupo, setResumenGrupo] = useState<ResumenGrupoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [finalizingGrupo, setFinalizingGrupo] = useState<number | null>(null);

  useEffect(() => {
    loadGrupos();
  }, [workflowId]);

  useEffect(() => {
    if (grupoId) {
      loadResumenGrupo(grupoId);
    }
  }, [grupoId]);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const response = await gobernanzaWorkflowGrupoService.getGruposByWorkflowId(workflowId);
      if (response.success && response.data) {
        setGrupos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grupos del workflow',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadResumenGrupo = async (id: number) => {
    try {
      const response = await gobernanzaWorkflowGrupoService.getResumenGrupo(id);
      if (response.success && response.data) {
        setResumenGrupo(response.data);
      }
    } catch (error) {
      console.error('Error al cargar resumen del grupo:', error);
    }
  };

  const handleFinalizarGrupo = async (id: number) => {
    try {
      setFinalizingGrupo(id);
      const response = await gobernanzaWorkflowGrupoService.finalizarGrupo(id);
      
      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Grupo finalizado exitosamente',
          variant: 'default'
        });
        
        await loadGrupos();
        if (grupoId === id) {
          await loadResumenGrupo(id);
        }
        
        onGrupoFinalized?.(id);
      }
    } catch (error) {
      console.error('Error al finalizar grupo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo finalizar el grupo',
        variant: 'destructive'
      });
    } finally {
      setFinalizingGrupo(null);
    }
  };

  const getEstadoIcon = (estadoGrupo: number, esActivo: boolean) => {
    if (estadoGrupo === 2) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (estadoGrupo === 3) return <XCircle className="h-4 w-4 text-red-500" />;
    if (esActivo) return <Play className="h-4 w-4 text-blue-500" />;
    return <Pause className="h-4 w-4 text-gray-500" />;
  };

  const getEstadoBadgeVariant = (estadoGrupo: number) => {
    switch (estadoGrupo) {
      case 0: return 'secondary'; // Pendiente
      case 1: return 'default'; // Activo
      case 2: return 'success'; // Completado
      case 3: return 'destructive'; // Rechazado
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando grupos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (grupos.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este workflow no tiene grupos paralelos configurados.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista general de grupos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Progreso de Grupos Paralelos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grupos.map((grupo) => {
              const estadisticas = gobernanzaWorkflowGrupoService.getEstadisticasGrupo(grupo);
              
              return (
                <div key={grupo.workflowGrupoId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getEstadoIcon(grupo.estadoGrupo, grupo.esActivo)}
                      <span className="font-medium">
                        Grupo {grupo.ordenEjecucion}
                      </span>
                      <Badge variant={getEstadoBadgeVariant(grupo.estadoGrupo)}>
                        {estadisticas.estadoDescripcion}
                      </Badge>
                    </div>
                    
                    {showActions && estadisticas.puedeAvanzar && (
                      <Button
                        size="sm"
                        onClick={() => handleFinalizarGrupo(grupo.workflowGrupoId)}
                        disabled={finalizingGrupo === grupo.workflowGrupoId}
                      >
                        {finalizingGrupo === grupo.workflowGrupoId ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Finalizar Grupo
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progreso: {estadisticas.usuariosCompletados} de {estadisticas.totalUsuarios} usuarios</span>
                      <span>{estadisticas.porcentajeCompletado}%</span>
                    </div>
                    
                    <Progress value={estadisticas.porcentajeCompletado} className="h-2" />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Orden: {grupo.ordenEjecucion}</span>
                      {grupo.fechaInicio && (
                        <span>Iniciado: {new Date(grupo.fechaInicio).toLocaleDateString()}</span>
                      )}
                      {grupo.fechaCompletado && (
                        <span>Completado: {new Date(grupo.fechaCompletado).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen detallado del grupo específico */}
      {resumenGrupo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Resumen Detallado - Grupo {resumenGrupo.ordenGrupo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {resumenGrupo.ejecucionesCompletadas}
                </div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {resumenGrupo.ejecucionesEnProceso}
                </div>
                <div className="text-sm text-gray-600">En Proceso</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {resumenGrupo.ejecucionesPendientes}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {resumenGrupo.ejecucionesRechazadas}
                </div>
                <div className="text-sm text-gray-600">Rechazadas</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progreso General:</span>
                <span className="text-sm font-bold">
                  {Math.round(resumenGrupo.porcentajeCompletado)}%
                </span>
              </div>
              <Progress value={resumenGrupo.porcentajeCompletado} className="mt-2" />
            </div>
            
            {resumenGrupo.puedeAvanzar && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Este grupo está listo para avanzar. Todas las ejecuciones han sido completadas.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GrupoWorkflowProgress;