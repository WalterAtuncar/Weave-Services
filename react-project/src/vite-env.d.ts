/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_NAME?: string;
  // Agrega más variables de entorno según necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 