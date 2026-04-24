import React, { useState } from 'react';

// Estructura adaptada del archivo 01_MODELO_DE_DATOS.md
interface PermissionNode {
  view: boolean;
  edit: boolean;
}

interface Matrix {
  [modulo: string]: PermissionNode;
}

export const PermissionsMatrix = ({ initialMatrix }: { initialMatrix: Matrix }) => {
  const [matrix, setMatrix] = useState<Matrix>(initialMatrix);

  const togglePermission = (modulo: string, acc: 'view' | 'edit') => {
    setMatrix(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [acc]: !prev[modulo][acc]
      }
    }));
  };

  const getModuleTitle = (key: string) => {
    const titles: Record<string, string> = {
      fase_0: "Factibilidad y ADN",
      fase_1: "Requisitos 2D",
      fase_2: "Diseño Visual",
      fase_3: "Desarrollo (Kanban)",
      fase_4: "Testing",
      crm: "CRM y Clientes",
      vault: "La Bóveda"
    };
    return titles[key] || key;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Módulo del Sistema</th>
              <th className="px-6 py-4 font-semibold text-center">Ver</th>
              <th className="px-6 py-4 font-semibold text-center">Editar / Mover</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrix).map(([modulo, perms]) => (
              <tr key={modulo} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                  {getModuleTitle(modulo)}
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={perms.view}
                    onChange={() => togglePermission(modulo, 'view')}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={perms.edit}
                    onChange={() => togglePermission(modulo, 'edit')}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-lg flex justify-end">
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
          Guardar Matriz
        </button>
      </div>
    </div>
  );
};
