import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  RefreshCw,
  Calendar,
  Target
} from 'lucide-react';
import { 
  bandejaTareasService,
  EstadisticasBandeja 
} from '../../services/bandeja-tareas.service';
import { 
  gobernanzaWorkflowGrupoService,
  GobernanzaWorkflowGrupo,
  ResumenGrupoDto 
} from '../../services/gobernanza-workflow-grupo.service';
import { toast } from '../ui/use-toast';

interface MetricasWorkflow {
  workflowId: number;
  nombreWorkflow: string;
  tipoFlujo: number;
  totalGrupos: number;
  gruposCompletados: number;
  gruposActivos: number;
  gruposPendientes: number;
  totalEjecuciones: number;
  ejecucionesCompletadas: number;
  porcentajeCompletado: number;
  tiempoPromedioGrupo: number;
  eficienciaParalela: number;
}

interface DashboardFlujosParalelosProps {
  workflowIds?: number[];
  refreshInterval?: number;
}

const DashboardFlujosParalelos: React.FC<DashboardFlujosParalelosProps> = ({
  workflowIds = [],
  refreshInterval = 30000 // 30 segundos
}) => {
  const [metricas, setMetricas] = useState<MetricasWorkflow[]>([]);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState<EstadisticasBandeja | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [workflowIds, refreshInterval]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const estadisticasResponse = await bandejaTareasService.getEstadisticasBandeja();
      if (estadisticasResponse.success && estadisticasResponse.data) {
        setEstadisticasGenerales(estadisticasResponse.data);
      }

      // Cargar métricas por workflow
      const metricasPromises = workflowIds.map(async (workflowId) => {
        try {
          const gruposResponse = await gobernanzaWorkflowGrupoService.getGruposByWorkflowId(workflowId);
          
          if (gruposResponse.success && gruposResponse.data) {
            const grupos = gruposResponse.data;
            const resumenesPromises = grupos.map(grupo => 
              gobernanzaWorkflowGrupoService.getResumenGrupo(grupo.workflowGrupoId)
            );
            
            const resumenes = await Promise.all(resumenesPromises);
            const resumenesValidos = resumenes
              .filter(r => r.success && r.data)
              .map(r => r.data!);

            return calcularMetricasWorkflow(workflowId, grupos, resumenesValidos);
          }
        } catch (error) {
          console.error(`Error al cargar métricas para workflow ${workflowId}:`, error);
        }
        return null;
      });

      const metricasResults = await Promise.all(metricasPromises);
      setMetricas(metricasResults.filter(m => m !== null) as MetricasWorkflow[]);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las métricas del dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricasWorkflow = (
    workflowId: number, 
    grupos: GobernanzaWorkflowGrupo[], 
    resumenes: ResumenGrupoDto[]
  ): MetricasWorkflow => {
    const gruposCompletados = grupos.filter(g => g.estadoGrupo === 2).length;
    const gruposActivos = grupos.filter(g => g.esActivo).length;
    const gruposPendientes = grupos.filter(g => g.estadoGrupo === 0).length;
    
    const totalEjecuciones = resumenes.reduce((sum, r) => sum + r.totalEjecuciones, 0);
    const ejecucionesCompletadas = resumenes.reduce((sum, r) => sum + r.ejecucionesCompletadas, 0);
    
    const porcentajeCompletado = totalEjecuciones > 0 
      ? (ejecucionesCompletadas / totalEjecuciones) * 100 
      : 0;
    
    // Calcular tiempo promedio por grupo (simulado)
    const tiempoPromedioGrupo = resumenes.length > 0 
      ? resumenes.reduce((sum, r) => {
          if (r.fechaInicio && r.fechaFinalizacion) {
            const inicio = new Date(r.fechaInicio);
            const fin = new Date(r.fechaFinalizacion);
            return sum + (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60); // horas
          }
          return sum;
        }, 0) / resumenes.filter(r => r.fechaFinalizacion).length
      : 0;
    
    // Calcular eficiencia paralela (comparado con flujo secuencial)
    const eficienciaParalela = grupos.length > 1 
      ? Math.min(100, (grupos.length / Math.max(1, tiempoPromedioGrupo)) * 20)
      : 0;

    return {
      workflowId,
      nombreWorkflow: `Workflow ${workflowId}`,
      tipoFlujo: 1, // Asumimos paralelo
      totalGrupos: grupos.length,
      gruposCompletados,
      gruposActivos,
      gruposPendientes,
      totalEjecuciones,
      ejecucionesCompletadas,
      porcentajeCompletado,
      tiempoPromedioGrupo,
      eficienciaParalela
    };
  };

  const datosGraficoBarras = metricas.map(m => ({
    nombre: m.nombreWorkflow,
    completadas: m.ejecucionesCompletadas,
    pendientes: m.totalEjecuciones - m.ejecucionesCompletadas,
    eficiencia: m.eficienciaParalela
  }));

  const datosGraficoPie = [
    { name: 'Completadas', value: estadisticasGenerales?.completadas || 0, color: '#10b981' },
    { name: 'En Proceso', value: estadisticasGenerales?.enProceso || 0, color: '#3b82f6' },
    { name: 'Pendientes', value: estadisticasGenerales?.pendientes || 0, color: '#f59e0b' },
    { name: 'Rechazadas', value: estadisticasGenerales?.rechazadas || 0, color: '#ef4444' }
  ];

  const datosGraficoLinea = metricas.map((m, index) => ({
    workflow: `W${m.workflowId}`,
    progreso: m.porcentajeCompletado,
    eficiencia: m.eficienciaParalela
  }));

  if (loading && metricas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando métricas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información general */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Flujos Paralelos</h2>
          <p className="text-gray-600">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold">
                  {(estadisticasGenerales?.total || 0).toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workflows Activos</p>
                <p className="text-2xl font-bold">{metricas.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiencia Promedio</p>
                <p className="text-2xl font-bold">
                  {metricas.length > 0 
                    ? Math.round(metricas.reduce((sum, m) => sum + m.eficienciaParalela, 0) / metricas.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {metricas.length > 0 
                    ? Math.round(metricas.reduce((sum, m) => sum + m.tiempoPromedioGrupo, 0) / metricas.length)
                    : 0}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Progreso por workflow */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completadas" fill="#10b981" name="Completadas" />
                <Bar dataKey="pendientes" fill="#f59e0b" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pie - Distribución general */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución General de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGraficoPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {datosGraficoPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de métricas detalladas */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalladas por Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {metricas.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No hay workflows con flujos paralelos configurados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {metricas.map(metrica => (
                <div key={metrica.workflowId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{metrica.nombreWorkflow}</h3>
                      <Badge variant="outline" icon={<Users className="h-3 w-3" />}>
                        {metrica.totalGrupos} grupos
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(metrica.porcentajeCompletado)}%
                      </div>
                      <div className="text-sm text-gray-600">Completado</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {metrica.gruposActivos}
                      </div>
                      <div className="text-sm text-gray-600">Grupos Activos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {metrica.gruposCompletados}
                      </div>
                      <div className="text-sm text-gray-600">Grupos Completados</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-yellow-600">
                        {metrica.gruposPendientes}
                      </div>
                      <div className="text-sm text-gray-600">Grupos Pendientes</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {Math.round(metrica.eficienciaParalela)}%
                      </div>
                      <div className="text-sm text-gray-600">Eficiencia</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {metrica.ejecucionesCompletadas} de {metrica.totalEjecuciones}</span>
                      <span>{Math.round(metrica.porcentajeCompletado)}%</span>
                    </div>
                    <Progress value={metrica.porcentajeCompletado} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardFlujosParalelos;