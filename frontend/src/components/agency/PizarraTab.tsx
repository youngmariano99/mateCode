import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Copy, Download, Eraser, Save, Check } from 'lucide-react';
import { insertarEtiquetaEnTexto } from '../../lib/prompts/constructorXml';
import { compilarConMotor, type MotorRenderizado } from '../../lib/prompts/ServicioDelimitadores';
import { extraerVariables, sustituirVariables } from '../../lib/prompts/motorVariables';
import { descargarComoMdc } from '../../lib/prompts/exportadorMdc';
import { MenuSlash, filtrarBloquesAtomicos, type BloqueAtomico } from './MenuSlash';
import { PanelVariables } from './PanelVariables';
import { normalizarNombreEtiqueta } from '../../lib/prompts/constructorXml';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTENIDO_INICIAL = `<system_context>
  Sos un experto en {{DOMINIO}}.
</system_context>

<imperativo_de_tarea>
  {{OBJETIVO}}
</imperativo_de_tarea>

<restricciones>

</restricciones>`;

const ETIQUETAS_RAPIDAS = [
  'system_context', 'imperativo_de_tarea', 'rol', 'contexto',
  'tarea', 'restricciones', 'formato_salida', 'ejemplos',
];

const BLOQUES_ATOMICOS_DEMO: BloqueAtomico[] = [
  { id: '1', nombre: 'Rol Experto', descripcion: 'Define el rol como experto del área', contenido: '<rol>\n  Sos un experto en {{AREA}} con 10 años de experiencia.\n</rol>' },
  { id: '2', nombre: 'Formato JSON', descripcion: 'Instruye respuesta en JSON estructurado', contenido: '<formato_salida>\n  Respondé ÚNICAMENTE con JSON válido, sin texto adicional.\n</formato_salida>' },
  { id: '3', nombre: 'Restricciones base', descripcion: 'Restricciones comunes de respuesta', contenido: '<restricciones>\n  - No inventes información.\n  - Sé conciso y directo.\n  - Usá español neutro.\n</restricciones>' },
];

interface EstadoSlash {
  readonly abierto: boolean;
  readonly inicio: number;
  readonly query: string;
  readonly indice: number;
}

const SLASH_CERRADO: EstadoSlash = { abierto: false, inicio: -1, query: '', indice: 0 };

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PropsPizarraTab {
  readonly titulo?: string;
  readonly onGuardar: (titulo: string, contenido: string, categoria: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PizarraTab({ titulo: tituloInicial = '', onGuardar }: PropsPizarraTab) {
  const refTextarea = useRef<HTMLTextAreaElement | null>(null);
  const [contenido, setContenido] = useState<string>(CONTENIDO_INICIAL);
  const [valoresVariables, setValoresVariables] = useState<Record<string, string>>({});
  const [slash, setSlash] = useState<EstadoSlash>(SLASH_CERRADO);
  const [motor, setMotor] = useState<MotorRenderizado>('XML');
  const [copiado, setCopiado] = useState(false);
  const [etiquetaPersonalizada, setEtiquetaPersonalizada] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [tituloGuardar, setTituloGuardar] = useState(tituloInicial);
  const [categoriaGuardar, setCategoriaGuardar] = useState('General');
  const [modalGuardarAbierto, setModalGuardarAbierto] = useState(false);

  const variables = useMemo(() => extraerVariables(contenido), [contenido]);

  // Limpia valores huérfanos cuando desaparece una variable del texto
  useEffect(() => {
    setValoresVariables((prev) => {
      const proximo: Record<string, string> = {};
      for (const v of variables) if (prev[v] !== undefined) proximo[v] = prev[v];
      return Object.keys(proximo).length === Object.keys(prev).length ? prev : proximo;
    });
  }, [variables]);

  const compilado = useMemo<string>(() => {
    const conValores = sustituirVariables(contenido, valoresVariables);
    return compilarConMotor(conValores, { motor });
  }, [contenido, valoresVariables, motor]);

  const insertarEtiqueta = useCallback((etiqueta: string): void => {
    const ta = refTextarea.current;
    const inicio = ta?.selectionStart ?? contenido.length;
    const fin = ta?.selectionEnd ?? contenido.length;
    const resultado = insertarEtiquetaEnTexto(contenido, etiqueta, inicio, fin);
    setContenido(resultado.contenido);
    requestAnimationFrame(() => {
      const nodo = refTextarea.current;
      if (!nodo) return;
      nodo.focus();
      nodo.setSelectionRange(resultado.inicioCursor, resultado.finCursor);
    });
  }, [contenido]);

  const cerrarSlash = useCallback((): void => setSlash(SLASH_CERRADO), []);

  const insertarBloqueAtomico = useCallback((bloque: BloqueAtomico): void => {
    const ta = refTextarea.current;
    if (!ta) return;
    const cursor = ta.selectionEnd;
    const inicioReemplazo = slash.abierto ? slash.inicio : cursor;
    const proximo = contenido.slice(0, inicioReemplazo) + bloque.contenido + contenido.slice(cursor);
    const posicionFinal = inicioReemplazo + bloque.contenido.length;
    setContenido(proximo);
    cerrarSlash();
    requestAnimationFrame(() => {
      const nodo = refTextarea.current;
      if (!nodo) return;
      nodo.focus();
      nodo.setSelectionRange(posicionFinal, posicionFinal);
    });
  }, [contenido, slash.abierto, slash.inicio, cerrarSlash]);

  const manejarCambio = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const valor = e.target.value;
    setContenido(valor);
    const cursor = e.target.selectionStart;
    if (!slash.abierto) {
      const charAnterior = valor[cursor - 1];
      const charPrevio = valor[cursor - 2] ?? ' ';
      if (charAnterior === '/' && /\s/.test(charPrevio)) {
        setSlash({ abierto: true, inicio: cursor - 1, query: '', indice: 0 });
      }
      return;
    }
    if (cursor <= slash.inicio) { cerrarSlash(); return; }
    const fragmento = valor.slice(slash.inicio + 1, cursor);
    if (/\s/.test(fragmento) || fragmento.length > 30) { cerrarSlash(); return; }
    setSlash((s) => ({ ...s, query: fragmento, indice: 0 }));
  };

  const manejarTecla = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!slash.abierto) return;
    const filtrados = filtrarBloquesAtomicos(BLOQUES_ATOMICOS_DEMO, slash.query);
    if (e.key === 'Escape') { e.preventDefault(); cerrarSlash(); return; }
    if (filtrados.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSlash((s) => ({ ...s, indice: (s.indice + 1) % filtrados.length })); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSlash((s) => ({ ...s, indice: (s.indice - 1 + filtrados.length) % filtrados.length })); return; }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const elegido = filtrados[Math.min(slash.indice, filtrados.length - 1)];
      if (elegido) insertarBloqueAtomico(elegido);
    }
  };

  const copiar = async (): Promise<void> => {
    await navigator.clipboard.writeText(compilado);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1800);
  };

  const confirmarGuardar = async (): Promise<void> => {
    if (!tituloGuardar.trim()) return;
    setGuardando(true);
    try { await onGuardar(tituloGuardar, contenido, categoriaGuardar); setModalGuardarAbierto(false); }
    finally { setGuardando(false); }
  };

  const hayContenido = contenido.trim().length > 0;
  const filtradosSlash = filtrarBloquesAtomicos(BLOQUES_ATOMICOS_DEMO, slash.query);
  const previewEtiqueta = normalizarNombreEtiqueta(etiquetaPersonalizada);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr_260px]">
      {/* Sidebar izquierdo: etiquetas */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Etiquetas XML</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ETIQUETAS_RAPIDAS.map((e) => (
              <button key={e} type="button" onClick={() => insertarEtiqueta(e)}
                className="rounded-md border border-zinc-700/60 bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] text-zinc-300 transition-colors hover:bg-zinc-700/60">
                {`<${e}>`}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input value={etiquetaPersonalizada} onChange={(e) => setEtiquetaPersonalizada(e.target.value)}
              placeholder="nueva_etiqueta" className="h-8 flex-1 rounded-lg border border-zinc-700/60 bg-zinc-950/60 px-2.5 text-[11px] text-white outline-none focus:border-emerald-500/60" />
            <button type="button" disabled={!previewEtiqueta}
              onClick={() => { insertarEtiqueta(previewEtiqueta); setEtiquetaPersonalizada(''); }}
              className="h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 text-[11px] font-bold text-emerald-400 disabled:opacity-40 hover:bg-emerald-500/30">
              +
            </button>
          </div>
          {previewEtiqueta && previewEtiqueta !== etiquetaPersonalizada.trim() && (
            <p className="mt-1.5 text-[10px] text-zinc-500">→ <code className="text-zinc-300">{previewEtiqueta}</code></p>
          )}
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-900/30 p-4 text-[11px] text-zinc-500">
          <p className="mb-1.5 font-bold text-zinc-400">Atajos</p>
          <ul className="space-y-1">
            <li>· <code className="text-zinc-300">/</code> abre bloques atómicos</li>
            <li>· <code className="text-zinc-300">{`{{VAR}}`}</code> crea inputs dinámicos</li>
            <li>· Seleccioná texto + tag para envolver</li>
          </ul>
        </div>
      </aside>

      {/* Editor central */}
      <section className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 px-5 py-3">
          <div>
            <h2 className="text-sm font-bold text-white">Taller de promps</h2>
            <p className="text-[10px] text-zinc-500">Editor libre · persiste XML · compila al motor activo</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={motor} onChange={(e) => setMotor(e.target.value as MotorRenderizado)}
              className="h-7 rounded-lg border border-zinc-700/60 bg-zinc-950/60 px-2 text-[11px] text-zinc-300 outline-none">
              <option value="XML">XML</option>
              <option value="Markdown">Markdown</option>
              <option value="JSON">JSON</option>
            </select>
            <button type="button" onClick={() => setContenido('')} disabled={!hayContenido}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-40">
              <Eraser size={12} /> Limpiar
            </button>
            <button type="button" onClick={copiar} disabled={!hayContenido}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-40">
              {copiado ? <Check size={12} /> : <Copy size={12} />}
              {copiado ? 'Copiado' : `Copiar (${motor})`}
            </button>
            <button type="button" onClick={() => descargarComoMdc('pizarra-matecode', compilado)} disabled={!hayContenido}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/60 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-40">
              <Download size={12} /> .mdc
            </button>
            <button type="button" onClick={() => setModalGuardarAbierto(true)} disabled={!hayContenido}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-bold text-black hover:bg-emerald-400 disabled:opacity-40">
              <Save size={12} /> Guardar
            </button>
          </div>
        </header>

        <div className="relative flex-1">
          <textarea ref={refTextarea} value={contenido} onChange={manejarCambio} onKeyDown={manejarTecla}
            onBlur={cerrarSlash} spellCheck={false}
            placeholder="Escribí o insertá etiquetas XML... usá / para snippets y {{VAR}} para variables."
            className="min-h-[340px] w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600"
            aria-haspopup="listbox" aria-expanded={slash.abierto} />
          {slash.abierto && (
            <MenuSlash bloques={BLOQUES_ATOMICOS_DEMO} query={slash.query}
              indiceActivo={Math.min(slash.indice, Math.max(0, filtradosSlash.length - 1))}
              alCambiarIndice={(i) => setSlash((s) => ({ ...s, indice: i }))}
              alSeleccionar={insertarBloqueAtomico} alCerrar={cerrarSlash} />
          )}
        </div>

        <div className="border-t border-zinc-800/60 bg-zinc-950/30 px-5 py-3">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500">
            <span>Vista previa compilada · {motor}</span>
            <span>{compilado.length} chars</span>
          </div>
          <pre className="max-h-48 overflow-auto rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {compilado || '—'}
          </pre>
        </div>
      </section>

      {/* Sidebar derecho: variables */}
      <aside>
        <PanelVariables variables={variables} valores={valoresVariables}
          alCambiar={(nombre, valor) => setValoresVariables((prev) => ({ ...prev, [nombre]: valor }))} />
      </aside>

      {/* Modal guardar */}
      {modalGuardarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Guardar en Biblioteca</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Título</label>
              <input value={tituloGuardar} onChange={(e) => setTituloGuardar(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Categoría</label>
              <select value={categoriaGuardar} onChange={(e) => setCategoriaGuardar(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-200 outline-none">
                {['General','Investigacion','Desarrollo','Marketing','Analisis','Creatividad','Productividad'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setModalGuardarAbierto(false)}
                className="px-4 py-2 bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 hover:bg-zinc-700">Cancelar</button>
              <button type="button" onClick={confirmarGuardar} disabled={!tituloGuardar.trim() || guardando}
                className="px-4 py-2 bg-emerald-500 rounded-xl text-xs font-bold text-black hover:bg-emerald-400 disabled:opacity-40">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
