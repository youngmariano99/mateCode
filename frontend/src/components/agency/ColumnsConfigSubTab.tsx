import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit3, Check } from 'lucide-react';
import { useOperationsStore } from '../../store/useOperationsStore';
import Swal from 'sweetalert2';

export const ColumnsConfigSubTab: React.FC = () => {
  const { 
    kanbanColumns, fetchKanbanColumns, createKanbanColumn, 
    updateKanbanColumnsOrder, updateKanbanColumnName, deleteKanbanColumn 
  } = useOperationsStore();

  const [newColName, setNewColName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchKanbanColumns();
  }, []);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      await createKanbanColumn(newColName.trim(), kanbanColumns.length);
      setNewColName('');
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

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveRename = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateKanbanColumnName(id, editingName.trim());
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

  const handleDelete = async (id: string, name: string) => {
    const { isConfirmed } = await Swal.fire({
      title: `¿Eliminar columna "${name}"?`,
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
      <form onSubmit={handleAddColumn} className="flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la nueva columna (ej: En Revisión, Bloqueado)"
          value={newColName}
          onChange={e => setNewColName(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-zinc-700 outline-none transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Plus size={14} />
          <span>Añadir</span>
        </button>
      </form>

      {/* Columns list */}
      <div className="space-y-2">
        {kanbanColumns.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No hay columnas personalizadas. El tablero está operando con las columnas por defecto (Todo, In Progress, Done).
          </div>
        ) : (
          kanbanColumns.map((col, idx) => (
            <div
              key={col.id}
              className="bg-zinc-950/60 border border-zinc-850/80 px-4 py-3 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] text-zinc-600 font-black tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">
                  #{idx + 1}
                </span>

                {editingId === col.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-xs text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveRename(col.id)}
                      className="p-1 text-emerald-400 hover:bg-emerald-950/30 rounded"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-white">{col.nombre}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Rename action */}
                {editingId !== col.id && (
                  <button
                    onClick={() => handleStartRename(col.id, col.nombre)}
                    className="p-1.5 text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-all"
                    title="Renombrar"
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
          ))
        )}
      </div>
    </div>
  );
};
