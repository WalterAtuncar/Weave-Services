import React, { useState } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Textarea } from '../../../ui/textarea';
import { Bot, FileUp, Database, GitBranch, ChevronRight, Plus } from 'lucide-react';
import { Input } from '../../../ui/input';
import { FileDropzone } from '../../../ui/file-upload';
import RelatedEntitiesManager from '../../../ui/related-entities/RelatedEntitiesManager';
import type { RelatedEntitiesMap } from '../../../ui/related-entities/types';
import { ENTIDADES_BY_TIPO_MOCK } from '../../../ui/related-entities/mock';
import { useTiposEntidad } from '../../../../hooks/useTiposEntidad';

export interface DescribeProcesoStepTabsProps {
  descripcion: string;
  onDescripcionChange: (value: string) => void;
  onGenerarProceso?: () => void;
  onAsistenteIA?: () => void;
  onDesdeArchivo?: () => void;
  onUsarDatosProceso?: () => void;
  nombre?: string;
  onNombreChange?: (value: string) => void;
  onImportFromFile?: (file: File | null) => void;
  entidadesRelacionadas?: RelatedEntitiesMap;
  onEntidadesRelacionadasChange?: (next: RelatedEntitiesMap) => void;
}

export const DescribeProcesoStepTabs: React.FC<DescribeProcesoStepTabsProps> = ({
  descripcion,
  onDescripcionChange,
  onGenerarProceso,
  onAsistenteIA,
  onDesdeArchivo,
  onUsarDatosProceso,
  nombre,
  onNombreChange,
  onImportFromFile,
  entidadesRelacionadas,
  onEntidadesRelacionadasChange
}) => {
  const { colors } = useTheme();
  const maxChars = 1200;
  const charsLeft = Math.max(0, maxChars - (descripcion?.length || 0));
  const [activeTab, setActiveTab] = useState<'ia' | 'archivo' | 'datos'>('ia');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { tipos: tiposEntidad, loading: loadingTipos } = useTiposEntidad();

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Columna izquierda */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Button
            variant={activeTab === 'ia' ? 'primary' : 'secondary'}
            size="sm"
            iconLeft={<Bot size={16} />}
            onClick={() => { setActiveTab('ia'); onAsistenteIA?.(); }}
          >
            Con Asistente IA
          </Button>
          <Button
            variant={activeTab === 'archivo' ? 'primary' : 'secondary'}
            size="sm"
            iconLeft={<FileUp size={16} />}
            onClick={() => { setActiveTab('archivo'); onDesdeArchivo?.(); }}
          >
            Desde archivo
          </Button>
          <Button
            variant={activeTab === 'datos' ? 'primary' : 'secondary'}
            size="sm"
            iconLeft={<Database size={16} />}
            onClick={() => { setActiveTab('datos'); }}
          >
            Datos del proceso
          </Button>
        </div>

        {activeTab === 'ia' && (
          <>
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
          </>
        )}

        {activeTab === 'archivo' && (
          <>
            <div style={{ marginBottom: 8, fontSize: 13, color: colors.textSecondary }}>Archivo a importar</div>
            <FileDropzone
              accept={[ '.xlsx', '.xls', '.csv', '.json' ]}
              onFileSelected={(f) => { setSelectedFile(f); onImportFromFile?.(f); }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>
              Formatos aceptados: <b>.json</b>, <b>.xls</b>, <b>.xlsx</b>
            </div>
          </>
        )}

        {activeTab === 'datos' && (
          <>
            <Input
              label="Nombre"
              value={nombre || ''}
              onChange={(e) => onNombreChange?.(e.target.value)}
              placeholder="Ej.: Cotización a través de e-mail"
            />
            <Textarea
              label="Resumen del Proceso"
              value={descripcion}
              onChange={(e) => onDescripcionChange(e.target.value)}
              placeholder="Describe brevemente cómo inicia, pasos clave y cierre del proceso"
              autoResize
              minHeight={160}
            />
            <div style={{ marginTop: 12 }}>
              <RelatedEntitiesManager
                initial={entidadesRelacionadas || {}}
                tipos={loadingTipos ? [] : tiposEntidad}
                entidades={ENTIDADES_BY_TIPO_MOCK}
                onChange={(next) => onEntidadesRelacionadasChange?.(next)}
                title="Entidades Relacionadas"
                description="Relaciona documentos, posiciones u otras entidades con el proceso"
              />
            </div>
          </>
        )}
      </div>

      {/* Columna derecha */}
      <div style={{ width: '340px', minWidth: '300px' }}>
        {activeTab === 'ia' && (
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
        )}

        {activeTab === 'archivo' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <GitBranch size={18} /> Importar Proceso
                </span>
              </CardTitle>
              <CardDescription>
                Se importará y se generará la información del proceso a partir del
                archivo seleccionado. Se reemplazará la información previa si hubiera.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                Selecciona un archivo válido a la izquierda y pulsa “Importar”.
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary" onClick={() => onImportFromFile?.(selectedFile)}>
                Importar
              </Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === 'datos' && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <GitBranch size={18} /> Usar datos del proceso
                </span>
              </CardTitle>
              <CardDescription>
                Se rellenará la información del proceso usando los datos introducidos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                Completa el nombre y resumen a la izquierda y pulsa “Usar”.
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="primary" onClick={onUsarDatosProceso}>
                Usar estos datos
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DescribeProcesoStepTabs;