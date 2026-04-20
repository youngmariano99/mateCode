import { useState } from 'react';
import { VaultExtractorWizard } from '../../components/vault/VaultExtractorWizard';
import { useNavigate } from 'react-router-dom';

export default function Phase5Deployment() {
  const [launched, setLaunched] = useState(false);
  const navigate = useNavigate();

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">¡Deploy Exitoso!</h1>
        <p className="text-zinc-600 dark:text-zinc-500 max-w-lg font-medium leading-relaxed">
          El producto está en las calles. Tus plantillas y stack tech ya fueron cosechados y están guardados en tu Bóveda personal. 
          <strong> El conocimiento es poder.</strong>
        </p>
        <button 
          onClick={() => navigate('/app/dashboard')}
          className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all"
        >
          Volver al Dashboard Central
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase italic">Lista de Lanzamiento</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">
          Corroborá las variables de entorno, apuntá los DNS y elegí qué información del proyecto vamos a extraer para reutilizar mañana.
        </p>
      </div>

      <div className="mt-8">
         <VaultExtractorWizard onComplete={() => setLaunched(true)} />
      </div>
    </>
  );
}
