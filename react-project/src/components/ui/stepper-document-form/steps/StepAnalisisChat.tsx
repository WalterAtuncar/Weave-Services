import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAI } from '@/ai';
import { Bot, Loader2, MessageCircle, Send, Sparkles } from 'lucide-react';

interface Props {
  extractedText?: string;
}

const StepAnalisisChat: React.FC<Props> = ({ extractedText }) => {
  const { buildIndex, ask, isBusy, lastError } = useAI();

  const [indexId, setIndexId] = useState<string | null>(null);
  const [indexStats, setIndexStats] = useState<{ chunks: number; ms: number } | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);

  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState('');
  const [context, setContext] = useState<Array<{ index: number; score: number; text: string }>>([]);
  const [qaError, setQaError] = useState<string | null>(null);

  // Construir índice cuando hay texto extraído
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIndexId(null);
      setIndexStats(null);
      setAnswer('');
      setContext([]);
      setQaError(null);

      const text = (extractedText || '').trim();
      if (!text || text.length < 50) return;
      try {
        setIsIndexing(true);
        const res = await buildIndex(text, { chunkSize: 900, overlap: 120 });
        if (cancelled) return;
        setIndexId(res.id);
        setIndexStats({ chunks: res.chunks, ms: res.milliseconds });
      } catch (e: any) {
        if (cancelled) return;
        console.error('[StepAnalisisChat] Error construyendo índice', e);
        setQaError(e?.message || 'No se pudo preparar el análisis');
      } finally {
        if (!cancelled) setIsIndexing(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [extractedText, buildIndex]);

  const canAsk = useMemo(() => !!indexId && !!question.trim() && !isAsking, [indexId, question, isAsking]);

  const handleAsk = async (q?: string) => {
    const query = (q ?? question).trim();
    if (!indexId || !query) return;
    setQaError(null);
    setIsAsking(true);
    try {
      const res = await ask(indexId, query, { topK: 4, useExtractiveQA: true });
      setAnswer(res.answer || '');
      setContext(res.context || []);
    } catch (e: any) {
      console.error('[StepAnalisisChat] Error respondiendo pregunta', e);
      setQaError(e?.message || 'Error respondiendo la pregunta');
    } finally {
      setIsAsking(false);
    }
  };

  const quickPrompts: string[] = [
    'Resume los puntos clave del documento',
    '¿Cuál es el objetivo principal y su alcance?',
    'Enumera las responsabilidades más importantes',
    '¿Qué procesos o áreas impacta este documento?',
    'Identifica riesgos o consideraciones relevantes',
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center"><Bot size={18} /></div>
          <div>
            <h3 className="m-0 text-base font-semibold">Análisis asistido por IA</h3>
            <p className="m-0 text-sm text-gray-600">Haz preguntas sobre el documento y obtén respuestas contextualizadas.</p>
          </div>
        </div>

        {!extractedText && (
          <div className="text-sm text-gray-600">Sube un PDF en el Paso 1 para habilitar el análisis.</div>
        )}

        {extractedText && (
          <div className="text-xs text-gray-600 mt-2">
            {isIndexing && <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Preparando el documento para preguntas…</div>}
            {!isIndexing && indexId && (
              <div>Índice listo • {indexStats?.chunks ?? 0} fragmentos • {indexStats?.ms ?? 0}ms</div>
            )}
            {!isIndexing && !indexId && !lastError && (
              <div className="text-gray-400">El documento es muy corto o no se pudo indexar.</div>
            )}
            {lastError && <div className="text-red-600 mt-1">{lastError}</div>}
          </div>
        )}
      </div>

      {/* Sugerencias rápidas */}
      {indexId && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-700"><Sparkles size={16} /> Preguntas sugeridas</div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-50"
                onClick={() => handleAsk(p)}
              >{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Chat QA simple */}
      <div className="p-4 border rounded-lg">
        <label className="block text-sm font-medium mb-2">Pregunta</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Escribe tu pregunta sobre el documento"
            value={question}
            disabled={!indexId}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && canAsk) handleAsk(); }}
          />
          <button
            type="button"
            className="px-4 py-2 rounded text-white bg-indigo-600 disabled:opacity-50 flex items-center gap-2"
            disabled={!canAsk}
            onClick={() => handleAsk()}
          >
            {isAsking ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            <span>Preguntar</span>
          </button>
        </div>
        {qaError && (
          <div className="mt-2 text-sm text-red-600">{qaError}</div>
        )}
      </div>

      {/* Respuesta */}
      {answer && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-indigo-700"><MessageCircle size={18} /> Respuesta</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>

          {Array.isArray(context) && context.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-700">Ver fragmentos de contexto ({context.length})</summary>
              <div className="mt-2 space-y-2">
                {context.map((c, idx) => (
                  <blockquote key={idx} className="text-xs text-gray-700 border-l-2 pl-3">
                    {c.text}
                    <div className="mt-1 opacity-60"># {c.index} • score {c.score.toFixed(2)}</div>
                  </blockquote>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default StepAnalisisChat;