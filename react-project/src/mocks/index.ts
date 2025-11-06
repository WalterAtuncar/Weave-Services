// Exportar todos los mocks de estructura organizacional
export { unidadesOrgMockData } from './unidadesOrgMocks';
export { posicionesMockData } from './posicionesMocks';
export { personaPosicionMockData } from './personaPosicionMocks';
export { personasMockData } from './personasMocks';
export { organizacionMockData } from './organizacionMocks';
export { constructorEstructuraMockData, getOrganizacionParaConstructor } from './constructorEstructuraMocks';
export { sedesMockData } from './sedesMocks';

// Exportar mocks de sistemas
export { 
  mockSistemas, 
  mockSistemasModulos,
  getSistemasByOrganizacion,
  getSistemasActivosByOrganizacion,
  getSistemaById,
  getSistemasByFamilia,
  getSistemasPosiblesPadres,
  getModulosBySistema,
  getSistemasStats
} from './sistemasMocks';

// Exportar mocks de servidores
export * from './servidoresMocks';

// Exportar mocks de gobernanza
export * from './gobernanzaMocks';

// Importar para crear el objeto consolidado
import { unidadesOrgMockData } from './unidadesOrgMocks';
import { posicionesMockData } from './posicionesMocks';
import { personaPosicionMockData } from './personaPosicionMocks';
import { personasMockData } from './personasMocks';
import { organizacionMockData } from './organizacionMocks';

// Exportar un objeto consolidado con todos los datos mock
export const organizationalMockData = {
  organizacion: organizacionMockData.organizacion,
  unidadesOrganizacionales: unidadesOrgMockData.unidadesOrganizacionales,
  posiciones: posicionesMockData.posiciones,
  personaPosiciones: personaPosicionMockData.personaPosiciones,
  personas: personasMockData.personas
}; 