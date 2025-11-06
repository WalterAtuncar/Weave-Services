import React from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Textarea } from '../../../ui/textarea/textarea';
import { Bot, FileUp, Database, GitBranch } from 'lucide-react';

export interface DescribeProcesoStepProps {
  descripcion: string;
  onDescripcionChange: (value: string) => void;
  onGenerarProceso?: () => void;
  onAsistenteIA?: () => void;
  onDesdeArchivo?: () => void;
  onUsarDatosProceso?: () => void;
}

export const DescribeProcesoStep: React.FC<DescribeProcesoStepProps> = ({
  descripcion,
  onDescripcionChange,
  onGenerarProceso,
  onAsistenteIA,
  onDesdeArchivo,
  onUsarDatosProceso
}) => {
  const { colors } = useTheme();
  const maxChars = 1200;
  const charsLeft = Math.max(0, maxChars - (descripcion?.length || 0));

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Columna izquierda */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Button variant="secondary" size="sm" iconLeft={<Bot size={16} />} onClick={onAsistenteIA}>
            Con Asistente IA
          </Button>
          <Button variant="secondary" size="sm" iconLeft={<FileUp size={16} />} onClick={onDesdeArchivo}>
            Desde archivo
          </Button>
          <Button variant="secondary" size="sm" iconLeft={<Database size={16} />} onClick={onUsarDatosProceso}>
            Datos del proceso
          </Button>
        </div>

        <Textarea
          label="Describe el proceso"
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          placeholder="Ej.: El proceso de cotización inicia con la solicitud del cliente..."
          showCounter
          maxLength={maxChars}
          autoResize
          minHeight={220}
          icon="MessageSquareText"
        />

        <div style={{ marginTop: '6px', fontSize: '12px', color: colors.textSecondary }}>
          Quedan {charsLeft} caracteres
        </div>
      </div>

      {/* Columna derecha */}
      <div style={{ width: '340px', minWidth: '300px' }}>
        <Card>
          <CardHeader>
            <CardTitle>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <GitBranch size={18} /> Generar Proceso
              </span>
            </CardTitle>
            <CardDescription>
              Se generará la información del proceso a partir de la descripción
              y se reemplazará la propuesta previa si hubiera.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                Usa tu texto en el área de la izquierda y pulsa “Generar”.
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" onClick={onGenerarProceso}>
              Generar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DescribeProcesoStep;