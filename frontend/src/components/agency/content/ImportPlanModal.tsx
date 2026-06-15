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

  const handleCopyTemplate = () => {
    const template = {
      tituloSemana: "Semana del 08 al 14 de Junio",
      fechaDesde: "2026-06-08",
      fechaHasta: "2026-06-14",
      objetivoSemana: "Atracción",
      kpisSeleccionados: ["dms", "guardados"],
      customKpis: [
        {
          key: "custom_views",
          label: "Reproducciones completas (>10s)"
        }
      ],
      menuIdeas: [
        "Idea 1: Cómo ahorrar 3 horas de trabajo usando tickets",
        "Idea 2: 3 atajos clave para organizar tu código en Next.js"
      ],
      posts: [
        {
          id: "post_1",
          titulo: "Post 1: Ganar 3 horas sumando tickets",
          formato: "Reel/TikTok",
          plataforma: "TikTok",
          gancho: "¿Perdés 3 horas los domingos sumando tickets?",
          tipVisual: "Yo agarrándome la cabeza frente a un Excel",
          desarrollo: "1. El problema de la suma manual.\n2. La solución con MateCode.\n3. Demo de automatización.",
          cta: "Comenta STOCK y te paso demo",
          estado: "Idea",
          fechaPublicacion: "2026-06-09",
          checklistBatching: [
            { id: "b1", text: "🎬 Set-up armado (trípode, luces, cámara limpia)", checked: false },
            { id: "b2", text: "📹 Grabé el Post", checked: false },
            { id: "b3", text: "👕 Cambié de remera o ángulo", checked: false },
            { id: "b4", text: "✍️ Subtítulos grandes en el centro", checked: false },
            { id: "b5", text: "✂️ Cortes rápidos cada 3-5 segundos", checked: false },
            { id: "b6", text: "💾 Archivos finales exportados", checked: false }
          ],
          checklistSeo: [
            { id: "s1", text: "📂 Nombre del archivo relevante (ej: video.mp4 ➡️ excel-tickets.mp4)", checked: false },
            { id: "s2", text: "✍️ Palabras clave de forma natural en el texto", checked: false },
            { id: "s3", text: "🏷️ 3 a 5 hashtags muy específicos (B2B)", checked: false },
            { id: "s4", text: "🚫 Video limpio sin marcas de agua de otras redes", checked: false }
          ],
          progreso: {
            guionado: false,
            grabado: false,
            editado: false,
            programado: false
          }
        }
      ]
    };

    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Estructura copiada al portapapeles',
      showConfirmButton: false,
      timer: 2000,
      background: '#18181b',
      color: '#fff'
    });
  };

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
        fechaDesde: parsed.fechaDesde || '',
        fechaHasta: parsed.fechaHasta || '',
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
          estado: p.estado || 'Idea',
          fechaPublicacion: p.fechaPublicacion || '',
          checklistBatching: p.checklistBatching || [
            { id: 'b1', text: '🎬 Set-up armado (trípode, luces, cámara limpia)', checked: false },
            { id: 'b2', text: '📹 Grabé el Post', checked: false },
            { id: 'b3', text: '👕 Cambié de remera o ángulo', checked: false },
            { id: 'b4', text: '✍️ Subtítulos grandes en el centro', checked: false },
            { id: 'b5', text: '✂️ Cortes rápidos cada 3-5 segundos', checked: false },
            { id: 'b6', text: '💾 Archivos finales exportados', checked: false }
          ],
          checklistSeo: p.checklistSeo || [
            { id: 's1', text: '📂 Nombre del archivo relevante (ej: video.mp4 ➡️ excel-tickets.mp4)', checked: false },
            { id: 's2', text: '✍️ Palabras clave de forma natural en el texto', checked: false },
            { id: 's3', text: '🏷️ 3 a 5 hashtags muy específicos (B2B)', checked: false },
            { id: 's4', text: '🚫 Video limpio sin marcas de agua de otras redes', checked: false }
          ],
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

        <div className="bg-zinc-950/60 border border-zinc-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-sky-400 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1 text-[11px] text-zinc-400">
              <p className="font-bold text-zinc-200">¿Cómo funciona?</p>
              <p>
                Pega el JSON estructurado de tu planificación semanal. Podés copiar nuestra estructura completa de ejemplo para guiar a la IA y evitar errores de formato.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyTemplate}
            className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-450 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap self-start md:self-auto shadow-md"
          >
            📋 Copiar Estructura Ejemplo
          </button>
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
