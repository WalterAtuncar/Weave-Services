import { Perfil } from '../models/Perfiles';

export const perfilesMockData = {
  perfiles: [
    {
      perfilId: 1,
      nombrePerfil: 'Administrador del Sistema',
      descripcion: 'Acceso completo a todas las funcionalidades del sistema de gestión de procesos. Puede configurar parámetros, gestionar usuarios y supervisar todas las operaciones.'
    },
    {
      perfilId: 2,
      nombrePerfil: 'Gestor de Procesos',
      descripcion: 'Responsable de la creación, modificación y supervisión de procesos empresariales. Acceso completo a gestión de procesos, actividades y documentos relacionados.'
    },
    {
      perfilId: 3,
      nombrePerfil: 'Auditor Senior',
      descripcion: 'Encargado de realizar auditorías internas, evaluar controles y generar reportes de cumplimiento. Acceso a módulos de auditoría, riesgos y controles.'
    },
    {
      perfilId: 4,
      nombrePerfil: 'Supervisor de Operaciones',
      descripcion: 'Supervisa la ejecución de actividades y procesos diarios. Acceso a monitoreo de actividades, dashboard ejecutivo y reportes operacionales.'
    },
    {
      perfilId: 5,
      nombrePerfil: 'Usuario Operativo',
      descripcion: 'Usuario final que ejecuta actividades específicas dentro de los procesos. Acceso limitado a sus actividades asignadas y documentos relacionados.'
    },
    {
      perfilId: 6,
      nombrePerfil: 'Analista de Riesgos',
      descripcion: 'Especialista en identificación, análisis y monitoreo de riesgos empresariales. Acceso completo a matriz de riesgos y controles asociados.'
    },
    {
      perfilId: 7,
      nombrePerfil: 'Consultor Externo',
      descripcion: 'Acceso de solo lectura para consultores externos que necesitan revisar procesos y documentación sin capacidad de modificación.'
    }
  ] as Perfil[]
}; 