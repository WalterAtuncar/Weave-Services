import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Spinner } from "./components/ui/spinner";
import { authService } from "./services";
import LoginPage from "./pages/login";
import AppPage from "./pages/app";
// import ServidoresPage from "./pages/servidores"; // COMENTADO: Navegación interna únicamente
import "./styles/globals.css";
import { AIProvider } from "./ai";
import { AlertProvider } from "./components/ui/alerts/AlertProvider";

// Componente para redirigir según autenticación
const AuthRedirect = () => {
  const isAuthenticated = authService.isAuthenticated();
  return <Navigate to={isAuthenticated ? "/app" : "/login"} replace />;
};

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />
        {/* Ruta directa para gestión de carpetas de documentos */}
        <Route path="/documentos-carpetas" element={<ProtectedRoute><AppPage selectedOption="documentos-carpetas" /></ProtectedRoute>} />
        {/* RUTA ELIMINADA: /servidores - Navegación es interna dentro de /app */}
        <Route path="/" element={<AuthRedirect />} />
      </Routes>
      <Spinner />
    </BrowserRouter>
  );
};

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <AIProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </AIProvider>
    </ThemeProvider>
  </StrictMode>
);