import React, { useEffect, useMemo, useState } from 'react'

export interface SimpleDocumentInlineViewerProps {
  file?: File
  className?: string
  style?: React.CSSProperties
}

/**
 * Visor simple basado en iframe/img que funciona en HTTP/HTTPS por igual.
 * No usa workers ni librerías externas.
 */
export const SimpleDocumentInlineViewer: React.FC<SimpleDocumentInlineViewerProps> = ({ file, className, style }) => {
  const [url, setUrl] = useState<string | null>(null)
  const mime = useMemo(() => file?.type || '', [file])

  useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const objUrl = URL.createObjectURL(file)
    setUrl(objUrl)
    return () => {
      URL.revokeObjectURL(objUrl)
    }
  }, [file])

  if (!file) {
    return <div className={className} style={style}>No hay archivo para visualizar.</div>
  }

  const commonStyle: React.CSSProperties = {
    width: '100%',
    height: '70vh',
    border: 'none',
    background: '#fff',
    ...style
  }

  // Render básico por tipo
  if (mime.includes('pdf')) {
    return <iframe src={url || ''} title="Visor PDF" className={className} style={commonStyle} />
  }
  if (mime.startsWith('image/')) {
    return (
      <div className={className} style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url || ''} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </div>
    )
  }
  if (mime.startsWith('text/')) {
    return <iframe src={url || ''} title="Visor Texto" className={className} style={commonStyle} />
  }

  // Para tipos no soportados por el navegador (ej. docx), ofrecer descarga
  return (
    <div className={className} style={{ padding: 12 }}>
      <p>Tipo no renderizable en visor simple: {mime || 'desconocido'}</p>
      <a href={url || ''} download={file.name} style={{
        display: 'inline-block',
        marginTop: 8,
        padding: '8px 12px',
        borderRadius: 8,
        background: 'var(--color-primary, #3b82f6)',
        color: '#fff',
        textDecoration: 'none'
      }}>Descargar archivo</a>
    </div>
  )
}

export default SimpleDocumentInlineViewer