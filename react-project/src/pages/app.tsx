import React, { useState, useEffect, useMemo } from 'react';
import { HomeWrapper } from '../components/pages/Home/HomeWrapper';
import { Home } from '../components/pages/Home/Home';
import { Roles } from '../components/pages/Roles';
import { Organizaciones } from '../components/pages/Organizaciones';
import { GestionOrganizacional } from '../components/pages/GestionOrganizacional';
import { MiOrganizacion } from '../components/pages/MiOrganizacion';
import { Sistemas } from '../components/pages/Sistemas';
import { Procesos } from '../components/pages/Procesos';
import DominiosData from "../components/pages/ActivosData/DominiosData";
import { Gobernanza } from '../components/pages/Gobernanza';
import { Ubigeo } from '../components/pages/Ubigeo';
import { Usuarios } from '../components/pages/Usuarios';
import { UnidadesPosiciones } from '../components/pages/UnidadesPosiciones';
import { Servidores } from '../components/pages/Servidores';
import { Workflow } from '../components/pages/Workflow';
import { Layout } from '../components/templates/Layout';
import { SecurityManager } from '../components/common/SecurityManager';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { homeDataMock, homeAdminDataMock } from '../mocks/Home';
import { HomeData, HomeAdminData } from '../models/Home';
import { initializeCustomMenus } from '../utils/menuUtils';
import { Documentos } from '../components/pages/Documentos';
import CarpetasManager from '../components/pages/Documentos/CarpetasManager';

interface AppProps {
  selectedOption?: string;
}

export const AppComponent: React.FC<AppProps> = ({ selectedOption: initialOption }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Recuperar la página actual desde localStorage o usar valor inicial
  const getInitialSelectedOption = () => {
    if (initialOption) return initialOption;
    
    try {
      // Para F5 o refresh normal, usar la página guardada
      const savedPage = localStorage.getItem('currentPage');
      return savedPage || 'home';
    } catch (error) {
      console.warn('Error al recuperar página guardada:', error);
      return 'home';
    }
  };
  
  const [selectedOption, setSelectedOption] = useState(getInitialSelectedOption);
  
  // Verificar si viene desde login y ajustar la página inicial
  useEffect(() => {
    const fromLogin = localStorage.getItem('fromLogin');
    if (fromLogin === 'true') {
      localStorage.removeItem('fromLogin');
      setSelectedOption('home');
      // También actualizar el localStorage para mantener consistencia
      localStorage.setItem('currentPage', 'home');
    }
    
    // Inicializar menús personalizados
    initializeCustomMenus();
  }, []);

  // Obtener datos del usuario autenticado y crear datos personalizados
  const personalizedHomeData = useMemo((): HomeData => {
    const userDisplayInfo = authService.getCurrentUserDisplayInfo();
    
    return {
      ...homeDataMock,
      user: {
        name: userDisplayInfo?.name || userDisplayInfo?.fullName || 'Usuario',
        avatar: userDisplayInfo?.photoUrl || null
      }
    };
  }, []);

  const personalizedHomeAdminData = useMemo((): HomeAdminData => {
    const userDisplayInfo = authService.getCurrentUserDisplayInfo();
    
    return {
      ...homeAdminDataMock,
      user: {
        ...homeAdminDataMock.user,
        name: userDisplayInfo?.name || userDisplayInfo?.fullName || 'Administrador',
        avatar: userDisplayInfo?.photoUrl || null
      }
    };
  }, []);

  // Obtener información del usuario para el Layout
  const layoutUser = useMemo(() => {
    const userDisplayInfo = authService.getCurrentUserDisplayInfo();
    
    return {
      name: userDisplayInfo?.name || userDisplayInfo?.fullName || 'Usuario',
      avatar: userDisplayInfo?.photoUrl || null
    };
  }, []);

  // Obtener el perfil del usuario actual
  const userProfile = useMemo(() => {
    const currentUser = authService.getCurrentUser();
    return currentUser?.perfilId || 2; // Default a perfil 2 si no se puede obtener
  }, []);

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    const checkAuth = () => {
      try {
        const isValid = authService.isAuthenticated();
        if (!isValid) {
          navigate('/login');
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error validating auth:', error);
        setError('Error de autenticación');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error en logout:', error);
      navigate('/login');
    }
  };

  // Función para cambiar de página y guardar en localStorage
  const handlePageChange = (newPage: string) => {
    console.log('🔄 handlePageChange - Cambiando a página:', newPage);
    console.log('🔄 selectedOption actual:', selectedOption);
    
    try {
      localStorage.setItem('currentPage', newPage);
      console.log('✅ Guardado en localStorage:', newPage);
      setSelectedOption(newPage);
      console.log('✅ setSelectedOption llamado con:', newPage);
    } catch (error) {
      console.warn('❌ Error al guardar página actual:', error);
      setSelectedOption(newPage);
      console.log('✅ setSelectedOption llamado (fallback) con:', newPage);
    }
  };

  const handleSidebarItemClick = (item: any) => {
    console.log('🔍 handleSidebarItemClick - Item recibido:', item);
    console.log('🔍 Item.ruta:', item.ruta);
    console.log('🔍 Item.titulo:', item.titulo);
    
    // Mapear las rutas del sidebar a las opciones de páginas
    const routeMapping: { [key: string]: string } = {
      '/': 'home',
      '/home': 'home',
      '/dashboard': 'home',
      '/inicio': 'home',
      '/roles': 'roles',
      '/organizaciones': 'organizaciones',
      '/gestion-organizacional': 'gestion-organizacional',
      '/mi-organizacion': 'mi-organizacion',
      '/sistemas': 'sistemas',
      '/gobernanza': 'gobernanza',
      '/servidores': 'servidores',
      '/ubigeo': 'ubigeo',
      '/usuarios': 'usuarios',
      '/dominios-data': 'dominios-data',
      '/activos-data': 'dominios-data',
      '/unidades-posiciones': 'unidades-posiciones',
      '/workflow': 'workflow',
      '/procesos': 'procesos',
      // ✅ Rutas específicas del módulo Procesos
      '/procesos/lista': 'procesos',
      '/procesos/crear': 'procesos',
      '/procesos/mapa': 'procesos',
      '/documentos': 'documentos',
      '/documentos/repositorio': 'documentos',
      '/documentos/plantillas': 'documentos',
      '/documentos/versiones': 'documentos',
      '/documentos-carpetas': 'documentos-carpetas'
    };

    // Mapear también por títulos como alternativa (incluyendo títulos específicos de configuración)
    const titleMapping: { [key: string]: string } = {
      'inicio': 'home',
      'dashboard': 'home',
      'roles': 'roles',
      'roles y permisos': 'roles', // Mapeo específico para el menú de configuración
      'organizaciones': 'organizaciones',
      'organigrama': 'gestion-organizacional', // Mapeo para organigrama
      'mi organización': 'mi-organizacion',
      'sistemas': 'sistemas',
      'gobernanza': 'gobernanza',
      'servidores': 'servidores',
      'ubigeo': 'ubigeo',
      'usuarios': 'usuarios',
      'dominios de data': 'dominios-data',
      'dominios data': 'dominios-data',
      'activos de data': 'dominios-data',
      'activos data': 'dominios-data',
      'clientes': 'organizaciones', // Mapeo para clientes del menú de configuración
      'unidades y posiciones': 'unidades-posiciones',
      'workflow': 'workflow',
      'procesos': 'procesos',
      // ✅ Títulos comunes del módulo Procesos
      'gestión de procesos': 'procesos',
      'gestion de procesos': 'procesos',
      'lista de procesos': 'procesos',
      'documentos': 'documentos',
      'documentos / manuales': 'documentos',
      'carpetas documentos': 'documentos-carpetas',
      'carpetas de documentos': 'documentos-carpetas'
    };

    // Primero intentar mapear por ruta
    let targetPage = null;
    if (item.ruta && routeMapping[item.ruta]) {
      targetPage = routeMapping[item.ruta];
      console.log('✅ Mapeo por ruta exitoso:', item.ruta, '->', targetPage);
    } else {
      console.log('❌ No se encontró mapeo por ruta para:', item.ruta);
    }
    
    // Si no funciona por ruta, intentar por título
    if (!targetPage && item.titulo) {
      const cleanTitle = item.titulo.toLowerCase().trim();
      console.log('🔍 Intentando mapeo por título:', cleanTitle);
      targetPage = titleMapping[cleanTitle];
      if (targetPage) {
        console.log('✅ Mapeo por título exitoso:', cleanTitle, '->', targetPage);
      } else {
        console.log('❌ No se encontró mapeo por título para:', cleanTitle);
      }
    }
    
    // Si encontramos una página válida, navegar
    if (targetPage) {
      console.log('🚀 Navegando a página:', targetPage);
      handlePageChange(targetPage);
    } else {
      console.log('❌ No se pudo determinar página de destino para el item:', item);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  const renderSelectedComponent = () => {
    console.log('🎯 renderSelectedComponent - selectedOption:', selectedOption);
    
    // Verificar si hay organización configurada para mostrar mensaje apropiado  
    const userDisplayInfo = authService.getCurrentUserDisplayInfo();
    const currentOrganization = authService.getCurrentOrganization();
    const hasOrganization = layoutUser && currentOrganization?.organizacionId;
    
    console.log('🏢 hasOrganization:', hasOrganization);
    console.log('🏢 currentOrganization:', currentOrganization);
    
    if (!hasOrganization) {
      const noOrgMessage = (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#666' }}>
            No hay organización configurada
          </h2>
          <p style={{ color: '#888', maxWidth: '400px' }}>
            Para acceder a las funcionalidades del sistema, necesita tener una organización asignada. 
            Contacte al administrador del sistema.
          </p>
        </div>
      );

      // Para Home, Roles, Usuarios, Organizaciones y Gestión Organizacional, permitir acceso sin organización
      switch (selectedOption) {
        case 'home':
          return (
            <Layout 
              showHeader={false} 
              user={layoutUser} 
              onSidebarItemClick={handleSidebarItemClick}
              onLogout={handleLogout}
              currentPage={selectedOption}
            >
              <HomeWrapper 
                userProfile={userProfile}
                homeData={personalizedHomeData}
                homeAdminData={personalizedHomeAdminData}
                onMenuToggle={() => {}}
                onNavigate={handleSidebarItemClick}
              />
            </Layout>
          );

        case 'roles':
          return (
            <Layout 
              showHeader={true} 
              user={layoutUser} 
              onSidebarItemClick={handleSidebarItemClick}
              onLogout={handleLogout}
              currentPage={selectedOption}
            >
              <Roles data={{}} />
            </Layout>
          );

        case 'usuarios':
          return (
            <Layout 
              showHeader={true} 
              user={layoutUser} 
              onSidebarItemClick={handleSidebarItemClick}
              onLogout={handleLogout}
              currentPage={selectedOption}
            >
              <Usuarios />
            </Layout>
          );

        case 'organizaciones':
          return (
            <Layout 
              showHeader={true} 
              user={layoutUser} 
              onSidebarItemClick={handleSidebarItemClick}
              onLogout={handleLogout}
              currentPage={selectedOption}
            >
              <Organizaciones />
            </Layout>
          );

        case 'gestion-organizacional':
          return (
            <Layout 
              showHeader={true} 
              user={layoutUser} 
              onSidebarItemClick={handleSidebarItemClick}
              onLogout={handleLogout}
              currentPage={selectedOption}
            >
              <GestionOrganizacional data={{}} />
            </Layout>
          );

        default:
          // Para otras páginas, mostrar mensaje de no organización
          return (
            <Layout 
              showHeader={true} 
              user={layoutUser} 
              onSidebarItemClick={handleSidebarItemClick}
              onLogout={handleLogout}
              currentPage={selectedOption}
            >
              {noOrgMessage}
            </Layout>
          );
      }
    }

    // Si hay organización, renderizar normalmente
    switch (selectedOption) {
      case 'home':
        return (
          <Layout 
            showHeader={false} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <HomeWrapper 
              userProfile={userProfile}
              homeData={personalizedHomeData}
              homeAdminData={personalizedHomeAdminData}
              onMenuToggle={() => {}}
              onNavigate={handleSidebarItemClick}
            />
          </Layout>
        );

      case 'roles':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Roles data={{}} />
          </Layout>
        );

      case 'organizaciones':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Organizaciones />
          </Layout>
        );

      case 'gestion-organizacional':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <GestionOrganizacional data={{}} />
          </Layout>
        );

      case 'mi-organizacion':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <MiOrganizacion />
          </Layout>
        );

      case 'sistemas':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Sistemas onNavigate={handlePageChange} />
          </Layout>
        );

      case 'gobernanza':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Gobernanza />
          </Layout>
        );

      case 'servidores':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Servidores onNavigate={handlePageChange} />
          </Layout>
        );

      case 'dominios-data':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <DominiosData onNavigate={handlePageChange} />
          </Layout>
        );

      case 'ubigeo':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Ubigeo 
              isOpen={true} 
              onClose={() => {}} 
            />
          </Layout>
        );

      case 'usuarios':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Usuarios />
          </Layout>
        );

      case 'unidades-posiciones':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <UnidadesPosiciones 
              organizacionData={{
                organizacionId: currentOrganization?.organizacionId || 0,
                codigo: currentOrganization?.codigo || '',
                razonSocial: currentOrganization?.razonSocial || 'Sin organización'
              }}
            />
          </Layout>
        );

      case 'workflow':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Workflow />
          </Layout>
        );

      case 'procesos':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Procesos />
          </Layout>
        );

      case 'documentos':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Documentos />
          </Layout>
        );

      case 'documentos-carpetas':
        return (
          <Layout 
            showHeader={true} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <CarpetasManager onBack={() => handlePageChange('documentos')} />
          </Layout>
        );

      default:
        return (
          <Layout 
            showHeader={false} 
            user={layoutUser} 
            onSidebarItemClick={handleSidebarItemClick}
            onLogout={handleLogout}
            currentPage={selectedOption}
          >
            <Home data={personalizedHomeData} />
          </Layout>
        );
    }
  };

  return (
    <div className="app-container">
      {renderSelectedComponent()}
      {/* 🔒 SEGURIDAD EMPRESARIAL: Manager de alertas de seguridad */}
      <SecurityManager />
    </div>
  );
}; 

export default AppComponent;