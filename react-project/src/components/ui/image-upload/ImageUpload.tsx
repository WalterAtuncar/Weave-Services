import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange?: (file: File | null, dataUrl: string | null) => void;
  accept?: string;
  maxSize?: number; // en MB
  preview?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Foto',
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5, // 5MB por defecto
  preview = true,
  placeholder = 'Haga clic para cargar una imagen o arrastre aquí',
  required = false,
  disabled = false,
  className = ''
}) => {
  const { colors, theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔧 FIX: Sincronizar previewUrl con la prop value cuando cambie
  useEffect(() => {
    setPreviewUrl(value || null);
    setError(null); // Limpiar errores cuando cambie el value
    
    // Si value es null, también limpiar el input file
    if (!value && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [value]);

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return 'Por favor seleccione un archivo de imagen válido';
    }

    // Validar tamaño
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo debe ser menor a ${maxSize}MB`;
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      setPreviewUrl(null);
      onChange?.(null, null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Crear URL de previsualización
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      onChange?.(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange?.(null, null);
  };

  const containerStyles = {
    border: `2px dashed ${isDragging ? colors.primary : (error ? '#EF4444' : colors.border)}`,
    backgroundColor: isDragging ? (theme === 'dark' ? '#1e293b' : '#f8fafc') : colors.surface,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center' as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const
  };

  const previewImageStyles = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: `2px solid ${colors.border}`,
    marginBottom: '8px'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          className="block text-sm font-medium"
          style={{ color: colors.text }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        style={containerStyles}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {previewUrl ? (
          <div style={{ position: 'relative' }}>
            <img
              src={previewUrl}
              alt="Vista Previa"
              style={previewImageStyles}
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}
              >
                <X size={14} />
              </button>
            )}
            <div style={{ 
              color: colors.textSecondary, 
              fontSize: '12px',
              marginTop: '4px'
            }}>
              Haga clic para cambiar
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary
            }}>
              <Camera size={24} />
            </div>
            <div style={{ color: colors.text, fontSize: '14px', fontWeight: '500' }}>
              {placeholder}
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
              Formatos: JPG, PNG, GIF (máx. {maxSize}MB)
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500" style={{ margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}; 