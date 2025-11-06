import { MenuPerfil } from '../models/MenuPerfil';

export const menuPerfilMockData = {
  menuPerfiles: [
    // Administrador del Sistema (perfilId: 1) - Acceso completo a todos los grupos (7 menús)
    { menuPerfilId: 1, menuId: 1, perfilId: 1, accesoId: 1 }, // Dashboard - Completo
    { menuPerfilId: 2, menuId: 2, perfilId: 1, accesoId: 1 }, // Gestión de Procesos - Completo
    { menuPerfilId: 3, menuId: 6, perfilId: 1, accesoId: 1 }, // Actividades - Completo
    { menuPerfilId: 4, menuId: 10, perfilId: 1, accesoId: 1 }, // Documentos - Completo
    { menuPerfilId: 5, menuId: 14, perfilId: 1, accesoId: 1 }, // Auditoría - Completo
    { menuPerfilId: 6, menuId: 18, perfilId: 1, accesoId: 1 }, // Riesgos y Controles - Completo
    { menuPerfilId: 7, menuId: 22, perfilId: 1, accesoId: 1 }, // Configuración - Completo

    // Gestor de Procesos (perfilId: 2) - Enfoque en procesos y actividades (5 menús)
    { menuPerfilId: 8, menuId: 1, perfilId: 2, accesoId: 2 }, // Dashboard - Lectura
    { menuPerfilId: 9, menuId: 2, perfilId: 2, accesoId: 1 }, // Gestión de Procesos - Completo
    { menuPerfilId: 10, menuId: 6, perfilId: 2, accesoId: 1 }, // Actividades - Completo
    { menuPerfilId: 11, menuId: 10, perfilId: 2, accesoId: 1 }, // Documentos - Completo
    { menuPerfilId: 12, menuId: 14, perfilId: 2, accesoId: 2 }, // Auditoría - Lectura

    // Auditor Senior (perfilId: 3) - Enfoque en auditoría y riesgos (5 menús)
    { menuPerfilId: 13, menuId: 1, perfilId: 3, accesoId: 2 }, // Dashboard - Lectura
    { menuPerfilId: 14, menuId: 2, perfilId: 3, accesoId: 2 }, // Gestión de Procesos - Lectura
    { menuPerfilId: 15, menuId: 10, perfilId: 3, accesoId: 2 }, // Documentos - Lectura
    { menuPerfilId: 16, menuId: 14, perfilId: 3, accesoId: 1 }, // Auditoría - Completo
    { menuPerfilId: 17, menuId: 18, perfilId: 3, accesoId: 1 }, // Riesgos y Controles - Completo

    // Supervisor de Operaciones (perfilId: 4) - Enfoque en supervisión (4 menús)
    { menuPerfilId: 18, menuId: 1, perfilId: 4, accesoId: 1 }, // Dashboard - Completo
    { menuPerfilId: 19, menuId: 2, perfilId: 4, accesoId: 2 }, // Gestión de Procesos - Lectura
    { menuPerfilId: 20, menuId: 6, perfilId: 4, accesoId: 1 }, // Actividades - Completo
    { menuPerfilId: 21, menuId: 10, perfilId: 4, accesoId: 2 }, // Documentos - Lectura

    // Usuario Operativo (perfilId: 5) - Acceso básico (3 menús)
    { menuPerfilId: 22, menuId: 1, perfilId: 5, accesoId: 2 }, // Dashboard - Lectura
    { menuPerfilId: 23, menuId: 6, perfilId: 5, accesoId: 2 }, // Actividades - Lectura
    { menuPerfilId: 24, menuId: 10, perfilId: 5, accesoId: 2 }, // Documentos - Lectura

    // Analista de Riesgos (perfilId: 6) - Especialista en riesgos (4 menús)
    { menuPerfilId: 25, menuId: 1, perfilId: 6, accesoId: 2 }, // Dashboard - Lectura
    { menuPerfilId: 26, menuId: 2, perfilId: 6, accesoId: 2 }, // Gestión de Procesos - Lectura
    { menuPerfilId: 27, menuId: 14, perfilId: 6, accesoId: 2 }, // Auditoría - Lectura
    { menuPerfilId: 28, menuId: 18, perfilId: 6, accesoId: 1 }, // Riesgos y Controles - Completo

    // Consultor Externo (perfilId: 7) - Solo lectura (3 menús)
    { menuPerfilId: 29, menuId: 1, perfilId: 7, accesoId: 2 }, // Dashboard - Lectura
    { menuPerfilId: 30, menuId: 2, perfilId: 7, accesoId: 2 }, // Gestión de Procesos - Lectura
    { menuPerfilId: 31, menuId: 10, perfilId: 7, accesoId: 2 } // Documentos - Lectura
  ] as MenuPerfil[]
}; 