import React, { useMemo, useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode, FORMAT_TEXT_COMMAND, $isRangeSelection, FORMAT_ELEMENT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, UNDO_COMMAND, REDO_COMMAND, PASTE_COMMAND, COMMAND_PRIORITY_LOW, $isTextNode } from 'lexical';
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode, $createCodeNode } from '@lexical/code';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { $createTableNode, $createTableRowNode, $createTableCellNode } from '@lexical/table';
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List as ListIcon, ListOrdered, Quote as QuoteIcon, Code as CodeIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LinkIcon, Undo as UndoIcon, Redo as RedoIcon, Indent as IndentIcon, Outdent as OutdentIcon } from 'lucide-react';
import './lexical-editor.css';

interface LexicalEditorProps {
  initialText?: string;
  onChange?: (plainText: string) => void;
  className?: string;
  minHeight?: number | string;
}

export const LexicalEditor: React.FC<LexicalEditorProps> = ({ initialText = '', onChange, className = '', minHeight = 280 }) => {
  const [stats, setStats] = useState({ words: 0, chars: 0, paragraphs: 0 });
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(true);
  const [customDict, setCustomDict] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lexical.customDict');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const fonts = ['Inter', 'Arial', 'Times New Roman', 'Georgia', 'Roboto', 'Montserrat'];
  const fontSizes = ['12px', '14px', '16px', '18px', '24px', '32px'];

  const theme = useMemo(() => ({
    paragraph: 'lex-p',
    quote: 'lex-quote',
    heading: {
      h1: 'lex-h1',
      h2: 'lex-h2',
      h3: 'lex-h3'
    },
    text: {
      bold: 'lex-bold',
      italic: 'lex-italic',
      underline: 'lex-underline'
    }
  }), []);

  const initialEditorState = (editor: any) => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const lines = (initialText || '').split('\n');
      for (const line of lines) {
        const p = $createParagraphNode();
        p.append($createTextNode(line));
        root.append(p);
      }
    });
  };

  const onChangeHandler = (editorState: any, editor: any) => {
    if (!onChange) return;
    editorState.read(() => {
      const text = $getRoot().getTextContent();
      onChange(text);
      // Actualizar estadísticas
      const words = text.trim().length ? (text.trim().match(/\S+/g) || []).length : 0;
      const paragraphs = (text.split('\n').filter(l => l.trim().length > 0)).length;
      setStats({ words, chars: text.length, paragraphs });
    });
  };

  const onError = (error: Error) => {
    console.error('Lexical error:', error);
  };

  const composerConfig = useMemo(() => ({
    namespace: 'DocumentLexicalEditor',
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode, TableNode, TableRowNode, TableCellNode],
    editorState: initialEditorState
  }), [theme]);

  return (
    <div className={`lexical-editor ${className}`} style={{ minHeight }}>
      <LexicalComposer initialConfig={composerConfig as any}>
        <Toolbar fonts={fonts} fontSizes={fontSizes} />

        <RichTextPlugin
          contentEditable={<ContentEditable className="lex-content" spellCheck={spellCheckEnabled} />}
          placeholder={<div className="lex-placeholder">Escribe o edita el contenido aquí…</div>}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TablePlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <PasteCleanerPlugin />
        <OnChangePlugin onChange={onChangeHandler} />

        <StatusBar stats={stats} />
        <SpellcheckPanel spellCheckEnabled={spellCheckEnabled} setSpellCheckEnabled={setSpellCheckEnabled} customDict={customDict} setCustomDict={setCustomDict} />
      </LexicalComposer>
    </div>
  );
};

const Toolbar: React.FC<{ fonts: string[]; fontSizes: string[] }> = ({ fonts, fontSizes }) => {
  const [editor] = useLexicalComposerContext();
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCount, setMatchCount] = useState<number>(0);
  const [font, setFont] = useState<string>('Inter');
  const [fontSize, setFontSize] = useState<string>('16px');

  const applyStyleToSelection = (styleMap: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const nodes = selection.getNodes();
      nodes.forEach((node: any) => {
        if ($isTextNode(node)) {
          const prevStyle: string = node.getStyle();
          const styleObj: Record<string, string> = {};
          prevStyle.split(';').map(s => s.trim()).filter(Boolean).forEach(pair => {
            const [k, v] = pair.split(':');
            if (k && v) styleObj[k.trim()] = v.trim();
          });
          Object.entries(styleMap).forEach(([k, v]) => {
            styleObj[k] = v;
          });
          const newStyle = Object.entries(styleObj).map(([k, v]) => `${k}: ${v}`).join('; ');
          node.setStyle(newStyle);
        }
      });
    });
  };

  const insertTable = (rows = 3, cols = 3) => {
    editor.update(() => {
      const table = $createTableNode(rows);
      for (let r = 0; r < rows; r++) {
        const row = $createTableRowNode();
        for (let c = 0; c < cols; c++) {
          const cell = $createTableCellNode();
          const p = $createParagraphNode();
          p.append($createTextNode(''));
          cell.append(p);
          row.append(cell);
        }
        table.append(row);
      }
      const root = $getRoot();
      root.append(table);
    });
  };

  const handleFindCount = () => {
    editor.getEditorState().read(() => {
      const text = $getRoot().getTextContent();
      if (!findText) { setMatchCount(0); return; }
      const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(re);
      setMatchCount(matches ? matches.length : 0);
    });
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    editor.update(() => {
      const root = $getRoot();
      const selection = $getSelection();
      const allNodes = root.getChildren();
      const replaceInNode = (node: any) => {
        if ($isTextNode(node)) {
          const txt = node.getTextContent();
          if (!txt) return;
          const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          const newTxt = txt.replace(re, replaceText);
          if (newTxt !== txt) node.setTextContent(newTxt);
        } else if (node.getChildren) {
          node.getChildren().forEach(replaceInNode);
        }
      };
      allNodes.forEach(replaceInNode);
    });
    handleFindCount();
  };

  const exportHTML = () => {
    const el = document.querySelector('.lex-content') as HTMLElement | null;
    const inner = el?.innerHTML || '';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Documento</title></head><body>${inner}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'documento.html');
  };

  const exportDOCX = () => {
    const el = document.querySelector('.lex-content') as HTMLElement | null;
    const inner = el?.innerHTML || '';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Documento</title></head><body>${inner}</body></html>`;
    // Fallback Word-compatible export usando HTML (abre en Word como .doc)
    const blob = new Blob([html], { type: 'application/msword' });
    downloadBlob(blob, 'documento.doc');
  };

  const exportPDF = () => {
    const el = document.querySelector('.lex-content') as HTMLElement | null;
    const inner = el?.innerHTML || '';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Documento</title></head><body>${inner}</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  return (
    <div className="lex-toolbar">
      {/* Fuente y tamaño */}
      <select className="lex-select" value={font} onChange={(e) => { const f = e.target.value; setFont(f); applyStyleToSelection({ 'font-family': f }); }} title="Fuente">
        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <select className="lex-select" value={fontSize} onChange={(e) => { const s = e.target.value; setFontSize(s); applyStyleToSelection({ 'font-size': s }); }} title="Tamaño">
        {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <span className="lex-divider" />

      {/* Undo/Redo */}
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Deshacer">
        <UndoIcon size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Rehacer">
        <RedoIcon size={16} />
      </button>
      <span className="lex-divider" />

      {/* Text format */}
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} title="Negrita">
        <Bold size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} title="Cursiva">
        <Italic size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} title="Subrayado">
        <Underline size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} title="Tachado">
        <Strikethrough size={16} />
      </button>
      <span className="lex-divider" />

      {/* Headings */}
      <button type="button" className="lex-btn" onClick={() => editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { const h1 = $createHeadingNode('h1'); selection.insertNodes([h1]); } })} title="Encabezado H1">
        <Heading1 size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { const h2 = $createHeadingNode('h2'); selection.insertNodes([h2]); } })} title="Encabezado H2">
        <Heading2 size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { const h3 = $createHeadingNode('h3'); selection.insertNodes([h3]); } })} title="Encabezado H3">
        <Heading3 size={16} />
      </button>
      <span className="lex-divider" />

      {/* Lists */}
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Lista con viñetas">
        <ListIcon size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Lista numerada">
        <ListOrdered size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)} title="Quitar lista">
        <ListIcon size={16} />
      </button>
      <span className="lex-divider" />

      {/* Tabla */}
      <button type="button" className="lex-btn" onClick={() => insertTable(3, 3)} title="Insertar tabla 3x3">
        🧱
      </button>
      <span className="lex-divider" />

      {/* Alignment */}
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start')} title="Alinear a la izquierda">
        <AlignLeft size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Centrar">
        <AlignCenter size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end')} title="Alinear a la derecha">
        <AlignRight size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} title="Justificar">
        <AlignJustify size={16} />
      </button>
      <span className="lex-divider" />

      {/* Indent / Outdent */}
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} title="Aumentar sangría">
        <IndentIcon size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} title="Disminuir sangría">
        <OutdentIcon size={16} />
      </button>
      <span className="lex-divider" />

      {/* Quote & Code block */}
      <button type="button" className="lex-btn" onClick={() => editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { const quote = $createQuoteNode(); selection.insertNodes([quote]); } })} title="Cita">
        <QuoteIcon size={16} />
      </button>
      <button type="button" className="lex-btn" onClick={() => editor.update(() => { const selection = $getSelection(); if ($isRangeSelection(selection)) { const code = $createCodeNode(); selection.insertNodes([code]); } })} title="Bloque de código">
        <CodeIcon size={16} />
      </button>
      <span className="lex-divider" />

      {/* Link */}
      <button
        type="button"
        className="lex-btn"
        onClick={() => {
          const url = (window.prompt('URL del enlace:') || '').trim();
          if (!url) { editor.dispatchCommand(TOGGLE_LINK_COMMAND, null); return; }
          try {
            const valid = /^(https?:\/\/|mailto:|tel:)/i.test(url);
            if (!valid) { alert('URL inválida. Debe iniciar con http(s), mailto o tel.'); return; }
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
            const targetBlank = (window.prompt('Abrir en nueva pestaña? (si/no)') || 'si').toLowerCase().startsWith('s');
            const relVal = (window.prompt('Valor rel (por defecto: noopener)') || 'noopener').trim();
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.getNodes().forEach((node: any) => {
                  if ($isLinkNode(node)) {
                    node.setTarget(targetBlank ? '_blank' : '_self');
                    node.setRel(relVal || 'noopener');
                  }
                });
              }
            });
          } catch {
            alert('No se pudo insertar el enlace.');
          }
        }}
        title="Insertar/editar enlace"
      >
        <LinkIcon size={16} />
      </button>

      <span className="lex-divider" />

      {/* Buscar/Reemplazar */}
      <input className="lex-input" placeholder="Buscar" value={findText} onChange={(e) => setFindText(e.target.value)} />
      <input className="lex-input" placeholder="Reemplazar" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />
      <button type="button" className="lex-btn" onClick={handleFindCount} title="Contar coincidencias">{matchCount}</button>
      <button type="button" className="lex-btn" onClick={handleReplaceAll} title="Reemplazar todo">Reemplazar</button>

      <span className="lex-divider" />

      {/* Exportar */}
      <button type="button" className="lex-btn" onClick={exportHTML} title="Exportar HTML">HTML</button>
      <button type="button" className="lex-btn" onClick={exportDOCX} title="Exportar DOCX">DOCX</button>
      <button type="button" className="lex-btn" onClick={exportPDF} title="Exportar PDF">PDF</button>
    </div>
  );
};

const PasteCleanerPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const html = event.clipboardData?.getData('text/html') || '';
        if (html && /(class=\"?Mso|mso-)/i.test(html)) {
          event.preventDefault();
          const text = event.clipboardData?.getData('text/plain') || '';
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertText(text);
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return null;
};

const StatusBar: React.FC<{ stats: { words: number; chars: number; paragraphs: number } }> = ({ stats }) => {
  return (
    <div className="lex-statusbar">
      <span>Palabras: {stats.words}</span>
      <span>Caracteres: {stats.chars}</span>
      <span>Párrafos: {stats.paragraphs}</span>
    </div>
  );
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const SpellcheckPanel: React.FC<{ spellCheckEnabled: boolean; setSpellCheckEnabled: (v: boolean) => void; customDict: string[]; setCustomDict: (v: string[]) => void; }> = ({ spellCheckEnabled, setSpellCheckEnabled, customDict, setCustomDict }) => {
  const [editor] = useLexicalComposerContext();
  const [unknownCount, setUnknownCount] = useState<number>(0);
  const [newWord, setNewWord] = useState<string>('');

  useEffect(() => {
    const updateCount = () => {
      editor.getEditorState().read(() => {
        const text = $getRoot().getTextContent();
        const words = (text.match(/[\p{L}’']+/gu) || []).map(w => w.toLowerCase());
        const dictSet = new Set(customDict.map(w => w.toLowerCase()));
        const unknown = words.filter(w => !dictSet.has(w));
        setUnknownCount(unknown.length);
      });
    };
    const unregister = editor.registerUpdateListener(() => updateCount());
    updateCount();
    return () => unregister();
  }, [editor, customDict]);

  const addWord = () => {
    const w = newWord.trim();
    if (!w) return;
    const next = Array.from(new Set([...customDict, w]));
    setCustomDict(next);
    try { localStorage.setItem('lexical.customDict', JSON.stringify(next)); } catch {}
    setNewWord('');
  };

  const handleUploadDict = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const next = Array.from(new Set([...customDict, ...lines]));
    setCustomDict(next);
    try { localStorage.setItem('lexical.customDict', JSON.stringify(next)); } catch {}
    e.target.value = '';
  };

  const clearDict = () => {
    setCustomDict([]);
    try { localStorage.removeItem('lexical.customDict'); } catch {}
  };

  return (
    <div className="lex-spellpanel">
      <label className="lex-spell-toggle">
        <input type="checkbox" checked={spellCheckEnabled} onChange={(e) => setSpellCheckEnabled(e.target.checked)} />
        Ortografía del navegador
      </label>
      <span className="lex-divider" />
      <span>No reconocidas: {unknownCount}</span>
      <span className="lex-divider" />
      <input className="lex-input" placeholder="Añadir palabra" value={newWord} onChange={(e) => setNewWord(e.target.value)} />
      <button className="lex-btn" type="button" onClick={addWord}>Añadir</button>
      <span className="lex-divider" />
      <label className="lex-btn" style={{ cursor: 'pointer' }}>
        Cargar diccionario
        <input type="file" accept=".txt" onChange={handleUploadDict} style={{ display: 'none' }} />
      </label>
      <button className="lex-btn" type="button" onClick={clearDict}>Limpiar diccionario</button>
    </div>
  );
};

export default LexicalEditor;