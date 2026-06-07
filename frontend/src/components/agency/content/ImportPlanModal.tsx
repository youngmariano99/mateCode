import React, { useState } from 'react';
import { X, Code, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface ImportPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedData: any) => void;
}

export const ImportPlanModal: React.FC<ImportPlanModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      // Intentar parsear JSON
      const parsed = JSON.parse(inputText);

      // Validación mínima de estructura
      if (!parsed.tituloSemana) {
        throw new Error("Falta el campo requerido 'tituloSemana'.");
      }

      // Normalizar estructura si faltan campos opcionales
      const normalizedData = {
        tituloSemana: parsed.tituloSemana,
        objetivoSemana: parsed.objetivoSemana || 'Atracción',
        kpisSeleccionados: parsed.kpisSeleccionados || [],
        customKpis: parsed.customKpis || [],
        menuIdeas: parsed.menuIdeas || [],
        posts: (parsed.posts || []).map((p: any, index: number) => ({
          id: p.id || `post_${Date.now()}_${index}`,
          titulo: p.titulo || `Post ${index + 1}`,
          formato: p.formato || 'Reel/TikTok',
          plataforma: p.plataforma || 'TikTok',
          gancho: p.gancho || '',
          tipVisual: p.tipVisual || '',
          desarrollo: p.desarrollo || '',
          cta: p.cta || '',
          progreso: {
            guionado: p.progreso?.guionado ?? false,
            grabado: p.progreso?.grabado ?? false,
            editado: p.progreso?.editado ?? false,
            programado: p.progreso?.programado ?? false
          }
        })),
        checklistBatching: {
          setupGrabacion: parsed.checklistBatching?.setupGrabacion ?? false,
          grabadoPost1: parsed.checklistBatching?.grabadoPost1 ?? false,
          reseteoVisual: parsed.checklistBatching?.reseteoVisual ?? false,
          subtitulosCentro: parsed.checklistBatching?.subtitulosCentro ?? false,
          cortesRapidos: parsed.checklistBatching?.cortesRapidos ?? false,
          archivoExportado: parsed.checklistBatching?.archivoExportado ?? false,
          ...parsed.checklistBatching
        },
        checklistSeo: {
          nombreArchivoRenombrado: parsed.checklistSeo?.nombreArchivoRenombrado ?? false,
          keywordsTexto: parsed.checklistSeo?.keywordsTexto ?? false,
          hashtagsEspecificos: parsed.checklistSeo?.hashtagsEspecificos ?? false,
          sinMarcasAgua: parsed.checklistSeo?.sinMarcasAgua ?? false,
          ...parsed.checklistSeo
        },
        analisisCierre: {
          totalDms: parsed.analisisCierre?.totalDms ?? 0,
          mejorPost: parsed.analisisCierre?.mejorPost ?? '',
          masCompartido: parsed.analisisCierre?.masCompartido ?? '',
          queFunciono: parsed.analisisCierre?.queFunciono ?? '',
          queFallo: parsed.analisisCierre?.queFallo ?? '',
          decisionProximaSemana: parsed.analisisCierre?.decisionProximaSemana ?? '',
          ...parsed.analisisCierre
        }
      };

      onImport(normalizedData);
      setInputText('');
      onClose();

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Planificación importada con éxito',
        showConfirmButton: false,
        timer: 2000,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al importar',
        text: `El formato del plan es inválido: ${err.message}`,
        background: '#09090b',
        color: '#f4f4f5',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-2xl space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Code className="text-emerald-400" size={20} />
          <div>
            <h3 className="text-lg font-bold text-white">Importar Planificación Semanal</h3>
            <p className="text-[10px] text-zinc-550 uppercase tracking-wider">Carga planes generados por Inteligencia Artificial</p>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-sky-400 shrink-0 mt-0.5" size={16} />
          <div className="space-y-1 text-[11px] text-zinc-400">
            <p className="font-bold text-zinc-200">¿Cómo funciona?</p>
            <p>
              Pega el JSON estructurado de tu planificación semanal. Asegúrate de incluir por lo menos el título de la semana (ej: <code className="text-emerald-400">"tituloSemana": "Semana del 08 al 14 de Junio"</code>).
            </p>
          </div>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-4">
          <textarea
            required
            rows={10}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='{
  "tituloSemana": "Semana del 08 al 14 de Junio",
  "objetivoSemana": "Atracción",
  "menuIdeas": ["Idea 1", "Idea 2"],
  "posts": [
    {
      "titulo": "Mi primer Reel",
      "formato": "Reel/TikTok",
      "plataforma": "TikTok",
      "gancho": "Gancho matador...",
      "desarrollo": "1. Valor, 2. Solución...",
      "cta": "Comenta INFO"
    }
  ]
}'
            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-xs font-mono text-zinc-350 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 text-zinc-350 hover:bg-zinc-750 rounded-xl text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-colors"
            >
              Aplicar Importación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
