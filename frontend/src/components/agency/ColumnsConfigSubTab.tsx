import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit3, Check } from 'lucide-react';
import { useOperationsStore, parseColumnName } from '../../store/useOperationsStore';
import Swal from 'sweetalert2';

export const ColumnsConfigSubTab: React.FC = () => {
  const { 
    kanbanColumns, fetchKanbanColumns, createKanbanColumn, 
    updateKanbanColumnsOrder, updateKanbanColumnName, deleteKanbanColumn 
  } = useOperationsStore();

  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('#71717a');
  const [newColIsUncompleted, setNewColIsUncompleted] = useState(false);
  const [newColIsDone, setNewColIsDone] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#71717a');
  const [editingIsUncompleted, setEditingIsUncompleted] = useState(false);
  const [editingIsDone, setEditingIsDone] = useState(false);

  useEffect(() => {
    fetchKanbanColumns();
  }, []);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const flags: string[] = [];
      if (newColIsUncompleted) flags.push('uncompleted');
      if (newColIsDone) flags.push('done');
      
      const serializedName = `${newColName.trim()}|${newColColor}|${flags.join(',')}`;

      await createKanbanColumn(serializedName, kanbanColumns.length);
      setNewColName('');
      setNewColColor('#71717a');
      setNewColIsUncompleted(false);
      setNewColIsDone(false);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Columna agregada',
        showConfirmButton: false,
        timer: 1500,
        background: '#09090b',
        color: '#f4f4f5'
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleStartRename = (id: string, rawName: string) => {
    setEditingId(id);
    const parsed = parseColumnName(rawName);
    setEditingName(parsed.name);
    setEditingColor(parsed.color);
    setEditingIsUncompleted(parsed.isUncompleted);
    setEditingIsDone(parsed.isDone);
  };

  const handleSaveRename = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const flags: string[] = [];
      if (editingIsUncompleted) flags.push('uncompleted');
      if (editingIsDone) flags.push('done');
      
      const serializedName = `${editingName.trim()}|${editingColor}|${flags.join(',')}`;

      await updateKanbanColumnName(id, serializedName);
      setEditingId(null);
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= kanbanColumns.length) return;

    const list = [...kanbanColumns];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;

    const payload = list.map((col, idx) => ({
      key: col.id,
      value: idx
    }));

    try {
      await updateKanbanColumnsOrder(payload);
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDelete = async (id: string, rawName: string) => {
    const parsed = parseColumnName(rawName);
    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar columna "${parsed.name}"?`,
      text: 'Se perderá el agrupamiento para esta columna. Las tareas asociadas mantendrán su estado de texto pero no se mostrarán en esta columna.',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      try {
        await deleteKanbanColumn(id);
      } catch (err: any) {
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-3xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Configuración del Tablero Kanban</h3>
        <p className="text-zinc-500 text-xs mt-1">Crea, edita o reordena las columnas para organizar tus tareas operativas.</p>
      </div>

      {/* Add column form */}
      <form onSubmit={handleAddColumn} className="space-y-4 bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre de la nueva columna (ej: En Revisión, Bloqueado)"
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-zinc-700 outline-none transition-colors"
          />
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/80 px-2 rounded-xl">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Color</label>
            <input
              type="color"
              value={newColColor}
              onChange={e => setNewColColor(e.target.value)}
              className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            <span>Añadir</span>
          </button>
        </div>
        <div className="flex gap-4 items-center pl-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newColIsUncompleted}
              onChange={e => {
                setNewColIsUncompleted(e.target.checked);
                if (e.target.checked) setNewColIsDone(false);
              }}
              className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
            />
            <span className="text-[11px] text-zinc-400">Es columna "No completada" (para re-programación)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newColIsDone}
              onChange={e => {
                setNewColIsDone(e.target.checked);
                if (e.target.checked) setNewColIsUncompleted(false);
              }}
              className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
            />
            <span className="text-[11px] text-zinc-400">Es columna "Hecho" (Completada)</span>
          </label>
        </div>
      </form>

      {/* Columns list */}
      <div className="space-y-2">
        {kanbanColumns.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No hay columnas personalizadas. El tablero está operando con las columnas por defecto (Todo, In Progress, Done).
          </div>
        ) : (
          kanbanColumns.map((col, idx) => {
            const parsedCol = parseColumnName(col.nombre);
            return (
              <div
                key={col.id}
                className="bg-zinc-950/60 border border-zinc-850/80 px-4 py-3 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-[10px] text-zinc-600 font-black tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                    #{idx + 1}
                  </span>

                  {editingId === col.id ? (
                    <div className="flex-1 flex flex-col gap-2 bg-zinc-900/40 p-3 rounded-xl border border-zinc-850">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 rounded text-xs text-white"
                          autoFocus
                        />
                        <input
                          type="color"
                          value={editingColor}
                          onChange={e => setEditingColor(e.target.value)}
                          className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                        />
                        <button
                          onClick={() => handleSaveRename(col.id)}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-950/30 rounded-lg flex items-center justify-center border border-emerald-950/30"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingIsUncompleted}
                            onChange={e => {
                              setEditingIsUncompleted(e.target.checked);
                              if (e.target.checked) setEditingIsDone(false);
                            }}
                            className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
                          />
                          <span className="text-[10px] text-zinc-400">Es columna "No completada"</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingIsDone}
                            onChange={e => {
                              setEditingIsDone(e.target.checked);
                              if (e.target.checked) setEditingIsUncompleted(false);
                            }}
                            className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-0"
                          />
                          <span className="text-[10px] text-zinc-400">Es columna "Hecho"</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: parsedCol.color, boxShadow: `0 0 6px ${parsedCol.color}` }}
                      />
                      <span className="text-xs font-bold text-white">
                        {parsedCol.name}
                        {parsedCol.isUncompleted && <span className="ml-2 text-[9px] bg-red-950/55 border border-red-900/60 text-red-400 px-1.5 py-0.5 rounded">No completado</span>}
                        {parsedCol.isDone && <span className="ml-2 text-[9px] bg-emerald-950/55 border border-emerald-900/60 text-emerald-400 px-1.5 py-0.5 rounded">Completado</span>}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Rename action */}
                  {editingId !== col.id && (
                    <button
                      onClick={() => handleStartRename(col.id, col.nombre)}
                      className="p-1.5 text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-all"
                      title="Renombrar / Configurar"
                    >
                      <Edit3 size={12} />
                    </button>
                  )}

                  {/* Move up */}
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 text-zinc-550 hover:text-zinc-350 hover:bg-zinc-900 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                    title="Subir orden"
                  >
                    <ArrowUp size={12} />
                  </button>

                  {/* Move down */}
                  <button
                    disabled={idx === kanbanColumns.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 text-zinc-550 hover:text-zinc-350 hover:bg-zinc-900 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
                    title="Bajar orden"
                  >
                    <ArrowDown size={12} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(col.id, col.nombre)}
                    className="p-1.5 text-zinc-550 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all ml-1"
                    title="Eliminar columna"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
