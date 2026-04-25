import React, { useMemo } from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface MatrixData {
  roles: { name: string; description: string }[];
  permission_matrix: any[];
}

interface Props {
  code: string;
}

export const RolesMatrixView: React.FC<Props> = ({ code }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);

  const data = useMemo(() => {
    try {
      return JSON.parse(code) as MatrixData;
    } catch (e) {
      return null;
    }
  }, [code]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollLeft(scrollRef.current.scrollLeft);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const y = e.pageY - scrollRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walkX;
    scrollRef.current.scrollTop = scrollTop - walkY;
  };

  const stopDragging = () => setIsDragging(false);

  if (!data || !data.roles || !Array.isArray(data.permission_matrix)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
        <ShieldCheck size={48} className="opacity-20" />
        <p className="text-sm font-medium">Esperando matriz de permisos válida...</p>
      </div>
    );
  }

  const roles = data.roles;
  const matrix = data.permission_matrix;

  return (
    <div className="h-full w-full bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`overflow-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent flex-1 ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-20 bg-zinc-900 shadow-xl">
            <tr>
              <th className="p-6 border-b border-zinc-800 bg-zinc-900 min-w-[150px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Módulo</span>
                </div>
              </th>
              <th className="p-6 border-b border-zinc-800 bg-zinc-900 min-w-[250px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Funcionalidad / Permiso</span>
                </div>
              </th>
              {roles.map((role: any) => (
                <th key={role.name} className="p-6 border-b border-zinc-800 bg-zinc-900 text-center min-w-[160px]">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-sm text-white font-black">{role.name}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-medium leading-tight max-w-[140px] line-clamp-2">
                      {role.description}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {matrix.map((row: any, idx: number) => (
              <tr key={idx} className="hover:bg-zinc-900/50 transition-colors group">
                <td className="p-4 border-r border-zinc-900">
                   <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {row.modulo}
                   </span>
                </td>
                <td className="p-6 border-r border-zinc-900">
                  <span className="text-xs text-zinc-200 font-bold group-hover:text-emerald-400 transition-colors">
                    {row.permiso}
                  </span>
                </td>
                {roles.map((role: any) => {
                  const access = row[role.name];
                  const hasAccess = access === "SÍ" || access === "SI" || access === true;

                  return (
                    <td key={role.name} className="p-6 text-center border-r border-zinc-900">
                      <div className="flex justify-center">
                        {hasAccess ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-in zoom-in duration-300">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase">SÍ</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/20 border border-zinc-800/50 rounded-full opacity-30">
                            <XCircle size={14} className="text-zinc-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase">NO</span>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer Informativo */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
        <span>Sincronizado con el Modelo de Seguridad RBAC</span>
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> 
              <span>Acceso Concedido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-700" /> 
              <span>Acceso Denegado</span>
            </div>
        </div>
      </div>
    </div>
  );
};
