// Environment configuration for development
export const environment = {
  production: false,
  apiUrl: 'http://walter150976-002-site1.atempurl.com/api', 
  //apiUrl: 'https://localhost:7089/api', 
  appName: 'Gestión Procesos - Development',
  version: '1.0.0',
  enableLogging: true,
  apiTimeout: 120000, // 30 segundos
  // Claves y configuración de AI
  anthropicApiKey: (import.meta as any).env?.VITE_ANTHROPIC_API_KEY ?? '',
  features: {
    // Aquí puedes agregar flags de funcionalidades
    debugMode: true,
    mockData: false,
  }
};

export type Environment = typeof environment;