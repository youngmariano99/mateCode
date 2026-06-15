import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, UserPlus, MapPin, ListFilter, ClipboardList, BookOpen, Link, Zap, Download } from 'lucide-react';
import { useCrmStore, type Lead } from '../../store/useCrmStore';
import { AgencyFormsPanel } from './AgencyFormsPanel';
import { AgencyContractsSubPanel } from './AgencyContractsSubPanel';
import { ClientesMapa } from './ClientesMapa';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const ETIQUETAS_OPCIONES = [
  "Anota en papel", "Local propio", "Local alquilado", "Desbordado de gente",
  "Local vacío", "Usa Posnet", "Sólo efectivo", "Familiar / Pyme",
  "Cadena / Franquicia", "Desconfiado de la tecnología", "Curioso / Abierto",
  "Joven / Digital", "Ya intentó digitalizarse", "Necesita urgente", "Volve más tarde"
];

export const CrmPanel: React.FC = () => {
  const { leads, fetchLeads, createLead, updateLead, updateLeadStatus, deleteLead, rubros, fetchRubros } = useCrmStore();
  const [activeTab, setActiveTab] = useState<'kanban' | 'map' | 'forms' | 'contracts' | 'responses'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [associatingLead, setAssociatingLead] = useState<Lead | null>(null);
  const [associationSearch, setAssociationSearch] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    categoria: 'Lead',
    calificacion: 'Calificado',
    origenContacto: '',
    motivoContacto: '',
    descripcion: '',
    rubro: '',
    direccionTexto: '',
    latitud: null as number | null,
    longitud: null as number | null,
    etiquetasRapidas: [] as string[],
    tipoSoftwareTiene: '',
    tipoSoftwareQuiere: '',
    doloresNotas: '',
    bitacoraContactos: [] as any[],
    linksRecursos: [] as any[]
  });

  useEffect(() => {
    fetchLeads();
    fetchRubros();
  }, []);

  const [addrFields, setAddrFields] = useState({
    calle: '',
    altura: '',
    ciudad: 'Coronel Pringles',
    provincia: 'Buenos Aires',
    pais: 'Argentina'
  });
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);

  const handleSearchAddress = async () => {
    const { calle, altura, ciudad, provincia, pais } = addrFields;
    if (!calle.trim()) {
      Swal.fire({ title: 'Falta Calle', text: 'Ingresa al menos el nombre de la calle.', icon: 'info' });
      return;
    }

    setIsSearchingGeocode(true);
    const query = `${calle} ${altura}, ${ciudad}, ${provincia}, ${pais}`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const match = data[0];
          setForm(f => ({
            ...f,
            direccionTexto: match.display_name || query,
            latitud: parseFloat(match.lat),
            longitud: parseFloat(match.lon)
          }));
          Swal.fire({
            title: '¡Dirección Encontrada!',
            text: `Se ubicó correctamente:\n${match.display_name}`,
            icon: 'success',
            background: '#09090b',
            color: '#f4f4f5',
            confirmButtonColor: '#10b981'
          });
        } else {
          Swal.fire({
            title: 'No encontrada',
            text: 'No se encontraron coordenadas exactas. Se guardará como texto pero sin ubicación en el mapa.',
            icon: 'warning',
            background: '#09090b',
            color: '#f4f4f5',
            confirmButtonColor: '#ef4444'
          });
          setForm(f => ({ ...f, direccionTexto: query }));
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: 'Ocurrió un error consultando el servidor cartográfico.', icon: 'error' });
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const isFormResponse = (lead: Lead) => {
    const ctx = lead.contextoJson || (lead as any).contexto_json;
    return ctx?.esRespuestaFormulario === true;
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);

    // Parse address fields
    let calle = '';
    let altura = '';
    let ciudad = 'Coronel Pringles';
    let provincia = 'Buenos Aires';
    let pais = 'Argentina';
    if (lead.direccionTexto) {
      const parts = lead.direccionTexto.split(',').map(p => p.trim());
      if (parts.length >= 1) {
        if (!isNaN(Number(parts[0]))) {
          altura = parts[0];
          calle = parts[1] || '';
          ciudad = parts[2] || 'Coronel Pringles';
          provincia = parts[5] || 'Buenos Aires';
          pais = parts[parts.length - 1] || 'Argentina';
        } else {
          const spaceIndex = parts[0].lastIndexOf(' ');
          if (spaceIndex !== -1 && !isNaN(Number(parts[0].substring(spaceIndex + 1)))) {
            calle = parts[0].substring(0, spaceIndex);
            altura = parts[0].substring(spaceIndex + 1);
          } else {
            calle = parts[0];
          }
          ciudad = parts[1] || 'Coronel Pringles';
          provincia = parts[2] || 'Buenos Aires';
          pais = parts[parts.length - 1] || 'Argentina';
        }
      }
    }
    setAddrFields({ calle, altura, ciudad, provincia, pais });

    setForm({
      nombre: lead.nombre,
      email: lead.email || '',
      categoria: lead.categoria,
      calificacion: lead.calificacion,
      origenContacto: lead.origenContacto || '',
      motivoContacto: lead.motivoContacto || '',
      descripcion: lead.descripcion || '',
      rubro: lead.rubro || '',
      direccionTexto: lead.direccionTexto || '',
      latitud: lead.latitud ?? null,
      longitud: lead.longitud ?? null,
      etiquetasRapidas: lead.etiquetasRapidas || [],
      tipoSoftwareTiene: lead.tipoSoftwareTiene || '',
      tipoSoftwareQuiere: lead.tipoSoftwareQuiere || '',
      doloresNotas: lead.doloresNotas || '',
      bitacoraContactos: lead.bitacoraContactos || [],
      linksRecursos: lead.linksRecursos || []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    setAddrFields({
      calle: '',
      altura: '',
      ciudad: 'Coronel Pringles',
      provincia: 'Buenos Aires',
      pais: 'Argentina'
    });
    setForm({
      nombre: '',
      email: '',
      categoria: 'Lead',
      calificacion: 'Calificado',
      origenContacto: '',
      motivoContacto: '',
      descripcion: '',
      rubro: '',
      direccionTexto: '',
      latitud: null,
      longitud: null,
      etiquetasRapidas: [],
      tipoSoftwareTiene: '',
      tipoSoftwareQuiere: '',
      doloresNotas: '',
      bitacoraContactos: [],
      linksRecursos: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, form);
      } else {
        await createLead(form);
      }
      fetchRubros(); // Refresh unique rubros list
      handleCloseModal();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleMapClickCreate = (lat: number, lng: number, address: string) => {
    // Parse address fields
    let calle = '';
    let altura = '';
    let ciudad = 'Coronel Pringles';
    let provincia = 'Buenos Aires';
    let pais = 'Argentina';
    if (address) {
      const parts = address.split(',').map(p => p.trim());
      if (parts.length >= 1) {
        if (!isNaN(Number(parts[0]))) {
          altura = parts[0];
          calle = parts[1] || '';
          ciudad = parts[2] || 'Coronel Pringles';
          provincia = parts[5] || 'Buenos Aires';
          pais = parts[parts.length - 1] || 'Argentina';
        } else {
          const spaceIndex = parts[0].lastIndexOf(' ');
          if (spaceIndex !== -1 && !isNaN(Number(parts[0].substring(spaceIndex + 1)))) {
            calle = parts[0].substring(0, spaceIndex);
            altura = parts[0].substring(spaceIndex + 1);
          } else {
            calle = parts[0];
          }
          ciudad = parts[1] || 'Coronel Pringles';
          provincia = parts[2] || 'Buenos Aires';
          pais = parts[parts.length - 1] || 'Argentina';
        }
      }
    }
    setAddrFields({ calle, altura, ciudad, provincia, pais });

    setForm({
      nombre: '',
      email: '',
      categoria: 'Lead',
      calificacion: 'Calificado',
      origenContacto: 'Mapa Geolocalización',
      motivoContacto: '',
      descripcion: '',
      rubro: '',
      direccionTexto: address,
      latitud: lat,
      longitud: lng,
      etiquetasRapidas: [],
      tipoSoftwareTiene: '',
      tipoSoftwareQuiere: '',
      doloresNotas: '',
      bitacoraContactos: [],
      linksRecursos: []
    });
    setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await updateLeadStatus(id, targetCategory);
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar prospecto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
      await deleteLead(id);
    }
  };

  const handleConvertToLead = async (lead: Lead) => {
    try {
      const ctx = { ...(lead.contextoJson || (lead as any).contexto_json || {}) };
      ctx.esRespuestaFormulario = false;
      await updateLead(lead.id, { contextoJson: ctx });
      Swal.fire({
        title: 'Prospecto Promovido',
        text: 'La respuesta de formulario se ha convertido en lead activo del CRM.',
        icon: 'success',
        timer: 1800
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleOpenAssociateModal = (lead: Lead) => {
    setAssociatingLead(lead);
    setAssociationSearch('');
  };

  const handleAssociateConfirm = async (targetClient: Lead) => {
    if (!associatingLead) return;
    try {
      const ctx = associatingLead.contextoJson || (associatingLead as any).contexto_json || {};
      const contextDetails = Object.entries(ctx)
        .filter(([key]) => key !== 'esRespuestaFormulario' && key !== 'formTemplateId' && key !== 'nombre' && key !== 'email')
        .map(([key, value]) => `• ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n');

      const mergedDescription = `${targetClient.descripcion || ''}\n\n--- Respuesta de Formulario (${new Date(associatingLead.fechaCreacion).toLocaleDateString()}) ---\n${contextDetails || associatingLead.descripcion || ''}`;

      await updateLead(targetClient.id, { descripcion: mergedDescription });
      await deleteLead(associatingLead.id);

      setAssociatingLead(null);
      Swal.fire({
        title: 'Asociación Exitosa',
        text: 'Las respuestas del formulario se han incorporado al cliente.',
        icon: 'success',
        timer: 1800
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleExportToExcel = () => {
    try {
      // Build a CSV representation of leads
      const headers = [
        'Nombre/Comercio',
        'Email',
        'Categoria (CRM Status)',
        'Calificacion',
        'Rubro',
        'Direccion',
        'Latitud',
        'Longitud',
        'Etiquetas Rapidas',
        'Software que Tiene',
        'Software que Quiere',
        'Dolores/Problemas',
        'Origen de Contacto',
        'Fecha Creacion'
      ];

      const rows = leads
        .filter(l => !isFormResponse(l))
        .map(l => [
          `"${l.nombre.replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${l.categoria}"`,
          `"${l.calificacion}"`,
          `"${(l.rubro || '').replace(/"/g, '""')}"`,
          `"${(l.direccionTexto || '').replace(/"/g, '""')}"`,
          l.latitud ?? '',
          l.longitud ?? '',
          `"${(l.etiquetasRapidas || []).join(', ').replace(/"/g, '""')}"`,
          `"${(l.tipoSoftwareTiene || '').replace(/"/g, '""')}"`,
          `"${(l.tipoSoftwareQuiere || '').replace(/"/g, '""')}"`,
          `"${(l.doloresNotas || '').replace(/"/g, '""')}"`,
          `"${(l.origenContacto || '').replace(/"/g, '""')}"`,
          new Date(l.fechaCreacion).toLocaleDateString()
        ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Clientes_CRM_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      Swal.fire({ title: 'Error al exportar', text: err.message, icon: 'error' });
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {activeTab === 'kanban'
                ? 'Clientes & Leads (CRM)'
                : activeTab === 'map'
                  ? 'Mapa de Clientes'
                  : activeTab === 'forms'
                    ? 'Formularios de Captación'
                    : activeTab === 'contracts'
                      ? 'Contratos Digitales'
                      : 'Respuestas de Formularios'}
            </h1>
            <p className="text-zinc-500 text-xs mt-1">
              {activeTab === 'kanban'
                ? 'Arrastra y suelta prospectos para calificar tus oportunidades de venta de software.'
                : activeTab === 'map'
                  ? 'Toca cualquier punto en el mapa para registrar un comercio o negocio geolocalizado en vivo.'
                  : activeTab === 'forms'
                    ? 'Crea y administra los cuestionarios de relevamiento para captar clientes desde tu enlace mágico.'
                    : activeTab === 'contracts'
                      ? 'Formaliza tus relaciones comerciales con firmas digitales criptográficas dibujables.'
                      : 'Inbox de respuestas completadas por clientes potenciales a través del enlace mágico.'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isFormResponse(selectedLead || ({} as any)) && (
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                title="Exportar a CSV/Excel"
              >
                <Download size={14} />
                <span>Exportar Excel</span>
              </button>
            )}
            {activeTab === 'kanban' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Plus size={14} />
                <span>Cargar Lead</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${activeTab === 'kanban' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <span>Tablero Kanban</span>
            {activeTab === 'kanban' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${activeTab === 'map' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <span>Mapa de Clientes</span>
            {activeTab === 'map' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${activeTab === 'responses' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <div className="flex items-center gap-1.5">
              <span>Respuestas Recibidas</span>
              {leads.filter(isFormResponse).length > 0 && (
                <span className="bg-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                  {leads.filter(isFormResponse).length}
                </span>
              )}
            </div>
            {activeTab === 'responses' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${activeTab === 'forms' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <span>Formularios de Captación</span>
            {activeTab === 'forms' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`pb-2 px-4 text-xs font-bold transition-all relative ${activeTab === 'contracts' ? 'text-emerald-400 font-extrabold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
          >
            <span>Contratos Digitales</span>
            {activeTab === 'contracts' && (
              <motion.div layoutId="crmSubTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeTab === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
            {[
              { key: 'Lead', label: 'Lead / Prospecto' },
              { key: 'Llamada agendada', label: 'Llamada Agendada' },
              { key: 'Propuesta enviada', label: 'Propuesta Enviada' },
              { key: 'Aceptado', label: 'Ganado / Aceptado' },
              { key: 'Rechazado', label: 'Perdido / Rechazado' }
            ].map(col => (
              <div
                key={col.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.key)}
                className="bg-zinc-900/30 border border-zinc-800/60 rounded-3xl p-4 flex flex-col min-h-[500px]"
              >
                <h4 className="text-xs font-black uppercase text-zinc-400 border-b border-zinc-800 pb-2.5 mb-4 tracking-wider flex justify-between items-center">
                  <span>{col.label}</span>
                  <span className="bg-zinc-800/50 text-zinc-500 text-[10px] px-2 py-0.5 rounded-full">
                    {leads.filter(l => l.categoria === col.key && !isFormResponse(l)).length}
                  </span>
                </h4>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] neon-scrollbar pr-1">
                  {leads.filter(l => l.categoria === col.key && !isFormResponse(l)).map(lead => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-zinc-900/70 border border-zinc-850 hover:border-zinc-700/80 p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all space-y-2.5 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${lead.calificacion === 'Calificado'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                          {lead.calificacion}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(lead)}
                            className="text-zinc-500 hover:text-white transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <h5 className="font-bold text-white text-xs">{lead.nombre}</h5>
                      {lead.rubro && (
                        <span className="text-[9px] bg-zinc-950/40 border border-zinc-850 px-2.5 py-0.5 rounded-md text-zinc-400 font-bold inline-block w-fit">
                          🏷️ {lead.rubro}
                        </span>
                      )}
                      {lead.email && <p className="text-[10px] text-zinc-500">{lead.email}</p>}
                      {lead.descripcion && <p className="text-[10px] text-zinc-400 line-clamp-2 bg-zinc-950/20 p-2 rounded-lg">{lead.descripcion}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'map' ? (
          <ClientesMapa
            leads={leads}
            onSelectLead={handleEditClick}
            onMapClick={handleMapClickCreate}
            selectedLead={selectedLead}
          />
        ) : activeTab === 'responses' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.filter(isFormResponse).length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-550 bg-zinc-900/10 border border-zinc-800/40 rounded-3xl">
                  No hay respuestas de formularios en la bandeja de entrada.
                </div>
              ) : (
                leads.filter(isFormResponse).map(lead => {
                  const ctx = lead.contextoJson || (lead as any).contexto_json || {};
                  return (
                    <div
                      key={lead.id}
                      className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-3xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              Respuesta Formulario
                            </span>
                            <span className="text-[10px] text-zinc-500 block mt-1">
                              {new Date(lead.fechaCreacion).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-zinc-650 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{lead.nombre}</h4>
                        {lead.email && <p className="text-xs text-zinc-400">{lead.email}</p>}

                        <div className="bg-zinc-950/45 p-3.5 rounded-2xl text-[11px] text-zinc-400 space-y-1.5 max-h-[220px] overflow-y-auto neon-scrollbar">
                          {Object.entries(ctx)
                            .filter(([key]) => key !== 'esRespuestaFormulario' && key !== 'formTemplateId' && key !== 'nombre' && key !== 'email')
                            .map(([key, val]) => (
                              <div key={key} className="border-b border-zinc-900/40 pb-1 last:border-b-0">
                                <span className="font-bold text-zinc-500 block capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-white block whitespace-pre-wrap">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-zinc-850">
                        <button
                          onClick={() => handleConvertToLead(lead)}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          <span>Convertir a Lead</span>
                        </button>
                        <button
                          onClick={() => handleOpenAssociateModal(lead)}
                          className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={12} />
                          <span>Asociar a Cliente</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeTab === 'forms' ? (
          <AgencyFormsPanel />
        ) : (
          <AgencyContractsSubPanel />
        )}
      </div>

      {/* Modal Carga/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4 neon-scrollbar"
          >
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ClipboardList className="text-emerald-400 size-5" />
                <span>{selectedLead ? 'Ficha Comercial / Editar Lead' : 'Cargar Relevamiento Comercial'}</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Columna Izquierda: Datos Básicos & Geolocalización */}
              <div className="space-y-4">
                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2">Identificación General</h4>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nombre del Comercio/Negocio</label>
                    <input required type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Rubro</label>
                    <input
                      type="text"
                      list="rubros-sugeridos"
                      value={form.rubro}
                      onChange={e => setForm({ ...form, rubro: e.target.value })}
                      placeholder="Gastronomía, Indumentaria, Estética..."
                      className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white"
                    />
                    <datalist id="rubros-sugeridos">
                      {rubros.map(r => <option key={r} value={r} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Email de Contacto</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Estado de Lead</label>
                      <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                        <option value="Lead">Lead / Potencial</option>
                        <option value="Llamada agendada">Llamada agendada / Indeciso</option>
                        <option value="Propuesta enviada">Propuesta enviada</option>
                        <option value="Aceptado">Ganado / Aceptado</option>
                        <option value="Rechazado">Perdido / Rechazado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Calificación</label>
                      <select value={form.calificacion} onChange={e => setForm({ ...form, calificacion: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                        <option value="Calificado">Calificado</option>
                        <option value="No calificado">No calificado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2 flex items-center gap-1">
                    <MapPin size={10} className="text-red-400" />
                    <span>Ubicación en Mapa</span>
                  </h4>

                  {/* Address segmented inputs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Calle</label>
                      <input type="text" value={addrFields.calle} onChange={e => setAddrFields({ ...addrFields, calle: e.target.value })} placeholder="Ej: Rivadavia" className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Altura</label>
                      <input type="text" value={addrFields.altura} onChange={e => setAddrFields({ ...addrFields, altura: e.target.value })} placeholder="Ej: 1063" className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Ciudad</label>
                      <input type="text" value={addrFields.ciudad} onChange={e => setAddrFields({ ...addrFields, ciudad: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Provincia</label>
                      <input type="text" value={addrFields.provincia} onChange={e => setAddrFields({ ...addrFields, provincia: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">País</label>
                      <input type="text" value={addrFields.pais} onChange={e => setAddrFields({ ...addrFields, pais: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded-lg text-xs text-white" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSearchAddress}
                    disabled={isSearchingGeocode}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <span>{isSearchingGeocode ? 'Buscando...' : '🔍 Buscar Dirección (Geolocalizar)'}</span>
                  </button>

                  <div className="pt-2 border-t border-zinc-900/60 space-y-2">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Dirección Confirmada</label>
                      <input type="text" readOnly value={form.direccionTexto} placeholder="Dirección geocodificada..." className="w-full bg-zinc-950/60 border border-zinc-900 p-2 rounded-lg text-[10px] text-zinc-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="font-bold text-zinc-500 uppercase block mb-0.5">Latitud</span>
                        <input type="number" step="any" value={form.latitud ?? ''} onChange={e => setForm({ ...form, latitud: e.target.value ? parseFloat(e.target.value) : null })} className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-xs text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-500 uppercase block mb-0.5">Longitud</span>
                        <input type="number" step="any" value={form.longitud ?? ''} onChange={e => setForm({ ...form, longitud: e.target.value ? parseFloat(e.target.value) : null })} className="w-full bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-xs text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2">Dolores & Notas</h4>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Dolores, Necesidades y Problemáticas</label>
                    <textarea rows={3} value={form.doloresNotas} onChange={e => setForm({ ...form, doloresNotas: e.target.value })} placeholder="¿Qué le duele al comercio hoy? (ej. anota en papel, pierde stock...)" className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white resize-none" />
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Etiquetas Rápidas, Software, Bitácora & Enlaces */}
              <div className="space-y-4">
                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2 flex items-center justify-between">
                    <span>🏷️ Perfilado Sigiloso (Quick Tags)</span>
                    <span className="text-[9px] text-zinc-500 font-bold">{form.etiquetasRapidas.length} seleccionadas</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1 neon-scrollbar">
                    {ETIQUETAS_OPCIONES.map(tag => {
                      const activa = form.etiquetasRapidas.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            const nuevas = activa
                              ? form.etiquetasRapidas.filter(t => t !== tag)
                              : [...form.etiquetasRapidas, tag];
                            setForm({ ...form, etiquetasRapidas: nuevas });
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${activa
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                              : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                        >
                          {activa ? '✓ ' : ''}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2">Tecnología & Software</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Software que Tiene</label>
                      <input type="text" value={form.tipoSoftwareTiene} onChange={e => setForm({ ...form, tipoSoftwareTiene: e.target.value })} placeholder="Ej: Excel, Posnet..." className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Software que Quiere</label>
                      <select value={form.tipoSoftwareQuiere} onChange={e => setForm({ ...form, tipoSoftwareQuiere: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white">
                        <option value="">Sin definir</option>
                        <option value="Sistema de Gestión">Sistema de Gestión</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Sistema de Inventario">Sistema de Inventario</option>
                        <option value="Landing / Web Institucional">Landing / Web Institucional</option>
                        <option value="App Mobile">App Mobile</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2 flex items-center gap-1">
                    <ClipboardList size={10} className="text-yellow-400" />
                    <span>Bitácora de Contactos / Interacciones</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-contact-log"
                      placeholder="Nueva interacción... (Presiona Enter)"
                      className="flex-1 bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-xs text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const newLog = { fecha: new Date().toISOString(), resumen: val };
                            setForm(f => ({ ...f, bitacoraContactos: [...f.bitacoraContactos, newLog] }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('new-contact-log') as HTMLInputElement;
                        const val = el?.value.trim();
                        if (val) {
                          const newLog = { fecha: new Date().toISOString(), resumen: val };
                          setForm(f => ({ ...f, bitacoraContactos: [...f.bitacoraContactos, newLog] }));
                          el.value = '';
                        }
                      }}
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl"
                    >
                      +
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 neon-scrollbar">
                    {form.bitacoraContactos.map((log, idx) => (
                      <div key={idx} className="bg-zinc-950/50 border border-zinc-850 p-2 rounded-xl text-[10px] text-zinc-300 flex justify-between items-start">
                        <div>
                          <span className="text-zinc-500 font-bold block">{new Date(log.fecha).toLocaleDateString()}</span>
                          <span className="block mt-0.5">{log.resumen}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, bitacoraContactos: f.bitacoraContactos.filter((_, i) => i !== idx) }))}
                          className="text-red-400 hover:text-red-300 font-black ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-2 flex items-center gap-1">
                    <Link size={10} className="text-indigo-400" />
                    <span>Recursos & Enlaces Compartidos</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Título" id="new-resource-title" className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-xs text-white" />
                    <input type="text" placeholder="URL" id="new-resource-url" className="bg-zinc-950 border border-zinc-800 p-2 rounded-xl text-xs text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const tEl = document.getElementById('new-resource-title') as HTMLInputElement;
                      const uEl = document.getElementById('new-resource-url') as HTMLInputElement;
                      const title = tEl?.value.trim();
                      const url = uEl?.value.trim();
                      if (title && url) {
                        const newLink = { titulo: title, url };
                        setForm(f => ({ ...f, linksRecursos: [...f.linksRecursos, newLink] }));
                        tEl.value = '';
                        uEl.value = '';
                      }
                    }}
                    className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 text-xs font-bold rounded-xl"
                  >
                    + Vincular Recurso
                  </button>
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 neon-scrollbar">
                    {form.linksRecursos.map((link, idx) => (
                      <div key={idx} className="bg-zinc-950/50 border border-zinc-850 p-2 rounded-xl text-[10px] text-zinc-300 flex justify-between items-center">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline truncate max-w-[200px]">
                          {link.titulo}
                        </a>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, linksRecursos: f.linksRecursos.filter((_, i) => i !== idx) }))}
                          className="text-red-400 hover:text-red-300 font-black ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Pie de modal */}
              <div className="col-span-full flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-2">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black transition-colors shadow-lg shadow-emerald-500/10">
                  {selectedLead ? 'Guardar Ficha Comercial' : 'Crear Lead Geolocalizado'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Associate Lead Modal */}
      {associatingLead && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Asociar Respuesta a Cliente Existente</h3>
            <p className="text-xs text-zinc-400">
              Se fusionarán las respuestas de <strong>{associatingLead.nombre}</strong> al historial del cliente seleccionado y se borrará esta respuesta temporal.
            </p>
            <input
              type="text"
              placeholder="Buscar cliente por nombre o email..."
              value={associationSearch}
              onChange={e => setAssociationSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white"
            />
            <div className="max-h-[250px] overflow-y-auto neon-scrollbar space-y-2 border border-zinc-850 p-2 rounded-2xl bg-zinc-950/20">
              {leads
                .filter(l => !isFormResponse(l))
                .filter(l =>
                  l.nombre.toLowerCase().includes(associationSearch.toLowerCase()) ||
                  (l.email && l.email.toLowerCase().includes(associationSearch.toLowerCase()))
                )
                .map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleAssociateConfirm(client)}
                    className="w-full text-left p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-850 hover:border-zinc-700 transition-all text-xs flex flex-col gap-0.5"
                  >
                    <span className="font-bold text-white">{client.nombre}</span>
                    {client.email && <span className="text-[10px] text-zinc-500">{client.email}</span>}
                  </button>
                ))}
              {leads.filter(l => !isFormResponse(l)).length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-4">No hay clientes registrados en el CRM.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                onClick={() => setAssociatingLead(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-350 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
