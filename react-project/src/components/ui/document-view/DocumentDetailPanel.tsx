import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './DocumentDetailPanel.module.css';
import { Documento } from './types';
import * as pdfjsLib from 'pdfjs-dist';
// Inicializar Worker de PDF.js como módulo y asignarlo a workerPort para miniaturas en el panel
const pdfWorkerPanel = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
(pdfjsLib.GlobalWorkerOptions as any).workerPort = pdfWorkerPanel;

export interface DocumentDetailPanelProps {
  doc: Documento | null;
  onClose: () => void;
}

export const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = ({ doc, onClose }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'detalles' | 'actividad'>('detalles');
  // Generar miniatura local en el panel si el documento es PDF y no hay miniaturaUrl
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);

  // Cerrar con tecla Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Generación de miniatura para PDF (misma idea que en el tile) cuando no hay miniaturaUrl
  useEffect(() => {
    if (!doc) { setPreviewThumb(null); return; }
    const isPDF = (doc.extension || '').toLowerCase() === 'pdf';
    if (!isPDF || !doc.fileUrl) { setPreviewThumb(null); return; }
    let cancelled = false;

    const generate = async () => {
      try {
        const loadingTask = (pdfjsLib as any).getDocument({ url: doc.fileUrl });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const targetWidth = 800; // render de buena calidad para panel
        const scale = targetWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = Math.round(scaledViewport.width);
        canvas.height = Math.round(scaledViewport.height);
        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        if (!cancelled) setPreviewThumb(dataUrl);
      } catch (e) {
        console.warn('[DocumentDetailPanel] Error generando miniatura PDF:', e);
        if (!cancelled) setPreviewThumb(null);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, [doc]);

  if (!doc) return null;

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera del panel */}
      <div className={styles.overlayBackdrop} onClick={onClose} />

      <aside className={styles.panel} style={{ backgroundColor: colors.surface, borderColor: colors.border }} aria-label="Detalles del documento" role="dialog">
        <div className={styles.header}>
          <div className={styles.titleBox}>
            <div className={styles.title} style={{ color: colors.text }}>{doc.titulo}</div>
            <div style={{ color: colors.textSecondary }}>{doc.extension?.toUpperCase()} · {doc.ubicacion}</div>
          </div>
          <div className={styles.headerActions}>
            <Button size="s" variant="action" iconName="X" aria-label="Cerrar" onClick={onClose} />
          </div>
        </div>

        <div className={styles.tabs}>
          <Button
            size="s"
            variant={activeTab === 'detalles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('detalles')}
          >
            Detalles
          </Button>
          <Button
            size="s"
            variant={activeTab === 'actividad' ? 'default' : 'outline'}
            onClick={() => setActiveTab('actividad')}
          >
            Actividad
          </Button>
        </div>

        <div className={styles.content}>
          {activeTab === 'detalles' ? (
            <>
              <div className={styles.section} style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                <div className={styles.sectionTitle}>Vista previa</div>
                {(previewThumb || doc.miniaturaUrl) ? (
                  <img src={previewThumb || doc.miniaturaUrl!} alt={doc.titulo} className={styles.thumb} />
                ) : null}
              </div>
              <div className={styles.section} style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                <div className={styles.sectionTitle}>Acciones</div>
                <div className={styles.actionsRow}>
                  <Button className={styles.iconOnlyBtn} size="s" variant="primary" iconName="Eye" aria-label="Abrir" />
                  <Button className={styles.iconOnlyBtn} size="s" variant="primary" iconName="Download" aria-label="Descargar" />
                  <Button size="s" variant="outline" iconName="Share">Compartir</Button>
                </div>
              </div>
              <div className={styles.section} style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                <div className={styles.sectionTitle}>Metadatos</div>
                <div style={{ color: colors.textSecondary }}>Última apertura: {doc.ultimaApertura ? new Date(doc.ultimaApertura).toLocaleDateString() : '-'}</div>
                <div style={{ color: colors.textSecondary }}>Propietario: {doc.propietario}</div>
                <div style={{ color: colors.textSecondary }}>Ubicación: {doc.ubicacion}</div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.section} style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                <div className={styles.sectionTitle}>Actividad reciente</div>
                <div style={{ color: colors.textSecondary }}>Abriste este archivo {doc.sugeridoMotivo?.toLowerCase() || 'recientemente'}.</div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};