import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { TipoDocumento, DocumentFormData, DocumentFormErrors } from '../types';
import { aiBackendService } from '@/services/ai-backend.service';
import { AlertService } from '../../alerts';
import { Button } from '../../button';
import { Card } from '@/components/ui/card';

interface Step2Props {
  formData: DocumentFormData;
  errors: DocumentFormErrors;
  onDataChange: (data: Partial<DocumentFormData>) => void;
  onErrorChange: (errors: Partial<DocumentFormErrors>) => void;
  tiposDocumento: TipoDocumento[];
}

const Step2DatosDocumento: React.FC<Step2Props> = ({
  formData,
  errors,
  onDataChange,
  onErrorChange,
  tiposDocumento
}) => {
  const [aiLoading, setAiLoading] = useState(false);

  // Eliminado Xenova: ya no se usan pipelines ni embeddings locales

  const selectTipoByHeuristics = (contentText: string, tipos: TipoDocumento[]) => {
    const base = contentText.toLowerCase();
    let bestId: string | undefined;
    let bestScore = -Infinity;
    for (const t of tipos) {
      const name = String(t.nombre || '').toLowerCase();
      // Puntuación simple: matches directos + coincidencia por palabras
      const tokens = name.split(/[^a-záéíóúüñ]+/).filter(Boolean);
      let score = base.includes(name) ? 3 : 0;
      for (const w of tokens) {
        if (w.length >= 4 && base.includes(w)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestId = t.id;
      }
    }
    return bestId;
  };

  // Ya no se usa selección por embeddings; se mantiene heurístico simple como respaldo

  const generateTitle = (nombreArchivo: string, content: string, summary: string) => {
    let title = (summary || '').split(/[\.\!\?]/)[0] || summary || nombreArchivo || 'Documento';
    title = title.replace(/[:;,.]+$/, '').trim();
    if (title.length > 120) title = title.slice(0, 120);
    title = title
      .split(' ')
      .map(w => (w.length > 3 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
      .join(' ');
    return title;
  };

  const buildContentWindow = () => {
    const doc = formData.vectorizedDocument;
    const contenido = (doc?.contenido_texto || '').trim();
    // Tomar ventana representativa del contenido (inicio y fin)
    const maxChars = 20000;
    const head = contenido.slice(0, Math.min(contenido.length, Math.floor(maxChars / 2)));
    const tailStart = Math.max(0, contenido.length - Math.floor(maxChars / 2));
    const tail = contenido.slice(tailStart);
    return `${head}\n\n[...]\n\n${tail}`.slice(0, maxChars);
  };

  const fallbackObjective = (text: string): string => {
    const clean = String(text || '').replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    let out = clean.slice(0, 250);
    const cut = out.lastIndexOf(' ');
    if (cut > 180) out = out.slice(0, cut);
    return out;
  };

  // Ya no se usa parseo de JSON porque trabajamos localmente

  const handleAutoFillWithAI = async () => {
    try {
      if (!formData.vectorizedDocument?.contenido_texto) {
        AlertService.error('Primero procesa el archivo en el Paso 1');
        return;
      }
      setAiLoading(true);
      const doc = formData.vectorizedDocument;
      const contenido = (doc?.contenido_texto || '').trim();
      const nombreArchivo = doc?.metadata?.nombre_documento || '';
      const ventana = buildContentWindow();

      // Intento principal: llamar al backend (Anthropic)
      try {
        const tiposDisponibles = tiposDocumento.map((t) => t.nombre);
        const resp = await aiBackendService.autocompletarStep2({
          contenido: ventana,
          tiposDisponibles,
          idioma: 'es',
        });

        if (resp?.success && resp?.data) {
          const r = resp.data;
          // Mapear nombre de tipo -> id
          const tipoByName = tiposDocumento.find(
            (t) => String(t.nombre).toLowerCase() === String(r.tipo || '').toLowerCase()
          );
          const updates: Partial<DocumentFormData> = {
            titulo: r.titulo || nombreArchivo || formData.titulo,
            objetivo: r.objetivo || formData.objetivo,
            tipo: tipoByName?.id || formData.tipo,
          };

          if (!updates.tipo) {
            // Fallback ligero si el nombre no coincide
            updates.tipo = selectTipoByHeuristics(contenido, tiposDocumento);
          }

          onDataChange(updates);
          AlertService.success('Paso 2 completado con IA');
          return;
        }
      } catch (err) {
        console.warn('Fallo IA backend, aplicando respaldo local sin Xenova:', err);
      }
      // Respaldo local SIN Xenova: usar heurísticas simples sobre el contenido
      const objetivo = fallbackObjective(ventana);
      const titulo = generateTitle(nombreArchivo, contenido, ventana);
      const tipoSeleccionadoId = selectTipoByHeuristics(contenido, tiposDocumento);

      const updates: Partial<DocumentFormData> = {};
      if (titulo) updates.titulo = titulo;
      if (tipoSeleccionadoId) updates.tipo = tipoSeleccionadoId;
      if (objetivo) updates.objetivo = objetivo;

      if (Object.keys(updates).length === 0) {
        throw new Error('No se pudieron derivar campos del contenido');
      }

      onDataChange(updates);
      AlertService.success('Paso 2 completado con respaldo local');
    } catch (err: any) {
      console.error('AI autofill error:', err);
      AlertService.error(err?.message || 'No se pudo completar con IA');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-3 border-0 shadow-none rounded-xl flex items-center justify-between gap-3 bg-transparent">
        <div>
          <span className="text-sm text-gray-600">Completa automáticamente título, tipo y objetivos según el contenido.</span>
        </div>
        <Button
          variant="primary"
          size="s"
          iconName="Sparkles"
          iconPosition="left"
          loading={aiLoading}
          onClick={handleAutoFillWithAI}
        >
          Autocompletar con IA
        </Button>
      </Card>

      <Card className="p-4 border-0 shadow-none rounded-xl bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Titulo *</label>
            <input
              type="text"
              className="w-full rounded-lg px-3 py-2 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none border-transparent bg-white/90 dark:bg-gray-800/70"
              placeholder="Ej. Política de Seguridad de la Información"
              value={formData.titulo || ''}
              onChange={(e) => onDataChange({ titulo: e.target.value })}
            />
            {errors.titulo && (
              <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.titulo}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              className="w-full rounded-lg px-3 py-2 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none border-transparent bg-white/90 dark:bg-gray-800/70"
              value={formData.tipo || ''}
              onChange={(e) => onDataChange({ tipo: e.target.value })}
            >
              <option value="">Seleccione un tipo</option>
              {tiposDocumento.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            {errors.tipo && (
              <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.tipo}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 border-0 shadow-none rounded-xl bg-transparent">
        <label className="block text-sm font-medium mb-1">Objetivo</label>
        <textarea
          className="w-full rounded-lg px-3 py-2 min-h-[120px] ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none border-transparent bg-white/90 dark:bg-gray-800/70"
          placeholder="Describe el objetivo del documento (máx. 250 caracteres, un párrafo)"
          value={formData.objetivo || ''}
          maxLength={250}
          onChange={(e) => onDataChange({ objetivo: e.target.value.replace(/[\r\n]+/g, ' ') })}
          onBlur={(e) => onDataChange({ objetivo: e.target.value.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim() })}
        />
        {errors.objetivo && (
          <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={16} />
            {errors.objetivo}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Step2DatosDocumento;