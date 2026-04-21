import { useState } from 'react';
import { MapaHistoriasBoard } from '../../components/agile/MapaHistoriasBoard';
import { Sparkles, FileJson, AlertCircle, ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { supabase } from '../../lib/supabase';

export default function Phase1Requirements() {
  const { id: projectId } = useParams<{ id: string }>();
  const { tenantId } = useProject();
  const [jsonInput, setJsonInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleHydrate = async () => {
    setIsLoading(true);
    try {
      const parsed = JSON.parse(jsonInput);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';
      const response = await fetch(`${API_BASE}/api/Agile/projects/${projectId}/storymap/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Id': tenantId || ""
        },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) throw new Error('Error al importar en el servidor');

      setIsHydrated(true);
      setErrorMsg("");
    } catch (e) {
      setErrorMsg("Che, parece que a la IA le faltó una coma o el formato no es válido. Revisá el texto que pegaste.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
             <Sparkles size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">IA Magic Link</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">User Story Mapping 2D</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500 max-w-2xl font-medium leading-relaxed">
            Pegá el resultado de la IA y mirá cómo se dibuja solo el tablero interactivo. Cada épica es un pilar, cada historia un ladrillo.
          </p>
        </div>
        {isHydrated && (
          <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
             Finalizar Mapa y Crear Backlog
             <ArrowRight size={18} />
          </button>
        )}
      </div>

      {!isHydrated ? (
        <div className="glass-card p-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-4">
            <FileJson size={20} className="text-zinc-400" />
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
              Pegá acá el JSON devuelto por el Prompt Maestro
            </label>
          </div>
          
          <textarea
            rows={12}
            className="w-full font-mono text-xs p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-zinc-200 placeholder-zinc-700"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={'[\n  {\n    "title": "Gestión de Usuarios",\n    "stories": [\n      { "title": "Registro con validación de mail" },\n      { "title": "Recupero de contraseña" }\n    ]\n  }\n]'}
          />
          
          {errorMsg && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 italic font-medium">
              "¡Magia pura! Mirá cómo se armó tu mapa. Ahora arrastrá las tarjetas para priorizar qué entra en el MVP."
            </p>
            <button 
              onClick={handleHydrate}
              disabled={isLoading || !jsonInput}
              className="w-full sm:w-auto px-10 py-4 bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-black rounded-md shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? "Procesando ADN Ágil..." : "Dibujar Tablero 🎨"}
            </button>
          </div>
        </div>
      ) : (
        <MapaHistoriasBoard rawJson={jsonInput} />
      )}
    </>
  );
}
