import { useState, useEffect } from 'react';
import { Plus, PenLine, BookOpen, UploadCloud } from 'lucide-react';
import { useOperationsStore, type Resource } from '../../store/useOperationsStore';
import { useCrmStore } from '../../store/useCrmStore';
import { useAgencyStore } from '../../store/useAgencyStore';
import { UploadAdapterFactory } from '../../services/UploadAdapters';
import { ImageCropModal } from '../common/ImageCropModal';
import { PizarraTab } from './PizarraTab';
import { BibliotecaTab } from './BibliotecaTab';
import Swal from 'sweetalert2';

type Tab = 'pizarra' | 'biblioteca';

export function ResourcesPanel() {
  const { resources, fetchResources, createResource, updateResource, deleteResource, toggleResourceFavorite } =
    useOperationsStore();
  const { leads, fetchLeads } = useCrmStore();
  const { activeAgency } = useAgencyStore();

  const [tab, setTab] = useState<Tab>('pizarra');
  const [editando, setEditando] = useState<Resource | null>(null);

  // File Upload states
  const [selectedTipo, setSelectedTipo] = useState<string>('herramienta');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [uploadedName, setUploadedName] = useState<string>('');
  const [subiendoArchivo, setSubiendoArchivo] = useState<boolean>(false);

  // Cropper states for images in resources
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState('');

  // Branding color
  const brand = activeAgency?.branding ? (typeof activeAgency.branding === 'string' ? JSON.parse(activeAgency.branding) : activeAgency.branding) : null;
  const colorPrimario = brand?.colorPrimario || '#10b981';

  useEffect(() => {
    fetchResources();
    fetchLeads();
  }, []);

  useEffect(() => {
    if (editando) {
      setSelectedTipo(editando.tipo || 'herramienta');
      setUploadedUrl(editando.contenido || '');
      setUploadedName(editando.tipo === 'archivo' && editando.contenido ? 'Archivo cargado' : '');
    } else {
      setSelectedTipo('herramienta');
      setUploadedUrl('');
      setUploadedName('');
    }
  }, [editando]);

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

  const handleNuevoRecurso = () => {
    setEditando({
      id: '',
      agencia_id: '',
      titulo: '',
      contenido: '',
      tipo: 'herramienta',
      etiquetas: [],
      roles_permitidos: [],
      categoria: 'General',
      favorito: false,
      fecha_creacion: new Date().toISOString()
    });
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

  const handleResourceImageCropConfirm = async (croppedBlob: Blob) => {
    setCropModalOpen(false);
    setSubiendoArchivo(true);
    try {
      const adapter = UploadAdapterFactory.getAdapter();
      const url = await adapter.uploadImage(croppedBlob);
      setUploadedUrl(url);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Imagen procesada y subida',
        showConfirmButton: false,
        timer: 2000,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error al subir',
        text: err.message || 'No se pudo subir la imagen.',
        icon: 'error',
        background: '#09090b',
        color: '#f4f4f5'
      });
      setUploadedName('');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!editando) return;
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const payload = {
        titulo: fd.get('titulo') as string,
        contenido: fd.get('contenido') as string,
        tipo: fd.get('tipo') as string,
        etiquetas: (fd.get('etiquetas') as string).split(',').map((s) => s.trim()).filter(Boolean),
        roles_permitidos: editando.roles_permitidos ?? [],
        categoria: fd.get('categoria') as string,
        favorito: editando.favorito,
        cliente_id: fd.get('cliente_id') as string || undefined,
      };

      if (editando.id) {
        await updateResource(editando.id, payload);
      } else {
        await createResource(payload);
      }
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
          <h1 className="text-3xl font-black tracking-tight text-white">Biblioteca de Prompts & Herramientas</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Crea, edita y organiza tus prompts de IA y herramientas. Usá la Pizarra para ingeniería de prompts avanzada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNuevoRecurso}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
            style={{ backgroundColor: colorPrimario }}
          >
            <Plus size={14} />
            <span>Registrar Recurso</span>
          </button>
          <button
            onClick={() => setTab('biblioteca')}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <BookOpen size={14} />
            <span>{resources.length} en biblioteca</span>
          </button>
        </div>
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editando.id ? 'Editar Recurso' : 'Registrar Nuevo Recurso'}
              </h3>
              {activeAgency?.nombre && (
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-850">
                  {activeAgency.nombre}
                </span>
              )}
            </div>
            <form onSubmit={handleGuardarEdicion} className="space-y-3">
              <Field label="Título">
                <input name="titulo" required defaultValue={editando.titulo}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500/60" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tipo">
                  <select 
                    name="tipo" 
                    value={selectedTipo} 
                    onChange={(e) => setSelectedTipo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-zinc-200 outline-none"
                  >
                    <option value="prompt">Prompt IA</option>
                    <option value="herramienta">Herramienta</option>
                    <option value="documento">Documento</option>
                    <option value="template">Plantilla</option>
                    <option value="archivo">Archivo / Foto de Cliente</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
                <Field label="Cliente Asociado (CRM)">
                  <select 
                    name="cliente_id" 
                    defaultValue={editando.cliente_id ?? ''}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-zinc-200 outline-none"
                  >
                    <option value="">-- Sin Cliente --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.nombre} ({l.email || 'Sin email'})</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Categoría">
                <select name="categoria" defaultValue={editando.categoria ?? 'General'}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-zinc-200 outline-none">
                  {['General','Investigacion','Desarrollo','Marketing','Analisis','Creatividad','Productividad'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              
              {selectedTipo === 'archivo' ? (
                <Field label="Archivo o Foto del Cliente">
                  <div 
                    className="relative rounded-2xl border-2 border-dashed bg-zinc-950 p-6 flex flex-col items-center justify-center transition-all hover:bg-zinc-900/50"
                    style={{ borderColor: subiendoArchivo ? '#71717a' : colorPrimario }}
                  >
                    {uploadedUrl ? (
                      <div className="text-center space-y-2">
                        <p className="text-xs text-zinc-300 font-bold">✓ Archivo cargado correctamente</p>
                        <div className="flex items-center justify-center gap-2 max-w-full">
                          {uploadedUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                            <img src={uploadedUrl} alt="Vista previa" className="h-16 w-16 object-cover rounded-xl border border-zinc-800" />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-[10px] uppercase">
                              {uploadedUrl.split('.').pop() || 'File'}
                            </div>
                          )}
                          <div className="text-left overflow-hidden">
                            <span className="text-[10px] text-zinc-500 block truncate max-w-[200px]" title={uploadedUrl}>
                              {uploadedName || uploadedUrl.substring(uploadedUrl.lastIndexOf('/') + 1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 pt-1">
                          {uploadedUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImageSrc(uploadedUrl);
                                setCropModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[10px] bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg border border-zinc-800 transition-all"
                            >
                              Recortar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedUrl('');
                              setUploadedName('');
                            }}
                            className="px-2.5 py-1 text-[10px] bg-red-950/20 hover:bg-red-900/20 text-red-400 font-bold rounded-lg border border-red-900/30 transition-all"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : subiendoArchivo ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: colorPrimario }} />
                        <p className="text-xs text-zinc-400">Subiendo a la nube...</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 cursor-pointer w-full">
                        <label className="cursor-pointer block w-full">
                          <UploadCloud className="mx-auto mb-2 text-zinc-500 group-hover:text-zinc-300" size={28} style={{ color: colorPrimario }} />
                          <span className="text-xs font-bold text-zinc-300 block">Subir archivo o foto</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">Arrastra aquí o haz clic para buscar</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              // Validation: 20MB limit
                              const maxLimit = 20 * 1024 * 1024;
                              if (file.size > maxLimit) {
                                Swal.fire({
                                  title: 'Archivo demasiado grande',
                                  text: `El archivo supera el límite de 20 MB (tamaño: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
                                  icon: 'warning',
                                  background: '#09090b',
                                  color: '#f4f4f5',
                                  confirmButtonColor: colorPrimario
                                });
                                e.target.value = '';
                                return;
                              }

                              if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setSelectedImageSrc(reader.result as string);
                                  setUploadedName(file.name);
                                  setCropModalOpen(true);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setSubiendoArchivo(true);
                                setUploadedName(file.name);
                                try {
                                  const adapter = UploadAdapterFactory.getAdapter();
                                  const url = await adapter.uploadRawFile(file);
                                  setUploadedUrl(url);
                                } catch (err: any) {
                                  Swal.fire({
                                    title: 'Error al subir',
                                    text: err.message || 'No se pudo subir el archivo.',
                                    icon: 'error',
                                    background: '#09090b',
                                    color: '#f4f4f5'
                                  });
                                  setUploadedName('');
                                } finally {
                                  setSubiendoArchivo(false);
                                }
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {/* Hidden input for form submission */}
                  <input type="hidden" name="contenido" value={uploadedUrl} />
                </Field>
              ) : (
                <Field label="Contenido / Enlace">
                  <textarea name="contenido" rows={6} defaultValue={editando.contenido ?? ''}
                    placeholder="Escribe el contenido del prompt o la URL de la herramienta..."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500/60" />
                </Field>
              )}

              <Field label="Etiquetas (separadas por comas)">
                <input name="etiquetas" defaultValue={editando.etiquetas?.join(', ') ?? ''}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-white outline-none focus:border-emerald-500/60" />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditando(null)}
                  className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700">Cancelar</button>
                <button type="submit"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400"
                  style={{ backgroundColor: colorPrimario }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal for Client Photos */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={selectedImageSrc}
        aspectRatio={undefined}
        circular={false}
        onClose={() => {
          setCropModalOpen(false);
          setUploadedName('');
        }}
        onConfirm={handleResourceImageCropConfirm}
      />
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
