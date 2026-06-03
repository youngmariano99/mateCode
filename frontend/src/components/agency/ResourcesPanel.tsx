import { useState, useEffect } from 'react';
import { Plus, PenLine, BookOpen } from 'lucide-react';
import { useOperationsStore, type Resource } from '../../store/useOperationsStore';
import { PizarraTab } from './PizarraTab';
import { BibliotecaTab } from './BibliotecaTab';
import Swal from 'sweetalert2';

type Tab = 'pizarra' | 'biblioteca';

export function ResourcesPanel() {
  const { resources, fetchResources, createResource, updateResource, deleteResource, toggleResourceFavorite } =
    useOperationsStore();
  const [tab, setTab] = useState<Tab>('pizarra');
  const [editando, setEditando] = useState<Resource | null>(null);

  useEffect(() => { fetchResources(); }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleGuardarDesdePizarra = async (titulo: string, contenido: string, categoria: string): Promise<void> => {
    await createResource({
      titulo,
      contenido,
      tipo: 'prompt',
      etiquetas: [],
      roles_permitidos: [],
      categoria,
      favorito: false,
    });
    setTab('biblioteca');
  };

  const handleToggleFavorite = async (id: string, favorito: boolean): Promise<void> => {
    await toggleResourceFavorite(id, favorito);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteResource(id);
  };

  const handleEdit = (resource: Resource): void => {
    setEditando(resource);
  };

  const handleGuardarEdicion = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!editando) return;
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      await updateResource(editando.id, {
        titulo: fd.get('titulo') as string,
        contenido: fd.get('contenido') as string,
        tipo: fd.get('tipo') as string,
        etiquetas: (fd.get('etiquetas') as string).split(',').map((s) => s.trim()).filter(Boolean),
        roles_permitidos: editando.roles_permitidos ?? [],
        categoria: fd.get('categoria') as string,
        favorito: editando.favorito,
      });
      setEditando(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      Swal.fire({ title: 'Error', text: msg, icon: 'error', background: '#09090b', color: '#f4f4f5' });
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Biblioteca de Prompts</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Crea, edita y organiza tus prompts de IA. Usá la Pizarra para ingeniería de prompts avanzada.
          </p>
        </div>
        <button
          onClick={() => setTab('biblioteca')}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <BookOpen size={14} />
          <span>{resources.length} en biblioteca</span>
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-1 w-fit">
        <TabBtn label="Pizarra" icon={<PenLine size={13} />} active={tab === 'pizarra'} onClick={() => setTab('pizarra')} />
        <TabBtn label="Biblioteca" icon={<BookOpen size={13} />} active={tab === 'biblioteca'} onClick={() => setTab('biblioteca')} />
      </div>

      {/* Content */}
      {tab === 'pizarra' ? (
        <PizarraTab onGuardar={handleGuardarDesdePizarra} />
      ) : (
        <BibliotecaTab resources={resources} onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite} onEdit={handleEdit} />
      )}

      {/* Edit modal */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Editar Recurso</h3>
            <form onSubmit={handleGuardarEdicion} className="space-y-3">
              <Field label="Título">
                <input name="titulo" required defaultValue={editando.titulo}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500/60" />
              </Field>
              <Field label="Tipo">
                <select name="tipo" defaultValue={editando.tipo}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-zinc-200 outline-none">
                  <option value="prompt">Prompt IA</option>
                  <option value="documento">Documento</option>
                  <option value="template">Plantilla</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>
              <Field label="Categoría">
                <select name="categoria" defaultValue={editando.categoria ?? 'General'}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-zinc-200 outline-none">
                  {['General','Investigacion','Desarrollo','Marketing','Analisis','Creatividad','Productividad'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Contenido">
                <textarea name="contenido" rows={6} defaultValue={editando.contenido ?? ''}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/60" />
              </Field>
              <Field label="Etiquetas (separadas por comas)">
                <input name="etiquetas" defaultValue={editando.etiquetas?.join(', ') ?? ''}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500/60" />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditando(null)}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700">Cancelar</button>
                <button type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TabBtn({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
        active ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
      {icon}{label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
