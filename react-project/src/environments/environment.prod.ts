import type { Environment } from './environment';

// Environment configuration for production
export const environment: Environment = {
  production: true,
  apiUrl: 'http://walter150976-002-site1.atempurl.com/api', 
  //apiUrl: 'https://localhost:7089/api', 
  appName: 'Gestión Procesos',
  version: '1.0.0',
  enableLogging: false,
  apiTimeout: 15000, // 15 segundos
  // Claves y configuración de AI
  anthropicApiKey: (import.meta as any).env?.VITE_ANTHROPIC_API_KEY ?? '',
  features: {
    debugMode: false,
    mockData: false,
  }
};