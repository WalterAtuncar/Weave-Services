import React, { useState } from 'react';
import { Save, X, Hash, Server, HardDrive, Shield, Terminal, Globe, Activity } from 'lucide-react';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../select';
import { 
  Servidor, 
  CreateServidorDto, 
  UpdateServidorDto,
  TipoServidor,
  AmbienteServidor,
  EstadoServidor,
  getSistemaOperativoOptions,
  getTipoServidorOptions,
  getAmbienteServidorOptions,
  getEstadoServidorOptions
} from '../../../models/Servidores';
import styles from './ServidorForm.module.css';

export interface ServidorFormProps {
  servidor?: Servidor | null;
  organizacionId: number;
  onSubmit: (data: CreateServidorDto | UpdateServidorDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  readonly?: boolean;
  compact?: boolean; // Nuevo prop para controlar altura mínima
}

interface FormData {
  codigo: string;
  nombre: string;
  tipo: TipoServidor;
  ambiente: AmbienteServidor;
  sistemaOperativo: string;
  ip: string;
  estado: EstadoServidor;
}

interface FormErrors {
  codigo?: string;
  nombre?: string;
  tipo?: string;
  ambiente?: string;
  sistemaOperativo?: string;
  ip?: string;
}

export const ServidorForm: React.FC<ServidorFormProps> = ({
  servidor,
  organizacionId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  readonly = false,
  compact = false // Por defecto no es compacto
}) => {
  const isEditing = !!servidor;

  const [formData, setFormData] = useState<FormData>({
    codigo: servidor?.codigoServidor || '',
    nombre: servidor?.nombreServidor || '',
    tipo: servidor?.tipoServidor ?? TipoServidor.VIRTUAL,
    ambiente: servidor?.ambiente ?? AmbienteServidor.DESARROLLO,
    sistemaOperativo: servidor?.sistemaOperativo || 'Ubuntu 20.04',
    ip: servidor?.direccionIP || '',
    estado: servidor?.estado ?? EstadoServidor.ACTIVO
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Obtener opciones de los helpers
  const tipoServidorOptions = getTipoServidorOptions();
  const ambienteOptions = getAmbienteServidorOptions();
  const sistemaOperativoOptions = getSistemaOperativoOptions();
  const estadoOptions = getEstadoServidorOptions();

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (formData.codigo.length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'La dirección IP es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const baseData = {
      organizacionId,
      codigoServidor: formData.codigo.trim(),
      nombreServidor: formData.nombre.trim(),
      tipoServidor: formData.tipo,
      ambiente: formData.ambiente,
      sistemaOperativo: formData.sistemaOperativo,
      direccionIP: formData.ip.trim(),
      estado: formData.estado
    };

    if (isEditing && servidor) {
      const updateData: UpdateServidorDto = {
        servidorId: servidor.servidorId,
        ...baseData,
        actualizadoPor: 1 // TODO: obtener del contexto de usuario
      };
      onSubmit(updateData);
    } else {
      const createData: CreateServidorDto = {
        ...baseData,
        creadoPor: 1 // TODO: obtener del contexto de usuario
      };
      onSubmit(createData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? styles.formCompact : styles.form}>
      <div className={styles.formGrid}>
        {/* Código del Servidor */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Código del Servidor <span className={styles.required}>*</span>
          </label>
          <Input
            type="text"
            placeholder="Ej: PROD-WEB-01"
            value={formData.codigo}
            onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
            className={errors.codigo ? styles.inputError : ''}
            maxLength={50}
            disabled={readonly}
            icon="Hash"
          />
          {errors.codigo && <span className={styles.errorText}>{errors.codigo}</span>}
        </div>

        {/* Nombre del Servidor */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Nombre del Servidor <span className={styles.required}>*</span>
          </label>
          <Input
            type="text"
            placeholder="Ej: Servidor Web Principal"
            value={formData.nombre}
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            className={errors.nombre ? styles.inputError : ''}
            maxLength={200}
            disabled={readonly}
            icon="Server"
          />
          {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
        </div>

        {/* Tipo de Servidor */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Tipo de Servidor <span className={styles.required}>*</span>
          </label>
          <Select 
            value={formData.tipo.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: parseInt(value) as TipoServidor }))}
            disabled={readonly}
          >
            <SelectTrigger icon="HardDrive">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tipoServidorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ambiente */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Ambiente <span className={styles.required}>*</span>
          </label>
          <Select 
            value={formData.ambiente.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, ambiente: parseInt(value) as AmbienteServidor }))}
            disabled={readonly}
          >
            <SelectTrigger icon="Shield">
              <SelectValue placeholder="Seleccionar ambiente" />
            </SelectTrigger>
            <SelectContent>
              {ambienteOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sistema Operativo */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Sistema Operativo <span className={styles.required}>*</span>
          </label>
          <Select 
            value={formData.sistemaOperativo} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, sistemaOperativo: value }))}
            disabled={readonly}
          >
            <SelectTrigger icon="Terminal">
              <SelectValue placeholder="Seleccionar sistema operativo" />
            </SelectTrigger>
            <SelectContent>
              {sistemaOperativoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dirección IP */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Dirección IP <span className={styles.required}>*</span>
          </label>
          <Input
            type="text"
            placeholder="Ej: 192.168.1.100"
            value={formData.ip}
            onChange={(e) => setFormData(prev => ({ ...prev, ip: e.target.value }))}
            className={errors.ip ? styles.inputError : ''}
            maxLength={45}
            disabled={readonly}
            icon="Globe"
          />
          {errors.ip && <span className={styles.errorText}>{errors.ip}</span>}
        </div>

        {/* Estado */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Estado <span className={styles.required}>*</span>
          </label>
          <Select 
            value={formData.estado.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, estado: parseInt(value) as EstadoServidor }))}
            disabled={readonly}
          >
            <SelectTrigger icon="Activity">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {estadoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className={styles.formFooter}>
        {readonly ? (
          // Solo mostrar botón Cerrar en modo readonly
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            <X size={16} />
            Cerrar
          </Button>
        ) : (
          // Mostrar botones normales en modo edición
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              <X size={16} />
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              backgroundColor="#414976"
              textColor="white"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              <Save size={16} />
              {isEditing ? 'Actualizar' : 'Crear'} Servidor
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default ServidorForm;