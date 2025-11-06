import React, { useEffect, useMemo, useState } from "react";
import styles from "./DocumentTile.module.css";
import { Button } from "@/components/ui/button";
import type { Documento } from "./types";
import * as pdfjsLib from "pdfjs-dist";
import { ContextMenu, type ContextMenuItem } from "@/components/ui/context-menu/ContextMenu";
import { Shield, Edit, Trash2 } from "lucide-react";
// Inicializar Worker de PDF.js como módulo y asignarlo a workerPort
const pdfWorker = new Worker(new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url), { type: 'module' });
(pdfjsLib.GlobalWorkerOptions as any).workerPort = pdfWorker;
// No establecer workerSrc: pdf.js usará el workerPort provisto
// (Eliminado: pdfjsLib.GlobalWorkerOptions.workerSrc = undefined as any)

export interface DocumentTileProps {
  doc: Documento;
  onOpen?: (doc: Documento) => void;
  onDownload?: (doc: Documento) => void;
  onMore?: (doc: Documento) => void;
  onGovernance?: (doc: Documento) => void;
  onEdit?: (doc: Documento) => void;
  onDelete?: (doc: Documento) => void;
}

export const DocumentTile: React.FC<DocumentTileProps> = ({ doc, onOpen, onDownload, onMore, onGovernance, onEdit, onDelete }) => {
  const { titulo, miniaturaUrl, extension, fileUrl, miniaturaAncho, miniaturaAlto } = doc;
  const [generatedThumb, setGeneratedThumb] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasThumb = !!miniaturaUrl || !!generatedThumb;

  const isPDF = useMemo(() => (extension || "").toLowerCase() === "pdf", [extension]);

  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleOpen = () => onOpen?.(doc);
  const handleDownload = () => onDownload?.(doc);
  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextPos({ x: e.clientX, y: e.clientY });
    setContextOpen(true);
    onMore?.(doc);
  };

  const contextItems: ContextMenuItem[] = useMemo(() => [
    {
      id: 'gobierno',
      label: 'Gobierno',
      icon: <Shield size={14} />,
      onClick: () => onGovernance?.(doc)
    },
    {
      id: 'editar',
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: () => onEdit?.(doc)
    },
    {
      id: 'eliminar',
      label: 'Eliminar',
      icon: <Trash2 size={14} />,
      onClick: () => onDelete?.(doc)
    }
  ], [doc, onGovernance, onEdit, onDelete]);

  // Generar miniatura para PDFs: primera página renderizada a un canvas y convertida a dataURL
  useEffect(() => {
    let cancelled = false;
    async function generatePdfThumb() {
      if (!isPDF) return;
      if (miniaturaUrl) return; // ya viene del backend
      if (!fileUrl) return; // necesitamos la URL del PDF
      try {
        setIsGenerating(true);
        let loadingTask: any;
        try {
          // Intentar cargar como ArrayBuffer para evitar CORS
          const resp = await fetch(fileUrl, { mode: 'cors' });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const buf = await resp.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buf), useSystemFonts: true });
        } catch (e) {
          // Fallback: cargar por URL
          loadingTask = pdfjsLib.getDocument({ url: fileUrl, useSystemFonts: true });
        }
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Tamaño deseado (proporción 16:10 como en UI)
        const targetWidth = 320;
        const targetHeight = 200;

        const viewport = page.getViewport({ scale: 1 });
        // Escala para encajar ancho manteniendo proporción
        const scale = targetWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsGenerating(false);
          return;
        }
        canvas.width = Math.round(scaledViewport.width);
        canvas.height = Math.round(scaledViewport.height);

        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

        // Si la altura excede, recortamos a targetHeight con center-crop
        let dataUrl: string;
        if (canvas.height > targetHeight) {
          const off = document.createElement("canvas");
          off.width = targetWidth;
          off.height = targetHeight;
          const offCtx = off.getContext("2d");
          if (offCtx) {
            const dy = (canvas.height - targetHeight) / 2;
            offCtx.drawImage(canvas, 0, -dy, canvas.width, canvas.height);
            dataUrl = off.toDataURL("image/jpeg", 0.85);
          } else {
            dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          }
        } else {
          dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        }

        if (!cancelled) setGeneratedThumb(dataUrl);
      } catch (err) {
        console.warn("[DocumentTile] Error generando miniatura PDF:", err);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }

    generatePdfThumb();
    return () => { cancelled = true; };
  }, [isPDF, miniaturaUrl, fileUrl]);

  const Thumb = () => (
    <div className={styles.thumbnail}>
      {hasThumb ? (
        <img className={styles.thumbImg} src={generatedThumb || miniaturaUrl!} alt={titulo} />
      ) : (
        <span className={styles.thumbPlaceholder}>{(extension || "DOC").toUpperCase()}</span>
      )}

      <div className={styles.overlay}>
        <div className={styles.overlayTopRight}>
          <Button
            className={`${styles.overlayBtn} ${styles.iconOnlyBtn}`}
            variant="action"
            size="s"
            iconName="MoreVertical"
            aria-label="Más opciones"
            onClick={handleMore}
          />
        </div>
        <div className={styles.overlayBottomRight}>
          <div className={styles.overlayActions}>
            <Button
              className={`${styles.overlayBtn} ${styles.iconOnlyBtn}`}
              variant="primary"
              size="s"
              iconName="Eye"
              aria-label="Ver"
              onClick={handleOpen}
            />
            <Button
              className={`${styles.overlayBtn} ${styles.iconOnlyBtn}`}
              variant="primary"
              size="s"
              iconName="Download"
              aria-label="Descargar"
              onClick={handleDownload}
            />
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className={styles.thumbLoading}>Generando miniatura…</div>
      )}
    </div>
  );

  return (
    <article className={styles.tile}>
      <Thumb />
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <button className={styles.titleButton} onClick={handleOpen}>
            <span className={styles.title}>{titulo}</span>
          </button>
        </div>
        {doc.sugeridoMotivo && (
          <div className={styles.meta}>{doc.sugeridoMotivo}</div>
        )}
      </div>

      {/* Menú contextual anclado al clic en los tres puntos */}
      <ContextMenu
        isOpen={contextOpen}
        position={contextPos}
        items={contextItems}
        onClose={() => setContextOpen(false)}
      />
    </article>
  );
};