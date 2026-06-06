import React, { useState, useEffect } from 'react';
import { useCrmStore, type Contract } from '../../store/useCrmStore';
import { useAgencyStore } from '../../store/useAgencyStore';
import { api } from '../../lib/apiClient';
import { Plus, Trash2, Edit, ExternalLink } from 'lucide-react';
import Swal from 'sweetalert2';
import { ContractVisualizer } from './contracts/ContractVisualizer';
import { ContractEditorForm } from './contracts/ContractEditorForm';

const TEMPLATE_CONTRATO_BASE = `# CONTRATO DE PRESTACIÓN DE SERVICIOS DIGITALES

Conste por el presente documento, el Contrato de Prestación de Servicios de Diseño y Desarrollo de Software que celebran de una parte MateCode Argentina (en adelante la EMPRESA/AGENCIA) y de la otra parte el CLIENTE especificado en la carátula de este documento.

## CLAUSULAS GENERALES

### PRIMERA: OBJETO DEL CONTRATO
La EMPRESA se compromete a realizar los servicios de diseño UX/UI, maquetación frontend y desarrollo técnico backend del sitio web o aplicación acordada según el relevamiento inicial.

### SEGUNDA: PLAZOS Y ENTREGAS
El desarrollo se ejecutará de forma ágil siguiendo las fases del mapa de hitos. Cada entrega intermedia requerirá la conformidad del CLIENTE para proceder a la siguiente etapa.

### TERCERA: PROPIEDAD INTELECTUAL
Una vez cancelado el monto total del proyecto, la titularidad del código fuente y los recursos visuales del sitio web serán propiedad exclusiva del CLIENTE.

---
Firmado digitalmente por ambas partes en conformidad de los términos establecidos.
`;

export const AgencyContractsSubPanel: React.FC = () => {
  const { leads, fetchLeads, contracts, fetchContracts, createContract, updateContract, deleteContract, signContract } = useCrmStore();
  const { activeAgency } = useAgencyStore();
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: '',
    clienteId: '',
    titulo: '',
    contenido: '',
    estado: 'Borrador',
    tipoContrato: 'Cliente',
    miembrosIds: [] as string[]
  });



  useEffect(() => {
    fetchLeads();
    fetchContracts();
  }, []);

  useEffect(() => {
    const loadMembers = async () => {
      if (!activeAgency?.id) return;
      try {
        const res = await api.get('/AgencyOperations/members');
        setMembers(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadMembers();
  }, [activeAgency?.id]);

  useEffect(() => {
    if (viewingContract) {
      loadHistory(viewingContract.id);
    } else {
      setHistory([]);
    }
  }, [viewingContract]);

  const loadHistory = async (contractId: string) => {
    try {
      const data = await api.get(`/AgencyContract/${contractId}/history`);
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNew = () => {
    const firstClient = leads[0]?.id || '';
    setForm({
      id: '',
      clienteId: firstClient,
      titulo: 'Contrato de Servicios de Desarrollo Web - ' + (leads[0]?.nombre || ''),
      contenido: TEMPLATE_CONTRATO_BASE,
      estado: 'Borrador',
      tipoContrato: 'Cliente',
      miembrosIds: []
    });
    setIsFormOpen(true);
  };

  const handleEdit = (c: Contract) => {
    let mIds: string[] = [];
    if (c.miembrosIds) {
      try {
        mIds = typeof c.miembrosIds === 'string' ? JSON.parse(c.miembrosIds) : c.miembrosIds;
        if (!Array.isArray(mIds)) mIds = [];
      } catch {
        mIds = [];
      }
    }
    setForm({
      id: c.id,
      clienteId: c.clienteId || '',
      titulo: c.titulo,
      contenido: c.contenido,
      estado: c.estado,
      tipoContrato: c.tipoContrato || 'Cliente',
      miembrosIds: mIds
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar contrato?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await deleteContract(id);
      Swal.fire({ title: 'Contrato eliminado', icon: 'success', background: '#09090b', color: '#f4f4f5' });
      fetchContracts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.tipoContrato === 'Cliente' && !form.clienteId) {
        throw new Error('Debes seleccionar un cliente.');
      }
      if (!form.titulo.trim() || !form.contenido.trim()) {
        throw new Error('Título y contenido son requeridos.');
      }

      if (form.id) {
        await updateContract(form.id, {
          titulo: form.titulo,
          contenido: form.contenido,
          estado: form.estado
        });
      } else {
        await createContract({
          clienteId: form.tipoContrato === 'Cliente' ? form.clienteId : undefined,
          titulo: form.titulo,
          contenido: form.contenido,
          estado: form.estado,
          tipoContrato: form.tipoContrato,
          miembrosIds: form.tipoContrato !== 'Cliente' ? form.miembrosIds : []
        });
      }

      setIsFormOpen(false);
      Swal.fire({ title: 'Contrato guardado', icon: 'success', background: '#09090b', color: '#f4f4f5' });
      fetchContracts();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', background: '#09090b', color: '#f4f4f5' });
    }
  };

  const handleSignContract = async (huellaCripto: string) => {
    if (!viewingContract) return;

    try {
      await signContract(viewingContract.id, huellaCripto);
      setViewingContract({
        ...viewingContract,
        estado: 'Firmado',
        fechaFirma: new Date().toISOString(),
        huellaCriptografica: huellaCripto
      });

      Swal.fire({
        title: '¡Contrato Firmado!',
        text: `El acuerdo se ha cerrado con éxito. Huella: ${huellaCripto}`,
        icon: 'success',
        background: '#09090b',
        color: '#f4f4f5',
        confirmButtonColor: '#10b981'
      });
      fetchContracts();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const getContractTargetLabel = (c: Contract) => {
    if (c.tipoContrato === 'Cliente') {
      return `Cliente: ${c.cliente?.nombre || 'No asignado'}`;
    }
    if (c.tipoContrato === 'Trabajo' || c.tipoContrato === 'Socios') {
      let mIds: string[] = [];
      if (c.miembrosIds) {
        try {
          mIds = typeof c.miembrosIds === 'string' ? JSON.parse(c.miembrosIds) : c.miembrosIds;
        } catch {
          mIds = [];
        }
      }
      if (!Array.isArray(mIds)) mIds = [];
      
      const names = members
        .filter(m => mIds.includes(m.usuario_id || m.usuarioId || m.usuario?.id))
        .map(m => {
          const name = m.usuario?.nombreCompleto || m.usuario?.nombre_completo || m.usuario?.nombre;
          const handle = m.usuario?.nombre_usuario || m.usuario?.nombreUsuario;
          return name ? (handle ? `${name} (@${handle})` : name) : (handle ? `@${handle}` : 'Miembro');
        })
        .join(', ');
      return `${c.tipoContrato === 'Socios' ? 'Socios' : 'Equipo'}: ${names || 'Varios miembros'}`;
    }
    return 'Acuerdo General / Institucional';
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {viewingContract ? (
        <ContractVisualizer
          contract={viewingContract}
          onBack={() => setViewingContract(null)}
          history={history}
          targetLabel={getContractTargetLabel(viewingContract)}
          onSignContract={handleSignContract}
        />
      ) : isFormOpen ? (
        <ContractEditorForm
          form={form}
          setForm={setForm}
          leads={leads}
          members={members}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : (
        /* Contracts List */
        <div className="space-y-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contratos de la Agencia</h3>
              <p className="text-zinc-500 text-[10px] mt-0.5">Administra los documentos firmados y propuestas vigentes de tu empresa.</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Nuevo Contrato</span>
            </button>
          </div>

          {contracts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-zinc-850 rounded-2xl">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No hay contratos activos</p>
              <p className="text-[10px] text-zinc-650 mt-1">Crea un contrato para formalizar acuerdos y recibir firmas digitales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contracts.map(c => (
                <div key={c.id} className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        c.estado === 'Firmado'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {c.estado}
                      </span>
                      <div className="flex items-center gap-1">
                        {c.estado !== 'Firmado' && (
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 hover:bg-zinc-805 rounded-lg text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-zinc-855 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{c.titulo}</h4>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{getContractTargetLabel(c)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
                    <span className="text-[9px] text-zinc-600 font-bold">{new Date(c.fechaCreacion).toLocaleDateString()}</span>
                    <button
                      onClick={() => setViewingContract(c)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors border border-zinc-750"
                    >
                      <ExternalLink size={10} />
                      <span>{c.estado === 'Firmado' ? 'Ver Contrato' : 'Firmar / Ver'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
