import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";
import path from "path";
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import type { IncomingMessage, ServerResponse } from 'http';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'anthropic-endpoints',
      configureServer(server) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        dotenv.config({ path: path.resolve(__dirname, './.env') });

        const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
        const client = apiKey ? new Anthropic({ apiKey }) : null;

        server.middlewares.use(bodyParser.json({ limit: '10mb' }));

        const setCors = (res: any) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
          res.setHeader(
            'Access-Control-Allow-Headers',
            [
              'Content-Type',
              'Authorization',
              'X-Api-Key',
              'x-api-key',
              'anthropic-version',
              'anthropic-dangerous-direct-browser-access',
            ].join(', ')
          );
          res.setHeader('Access-Control-Max-Age', '86400');
        };

        server.middlewares.use((req: any, res: any, next: any) => {
          const url = req.url || '';
          if (!url.startsWith('/api/claude')) return next();

          // Preflight
          if (req.method === 'OPTIONS') {
            setCors(res);
            res.statusCode = 204;
            res.end('');
            return;
          }

          if (url.startsWith('/api/claude/health')) {
            setCors(res);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, apiKeyConfigured: Boolean(apiKey) }));
            return;
          }

          if (url.startsWith('/api/claude/messages')) {
            (async () => {
              try {
                if (!client) {
                  setCors(res);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'CLAUDE_API_KEY no configurado', detail: 'Agrega CLAUDE_API_KEY al .env y reinicia dev server.' }));
                  return;
                }

                const { messages, system, model = 'claude-sonnet-4-0', maxTokens = 1024 } = req.body || {};
                if (!Array.isArray(messages) || messages.length === 0) {
                  setCors(res);
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'messages es requerido y debe ser un arreglo' }));
                  return;
                }

                let response;
                try {
                  response = await client.messages.create({
                    model,
                    max_tokens: maxTokens,
                    system,
                    messages: messages.map((m: any) => ({ role: m.role, content: [{ type: 'text', text: String(m.content || '') }] }))
                  });
                } catch (err: any) {
                  const fallbackModel = 'claude-3-7-sonnet-20250219';
                  response = await client.messages.create({
                    model: fallbackModel,
                    max_tokens: maxTokens,
                    system,
                    messages: messages.map((m: any) => ({ role: m.role, content: [{ type: 'text', text: String(m.content || '') }] }))
                  });
                }

                const first = response?.content?.[0];
                const text = first && first.type === 'text' ? first.text : '';
                setCors(res);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text, raw: response }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Error procesando solicitud', detail: err?.message || String(err) }));
              }
            })();
            return;
          }

          if (url.startsWith('/api/claude/ask-pdf')) {
            (async () => {
              try {
                if (!client) {
                  setCors(res);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'CLAUDE_API_KEY no configurado', detail: 'Agrega CLAUDE_API_KEY al .env y reinicia dev server.' }));
                  return;
                }

                const { pdfBase64, question, model = 'claude-sonnet-4-0', maxTokens = 1024, system } = req.body || {};
                if (!pdfBase64 || !question) {
                  setCors(res);
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Se requieren pdfBase64 y question' }));
                  return;
                }

                const base64 = String(pdfBase64).replace(/^data:application\/pdf;base64,/, '');
                const buffer = Buffer.from(base64, 'base64');
                // pdfjs-dist v5 requiere Uint8Array explícito, no Buffer
                const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                // Polyfill DOMMatrix en entorno Node para pdfjs-dist
                try {
                  const dm = await import('dommatrix');
                  const DOMMatrixPoly: any = (dm as any).DOMMatrix || (dm as any).default || dm;
                  if (!(globalThis as any).DOMMatrix) {
                    (globalThis as any).DOMMatrix = DOMMatrixPoly;
                  }
                } catch {}
                const pdfjsLib = await import('pdfjs-dist');
                const loadingTask = pdfjsLib.getDocument({ data: uint8, disableWorker: true });
                const pdfDoc = await loadingTask.promise;
                let text = '';
                for (let i = 1; i <= pdfDoc.numPages; i++) {
                  const page = await pdfDoc.getPage(i);
                  const content: any = await page.getTextContent();
                  const pageText = (content.items || []).map((it: any) => (typeof it.str !== 'undefined' ? it.str : '')).join(' ');
                  text += pageText + '\n';
                }
                text = text.replace(/\s+/g, ' ').trim();
                if (!text) {
                  setCors(res);
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'No se pudo extraer texto del PDF' }));
                  return;
                }

                const chunkSize = 4000; // chars
                const chunks: string[] = [];
                for (let i = 0; i < text.length; i += chunkSize) chunks.push(text.slice(i, i + chunkSize));

                const keywords = String(question).toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
                const scored = chunks.map((c) => {
                  const lc = c.toLowerCase();
                  const score = keywords.reduce((acc, k) => acc + (lc.includes(k) ? 1 : 0), 0);
                  return { c, score };
                }).sort((a, b) => b.score - a.score);
                const topExcerpts = scored.slice(0, Math.min(5, scored.length)).map(s => s.c);

                const retrievalSystem = (system || 'Eres un asistente que responde en español con precisión y citas breves.') +
                  '\nUsa SOLO el siguiente contexto del documento si es relevante. Cita frases exactas. Si no está en el documento, dilo.';

                const messages = [
                  { role: 'user', content: `Contexto del documento (extractos relevantes):\n${topExcerpts.join('\n---\n')}` },
                  { role: 'user', content: question }
                ];

                let response;
                try {
                  response = await client.messages.create({
                    model,
                    max_tokens: maxTokens,
                    system: retrievalSystem,
                    messages: messages.map((m: any) => ({ role: m.role, content: [{ type: 'text', text: m.content }] }))
                  });
                } catch (err: any) {
                  const fallbackModel = 'claude-3-7-sonnet-20250219';
                  response = await client.messages.create({
                    model: fallbackModel,
                    max_tokens: maxTokens,
                    system: retrievalSystem,
                    messages: messages.map((m: any) => ({ role: m.role, content: [{ type: 'text', text: m.content }] }))
                  });
                }

                const first = response?.content?.[0];
                const answer = first && first.type === 'text' ? first.text : '';
                setCors(res);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text: answer, raw: response }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Error procesando PDF', detail: err?.message || String(err) }));
              }
            })();
            return;
          }

          next();
        });
      }
    }
  ],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@env": path.resolve(__dirname, "./src/environments")
    }
  },
  build: {
    // Configuración optimizada para producción
    minify: 'esbuild',
    target: 'esnext',
    
    rollupOptions: {
      output: {
        // Nombres de archivos con hash para mejor caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Optimizar chunks
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  
  // Variables de entorno por defecto
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'pdfjs-dist'],
    // Excluir librerías no ESM para evitar errores de bundling
    exclude: ['html-docx-js']
  },
  
  // Configuración para workers
  worker: {
    format: 'es'
  },
  
  // Configuración para preview
  preview: {
    port: 4173,
    host: true
  },
  
  server: {
    port: 5173,
    host: true,
    fs: { allow: ['..'] },
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    // Endpoints para Claude se montan vía plugin 'anthropic-endpoints'
  }
});