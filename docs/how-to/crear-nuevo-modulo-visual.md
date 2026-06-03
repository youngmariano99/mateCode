# Guía de Procedimiento: Crear Nuevo Módulo de UI en Spatial OS

Esta guía detalla el procedimiento para integrar un nuevo panel o módulo visual interactivo dentro de la interfaz espacial (2D/3D) de MateCode.

---

## 1. Definición del Mapeo Espacial (Coordenadas)
1.  Dirigite a `frontend/src/components/layout/WorkspaceMap.tsx`.
2.  Definí el polígono de coordenadas bidimensionales de la nueva sala o región dentro de la constante de configuración de habitaciones:
    ```typescript
    export const HABITACIONES = {
      RECEPCION: { x: 10, y: 15, ancho: 100, alto: 80, label: "Recepción" },
      // Definí tu nueva sala aquí...
    };
    ```

---

## 2. Inyección del Panel Inmersivo (Capa UI)
1.  Creá tu componente de vista principal en una carpeta dentro de `frontend/src/pages/` (ej. `frontend/src/pages/laboratorio/LaboratorioWorkspace.tsx`).
2.  Importá y utilizá las clases Glassmorphism predefinidas en Tailwind para integrarte al ecosistema monocromático:
    ```tsx
    export const LaboratorioWorkspace = () => {
      return (
        <div className="backdrop-blur-md bg-zinc-950/70 border border-zinc-800 rounded-lg p-6 shadow-2xl">
          <h2 className="text-zinc-100 text-lg font-semibold">Laboratorio IA</h2>
          {/* Contenido modular aquí */}
        </div>
      );
    };
    ```
3.  En `frontend/src/components/layout/SpatialLayout.tsx`, vinculá la activación de la habitación con el renderizado condicional de tu componente:
    ```tsx
    {activeRoom === "LABORATORIO" && <LaboratorioWorkspace />}
    ```

---

## 3. Conexión de Datos (TanStack Query y Named Exports)
1.  Para consultar o enviar datos, utilizá el cliente de API unificado ubicado en `frontend/src/lib/apiClient.ts`.
2.  Creá tu hook de consulta o mutación utilizando exportación con nombre:
    ```typescript
    import { useQuery } from '@tanstack/react-query';
    import { apiClient } from '../lib/apiClient';

    export const useDatosLaboratorio = (projectId: string) => {
      return useQuery({
        queryKey: ['laboratorio', projectId],
        queryFn: () => apiClient.get(`/api/laboratorio/${projectId}`).then(res => res.data),
      });
    };
    ```
3.  Consumí el hook dentro de tu componente de UI y controlá los estados de carga mediante esqueletos visuales (Loading Skeletons) nativos.
