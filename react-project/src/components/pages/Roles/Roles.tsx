import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Menu } from '../../../models/Menu';
import { MenuPerfil } from '../../../models/MenuPerfil';
import { menuService, perfilService, menuPerfilService, personasService } from '../../../services';
import { MenuItem } from '../../../services/types/auth.types';
import { Perfil } from '../../../services/types/perfil.types';
import { AlertService } from '../../ui/alerts/AlertService';
import { Button } from '../../ui/button/button';
import { Input } from '../../ui/input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Edit, Copy, Trash2, MinusCircle, Save, X, RefreshCw, ArrowLeft } from 'lucide-react';
import styles from './Roles.module.css';

export interface RolesProps {
  data: any;
}

interface MenuTreeNode extends MenuItem {
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

interface PerfilWithMenus extends Perfil {
  menuCount: number;
  menuIds: number[];
  accessTypes: { [menuId: number]: number };
}

interface DragItem {
  type: 'menu';
  menuId: number;
  menu: MenuItem;
}

export const Roles: React.FC<RolesProps> = ({ data }) => {
  const { colors, theme } = useTheme();
  
  // Estados principales
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [menuPerfiles, setMenuPerfiles] = useState<MenuPerfil[]>([]);
  
  // Estados de carga
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [isLoadingPerfiles, setIsLoadingPerfiles] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados de UI
  const [selectedPerfil, setSelectedPerfil] = useState<number | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set([2, 3, 6, 9]));
  const [editingPerfil, setEditingPerfil] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [newPerfilName, setNewPerfilName] = useState('');
  const [newPerfilDesc, setNewPerfilDesc] = useState('');
  const [showNewPerfilForm, setShowNewPerfilForm] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<MenuItem[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<Set<number>>(new Set());
  const [selectedPerfiles, setSelectedPerfiles] = useState<Set<number>>(new Set());
  
  // Estados para controlar el flujo de visualización
  const [viewMode, setViewMode] = useState<'list' | 'creating' | 'viewing' | 'editing'>('list');

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadMenus(),
      loadPerfiles(),
      loadMenuPerfiles()
    ]);
  };

  const loadMenus = async () => {
    try {
      setIsLoadingMenus(true);
      
      // Intentar obtener desde API con fallback a localStorage
      const menusData = await menuService.getMenusWithFallback();
      
      if (menusData.length === 0) {
        AlertService.warning('No se encontraron menús. Inicia sesión para cargar los menús.');
      } else {
        // Aplanar la jerarquía para el tree view
        const flatMenus = flattenMenuHierarchy(menusData);
        setMenus(flatMenus);
      }
    } catch (error) {
      console.error('Error al cargar menús:', error);
      AlertService.error('Error inesperado al cargar menús del sistema');
    } finally {
      setIsLoadingMenus(false);
    }
  };

  const loadPerfiles = async () => {
    try {
      setIsLoadingPerfiles(true);
      const response = await perfilService.getPerfiles();
      
      if (response.success && response.data) {
        // Convertir PerfilDto a Perfil para compatibilidad
        const perfilesCompatibles: Perfil[] = response.data.map(dto => ({
          perfilId: dto.perfilId,
          nombrePerfil: dto.nombrePerfil,
          descripcion: dto.descripcion || undefined
        }));
        setPerfiles(perfilesCompatibles);
      } else {
        AlertService.error(response.message || 'Error al cargar perfiles del sistema');
      }
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      AlertService.error('Error de conexión al cargar perfiles');
    } finally {
      setIsLoadingPerfiles(false);
    }
  };

  const loadMenuPerfiles = async () => {
    try {
      const response = await menuPerfilService.getMenuPerfiles();
      
      if (response.success && response.data) {
        // Convertir MenuPerfilDto a MenuPerfil para compatibilidad
        const menuPerfilesCompatibles = menuPerfilService.convertMenuPerfilDtoToMenuPerfil(response.data);
        setMenuPerfiles(menuPerfilesCompatibles);
      } else {
        console.warn('No se pudieron cargar las relaciones MenuPerfil');
      }
    } catch (error) {
      console.error('Error al cargar MenuPerfiles:', error);
      // No mostrar error al usuario, usar datos mock como fallback
    }
  };

  // Función para aplanar la jerarquía de menús
  const flattenMenuHierarchy = (menuItems: MenuItem[]): MenuItem[] => {
    const flattened: MenuItem[] = [];
    
    const flatten = (items: MenuItem[], level: number = 0) => {
      items.forEach(item => {
        flattened.push(item);
        if (item.menusHijos && item.menusHijos.length > 0) {
          flatten(item.menusHijos, level + 1);
        }
      });
    };
    
    flatten(menuItems);
    
    return flattened;
  };

  // Función para construir el árbol de menús completo de manera recursiva
  const buildMenuTree = useCallback((parentId: number | null = null, level: number = 0): MenuTreeNode[] => {
    const result: MenuTreeNode[] = [];
    
    const menuItems = menus
      .filter(menu => menu.menuPadreId === parentId)
      .sort((a, b) => {
        // Ordenar por menuId para consistencia
        return a.menuId - b.menuId;
      });

    menuItems.forEach(menu => {
      const hasChildren = menus.some(m => m.menuPadreId === menu.menuId);
      const isExpanded = expandedMenus.has(menu.menuId);
      
      // Agregar el menú actual al resultado
      result.push({
        ...menu,
        level,
        isExpanded,
        hasChildren
      });

      // Si el menú tiene hijos y está expandido, agregarlos recursivamente
      if (hasChildren && isExpanded) {
        const children = buildMenuTree(menu.menuId, level + 1);
        result.push(...children);
      }
    });

    return result;
  }, [menus, expandedMenus]);

  // Generar números de menús jerárquicos
  const menuNumbers = useMemo((): { [key: number]: string } => {
    const menuNumbers: { [key: number]: string } = {};
    const counters: number[] = []; // Contadores por nivel
    
    const assignNumbers = (parentId: number | null = null, level: number = 0) => {
      // Inicializar contador para este nivel si no existe
      if (counters.length <= level) {
        counters.push(0);
      }
      
      // Resetear contadores de niveles inferiores
      counters.splice(level + 1);
      
      const menuItems = menus
        .filter(menu => menu.menuPadreId === parentId)
        .sort((a, b) => {
          // Ordenar por menuId para consistencia
          return a.menuId - b.menuId;
        });
      
      menuItems.forEach(menu => {
        counters[level]++;
        
        // Generar número jerárquico
        const number = counters.slice(0, level + 1).join('.');
        menuNumbers[menu.menuId] = number;
        
        // Procesar hijos si existen
        if (menus.some(m => m.menuPadreId === menu.menuId)) {
          assignNumbers(menu.menuId, level + 1);
        }
      });
    };
    
    assignNumbers();
    return menuNumbers;
  }, [menus]);

  // Función para obtener perfiles con información de menús
  const perfilesWithMenus = useMemo((): PerfilWithMenus[] => {
    return perfiles.map(perfil => {
      const perfilMenus = menuPerfiles.filter(mp => mp.perfilId === perfil.perfilId);
      const menuIds = perfilMenus.map(mp => mp.menuId);
      const accessTypes = perfilMenus.reduce((acc, mp) => {
        // 🔍 DEBUG: Verificar valores que llegan desde el backend
        acc[mp.menuId] = mp.accesoId;
        return acc;
      }, {} as { [menuId: number]: number });
      
      return {
        ...perfil,
        menuCount: perfilMenus.length,
        menuIds,
        accessTypes
      };
    });
  }, [perfiles, menuPerfiles]);

  // Filtrar perfiles según búsqueda
  const filteredPerfiles = useMemo(() => {
    if (!searchTerm) return perfilesWithMenus;
    return perfilesWithMenus.filter(perfil =>
      perfil.nombrePerfil.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perfil.descripcion && perfil.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [perfilesWithMenus, searchTerm]);

  // Auto-guardado cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSaving(true);
      setTimeout(() => {
        setLastSaved(new Date());
        setIsSaving(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generar breadcrumbs para menú seleccionado
  const generateBreadcrumbs = useCallback((menuId: number) => {
    const breadcrumbPath: MenuItem[] = [];
    let currentMenu = menus.find(m => m.menuId === menuId);
    
    while (currentMenu) {
      breadcrumbPath.unshift(currentMenu);
      if (currentMenu.menuPadreId) {
        currentMenu = menus.find(m => m.menuId === currentMenu!.menuPadreId);
      } else {
        break;
      }
    }
    
    setBreadcrumbs(breadcrumbPath);
  }, [menus]);

  // Función para obtener toda la cadena jerárquica de padres de un menú
  const getMenuParentChain = useCallback((menuId: number): MenuItem[] => {
    const chain: MenuItem[] = [];
    let currentMenu = menus.find(m => m.menuId === menuId);
    
    while (currentMenu) {
      chain.unshift(currentMenu); // Agregar al inicio para mantener orden jerárquico (raíz -> hijo)
      if (currentMenu.menuPadreId) {
        currentMenu = menus.find(m => m.menuId === currentMenu!.menuPadreId);
      } else {
        break;
      }
    }
    
    return chain;
  }, [menus]);

  // Función para identificar si un menú es padre (tiene hijos) o hijo (no tiene hijos)
  const isMenuParent = useCallback((menuId: number): boolean => {
    return menus.some(menu => menu.menuPadreId === menuId);
  }, [menus]);

  // Función para identificar menús faltantes en un perfil
  const getMissingParentsForProfile = useCallback((menuId: number, perfilId: number): MenuItem[] => {
    // Obtener la cadena jerárquica completa directamente sin usar getMenuParentChain
    const chain: MenuItem[] = [];
    let currentMenu = menus.find(m => m.menuId === menuId);
    
    while (currentMenu) {
      chain.unshift(currentMenu);
      if (currentMenu.menuPadreId) {
        currentMenu = menus.find(m => m.menuId === currentMenu!.menuPadreId);
      } else {
        break;
      }
    }
    
    const currentProfileMenus = menuPerfiles
      .filter(mp => mp.perfilId === perfilId)
      .map(mp => mp.menuId);
    
    // Filtrar solo los menús que NO están asignados al perfil
    const missingMenus = chain.filter(menu => !currentProfileMenus.includes(menu.menuId));
    
    return missingMenus;
  }, [menus, menuPerfiles]);

  // Función para identificar menús padre que se quedan sin hijos tras eliminar un menú
  const getOrphanedParentsForProfile = useCallback((menuId: number, perfilId: number): MenuItem[] => {
    const menuToDelete = menus.find(m => m.menuId === menuId);
    if (!menuToDelete) return [];

    // Obtener todos los menús actualmente asignados al perfil
    const currentProfileMenus = menuPerfiles
      .filter(mp => mp.perfilId === perfilId)
      .map(mp => mp.menuId);

    // Simular el estado después de eliminar el menú
    const menusSinEliminar = currentProfileMenus.filter(id => id !== menuId);

    const orphanedParents: MenuItem[] = [];
    
    // Función recursiva para verificar padres huérfanos
    const checkOrphanedParents = (currentMenuId: number) => {
      const currentMenu = menus.find(m => m.menuId === currentMenuId);
      if (!currentMenu?.menuPadreId) return; // No tiene padre
      
      const parentMenu = menus.find(m => m.menuId === currentMenu.menuPadreId);
      if (!parentMenu) return; // Padre no encontrado
      
      // EXCEPCIÓN: Si el padre es "Home" no aplicamos la lógica de eliminación
      if (parentMenu.titulo?.toLowerCase() === 'home' || parentMenu.titulo?.toLowerCase() === 'dashboard') {
        return;
      }
      
      // Verificar si el padre tiene otros hijos en el perfil después de la eliminación
      const hermanos = menus.filter(m => 
        m.menuPadreId === parentMenu.menuId && 
        menusSinEliminar.includes(m.menuId)
      );
      
      if (hermanos.length === 0) {
        // El padre se queda sin hijos, agregar a la lista de huérfanos
        orphanedParents.push(parentMenu);
        // Verificar recursivamente si el padre del padre también se queda huérfano
        checkOrphanedParents(parentMenu.menuId);
      }
    };

    // Iniciar verificación desde el menú que se va a eliminar
    checkOrphanedParents(menuId);
    
    return orphanedParents;
  }, [menus, menuPerfiles]);

  // Handlers para drag and drop
  const handleDragStart = (e: React.DragEvent, menu: MenuTreeNode) => {
    const dragItem: DragItem = { type: 'menu', menuId: menu.menuId, menu };
    setDraggedItem(dragItem);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent, perfilId: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== 'menu') return;

    const existingMenuPerfil = menuPerfiles.find(
      mp => mp.menuId === draggedItem.menuId && mp.perfilId === perfilId
    );

    if (!existingMenuPerfil) {
      // 🎯 VALIDACIÓN JERÁRQUICA: Obtener todos los menús faltantes (padres + hijo)
      const missingMenus = getMissingParentsForProfile(draggedItem.menuId, perfilId);
      
      if (missingMenus.length === 0) {
        AlertService.info('El menú ya está asignado a este perfil');
        setDraggedItem(null);
        return;
      }

      const menuPrincipal = missingMenus[missingMenus.length - 1];
      const menusPadre = missingMenus.slice(0, -1);
      
      // Mensaje informativo sobre qué se va a agregar
      const mensajeDetallado = missingMenus.length === 1 
        ? `Asignando menú "${menuPrincipal?.titulo || 'Menú'}" al perfil...`
        : `Asignando menú "${menuPrincipal?.titulo || 'Menú'}" y ${menusPadre.length} menú(s) padre al perfil...`;
      
      const loadingToast = AlertService.loading(mensajeDetallado);
      
      try {
        // 🎯 IMPLEMENTACIÓN DIFERENCIADA: Asignar permisos según tipo de menú
        const promesasCreacion = missingMenus.map(menu => {
          // ✅ Menús padre: accesoId = -1 (sin permisos específicos)
          // ✅ Menús hijos: accesoId = 1 (lectura por defecto)
          const accesoId = isMenuParent(menu.menuId) ? -1 : 1;
          
          return menuPerfilService.createMenuPerfil({
            menuId: menu.menuId,
            perfilId: perfilId,
            accesoId: accesoId
          });
        });

        const responses = await Promise.all(promesasCreacion);
        
        // Verificar que todas las asignaciones fueron exitosas
        const errores = responses.filter(response => !response.success);
        
        if (errores.length === 0) {
          // 🔄 Recargar MenuPerfiles desde el servidor para obtener los datos actualizados
          try {
            await loadMenuPerfiles();
            
            // 🎉 Mensaje de éxito detallado
            const mensajeExito = missingMenus.length === 1
              ? `Menú "${menuPrincipal?.titulo}" asignado correctamente`
              : `Menú "${menuPrincipal?.titulo}" y ${menusPadre.length} menú(s) padre asignados correctamente`;
            
            AlertService.updateLoading(loadingToast, 'success', mensajeExito);
            
          } catch (reloadError) {
            console.error('❌ Error al recargar MenuPerfiles:', reloadError);
            AlertService.updateLoading(loadingToast, 'error', 'Menús asignados, pero error al actualizar la vista. Recarga la página.');
          }
          
        } else {
          console.error('❌ Algunos menús no se pudieron asignar:', errores);
          AlertService.updateLoading(loadingToast, 'error', `Error al asignar ${errores.length} menú(s) al perfil`);
        }
        
      } catch (error) {
        console.error('💥 Error en asignación BATCH:', error);
        
        // 🔍 Verificar si es un error de red/servidor vs error de procesamiento
        if (error instanceof Error) {
          if (error.message.includes('fetch') || error.message.includes('network')) {
            AlertService.updateLoading(loadingToast, 'error', 'Error de conexión al asignar menús');
          } else {
            AlertService.updateLoading(loadingToast, 'error', 'Error inesperado al asignar menús');
          }
        } else {
          AlertService.updateLoading(loadingToast, 'error', 'Error inesperado al asignar menús');
        }
        
        // 🔄 Como fallback, recargar MenuPerfiles para verificar el estado actual
        try {
          await loadMenuPerfiles();
          AlertService.info('Datos de perfiles actualizados desde el servidor');
        } catch (reloadError) {
          console.error('Error al recargar MenuPerfiles:', reloadError);
        }
      }
    } else {
      AlertService.info('El menú ya está asignado a este perfil');
    }

    setDraggedItem(null);
  };

  // Handlers para gestión de perfiles
  const handleCreatePerfil = async () => {
    if (!newPerfilName.trim()) {
      AlertService.warning('Por favor ingresa un nombre para el perfil');
      return;
    }

    const loadingMessage = editingPerfil ? 'Actualizando perfil...' : 'Creando nuevo perfil...';
    const loadingToast = AlertService.loading(loadingMessage);

    try {
      setIsCreating(true);

    if (editingPerfil) {
      // Modo edición - actualizar perfil existente
        const currentPerfil = perfiles.find(p => p.perfilId === editingPerfil);
        if (!currentPerfil) {
          AlertService.updateLoading(loadingToast, 'error', 'Perfil no encontrado');
          return;
        }
        
        const updateRequest = {
          perfilId: editingPerfil,
          nombrePerfil: newPerfilName.trim(),
          descripcion: newPerfilDesc.trim(),
          estado: typeof currentPerfil.estado === 'number' ? currentPerfil.estado : 1
        };
        
        const response = await perfilService.updatePerfil(editingPerfil, updateRequest);
        
        if (response.success) {
          AlertService.updateLoading(loadingToast, 'success', 'Perfil actualizado correctamente');
          await loadPerfiles(); // Recargar perfiles
      setEditingPerfil(null);
          setViewMode('viewing'); // Cambiar a modo vista después de actualizar
          setNewPerfilName('');
          setNewPerfilDesc('');
        } else {
          AlertService.updateLoading(loadingToast, 'error', response.message || 'Error al actualizar el perfil');
        }
    } else {
      // Modo creación - crear nuevo perfil
      const createRequest = {
        nombrePerfil: newPerfilName.trim(),
        descripcion: newPerfilDesc.trim()
      };
        
      const response = await perfilService.createPerfil(createRequest);
        
      if (response.success && response.data) {
        AlertService.updateLoading(loadingToast, 'success', 'Perfil creado correctamente');
        await loadPerfiles(); // Recargar perfiles
          
        // Cambiar al modo editing y seleccionar el perfil creado
        setSelectedPerfil(response.data);
        setViewMode('editing');
          
        // ✅ MANTENER los datos en los campos para el modo edición
        // NO limpiar newPerfilName y newPerfilDesc aquí
        setShowNewPerfilForm(false);
      } else {
        AlertService.updateLoading(loadingToast, 'error', response.message || 'Error al crear el perfil');
          
        // 🧹 Solo limpiar si hubo error
        setNewPerfilName('');
        setNewPerfilDesc('');
        setShowNewPerfilForm(false);
      }
    }
    } catch (error) {
      console.error('Error al gestionar perfil:', error);
      AlertService.updateLoading(loadingToast, 'error', 'Error inesperado al procesar la solicitud');
    } finally {
      setIsCreating(false);
    }
  };

  // Handler para iniciar la creación de un nuevo perfil
  const handleStartNewPerfil = () => {
    setShowNewPerfilForm(true);
    setEditingPerfil(null);
    setNewPerfilName('');
    setNewPerfilDesc('');
    setViewMode('creating');
  };

  // Handler para cancelar y volver al estado inicial
  const handleCancelAndReset = () => {
    setViewMode('list');
    setShowNewPerfilForm(false);
    setEditingPerfil(null);
    setNewPerfilName('');
    setNewPerfilDesc('');
    setSelectedPerfil(null);
    setSearchTerm(''); // Limpiar el término de búsqueda
  };

  const handleDeletePerfil = async (perfilId: number) => {
    const perfil = perfiles.find(p => p.perfilId === perfilId);
    if (!perfil) return;

    // 🔍 VALIDACIÓN: Verificar si el perfil tiene personas activas asignadas
    const loadingValidation = AlertService.loading('Verificando si el perfil tiene personas activas asignadas...');
    
    try {
      const personasResponse = await personasService.getPersonasByPerfil(perfilId);
      
      AlertService.dismiss(loadingValidation);
      
      if (personasResponse.success && personasResponse.data) {
        const personasActivas = personasResponse.data;
        
        // 🚫 Si tiene personas activas asignadas, no permitir eliminación
        if (personasActivas.length > 0) {
          const nombres = personasActivas
            .slice(0, 5) // Mostrar máximo 5 nombres
            .map(p => p.nombreCompleto || `${p.nombres} ${p.apellidoPaterno}`)
            .join(', ');
          
          const mensajeExtra = personasActivas.length > 5 
            ? ` y ${personasActivas.length - 5} más`
            : '';
          
          AlertService.error(
            `No se puede eliminar el perfil "${perfil.nombrePerfil}" porque tiene ${personasActivas.length} persona(s) activa(s) asignada(s).\n\n` +
            `Personas activas: ${nombres}${mensajeExtra}\n\n` +
            `Para eliminar este perfil, primero debes cambiar el perfil de estas personas o desactivarlas.`
          );
          return;
        }
        
        // ✅ Si no tiene personas activas, proceder con la eliminación
        
      } else {
        // 🤷‍♂️ Si no se puede verificar, preguntar al usuario
        const procederSinValidacion = await AlertService.confirm(
          `No se pudo verificar si el perfil "${perfil.nombrePerfil}" tiene personas activas asignadas.\n\n` +
          `¿Deseas proceder con la eliminación de todas formas?`
        );
        
        if (!procederSinValidacion) return;
      }
      
    } catch (error) {
      AlertService.dismiss(loadingValidation);
      console.error('Error al validar personas activas del perfil:', error);
      
      // 🤷‍♂️ En caso de error, preguntar al usuario
      const procederConError = await AlertService.confirm(
        `Error al verificar personas activas del perfil "${perfil.nombrePerfil}".\n\n` +
        `¿Deseas proceder con la eliminación de todas formas?`
      );
      
      if (!procederConError) return;
    }

    // 🗑️ Confirmación final para eliminar el perfil
    const confirmed = await AlertService.confirm(
      `¿Estás seguro de que deseas eliminar el perfil "${perfil.nombrePerfil}"?`
    );
    
    if (confirmed) {
      const loadingToast = AlertService.loading('Eliminando perfil...');
      
      try {
        setIsDeleting(true);
        const response = await perfilService.deletePerfil(perfilId);
        
        if (response.success) {
          AlertService.updateLoading(loadingToast, 'success', 'Perfil eliminado correctamente');
          await loadPerfiles(); // Recargar perfiles
    setMenuPerfiles(menuPerfiles.filter(mp => mp.perfilId !== perfilId));
    if (selectedPerfil === perfilId) setSelectedPerfil(null);
        } else {
          AlertService.updateLoading(loadingToast, 'error', response.message || 'Error al eliminar el perfil');
        }
      } catch (error) {
        console.error('Error al eliminar perfil:', error);
        AlertService.updateLoading(loadingToast, 'error', 'Error inesperado al eliminar el perfil');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDuplicatePerfil = async (perfil: PerfilWithMenus) => {
    const loadingToast = AlertService.loading(`Duplicando perfil "${perfil.nombrePerfil}"...`);
    
    try {
      // Crear el nuevo perfil
      const createRequest = {
      nombrePerfil: `${perfil.nombrePerfil} (Copia)`,
        descripcion: perfil.descripcion || ''
    };

      const response = await perfilService.createPerfil(createRequest);
      
      if (response.success && response.data) {
        const newPerfilId = response.data; // response.data es el ID del perfil creado
        
        // Duplicar las relaciones MenuPerfil
        const menuPerfilesOriginales = menuPerfiles.filter(mp => mp.perfilId === perfil.perfilId);
        
        if (menuPerfilesOriginales.length > 0) {
          // Crear las relaciones una por una
          const promesasCreacion = menuPerfilesOriginales.map(mp => 
            menuPerfilService.createMenuPerfil({
              menuId: mp.menuId,
              perfilId: newPerfilId,
              accesoId: mp.accesoId
            })
          );
          
          await Promise.all(promesasCreacion);
        }
        
        // Recargar datos
        await loadPerfiles();
        await loadMenuPerfiles();
        
        AlertService.updateLoading(loadingToast, 'success', `Perfil "${perfil.nombrePerfil}" duplicado correctamente`);
      } else {
        AlertService.updateLoading(loadingToast, 'error', response.message || 'Error al duplicar el perfil');
      }
    } catch (error) {
      console.error('Error al duplicar perfil:', error);
      AlertService.updateLoading(loadingToast, 'error', 'Error inesperado al duplicar el perfil');
    }
  };

  const handleRemoveMenuFromPerfil = async (menuId: number, perfilId: number) => {
    const menu = menus.find(m => m.menuId === menuId);
    const perfil = perfiles.find(p => p.perfilId === perfilId);
    const menuPerfil = menuPerfiles.find(mp => mp.menuId === menuId && mp.perfilId === perfilId);
    
    if (menu && perfil && menuPerfil) {
      // 🔍 ANÁLISIS JERÁRQUICO INVERSO: Identificar padres que se quedarán huérfanos
      const orphanedParents = getOrphanedParentsForProfile(menuId, perfilId);
      
      // Construir mensaje de confirmación detallado
      let confirmMessage = `¿Estás seguro de que deseas eliminar el menú "${menu.titulo}" del perfil "${perfil.nombrePerfil}"?`;
      
      if (orphanedParents.length > 0) {
        const padresTexto = orphanedParents.map(p => `"${p.titulo}"`).join(', ');
        confirmMessage += `\n\n⚠️ ATENCIÓN: También se eliminarán los siguientes menús padre que se quedarán sin hijos:\n${padresTexto}`;
      }
      
      const confirmed = await AlertService.confirm(confirmMessage);
      
      if (confirmed) {
        // Todos los menús a eliminar (hijo + padres huérfanos)
        const menusToDelete = [menu, ...orphanedParents];
        
        const mensajeDetallado = menusToDelete.length === 1 
          ? `Eliminando menú "${menu.titulo}" del perfil...`
          : `Eliminando menú "${menu.titulo}" y ${orphanedParents.length} menú(s) padre del perfil...`;
        
        const loadingToast = AlertService.loading(mensajeDetallado);
        
        try {
          const menuPerfilesToDelete: number[] = [];
          
          // 🔍 Recopilar todos los menuPerfilId que necesitan ser eliminados
          for (const menuToDelete of menusToDelete) {
            const menuPerfilToDelete = menuPerfiles.find(mp => 
              mp.menuId === menuToDelete.menuId && mp.perfilId === perfilId
            );
            if (menuPerfilToDelete) {
              menuPerfilesToDelete.push(menuPerfilToDelete.menuPerfilId);
            }
          }
          
          // 🗑️ Eliminar todas las relaciones MenuPerfil en orden (hijo → padres)
          for (const menuPerfilId of menuPerfilesToDelete) {
            const menuPerfilToDelete = menuPerfiles.find(mp => mp.menuPerfilId === menuPerfilId);
            const menuTitle = menus.find(m => m.menuId === menuPerfilToDelete?.menuId)?.titulo;
            
            const response = await menuPerfilService.deleteMenuPerfil(menuPerfilId);
            
            if (!response.success) {
              console.error(`❌ Error al eliminar relación ${menuTitle}:`, response.message);
              throw new Error(`Error al eliminar menú: ${menuTitle}`);
            }
          }
          
          // 🔄 Actualizar estado local eliminando todas las relaciones
          setMenuPerfiles(prev => prev.filter(mp => !menuPerfilesToDelete.includes(mp.menuPerfilId)));
          
          // 🎉 Mensaje de éxito detallado
          const mensajeExito = menusToDelete.length === 1
            ? `Menú "${menu.titulo}" eliminado correctamente`
            : `Menú "${menu.titulo}" y ${orphanedParents.length} menú(s) padre eliminados correctamente`;
          
          AlertService.updateLoading(loadingToast, 'success', mensajeExito);
          
        } catch (error) {
          console.error('💥 Error en eliminación jerárquica:', error);
          AlertService.updateLoading(loadingToast, 'error', 'Error al eliminar menús del perfil. Algunos menús pueden haberse eliminado parcialmente.');
        }
      }
    }
  };

  const handleToggleAccess = async (menuId: number, perfilId: number) => {
    const menuPerfil = menuPerfiles.find(mp => mp.menuId === menuId && mp.perfilId === perfilId);
    
    if (menuPerfil) {
      // Ciclar entre los tipos de acceso: 1 -> 2 -> 3 -> 1
      let newAccesoId: number;
      switch (menuPerfil.accesoId) {
        case 1: // Lectura -> Restringido
          newAccesoId = 2;
          break;
        case 2: // Restringido -> Control Total
          newAccesoId = 3;
          break;
        case 3: // Control Total -> Lectura
          newAccesoId = 1;
          break;
        default:
          newAccesoId = 1; // Por defecto, Lectura
      }
      
      const tipoAccesoAnterior = menuPerfilService.getNombreAcceso(menuPerfil.accesoId);
      const tipoAccesoNuevo = menuPerfilService.getNombreAcceso(newAccesoId);
      
      try {
        const response = await menuPerfilService.updateMenuPerfil(menuPerfil.menuPerfilId, {
          menuPerfilId: menuPerfil.menuPerfilId,
          menuId: menuPerfil.menuId,
          perfilId: menuPerfil.perfilId,
          accesoId: newAccesoId
        });
        
        if (response.success) {
          // Actualizar el estado local
    setMenuPerfiles(menuPerfiles.map(mp => {
      if (mp.menuId === menuId && mp.perfilId === perfilId) {
              return { ...mp, accesoId: newAccesoId };
      }
      return mp;
    }));
          
          AlertService.success(`Acceso cambiado de "${tipoAccesoAnterior}" a "${tipoAccesoNuevo}"`);
        } else {
          AlertService.error(response.message || 'Error al cambiar tipo de acceso');
        }
      } catch (error) {
        console.error('Error al actualizar MenuPerfil:', error);
        AlertService.error('Error inesperado al cambiar tipo de acceso');
      }
    }
  };

  const handleAccessChange = async (menuId: number, perfilId: number, newAccesoId: string) => {
    const menuPerfil = menuPerfiles.find(mp => mp.menuId === menuId && mp.perfilId === perfilId);
    
    if (menuPerfil) {
      // 🚫 Prevenir cambios de permisos en menús padre
      if (menuPerfil.accesoId === -1) {
        AlertService.warning('Los menús padre no pueden tener permisos específicos');
        return;
      }
      const newAccesoIdNumber = parseInt(newAccesoId);
      const tipoAccesoAnterior = menuPerfilService.getNombreAcceso(menuPerfil.accesoId);
      const tipoAccesoNuevo = menuPerfilService.getNombreAcceso(newAccesoIdNumber);
      
      try {
        const response = await menuPerfilService.updateMenuPerfil(menuPerfil.menuPerfilId, {
          menuPerfilId: menuPerfil.menuPerfilId,
          menuId: menuPerfil.menuId,
          perfilId: menuPerfil.perfilId,
          accesoId: newAccesoIdNumber
        });
        
        if (response.success) {
          // Actualizar el estado local
          setMenuPerfiles(menuPerfiles.map(mp => {
            if (mp.menuId === menuId && mp.perfilId === perfilId) {
              return { ...mp, accesoId: newAccesoIdNumber };
      }
      return mp;
    }));
          
          AlertService.success(`Acceso cambiado de "${tipoAccesoAnterior}" a "${tipoAccesoNuevo}"`);
        } else {
          AlertService.error(response.message || 'Error al cambiar tipo de acceso');
        }
      } catch (error) {
        console.error('Error al actualizar MenuPerfil:', error);
        AlertService.error('Error inesperado al cambiar tipo de acceso');
      }
    }
  };

  // Handlers para batch operations
  const handleBatchAssign = () => {
    const newAssignments: MenuPerfil[] = [];
    
    selectedPerfiles.forEach(perfilId => {
      selectedMenus.forEach(menuId => {
        const exists = menuPerfiles.some(mp => 
          mp.menuId === menuId && mp.perfilId === perfilId
        );
        
        if (!exists) {
          newAssignments.push({
            menuPerfilId: Math.max(...menuPerfiles.map(mp => mp.menuPerfilId)) + newAssignments.length + 1,
            menuId,
            perfilId,
            accesoId: 1
          });
        }
      });
    });

    setMenuPerfiles([...menuPerfiles, ...newAssignments]);
    setSelectedMenus(new Set());
    setSelectedPerfiles(new Set());
    setBatchMode(false);
  };

  const getAccessColor = (accessId: number) => {
    return menuPerfilService.getColorAcceso(accessId);
  };

  const getAccessText = (accessId: number) => {
    return menuPerfilService.getNombreAcceso(accessId);
  };

  return (
    <div className={styles.rolesContainer} style={{ backgroundColor: colors.background }}>
      {/* Header con controles principales */}
      <div className={styles.rolesHeader} style={{ backgroundColor: colors.surface }}>
        <div className={styles.headerLeft}>
          <h1 style={{ color: colors.text }}>
            Gestión de Roles y Permisos
            {(isLoadingMenus || isLoadingPerfiles) && (
              <RefreshCw size={20} style={{ marginLeft: '0.5rem' }} className="animate-spin" />
            )}
          </h1>
          <div className={styles.searchContainer}>
            <Input
              type="text"
              placeholder="Buscar perfiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="Search"
              className={styles.searchInput}
              disabled={isLoadingPerfiles}
            />
            {/* Botón para volver al menú principal */}
            {(viewMode === 'viewing' || viewMode === 'editing' || viewMode === 'creating') && (
              <Button
                variant="outline"
                size="m"
                iconName="ArrowLeft"
                onClick={handleCancelAndReset}
                className={styles.backButton}
                title="Volver al menú principal"
              >
                Volver
              </Button>
            )}
          </div>
        </div>
        
                <div className={styles.headerRight}>
          {/* Indicador de guardado oculto temporalmente */}
          {false && (
            <div className={styles.statusIndicator} style={{ color: colors.textSecondary }}>
              {isSaving ? (
                <span>Guardando... <i className="fas fa-spinner fa-spin"></i></span>
              ) : (
                <span>Guardado: {lastSaved.toLocaleTimeString()}</span>
              )}
            </div>
          )}
          
          {/* Botón Modo Lotes oculto temporalmente */}
          {false && (
            <Button
              variant={batchMode ? "default" : "outline"}
              size="m"
              iconName="Layers"
              onClick={() => setBatchMode(!batchMode)}
              className={styles.batchButton}
            >
              Modo Lotes
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className={styles.breadcrumbs} style={{ color: colors.textSecondary }}>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.menuId}>
              {index > 0 && <i className="fas fa-chevron-right"></i>}
              <span>{crumb.titulo}</span>
            </span>
          ))}
        </div>
      )}

      {/* Contenedor principal de tres paneles */}
      <div className={styles.mainContent}>
        
        {/* Panel izquierdo - Tree view de menús - Solo visible en modo editing */}
        {viewMode === 'editing' && (
        <div className={styles.leftPanel} style={{ backgroundColor: colors.surface }}>
          <div className={styles.panelHeader}>
            <h3 style={{ color: colors.text }}>
              <i className="fas fa-sitemap"></i>
              Menús Disponibles
            </h3>
          </div>
          
          <div className={styles.menuTree} style={{ paddingTop: '0px' }}>
            {buildMenuTree().map((menuNode, index) => {
              const indentLevel = menuNode.level * 24; // 24px por nivel para mejor proporción
              const isRootLevel = menuNode.level === 0;
              const isChildLevel = menuNode.level > 0;
              const isFirstItem = index === 0;
              
              return (
                <div
                  key={menuNode.menuId}
                  className={`${styles.menuItem}`}
                  style={{
                    paddingLeft: `${indentLevel + 12}px`,
                    paddingRight: '12px',
                    paddingTop: isFirstItem ? '12px' : (isRootLevel ? '8px' : '6px'),
                    paddingBottom: isRootLevel ? '8px' : '6px',
                    borderLeft: isChildLevel ? `2px solid ${colors.border}` : 'none',
                    marginLeft: isChildLevel ? '8px' : '0px',
                    marginTop: '0px',
                    marginBottom: isRootLevel ? '4px' : '2px',
                    backgroundColor: isRootLevel ? colors.background : 'transparent'
                  }}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, menuNode)}
                  onClick={() => {
                    generateBreadcrumbs(menuNode.menuId);
                  }}
                >
                  <div className={styles.menuItemContent} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    width: '100%'
                  }}>
                    {/* Botón de expansión */}
                  {menuNode.hasChildren && (
                    <button
                      className={styles.expandButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newExpanded = new Set(expandedMenus);
                        if (newExpanded.has(menuNode.menuId)) {
                          newExpanded.delete(menuNode.menuId);
                        } else {
                          newExpanded.add(menuNode.menuId);
                        }
                        setExpandedMenus(newExpanded);
                      }}
                        style={{ 
                          width: '16px',
                          height: '16px',
                          minWidth: '16px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: colors.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                    >
                        <i 
                          className={`fas fa-chevron-${menuNode.isExpanded ? 'down' : 'right'}`}
                          style={{ fontSize: '12px' }}
                        ></i>
                    </button>
                  )}
                  
                    {/* Espaciador para menús sin hijos */}
                    {!menuNode.hasChildren && (
                      <div style={{ width: '16px', minWidth: '16px' }}></div>
                    )}
                    
                    {/* Número jerárquico */}
                    <span 
                      className={styles.menuNumber} 
                      style={{
                        color: colors.primary, 
                        fontWeight: 'bold', 
                        minWidth: isRootLevel ? '24px' : '32px',
                        fontSize: isRootLevel ? '14px' : '13px',
                        textAlign: 'left'
                      }}
                    >
                      {menuNumbers[menuNode.menuId]}
                    </span>
                    
                    {/* Icono del menú */}
                    <i 
                      className={`${menuNode.tipoIcono} ${menuNode.icono}`} 
                      style={{ 
                        color: colors.textSecondary,
                        fontSize: isRootLevel ? '14px' : '13px',
                        minWidth: '16px'
                      }}
                    ></i>
                    
                    {/* Título del menú */}
                    <span 
                      style={{ 
                        color: colors.text, 
                        fontSize: isRootLevel ? '14px' : '13px',
                        fontWeight: isRootLevel ? '500' : '400',
                        flex: 1
                      }}
                    >
                      {menuNode.titulo}
                    </span>
                    
                    {/* Badge del menú */}
                    {menuNode.badge && (
                      <span 
                        className={`${styles.badge} ${menuNode.badgeClase}`}
                        style={{ fontSize: '11px' }}
                      >
                        {menuNode.badge}
                          </span>
                        )}
                      </div>
                    </div>
              );
            })}
              </div>
          </div>
        )}

        {/* Panel central - Builder de perfiles - Visible en modos creating, viewing y editing */}
        {(viewMode === 'creating' || viewMode === 'viewing' || viewMode === 'editing') && (
        <div className={styles.centerPanel} style={{ backgroundColor: colors.surface }}>
          <div className={styles.panelHeader}>
            <h3 style={{ color: colors.text }}>
              <i className={viewMode === 'viewing' ? 'fas fa-eye' : 'fas fa-edit'}></i>
              {viewMode === 'viewing' ? 'Vista de Perfil' : 
               viewMode === 'editing' ? 'Editor de Perfil' : 
               'Constructor de Perfiles'}
            </h3>
          </div>

          {showNewPerfilForm && (
            <div className={styles.newPerfilForm} style={{ backgroundColor: colors.background }}>
              <input
                type="text"
                placeholder="Nombre del perfil"
                value={newPerfilName}
                onChange={(e) => setNewPerfilName(e.target.value)}
                className={styles.formInput}
                style={{ backgroundColor: colors.surface, color: colors.text }}
              />
              <textarea
                placeholder="Descripción"
                value={newPerfilDesc}
                onChange={(e) => setNewPerfilDesc(e.target.value)}
                className={styles.formTextarea}
                style={{ backgroundColor: colors.surface, color: colors.text }}
              />
              <div className={styles.formActions}>
                <Button
                  variant="custom"
                  size="m"
                  onClick={handleCreatePerfil}
                  backgroundColor="#06d6a0"
                  textColor="#ffffff"
                  className={styles.saveButton}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <RefreshCw size={16} style={{ marginRight: '0.5rem' }} className="animate-spin" />
                  ) : (
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  )}
                  {isCreating ? 'Procesando...' : 'Crear'}
                </Button>
                <Button
                  variant="custom"
                  size="m"
                  onClick={handleCancelAndReset}
                  backgroundColor="#e5e7eb"
                  textColor="#374151"
                  className={styles.cancelButton}
                >
                  <X size={16} style={{ marginRight: '0.5rem' }} />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className={styles.dropZone}>
            {selectedPerfil ? (
              <div className={styles.perfilBuilder}>
                {(() => {
                  const perfil = perfilesWithMenus.find(p => p.perfilId === selectedPerfil);
                  if (!perfil) return null;

                  return (
                    <div>
                      <div className={styles.perfilHeader}>
                        {viewMode === 'editing' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text, marginBottom: '0.5rem' }}>
                                Nombre del Perfil
                              </label>
                              <Input
                                type="text"
                                value={newPerfilName}
                                onChange={(e) => setNewPerfilName(e.target.value)}
                                placeholder="Ingresa el nombre del perfil"
                                style={{ width: '100%' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.text, marginBottom: '0.5rem' }}>
                                Descripción
                              </label>
                              <textarea
                                value={newPerfilDesc}
                                onChange={(e) => setNewPerfilDesc(e.target.value)}
                                placeholder="Ingresa una descripción para el perfil"
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: '8px',
                                  backgroundColor: colors.surface,
                                  color: colors.text,
                                  resize: 'vertical',
                                  fontSize: '0.875rem'
                                }}
                              />
                            </div>
                            <span className={styles.menuCounter} style={{ color: colors.textSecondary }}>
                              {perfil.menuCount} menús asignados
                            </span>
                            
                            {/* Botones de acción para el modo edición */}
                            <div className={styles.formActions} style={{ 
                              marginTop: '1.5rem', 
                              paddingTop: '1.5rem', 
                              borderTop: `1px solid ${colors.border}` 
                            }}>
                              <Button
                                variant="custom"
                                size="m"
                                onClick={handleCreatePerfil}
                                backgroundColor="#06d6a0"
                                textColor="#ffffff"
                                className={styles.saveButton}
                                disabled={isCreating}
                              >
                                {isCreating ? (
                                  <RefreshCw size={16} style={{ marginRight: '0.5rem' }} className="animate-spin" />
                                ) : (
                                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                                )}
                                {isCreating ? 'Actualizando...' : 'Actualizar'}
                              </Button>
                              <Button
                                variant="custom"
                                size="m"
                                onClick={handleCancelAndReset}
                                backgroundColor="#e5e7eb"
                                textColor="#374151"
                                className={styles.cancelButton}
                              >
                                <X size={16} style={{ marginRight: '0.5rem' }} />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                        <h4 style={{ color: colors.text }}>{perfil.nombrePerfil}</h4>
                        <span className={styles.menuCounter} style={{ color: colors.textSecondary }}>
                          {perfil.menuCount} menús asignados
                        </span>
                          </>
                        )}
                      </div>

                      <div
                        className={styles.perfilMenus}
                        onDragOver={viewMode === 'editing' ? handleDragOver : undefined}
                        onDrop={viewMode === 'editing' ? (e) => handleDrop(e, selectedPerfil) : undefined}
                      >
                        {perfil.menuIds.length === 0 ? (
                          <div className={styles.emptyState} style={{ color: colors.textSecondary }}>
                              <i className="fas fa-list"></i>
                              <p>
                                {viewMode === 'editing' 
                                  ? 'Arrastra menús desde el panel izquierdo para asignarlos a este perfil'
                                  : 'Este perfil no tiene menús asignados'
                                }
                              </p>
                          </div>
                        ) : (
                          perfil.menuIds.map(menuId => {
                            const menu = menus.find(m => m.menuId === menuId);
                            if (!menu) return null;

                            const accessType = perfil.accessTypes[menuId];
                            // 🔍 DEBUG: Verificar accessType en el render
                            return (
                              <div
                                key={menuId}
                                className={styles.assignedMenu}
                                style={{ borderColor: getAccessColor(accessType) }}
                              >
                                <div className={styles.menuInfo}>
                                  <i className={`${menu.tipoIcono} ${menu.icono}`}></i>
                                  <span style={{ color: colors.text }}>{menu.titulo}</span>
                                </div>
                                
                                <div className={styles.menuActions}>
                                  {/* 🎯 LÓGICA DIFERENCIADA: Menús padre vs hijos */}
                                  {accessType === -1 ? (
                                    // ✅ Menú padre: Solo mostrar etiqueta sin controles
                                    <div
                                      className={styles.accessButton}
                                      style={{ 
                                        backgroundColor: '#6b7280',
                                        color: '#fff',
                                        cursor: 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '120px',
                                        height: '32px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        borderRadius: '16px',
                                        padding: '0 12px'
                                      }}
                                      title="Menú padre: No requiere permisos específicos"
                                    >
                                      Menú Padre
                                    </div>
                                  ) : (
                                    // ✅ Menú hijo: Mostrar controles de permisos
                                    viewMode === 'editing' ? (
                                      <select
                                        value={accessType.toString()}
                                        onChange={(e) => handleAccessChange(menuId, selectedPerfil, e.target.value)}
                                        style={{ 
                                          backgroundColor: getAccessColor(accessType),
                                          color: '#fff',
                                          border: 'none',
                                          minWidth: '120px',
                                          height: '32px',
                                          fontSize: '12px',
                                          fontWeight: '500',
                                          borderRadius: '16px',
                                          padding: '0 12px',
                                          cursor: 'pointer',
                                          appearance: 'none',
                                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'right 8px center',
                                          backgroundSize: '16px',
                                          paddingRight: '32px'
                                        }}
                                      >
                                        <option value="1" style={{ backgroundColor: '#fff', color: '#000' }}>
                                          Lectura
                                        </option>
                                        <option value="2" style={{ backgroundColor: '#fff', color: '#000' }}>
                                          Restringido
                                        </option>
                                        <option value="3" style={{ backgroundColor: '#fff', color: '#000' }}>
                                          Control Total
                                        </option>
                                      </select>
                                    ) : (
                                      <div
                                        className={styles.accessButton}
                                        style={{ 
                                          backgroundColor: getAccessColor(accessType),
                                          color: '#fff',
                                          cursor: 'default',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          minWidth: '120px',
                                          height: '32px',
                                          fontSize: '12px',
                                          fontWeight: '500',
                                          borderRadius: '16px',
                                          padding: '0 12px'
                                        }}
                                        title={`Acceso: ${getAccessText(accessType)}`}
                                      >
                                        {getAccessText(accessType)}
                                      </div>
                                    )
                                  )}
                                  {viewMode === 'editing' && (
                                  <button
                                    className={styles.removeButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveMenuFromPerfil(menuId, selectedPerfil);
                                    }}
                                    style={{ color: '#ef4444' }}
                                    title="Eliminar menú del perfil"
                                  >
                                    <MinusCircle size={18} />
                                  </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer del Constructor de Perfiles */}
                      <div className={styles.constructorFooter}>
                        {viewMode === 'viewing' && (
                        <Button
                          variant="custom"
                          size="m"
                            onClick={handleCancelAndReset}
                            backgroundColor="#e5e7eb"
                            textColor="#374151"
                            className={styles.cancelButton}
                        >
                            <X size={16} style={{ marginRight: '0.5rem' }} />
                            Volver
                        </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className={styles.selectPerfilMessage} style={{ color: colors.textSecondary }}>
                <i className="fas fa-hand-pointer"></i>
                <p>
                  {viewMode === 'creating' 
                    ? 'Completa el formulario para crear un nuevo perfil'
                    : 'Selecciona un perfil del panel derecho para verlo o editarlo'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Acciones por lotes ocultas temporalmente */}
          {false && batchMode && (
            <div className={styles.batchActions} style={{ backgroundColor: colors.background }}>
              <div className={styles.batchInfo}>
                <span style={{ color: colors.text }}>
                  {selectedMenus.size} menús y {selectedPerfiles.size} perfiles seleccionados
                </span>
              </div>
              <Button
                variant="default"
                size="m"
                onClick={handleBatchAssign}
                disabled={selectedMenus.size === 0 || selectedPerfiles.size === 0}
                className={styles.batchAssignButton}
              >
                Asignar en Lote
              </Button>
            </div>
          )}
        </div>
        )}

        {/* Panel derecho - Lista de perfiles - Siempre visible */}
        <div className={styles.rightPanel} style={{ backgroundColor: colors.surface }}>
          <div className={styles.panelHeader}>
            <h3 style={{ color: colors.text }}>
              <i className="fas fa-users"></i>
              Perfiles ({filteredPerfiles.length})
            </h3>
            {viewMode === 'list' && (
              <Button
                variant="default"
                size="m"
                iconName="Plus"
                onClick={handleStartNewPerfil}
                className={styles.newPerfilButton}
              >
                Nuevo Perfil
              </Button>
            )}
          </div>

          <div className={styles.perfilesList}>
            {filteredPerfiles.map(perfil => (
              <div
                key={perfil.perfilId}
                className={`${styles.perfilCard} ${selectedPerfil === perfil.perfilId ? styles.selected : ''}`}
                style={{
                  backgroundColor: selectedPerfil === perfil.perfilId ? `${colors.primary}15` : colors.background,
                  borderColor: selectedPerfil === perfil.perfilId ? colors.primary : colors.border
                }}
                onClick={() => {
                  // 🎯 SIEMPRE ir a modo vista cuando se hace click en el card
                  setSelectedPerfil(perfil.perfilId);
                  setViewMode('viewing'); // Modo vista (solo lectura)
                  
                  // 🧹 Limpiar estados de edición
                  setEditingPerfil(null);
                  setNewPerfilName('');
                  setNewPerfilDesc('');
                  setShowNewPerfilForm(false);
                }}
              >
                <div className={styles.perfilInfo}>
                  <h4 style={{ color: colors.text }}>{perfil.nombrePerfil}</h4>
                  <p style={{ color: colors.textSecondary }}>{perfil.descripcion || 'Sin descripción'}</p>
                  <div className={styles.perfilStats}>
                    <span 
                      className={styles.menuBadge}
                      style={{ backgroundColor: colors.primary }}
                    >
                      {perfil.menuCount} menús
                    </span>
                  </div>
                </div>

                                <div className={styles.perfilActions}>
                     <button
                       className={styles.actionButton}
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedPerfil(perfil.perfilId);
                         setEditingPerfil(perfil.perfilId);
                         setNewPerfilName(perfil.nombrePerfil);
                         setNewPerfilDesc(perfil.descripcion || '');
                         setViewMode('editing'); // Modo edición completa
                       }}
                       title="Editar"
                       style={{ 
                         color: '#2563eb',
                         background: 'rgba(37, 99, 235, 0.1)',
                         borderColor: 'rgba(37, 99, 235, 0.2)'
                       }}
                     >
                       <Edit size={16} />
                     </button>
                     <button
                       className={styles.actionButton}
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDuplicatePerfil(perfil);
                       }}
                       title="Duplicar"
                       style={{ 
                         color: '#059669',
                         background: 'rgba(5, 150, 105, 0.1)',
                         borderColor: 'rgba(5, 150, 105, 0.2)'
                       }}
                     >
                       <Copy size={16} />
                     </button>
                     <button
                       className={styles.actionButton}
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeletePerfil(perfil.perfilId);
                       }}
                       title="Eliminar"
                       style={{ 
                         color: '#dc2626',
                         background: 'rgba(220, 38, 38, 0.1)',
                         borderColor: 'rgba(220, 38, 38, 0.3)'
                       }}
                     >
                                              <Trash2 size={16} />
                     </button>
                   </div>
               </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}; 