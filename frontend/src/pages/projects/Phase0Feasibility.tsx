import { FeasibilityForm } from '../../components/projects/FeasibilityForm';

export default function Phase0Feasibility() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">El ADN del Proyecto</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
          Transformá la idea cruda en un objeto de datos concreto. Llená estos casilleros estratégicos para que la inteligencia artificial entienda exactamente qué software necesitamos construir más adelante.
        </p>
      </div>
      
      <FeasibilityForm />
    </>
  );
}
