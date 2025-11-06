// Automatic environment selection based on Vite's mode
import { environment as devEnvironment } from './environment';
import { environment as prodEnvironment } from './environment.prod';

// Vite automatically sets import.meta.env.PROD to true in production builds
export const environment = import.meta.env.PROD ? prodEnvironment : devEnvironment;

// Export types for TypeScript support
export type { Environment } from './environment';

// Helper functions
export const isProduction = () => environment.production;
export const isDevelopment = () => !environment.production;
export const getApiUrl = () => environment.apiUrl;
export const getAppName = () => environment.appName; 