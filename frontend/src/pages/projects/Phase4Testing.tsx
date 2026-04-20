import { TestingChecklist } from '../../components/testing/TestingChecklist';

export default function Phase4Testing() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inspección de Calidad</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
          Navegá rápido tu checklist basado en el BDD que armamos. Si algo no anda, reportalo y lo mandamos al Kanban de una.
        </p>
      </div>

      <TestingChecklist />
    </>
  );
}
