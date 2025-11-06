import React, { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { ViewMode, ViewToggle } from '../ui/view-toggle';

// Tipos genéricos para los hooks de datos
export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export interface UseListResult<T> {
  items: T[];
  loading?: boolean;
  error?: string | null;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export type UseListHook<T> = (options?: unknown) => UseListResult<T>;

export interface ContextBadge {
  text: string;
  colorClassName?: string; // Permite personalizar color (Tailwind o clases globales)
}

export interface EntityManagementTemplateProps<T> {
  // Header
  title: string;
  subtitle?: string;
  contextBadge?: ContextBadge;
  headerActions?: React.ReactNode; // slot de acciones del header (extensible)

  // Toolbar
  toolbarLeft?: React.ReactNode; // p. ej. SearchBar / filtros
  toolbarRight?: React.ReactNode; // p. ej. acciones visibles (import/export/analytics)
  // Botones expandibles en la toolbar (sección de botones ampliable/reducible)
  toolbarActionsExtra?: React.ReactNode; // contenido adicional que aparece al expandir
  toolbarActionsCollapsible?: boolean; // habilita el comportamiento expandible
  toolbarActionsInitiallyExpanded?: boolean; // estado inicial
  toolbarActionsToggleLabels?: { expand?: string; collapse?: string }; // etiquetas del botón toggle

  // Vista y renderers
  defaultViewMode?: ViewMode; // 'grid' | 'list'
  viewMode?: ViewMode; // controlado
  onViewModeChange?: (mode: ViewMode) => void;
  enableViewToggle?: boolean; // si true, renderiza el ViewToggle estándar al lado derecho

  // Datos genéricos
  useCardsData?: UseListHook<T>; // hook para datos de tarjetas (grid)
  useGridData?: UseListHook<T>; // hook para datos de lista/tabla

  // Renderers
  renderCard?: (item: T, index: number) => React.ReactNode; // cómo dibujar cada card
  renderGrid?: (items: T[], result?: UseListResult<T>) => React.ReactNode; // cómo dibujar la lista/tabla

  // Área de contenido y pie
  contentClassName?: string;
  className?: string;
  footer?: React.ReactNode | ((result: UseListResult<T> | undefined) => React.ReactNode);

  // Portal para modales
  modalsPortal?: React.ReactNode;
}

export function EntityManagementTemplate<T extends Record<string, any>>({
  title,
  subtitle,
  contextBadge,
  headerActions,
  toolbarLeft,
  toolbarRight,
  toolbarActionsExtra,
  toolbarActionsCollapsible = true,
  toolbarActionsInitiallyExpanded = false,
  toolbarActionsToggleLabels,
  defaultViewMode = 'grid',
  viewMode: controlledViewMode,
  onViewModeChange,
  enableViewToggle = true,
  useCardsData,
  useGridData,
  renderCard,
  renderGrid,
  contentClassName = '',
  className = '',
  footer,
  modalsPortal
}: EntityManagementTemplateProps<T>) {
  // Soporte controlado / no controlado para el modo de vista
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>(defaultViewMode);
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = (mode: ViewMode) => {
    onViewModeChange?.(mode);
    if (controlledViewMode === undefined) setInternalViewMode(mode);
  };

  // Estado para la sección de botones expandible en la toolbar
  const [toolbarExpanded, setToolbarExpanded] = useState<boolean>(toolbarActionsInitiallyExpanded);

  // Hooks de datos (opcionales). Si no hay hook específico para grid, se reutiliza el de cards
  const cardsResult = useCardsData ? useCardsData() : undefined;
  const listResult = useGridData ? useGridData() : cardsResult;

  const isLoading = (viewMode === 'grid' ? cardsResult?.loading : listResult?.loading) ?? false;
  const error = (viewMode === 'grid' ? cardsResult?.error : listResult?.error) ?? null;

  const items: T[] = useMemo(() => {
    if (viewMode === 'grid') return cardsResult?.items ?? [];
    return listResult?.items ?? [];
  }, [viewMode, cardsResult, listResult]);

  const activeResult = viewMode === 'grid' ? cardsResult : listResult;

  const expandLabel = toolbarActionsToggleLabels?.expand ?? 'Más';
  const collapseLabel = toolbarActionsToggleLabels?.collapse ?? 'Menos';

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
              {subtitle && (
                <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
              )}
            </div>
            {contextBadge && (
              <span className={`h-fit px-2 py-1 rounded text-xs font-medium ${contextBadge.colorClassName ?? 'bg-slate-100 text-slate-600'}`}>
                {contextBadge.text}
              </span>
            )}
          </div>

          {/* Acciones del header: libremente extensible */}
          {headerActions && (
            <div className="flex items-center gap-2 flex-wrap">
              {headerActions}
            </div>
          )}
        </div>

        {/* Toolbar */}
        {(toolbarLeft || toolbarRight || enableViewToggle || (toolbarActionsCollapsible && toolbarActionsExtra)) && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {toolbarLeft}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {toolbarRight}
              {toolbarActionsCollapsible && toolbarActionsExtra && (
                <>
                  <Button
                    variant="outline"
                    size="m"
                    onClick={() => setToolbarExpanded((v) => !v)}
                    iconName={toolbarExpanded ? 'ChevronUp' : 'ChevronDown'}
                    iconPosition="left"
                  >
                    {toolbarExpanded ? collapseLabel : expandLabel}
                  </Button>
                  {toolbarExpanded && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {toolbarActionsExtra}
                    </div>
                  )}
                </>
              )}
              {enableViewToggle && (
                <ViewToggle
                  currentView={viewMode}
                  onViewChange={setViewMode}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={`mt-4 ${contentClassName}`}>
        {/* Loading / Error */}
        {isLoading && (
          <div className="flex items-center justify-center h-48 rounded-lg border border-slate-200 bg-white">
            <div className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-slate-500 rounded-full" role="status" aria-label="loading" />
            <span className="ml-3 text-slate-500">Cargando...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border border-red-200 bg-red-50 text-red-700">
            <span>Ocurrió un error: {error}</span>
            <Button variant="outline" size="m" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {viewMode === 'grid' ? (
              // Vista de tarjetas (grid)
              items.length > 0 ? (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {items.map((item, idx) => (
                    <React.Fragment key={idx}>
                      {renderCard ? renderCard(item, idx) : (
                        <div className="p-4 border rounded-xl bg-white text-slate-500">
                          Implementa renderCard para personalizar la tarjeta.
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed rounded-xl text-center text-slate-500 bg-white">
                  No hay elementos para mostrar.
                </div>
              )
            ) : (
              // Vista de lista/tabla
              renderGrid ? (
                <div className="w-full">
                  {renderGrid(items, activeResult)}
                </div>
              ) : (
                <div className="p-8 border border-dashed rounded-xl text-center text-slate-500 bg-white">
                  Implementa renderGrid para personalizar la lista.
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Footer / Paginación (opcional y extensible) */}
      <div className="mt-3">
        {typeof footer === 'function' ? footer(activeResult) : footer}
      </div>

      {/* Portal de Modales */}
      {modalsPortal}
    </div>
  );
}

export default EntityManagementTemplate;