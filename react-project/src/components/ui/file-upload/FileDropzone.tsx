import React, { useCallback, useMemo, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CloudUpload, File, XCircle } from 'lucide-react';
import { Button } from '../button';

export interface FileDropzoneProps {
  accept?: string[]; // extensions like .xlsx, .csv, .json
  maxSizeBytes?: number; // default 10MB
  onFileSelected?: (file: File | null) => void;
  className?: string;
  label?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept = ['.xlsx', '.xls', '.csv', '.json'],
  maxSizeBytes = 10 * 1024 * 1024,
  onFileSelected,
  className = '',
  label = 'Seleccione o Arrastre Archivos'
}) => {
  const { colors } = useTheme();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const acceptAttr = useMemo(() => accept.join(','), [accept]);

  const validateFile = useCallback((f: File): string | null => {
    const okExt = accept.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!okExt) return `Formato inválido. Aceptados: ${accept.join(', ')}`;
    if (f.size > maxSizeBytes) return 'El archivo supera el tamaño permitido.';
    return null;
  }, [accept, maxSizeBytes]);

  const handleFiles = useCallback((flist: FileList | null) => {
    const f = flist && flist[0] ? flist[0] : null;
    if (!f) {
      setFile(null);
      setError(null);
      onFileSelected?.(null);
      return;
    }
    const err = validateFile(f);
    setError(err);
    if (!err) {
      setFile(f);
      onFileSelected?.(f);
    } else {
      setFile(null);
      onFileSelected?.(null);
    }
  }, [onFileSelected, validateFile]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    onFileSelected?.(null);
  };

  return (
    <div className={className}>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${dragging ? colors.primary : colors.border}`,
          borderRadius: 8,
          padding: 24,
          backgroundColor: dragging ? colors.surfaceHover : colors.surface,
          color: colors.textSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 140,
          transition: 'all 0.15s ease-in-out'
        }}
      >
        <label style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
          <input
            type="file"
            accept={acceptAttr}
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <CloudUpload size={40} color={colors.textSecondary} />
            <div style={{ fontSize: 14 }}>{label}</div>
          </div>
        </label>
      </div>

      {error && (
        <div style={{ marginTop: 8, color: colors.errorText, fontSize: 13 }}>
          {error}
        </div>
      )}

      {file && (
        <div style={{
          marginTop: 12,
          padding: 12,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.surface
        }}>
          <File size={18} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{file.name}</div>
            <div style={{ fontSize: 12, color: colors.textSecondary }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <Button variant="secondary" size="sm" iconLeft={<XCircle size={16} />} onClick={clearFile}>
            Quitar
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;