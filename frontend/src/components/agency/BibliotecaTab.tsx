import { useState, useMemo } from 'react';
import { Star, Trash2, Copy, Check, BookOpen, SlidersHorizontal } from 'lucide-react';
import { type Resource } from '../../store/useOperationsStore';
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropsBibliotecaTab {
  readonly resources: Resource[];
  readonly onDelete: (id: string) => Promise<void>;
  readonly onToggleFavorite: (id: string, favorito: boolean) => Promise<void>;
  readonly onEdit: (resource: Resource) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BibliotecaTab({ resources, onDelete, onToggleFavorite, onEdit }: PropsBibliotecaTab) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const cats = new Set(resources.map((r) => r.categoria ?? 'General').filter(Boolean));
    return ['todas', ...Array.from(cats)];
  }, [resources]);

  const filtrados = useMemo(() => {
    return resources.filter((r) => {
      const matchBusqueda = !busqueda || r.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.contenido?.toLowerCase().includes(busqueda.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
      const matchCategoria = filtroCategoria === 'todas' || (r.categoria ?? 'General') === filtroCategoria;
      const matchFav = !soloFavoritos || r.favorito;
      return matchBusqueda && matchTipo && matchCategoria && matchFav;
    });
  }, [resources, busqueda, filtroTipo, filtroCategoria, soloFavoritos]);

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar recurso?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (isConfirmed) await onDelete(id);
  };

  const copiar = async (id: string, texto: string) => {
    await navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    window.setTimeout(() => setCopiadoId(null), 1800);
  };

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-zinc-500">
        <BookOpen size={40} className="mb-4 text-zinc-700" />
        <p className="text-sm font-bold text-zinc-400">Biblioteca vacía</p>
        <p className="mt-1 text-xs">Creá tu primer prompt desde la Pizarra.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <SlidersHorizontal size={14} className="text-zinc-500 shrink-0" />
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título o contenido..."
          className="h-8 flex-1 min-w-[180px] rounded-xl border border-zinc-700/60 bg-zinc-950/60 px-3 text-xs text-white outline-none focus:border-emerald-500/60 placeholder:text-zinc-600" />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
          className="h-8 rounded-xl border border-zinc-700/60 bg-zinc-950/60 px-2.5 text-xs text-zinc-300 outline-none">
          <option value="todos">Todos los tipos</option>
          <option value="prompt">Prompt IA</option>
          <option value="documento">Documento</option>
          <option value="template">Plantilla</option>
          <option value="otro">Otro</option>
        </select>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
          className="h-8 rounded-xl border border-zinc-700/60 bg-zinc-950/60 px-2.5 text-xs text-zinc-300 outline-none">
          {categorias.map((c) => <option key={c} value={c}>{c === 'todas' ? 'Todas las categorías' : c}</option>)}
        </select>
        <button type="button" onClick={() => setSoloFavoritos((v) => !v)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-colors ${
            soloFavoritos ? 'border-yellow-500/60 bg-yellow-500/10 text-yellow-400' : 'border-zinc-700/60 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
          <Star size={12} fill={soloFavoritos ? 'currentColor' : 'none'} /> Favoritos
        </button>
        <span className="ml-auto text-[10px] text-zinc-500">{filtrados.length} recursos</span>
      </div>

      {/* Grilla de tarjetas */}
      {filtrados.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-600">Sin resultados para los filtros seleccionados.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((res) => (
            <TarjetaRecurso key={res.id} resource={res} copiadoId={copiadoId}
              onCopiar={copiar} onDelete={handleDelete}
              onToggleFavorite={onToggleFavorite} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: TarjetaRecurso ────────────────────────────────────────────

interface PropsTarjeta {
  readonly resource: Resource;
  readonly copiadoId: string | null;
  readonly onCopiar: (id: string, texto: string) => Promise<void>;
  readonly onDelete: (id: string) => Promise<void>;
  readonly onToggleFavorite: (id: string, favorito: boolean) => Promise<void>;
  readonly onEdit: (resource: Resource) => void;
}

function TarjetaRecurso({ resource: res, copiadoId, onCopiar, onDelete, onToggleFavorite, onEdit }: PropsTarjeta) {
  const esCopiado = copiadoId === res.id;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 transition-all hover:border-zinc-700/60">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-400">
            {res.tipo}
          </span>
          {res.categoria && res.categoria !== 'General' && (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-400">
              {res.categoria}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={() => onToggleFavorite(res.id, !res.favorito)}
            className={`rounded-lg p-1.5 transition-colors ${res.favorito ? 'text-yellow-400 hover:text-yellow-300' : 'text-zinc-600 hover:text-yellow-400'}`}>
            <Star size={12} fill={res.favorito ? 'currentColor' : 'none'} />
          </button>
          <button type="button" onClick={() => onCopiar(res.id, res.contenido ?? '')}
            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:text-zinc-300">
            {esCopiado ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          <button type="button" onClick={() => onEdit(res)}
            className="rounded-lg px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            Editar
          </button>
          <button type="button" onClick={() => onDelete(res.id)}
            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:text-red-400">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Título */}
      <h4 className="mb-2 text-sm font-bold text-white leading-tight">{res.titulo}</h4>

      {/* Contenido */}
      {res.contenido && (
        <pre className="mb-3 flex-1 max-h-[120px] overflow-y-auto rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 font-mono text-[11px] leading-relaxed text-zinc-400 whitespace-pre-wrap">
          {res.contenido}
        </pre>
      )}

      {/* Etiquetas */}
      {res.etiquetas && res.etiquetas.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1 pt-3 border-t border-zinc-800/60">
          {res.etiquetas.map((t, i) => (
            <span key={i} className="text-[9px] font-bold text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Favorito indicator */}
      {res.favorito && (
        <span className="absolute top-3 right-3 text-yellow-400 opacity-60">
          <Star size={10} fill="currentColor" />
        </span>
      )}
    </div>
  );
}
