import React, { useState, useEffect } from 'react';
import { PermissionsMatrix } from '../../components/team/PermissionsMatrix';
import { useProject } from '../../context/ProjectContext';
import Swal from 'sweetalert2';

interface TeamMember {
  id: string;
  nombreCompleto: string;
  email: string;
  etiquetaRol: string;
  matrizPermisos: any;
}

export default function TeamManagement() {
  const { tenantId } = useProject();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5241/api/Team', {
        headers: { 'X-Tenant-Id': tenantId }
      });
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
        if (data.length > 0) setSelectedMember(data[0]);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [tenantId]);

  const handleInvite = async () => {
    const { value: email } = await Swal.fire({
      title: 'Invitar al equipo',
      input: 'email',
      inputLabel: 'Correo electrónico del nuevo integrante',
      inputPlaceholder: 'ejemplo@correo.com',
      showCancelButton: true,
      background: '#18181b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Enviar Invitación'
    });

    if (email) {
      try {
        const response = await fetch('http://localhost:5241/api/Team/invite', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Tenant-Id': tenantId 
          },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          Swal.fire({
            title: '¡Invitación Enviada!',
            text: `Se ha enviado un correo a ${email}`,
            icon: 'success',
            background: '#18181b',
            color: '#f4f4f5',
            confirmButtonColor: '#10b981'
          });
        }
      } catch (error) {
        console.error('Error inviting member:', error);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Equipo y Roles</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Invitá a tu equipo, definí sus roles visuales y armá sus permisos a medida.
          </p>
        </div>
        <button 
          onClick={handleInvite}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm transition cursor-pointer">
          Invitar Miembro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Miembros del Equipo</h2>
          
          {loading ? (
            <div className="text-slate-500 text-sm">Cargando equipo...</div>
          ) : team.map(member => (
            <div 
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-4 bg-white dark:bg-slate-800 border rounded-lg cursor-pointer transition ${
                selectedMember?.id === member.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500'
              }`}>
              <span className="block font-medium text-slate-900 dark:text-white">{member.nombreCompleto}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{member.etiquetaRol}</span>
            </div>
          ))}
          {team.length === 0 && !loading && (
            <div className="text-sm text-slate-500 italic">No hay otros miembros aún.</div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-4">
           <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
             Matriz de Permisos ({selectedMember?.nombreCompleto || 'Seleccioná un miembro'})
           </h2>
           
           {selectedMember ? (
             <PermissionsMatrix initialMatrix={selectedMember.matrizPermisos} />
           ) : (
             <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
               Seleccioná un miembro para ver sus permisos
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
