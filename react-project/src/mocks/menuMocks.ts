import { Menu, MenuData } from '../models/Menu';

export const menuMockData: MenuData = {
  menus: [
    {
      menuId: 1,
      titulo: "Dashboard",
      ruta: "/dashboard",
      tipoIcono: "fas",
      icono: "fa-tachometer-alt",
      clase: "menu-dashboard",
      esTituloGrupo: false,
      badge: "3",
      badgeClass: "badge-info"
    },
    {
      menuId: 2,
      titulo: "Gestión de Procesos",
      tipoIcono: "fas",
      icono: "fa-project-diagram",
      clase: "menu-group",
      esTituloGrupo: true,
      children: [
        {
          menuId: 3,
          menuPadreId: 2,
          titulo: "Lista de Procesos",
          ruta: "/procesos/lista",
          tipoIcono: "fas",
          icono: "fa-list-ul",
          clase: "menu-item",
          esTituloGrupo: false,
          badge: "12",
          badgeClass: "badge-primary"
        },
        {
          menuId: 4,
          menuPadreId: 2,
          titulo: "Crear Proceso",
          ruta: "/procesos/crear",
          tipoIcono: "fas",
          icono: "fa-plus-circle",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 5,
          menuPadreId: 2,
          titulo: "Mapa de Procesos",
          ruta: "/procesos/mapa",
          tipoIcono: "fas",
          icono: "fa-sitemap",
          clase: "menu-item",
          esTituloGrupo: false
        }
      ]
    },
    {
      menuId: 6,
      titulo: "Actividades",
      tipoIcono: "fas",
      icono: "fa-tasks",
      clase: "menu-group",
      esTituloGrupo: true,
      children: [
        {
          menuId: 7,
          menuPadreId: 6,
          titulo: "Pendientes",
          ruta: "/actividades/pendientes",
          tipoIcono: "fas",
          icono: "fa-clock",
          clase: "menu-item",
          esTituloGrupo: false,
          badge: "8",
          badgeClass: "badge-warning"
        },
        {
          menuId: 8,
          menuPadreId: 6,
          titulo: "Completadas",
          ruta: "/actividades/completadas",
          tipoIcono: "fas",
          icono: "fa-check-circle",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 9,
          menuPadreId: 6,
          titulo: "Asignación",
          ruta: "/actividades/asignar",
          tipoIcono: "fas",
          icono: "fa-user-plus",
          clase: "menu-item",
          esTituloGrupo: false
        }
      ]
    },
    {
      menuId: 10,
      titulo: "Documentos",
      tipoIcono: "fas",
      icono: "fa-file-alt",
      clase: "menu-group",
      esTituloGrupo: true,
      children: [
        {
          menuId: 11,
          menuPadreId: 10,
          titulo: "Repositorio",
          ruta: "/documentos/repositorio",
          tipoIcono: "fas",
          icono: "fa-folder-open",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 12,
          menuPadreId: 10,
          titulo: "Plantillas",
          ruta: "/documentos/plantillas",
          tipoIcono: "fas",
          icono: "fa-file-pdf",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 13,
          menuPadreId: 10,
          titulo: "Control de Versiones",
          ruta: "/documentos/versiones",
          tipoIcono: "fas",
          icono: "fa-code-branch",
          clase: "menu-item",
          esTituloGrupo: false
        }
      ]
    },
    {
      menuId: 14,
      titulo: "Auditoría",
      tipoIcono: "fas",
      icono: "fa-search",
      clase: "menu-group",
      esTituloGrupo: true,
      children: [
        {
          menuId: 15,
          menuPadreId: 14,
          titulo: "Planes de Auditoría",
          ruta: "/auditoria/planes",
          tipoIcono: "fas",
          icono: "fa-calendar-alt",
          clase: "menu-item",
          esTituloGrupo: false,
          badge: "5",
          badgeClass: "badge-info"
        },
        {
          menuId: 16,
          menuPadreId: 14,
          titulo: "Hallazgos",
          ruta: "/auditoria/hallazgos",
          tipoIcono: "fas",
          icono: "fa-exclamation-triangle",
          clase: "menu-item",
          esTituloGrupo: false,
          badge: "2",
          badgeClass: "badge-danger"
        },
        {
          menuId: 17,
          menuPadreId: 14,
          titulo: "Reportes",
          ruta: "/auditoria/reportes",
          tipoIcono: "fas",
          icono: "fa-chart-bar",
          clase: "menu-item",
          esTituloGrupo: false
        }
      ]
    },
    {
      menuId: 18,
      titulo: "Riesgos y Controles",
      tipoIcono: "fas",
      icono: "fa-shield-alt",
      clase: "menu-group",
      esTituloGrupo: true,
      children: [
        {
          menuId: 19,
          menuPadreId: 18,
          titulo: "Matriz de Riesgos",
          ruta: "/riesgos/matriz",
          tipoIcono: "fas",
          icono: "fa-th",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 20,
          menuPadreId: 18,
          titulo: "Controles",
          ruta: "/riesgos/controles",
          tipoIcono: "fas",
          icono: "fa-shield-alt",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 21,
          menuPadreId: 18,
          titulo: "Monitoreo",
          ruta: "/riesgos/monitoreo",
          tipoIcono: "fas",
          icono: "fa-eye",
          clase: "menu-item",
          esTituloGrupo: false,
          badge: "ACTIVO",
          badgeClass: "badge-success"
        }
      ]
    },
    {
      menuId: 22,
      titulo: "Configuración",
      tipoIcono: "fas",
      icono: "fa-cog",
      clase: "menu-group",
      esTituloGrupo: true,
      children: [
        {
          menuId: 23,
          menuPadreId: 22,
          titulo: "Usuarios y Perfiles",
          ruta: "/configuracion/usuarios",
          tipoIcono: "fas",
          icono: "fa-users-cog",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 24,
          menuPadreId: 22,
          titulo: "Unidades Organizacionales",
          ruta: "/configuracion/unidades",
          tipoIcono: "fas",
          icono: "fa-sitemap",
          clase: "menu-item",
          esTituloGrupo: false
        },
        {
          menuId: 25,
          menuPadreId: 22,
          titulo: "Parámetros del Sistema",
          ruta: "/configuracion/parametros",
          tipoIcono: "fas",
          icono: "fa-sliders-h",
          clase: "menu-item",
          esTituloGrupo: false
        }
      ]
    }
  ]
}; 