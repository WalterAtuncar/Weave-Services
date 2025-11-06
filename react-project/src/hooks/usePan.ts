import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface PanState {
  isDragging: boolean;
  lastPosition: Position;
  currentPosition: Position;
  zoom: number;
}

export interface UsePanReturn {
  panState: PanState;
  isPanMode: boolean;
  setPanMode: (enabled: boolean) => void;
  resetPan: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  panStyle: React.CSSProperties;
  // Funciones de navegación avanzada
  fitToScreen: () => void;
  fitContentToScreen: () => void;
  centerOnElement: (elementId: string) => void;
  panToPosition: (x: number, y: number, zoom?: number) => void;
  setPanState: (state: PanState | ((prev: PanState) => PanState)) => void;
}

export const usePan = (): UsePanReturn => {
  const [isPanMode, setIsPanMode] = useState(false);
  const [panState, setPanState] = useState<PanState>({
    isDragging: false,
    lastPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    zoom: 1 // Zoom inicial al 100% (1.0)
  });

  const panStateRef = useRef(panState);
  panStateRef.current = panState;

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Activar/desactivar pan con tecla H (Hand)
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsPanMode(prev => !prev);
      }
      
      // Reset pan con tecla R
      if ((e.key === 'r' || e.key === 'R') && isPanMode) {
        e.preventDefault();
        setPanState(prev => ({
          ...prev,
          isDragging: false,
          currentPosition: { x: 0, y: 0 }
        }));
      }
      
      // Zoom in con tecla +
      if ((e.key === '+' || e.key === '=') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setPanState(prev => ({
          ...prev,
          zoom: Math.min(prev.zoom + 0.25, 3)
        }));
      }
      
      // Zoom out con tecla -
      if ((e.key === '-' || e.key === '_') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setPanState(prev => ({
          ...prev,
          zoom: Math.max(prev.zoom - 0.25, 0.15) // Zoom mínimo al 15% (0.15)
        }));
      }
      
      // Reset zoom con tecla 0
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setPanState(prev => ({
          ...prev,
          zoom: 1,
          currentPosition: { x: 0, y: 0 }
        }));
      }
      
      // Escape para desactivar pan
      if (e.key === 'Escape' && isPanMode) {
        setIsPanMode(false);
      }
      
      // Ajustar a pantalla con tecla F
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        // Resetear zoom y posición para ajustar a pantalla
        setPanState(prev => ({
          ...prev,
          zoom: 0.8,
          currentPosition: { x: 0, y: 0 }
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanMode]);

  // Actualizar cursor cuando cambia el modo pan
  useEffect(() => {
    if (isPanMode) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isPanMode]);

  // Manejar eventos globales del mouse
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isPanMode || !panStateRef.current.isDragging) return;

      const deltaX = e.clientX - panStateRef.current.lastPosition.x;
      const deltaY = e.clientY - panStateRef.current.lastPosition.y;

      setPanState(prev => ({
        ...prev,
        currentPosition: {
          x: prev.currentPosition.x + deltaX,
          y: prev.currentPosition.y + deltaY
        },
        lastPosition: { x: e.clientX, y: e.clientY }
      }));

      document.body.style.cursor = 'grabbing';
    };

    const handleGlobalMouseUp = () => {
      if (panStateRef.current.isDragging) {
        setPanState(prev => ({
          ...prev,
          isDragging: false
        }));
        document.body.style.cursor = isPanMode ? 'grab' : 'default';
      }
    };

    if (isPanMode) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPanMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isPanMode) return;

    // Evitar arrastrar si se hizo clic en un botón o elemento interactivo
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.classList.contains('unitActionButton') ||
        target.classList.contains('positionActionButton') ||
        target.classList.contains('assignButton') ||
        target.classList.contains('panButton')) {
      return;
    }

    e.preventDefault();
    setPanState(prev => ({
      ...prev,
      isDragging: true,
      lastPosition: { x: e.clientX, y: e.clientY }
    }));
    document.body.style.cursor = 'grabbing';
  }, [isPanMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanMode || !panState.isDragging) return;

    const deltaX = e.clientX - panState.lastPosition.x;
    const deltaY = e.clientY - panState.lastPosition.y;

    setPanState(prev => ({
      ...prev,
      currentPosition: {
        x: prev.currentPosition.x + deltaX,
        y: prev.currentPosition.y + deltaY
      },
      lastPosition: { x: e.clientX, y: e.clientY }
    }));
  }, [isPanMode, panState.isDragging, panState.lastPosition]);

  const handleMouseUp = useCallback(() => {
    if (panState.isDragging) {
      setPanState(prev => ({
        ...prev,
        isDragging: false
      }));
      document.body.style.cursor = isPanMode ? 'grab' : 'default';
    }
  }, [isPanMode, panState.isDragging]);

  const handleMouseLeave = useCallback(() => {
    if (panState.isDragging) {
      setPanState(prev => ({
        ...prev,
        isDragging: false
      }));
      document.body.style.cursor = isPanMode ? 'grab' : 'default';
    }
  }, [isPanMode, panState.isDragging]);

  const setPanMode = useCallback((enabled: boolean) => {
    setIsPanMode(enabled);
    if (!enabled) {
      setPanState(prev => ({
        ...prev,
        isDragging: false
      }));
    }
  }, []);

  const resetPan = useCallback(() => {
    setPanState(prev => ({
      ...prev,
      isDragging: false,
      currentPosition: { x: 0, y: 0 }
    }));
  }, []);

  // Funciones de zoom
  const zoomIn = useCallback(() => {
    setPanState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.25, 3) // Máximo 300%
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setPanState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.25, 0.15) // Zoom mínimo al 15% (0.15)
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setPanState(prev => ({
      ...prev,
      zoom: 1,
      currentPosition: { x: 0, y: 0 }
    }));
  }, []);

  // Manejar zoom con rueda del mouse
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setPanState(prev => ({
        ...prev,
        zoom: Math.max(0.15, Math.min(3, prev.zoom + delta)) // Zoom mínimo al 15% (0.15)
      }));
    }
  }, []);

  // Funciones de navegación avanzada
  const fitToScreen = useCallback(() => {
    try {
      const orgChartInner = document.querySelector('.orgChartInner') as HTMLElement;
      const orgChartView = document.querySelector('.orgChartView') as HTMLElement;
      
      if (!orgChartInner || !orgChartView) {
        // Fallback: resetear a valores por defecto
        setPanState(prev => ({
          ...prev,
          zoom: 1, // Zoom fallback al 100% (1.0)
          currentPosition: { x: 0, y: 0 }
        }));
        return;
      }

      const contentRect = orgChartInner.getBoundingClientRect();
      const containerRect = orgChartView.getBoundingClientRect();
      
      // Solo centrar el contenido, mantener zoom en 100%
      const centerX = (containerRect.width - contentRect.width) / 2;
      const centerY = (containerRect.height - contentRect.height) / 2;

      setPanState(prev => ({
        ...prev,
        zoom: 1, // Mantener zoom al 100%
        currentPosition: { x: centerX, y: centerY }
      }));
    } catch (error) {
      console.warn('Error en fitToScreen:', error);
      // Fallback seguro
      setPanState(prev => ({
        ...prev,
        zoom: 1, // Zoom fallback al 100% (1.0)
        currentPosition: { x: 0, y: 0 }
      }));
    }
  }, []);

  const centerOnElement = useCallback((elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const containerRect = element.closest('.orgChartView')?.getBoundingClientRect();
      
      if (!containerRect) return;

      // Calcular posición para centrar el elemento
      const centerX = (containerRect.width / 2) - (rect.left - containerRect.left + rect.width / 2);
      const centerY = (containerRect.height / 2) - (rect.top - containerRect.top + rect.height / 2);

      setPanState(prev => ({
        ...prev,
        currentPosition: { x: centerX, y: centerY }
      }));
    } catch (error) {
      console.warn('Error al centrar elemento:', error);
    }
  }, []);

  const panToPosition = useCallback((x: number, y: number, zoom?: number) => {
    setPanState(prev => ({
      ...prev,
      currentPosition: { x, y },
      zoom: zoom !== undefined ? Math.max(0.15, Math.min(3, zoom)) : prev.zoom // Zoom mínimo al 15% (0.15)
    }));
  }, []);

  // Función para ajustar el contenido a la pantalla (zoom automático)
  const fitContentToScreen = useCallback(() => {
    try {
      const orgChartInner = document.querySelector('.orgChartInner') as HTMLElement;
      const orgChartView = document.querySelector('.orgChartView') as HTMLElement;
      
      if (!orgChartInner || !orgChartView) {
        return;
      }

      const contentRect = orgChartInner.getBoundingClientRect();
      const containerRect = orgChartView.getBoundingClientRect();
      
      // Calcular escala para ajustar el contenido
      const scaleX = (containerRect.width * 0.9) / contentRect.width;
      const scaleY = (containerRect.height * 0.9) / contentRect.height;
      const optimalScale = Math.min(scaleX, scaleY, 1); // Máximo 100% para evitar zoom excesivo
      
      // Centrar el contenido
      const centerX = (containerRect.width - (contentRect.width * optimalScale)) / 2;
      const centerY = (containerRect.height - (contentRect.height * optimalScale)) / 2;

      setPanState(prev => ({
        ...prev,
        zoom: Math.max(0.15, optimalScale), // Zoom mínimo al 15% (0.15)
        currentPosition: { x: centerX, y: centerY }
      }));
    } catch (error) {
      console.warn('Error en fitContentToScreen:', error);
    }
  }, []);

  const panStyle: React.CSSProperties = {
    transform: `translate(${panState.currentPosition.x}px, ${panState.currentPosition.y}px) scale(${panState.zoom})`,
    cursor: isPanMode ? (panState.isDragging ? 'grabbing' : 'grab') : 'default',
    userSelect: isPanMode ? 'none' : 'auto',
    transition: panState.isDragging ? 'none' : 'transform 0.2s ease',
    transformOrigin: 'center center'
  };

  return {
    panState,
    isPanMode,
    setPanMode,
    resetPan,
    zoomIn,
    zoomOut,
    resetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleWheel,
    panStyle,
    // Funciones de navegación avanzada
    fitToScreen,
    fitContentToScreen,
    centerOnElement,
    panToPosition,
    setPanState
  };
}; 