import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2, AlertCircle, FileX } from 'lucide-react';
import { ProcesoCard } from '../proceso-card';
import { Button } from '../button';
import styles from './ProcesosGrid.module.css';

// Interfaces para Procesos
interface Proceso {
  procesoId: number;
  organizacionId: number;
  codigoProceso: string | null;
  nombreProceso: string;
  descripcion: string | null;
  procesoDepende: number | null;
  tipoProceso: number;
  categoriaProceso: number;
  tieneGobernanzaPropia: boolean;
  gobernanzaId?: number | null;
  version: number;
  estado: number;
  creadoPor: number | null;
  fechaCreacion: string;
  actualizadoPor: number | null;
  fechaActualizacion: string | null;
  registroEliminado: boolean;
  responsable?: string | null;
  duracionEstimada?: number | null;
  procesoDepende_Nombre?: string;
  subprocesos?: Proceso[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export interface ProcesosGridProps {
  procesos: Proceso[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    paginaActual: number;
    tamanoPagina: number;
    totalElementos: number;
    totalPaginas: number;
    tienePaginaAnterior: boolean;
    tienePaginaSiguiente: boolean;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (proceso: Proceso) => void;
  onDelete?: (proceso: Proceso) => void;
  onGovernance?: (proceso: Proceso) => void;
  onApprovalTracking?: (proceso: Proceso) => void;
  className?: string;
}

export const ProcesosGrid: React.FC<ProcesosGridProps> = ({
  procesos,
  loading = false,
  error = null,
  pagination,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onGovernance,
  onApprovalTracking,
  className = ''
}) => {
  React.useEffect(() => {
    console.log('[ProcesosGrid] render', {
      count: Array.isArray(procesos) ? procesos.length : 0,
      loading,
      error,
      pagination,
      procesos
    });
  }, [procesos, loading, error, pagination]);

  // Estado de carga
  if (loading) {
    return (
      <div className={`${styles.gridContainer} ${className}`}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.loadingIcon} />
          <p className={styles.loadingText}>Cargando procesos...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={`${styles.gridContainer} ${className}`}>
        <div className={styles.errorState}>
          <AlertCircle className={styles.errorIcon} />
          <h3 className={styles.errorTitle}>Error al cargar procesos</h3>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  // Estado vacÃ­o
  if (!procesos || procesos.length === 0) {
    console.log('[ProcesosGrid] estado vacÃ­o: procesos.length =', Array.isArray(procesos) ? procesos.length : 0);
    return (
      <div className={`${styles.gridContainer} ${className}`}>
        <div className={styles.emptyState}>
          <FileX className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No hay procesos disponibles</h3>
          <p className={styles.emptyMessage}>
            No se encontraron procesos que coincidan con los criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  const renderPaginationNumbers = () => {
    if (!pagination || pagination.totalPaginas <= 1) return null;

    const { paginaActual, totalPaginas } = pagination;
    const pages: (number | string)[] = [];

    // LÃ³gica para mostrar nÃºmeros de pÃ¡gina con elipsis
    if (totalPaginas <= 7) {
      // Mostrar todas las pÃ¡ginas si son pocas
      for (let i = 1; i <= totalPaginas; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar con elipsis
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPaginas);
      }
    }

    return pages.map((pageNum, index) => {
      if (pageNum === '...') {
        return (
          <span key={`ellipsis-${index}`} className={styles.ellipsis}>
            <MoreHorizontal size={16} />
          </span>
        );
      }

      return (
        <button
          key={pageNum}
          className={`${styles.pageButton} ${pageNum === paginaActual ? styles.active : ''}`}
          onClick={() => onPageChange?.(pageNum as number)}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className={`${styles.gridContainer} ${className}`}>
      {/* Grid de procesos */}
      <div className={styles.procesosGrid}>
        {(() => { console.log('ðŸ§© ProcesosGrid render, cantidad procesos:', procesos?.length, procesos); return null; })()}
        {procesos.map((proceso) => (
          <ProcesoCard
            key={proceso.procesoId}
            proceso={proceso}
            onEdit={onEdit}
            onDelete={onDelete}
            onGovernance={onGovernance}
            onApprovalTracking={onApprovalTracking}
          />
        ))}
      </div>

      {/* PaginaciÃ³n */}
      {pagination && pagination.totalPaginas > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
             <span className={styles.resultsText}>
               Mostrando {((pagination.paginaActual - 1) * pagination.tamanoPagina) + 1} - {Math.min(pagination.paginaActual * pagination.tamanoPagina, pagination.totalElementos)} de {pagination.totalElementos} procesos
             </span>
             
             {onPageSizeChange && (
               <div className={styles.pageSizeSelector}>
                 <span className={styles.pageSizeLabel}>Mostrar:</span>
                 <select
                   value={pagination.tamanoPagina}
                   onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                   className={styles.pageSizeSelect}
                 >
                   {PAGE_SIZE_OPTIONS.map(size => (
                     <option key={size} value={size}>
                       {size}
                     </option>
                   ))}
                 </select>
               </div>
             )}
           </div>

           <div className={styles.paginationControls}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.paginaActual - 1)}
              disabled={!pagination.tienePaginaAnterior}
              className={styles.paginationButton}
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>
            
            <div className={styles.pageNumbers}>
              {renderPaginationNumbers()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.paginaActual + 1)}
              disabled={!pagination.tienePaginaSiguiente}
              className={styles.paginationButton}
            >
              Siguiente
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

