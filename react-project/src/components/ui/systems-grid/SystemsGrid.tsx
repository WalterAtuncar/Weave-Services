import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Sistema } from '../../../models/Sistemas';
import { SystemCard } from '../system-card';
import { Button } from '../button';
import styles from './SystemsGrid.module.css';

export interface SystemsGridProps {
  sistemas: Sistema[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onEdit?: (sistema: Sistema) => void;
  onDelete?: (sistema: Sistema) => void;
  onView?: (sistema: Sistema) => void;
  onGovernance?: (sistema: Sistema) => void;
  onApprovalTracking?: (sistema: Sistema) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

export const SystemsGrid: React.FC<SystemsGridProps> = ({
  sistemas,
  loading = false,
  error = null,
  pagination,
  onEdit,
  onDelete,
  onView,
  onGovernance,
  onApprovalTracking,
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`${styles.gridContainer} ${className}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Cargando sistemas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.gridContainer} ${className}`}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>Error: {error}</p>
          <Button
            variant="outline"
            size="m"
            onClick={() => window.location.reload()}
          >
            Recargar
          </Button>
        </div>
      </div>
    );
  }

  if (sistemas.length === 0) {
    return (
      <div className={`${styles.gridContainer} ${className}`}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M7 15h0M12 15h0M17 15h0"/>
              <path d="M7 11h10"/>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No se encontraron sistemas</h3>
          <p className={styles.emptyDescription}>
            Intenta ajustar los filtros o buscar con otros términos.
          </p>
        </div>
      </div>
    );
  }

  const renderPaginationNumbers = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages } = pagination;
    const pages: (number | string)[] = [];

    // Lógica para mostrar números de página con elipsis
    if (totalPages <= 7) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar con elipsis
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
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
          className={`${styles.pageButton} ${pageNum === page ? styles.activePage : ''}`}
          onClick={() => onPageChange?.(pageNum as number)}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className={`${styles.gridContainer} ${className}`}>
      {/* Grid de sistemas */}
      <div className={styles.grid}>
        {sistemas.map((sistema) => (
          <SystemCard
            key={sistema.sistemaId}
            sistema={sistema}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onGovernance={onGovernance}
            onApprovalTracking={onApprovalTracking}
          />
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            <span className={styles.resultsText}>
              Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} sistemas
            </span>
            
            {onPageSizeChange && (
              <div className={styles.pageSizeSelector}>
                <span className={styles.pageSizeLabel}>Mostrar:</span>
                <select
                  value={pagination.pageSize}
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
              size="s"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
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
              size="s"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
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