import { useEffect, useMemo, useRef } from "react";

export interface BloqueAtomico {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly contenido: string;
}

interface PropsMenuSlash {
  readonly bloques: ReadonlyArray<BloqueAtomico>;
  readonly query: string;
  readonly indiceActivo: number;
  readonly alCambiarIndice: (i: number) => void;
  readonly alSeleccionar: (bloque: BloqueAtomico) => void;
  readonly alCerrar: () => void;
}

/**
 * Menú flotante de comandos slash (`/`). Accesible por teclado
 * (Arriba / Abajo / Enter / Escape) — la navegación se controla desde
 * el `PizarraEditor` para mantener el caret en el textarea.
 */
export function MenuSlash({
  bloques,
  query,
  indiceActivo,
  alCambiarIndice,
  alSeleccionar,
  alCerrar,
}: PropsMenuSlash) {
  const refLista = useRef<HTMLUListElement | null>(null);

  const filtrados = useMemo(() => filtrar(bloques, query), [bloques, query]);

  useEffect(() => {
    const item = refLista.current?.querySelector<HTMLLIElement>(
      `[data-indice="${indiceActivo}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }, [indiceActivo]);

  if (filtrados.length === 0) {
    return (
      <div
        role="listbox"
        aria-label="Bloques atómicos"
        className="absolute left-3 right-3 top-3 z-20 max-h-64 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl"
      >
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
          <span>Sin coincidencias para "{query}"</span>
          <button
            type="button"
            onClick={alCerrar}
            className="text-[11px] underline-offset-2 hover:underline"
          >
            Cerrar (Esc)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Bloques atómicos"
      className="absolute left-3 right-3 top-3 z-20 max-h-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>
          Bloques atómicos {query && <span className="text-foreground">/{query}</span>}
        </span>
        <span>↑↓ navegar · Enter insertar · Esc</span>
      </div>
      <ul ref={refLista} className="max-h-60 overflow-y-auto py-1">
        {filtrados.map((b, i) => {
          const activo = i === indiceActivo;
          return (
            <li
              key={b.id}
              data-indice={i}
              role="option"
              aria-selected={activo}
              onMouseEnter={() => alCambiarIndice(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                alSeleccionar(b);
              }}
              className={`cursor-pointer px-3 py-2 text-sm ${
                activo ? "bg-primary/15 text-foreground" : "text-foreground/90 hover:bg-secondary/60"
              }`}
            >
              <div className="font-medium">{b.nombre}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {b.descripcion}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function filtrar(
  bloques: ReadonlyArray<BloqueAtomico>,
  query: string,
): ReadonlyArray<BloqueAtomico> {
  const q = query.trim().toLowerCase();
  if (!q) return bloques;
  return bloques.filter(
    (b) =>
      b.nombre.toLowerCase().includes(q) ||
      b.descripcion.toLowerCase().includes(q),
  );
}

export function filtrarBloquesAtomicos(
  bloques: ReadonlyArray<BloqueAtomico>,
  query: string,
): ReadonlyArray<BloqueAtomico> {
  return filtrar(bloques, query);
}
