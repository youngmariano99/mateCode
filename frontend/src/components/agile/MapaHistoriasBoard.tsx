import { useState, useEffect } from 'react';
import { EpicaColumn } from './EpicaColumn';
import { BddEditorPanel } from './BddEditorPanel';
import { supabase } from '../../lib/supabase';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { Historia, Epica } from './types';

export const MapaHistoriasBoard = ({ rawJson }: { rawJson: string }) => {
  const [epicas, setEpicas] = useState<Epica[]>([]);
  const [selectedHistoria, setSelectedHistoria] = useState<Historia | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(rawJson);
      const formatted = parsed.map((e: any) => {
        const epicaId = e.id || crypto.randomUUID();
        return {
          id: epicaId,
          titulo: e.title || e.titulo,
          historias: (e.stories || e.historias || []).map((s: any) => ({
            id: s.id || crypto.randomUUID(),
            titulo: s.title || s.titulo,
            epicaId: epicaId
          }))
        };
      });
      setEpicas(formatted);
    } catch (e) {
      console.error("Error parsing Mapa de Historias JSON", e);
    }
  }, [rawJson]);

  // Monitor de Pragmatic Drag & Drop
  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destinationData = destination.data;

        const historiaId = sourceData.id as string;
        const targetEpicaId = destinationData.id as string;

        setEpicas(prev => {
          const newEpicas = [...prev];
          let draggedHistoria: Historia | null = null;

          newEpicas.forEach(epica => {
            const index = epica.historias.findIndex(s => s.id === historiaId);
            if (index !== -1) {
              draggedHistoria = { ...epica.historias[index], epicaId: targetEpicaId };
              epica.historias.splice(index, 1);
            }
          });

          if (draggedHistoria) {
            const targetEpica = newEpicas.find(e => e.id === targetEpicaId);
            if (targetEpica) {
              targetEpica.historias.push(draggedHistoria);
            }
          }

          return newEpicas;
        });
      },
    });
  }, []);

  return (
    <div className="flex gap-8 h-[75vh] animate-in fade-in duration-1000">
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {epicas.map((epica) => (
          <EpicaColumn
            key={epica.id}
            epica={epica}
            onHistoriaClick={setSelectedHistoria}
            selectedHistoriaId={selectedHistoria?.id}
          />
        ))}
      </div>

      {selectedHistoria && (
        <div className="w-[450px] shrink-0 glass-card border-none shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-500">
          <BddEditorPanel
            historia={selectedHistoria}
            onClose={() => setSelectedHistoria(null)}
            onSave={async (bdd) => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5032';

                const response = await fetch(`${API_BASE}/api/Agile/historias/${selectedHistoria.id}/bdd`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ BddCriteria: bdd })
                });

                if (!response.ok) throw new Error('Error al guardar BDD');
                setSelectedHistoria(null);
              } catch (err) {
                alert("❌ Se nos lavó el mate. No pudimos guardar el BDD.");
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
