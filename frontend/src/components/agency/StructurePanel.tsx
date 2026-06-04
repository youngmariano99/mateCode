import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Plus, Shield, ExternalLink, Building, Globe, Palette, Megaphone, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAgencyStore } from '../../store/useAgencyStore';
import type { Member, Agency } from '../../store/useAgencyStore';

interface StructurePanelProps {
  activeAgency: Agency | null;
  agencyWorkspaces: any[];
  agencyMembers: Member[];
  onOpenInviteModal: () => void;
  onOpenPermModal: (member: Member) => void;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({
  activeAgency,
  agencyWorkspaces,
  agencyMembers,
  onOpenInviteModal,
  onOpenPermModal
}) => {
  const navigate = useNavigate();
  const { setAgencyId, updateAgencyProfile } = useAgencyStore();
  const [subTab, setSubTab] = useState<'team' | 'identity'>('team');

  // Form States
  const [nombre, setNombre] = useState('');
  const [mision, setMision] = useState('');
  const [vision, setVision] = useState('');
  
  // Networks
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Branding
  const [logoUrl, setLogoUrl] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#10b981');
  const [colorSecundario, setColorSecundario] = useState('#6366f1');
  const [tipografia, setTipografia] = useState('Inter');

  // Marketing
  const [publicoObjetivo, setPublicoObjetivo] = useState('');
  const [propuestaValor, setPropuestaValor] = useState('');
  const [tonoVoz, setTonoVoz] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeAgency) {
      setNombre(activeAgency.nombre || '');
      setMision(activeAgency.mision || '');
      setVision(activeAgency.vision || '');
      
      const redes = typeof activeAgency.redes_sociales === 'string' 
        ? JSON.parse(activeAgency.redes_sociales) 
        : (activeAgency.redes_sociales || {});
      setInstagram(redes.instagram || '');
      setLinkedin(redes.linkedin || '');
      setYoutube(redes.youtube || '');
      setTiktok(redes.tiktok || '');

      const brand = typeof activeAgency.branding === 'string' 
        ? JSON.parse(activeAgency.branding) 
        : (activeAgency.branding || {});
      setLogoUrl(brand.logoUrl || '');
      setColorPrimario(brand.colorPrimario || '#10b981');
      setColorSecundario(brand.colorSecundario || '#6366f1');
      setTipografia(brand.tipografia || 'Inter');

      const mkt = typeof activeAgency.datos_marketing === 'string' 
        ? JSON.parse(activeAgency.datos_marketing) 
        : (activeAgency.datos_marketing || {});
      setPublicoObjetivo(mkt.publicoObjetivo || '');
      setPropuestaValor(mkt.propuestaValor || '');
      setTonoVoz(mkt.tonoVoz || '');
    }
  }, [activeAgency]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgency) return;
    setIsSaving(true);
    
    const redesObj = { instagram, linkedin, youtube, tiktok };
    const brandObj = { logoUrl, colorPrimario, colorSecundario, tipografia };
    const mktObj = { publicoObjetivo, propuestaValor, tonoVoz };

    try {
      const ok = await updateAgencyProfile(
        activeAgency.id,
        nombre,
        redesObj,
        brandObj,
        mision,
        vision,
        mktObj
      );
      if (ok) {
        Swal.fire({
          title: 'Perfil Guardado',
          text: 'Los datos de la empresa se actualizaron correctamente.',
          icon: 'success',
          background: '#09090b',
          color: '#f4f4f5',
          confirmButtonColor: '#10b981'
        });
      } else {
        Swal.fire({
          title: 'Aviso',
          text: 'No se pudo guardar la información del perfil.',
          icon: 'warning',
          background: '#09090b',
          color: '#f4f4f5'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.message || 'Error al actualizar el perfil.',
        icon: 'error',
        background: '#09090b',
        color: '#f4f4f5'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800/80 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Building className="text-sky-400" />
            <span>Gestión de la Organización</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Administra la estructura del equipo, espacios de trabajo e identidad corporativa de la agencia.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sub-navigation tabs */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setSubTab('team')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'team'
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users size={12} />
              <span>Estructura & Equipo</span>
            </button>
            <button
              onClick={() => setSubTab('identity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'identity'
                  ? 'bg-zinc-850 text-white shadow-sm border border-zinc-750'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette size={12} />
              <span>Identidad & Branding</span>
            </button>
          </div>

          {subTab === 'team' && activeAgency?.tipo !== 'personal' && (
            <button
              onClick={onOpenInviteModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus size={14} />
              <span>Invitar Miembro</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'team' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Espacios y Proyectos */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-400" />
              <span>Árbol de Proyectos</span>
            </h3>
            
            <div className="space-y-4">
              {agencyWorkspaces.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 text-center rounded-2xl text-zinc-650 text-xs">
                  No se han cimentado espacios de trabajo en esta organización.
                </div>
              ) : (
                agencyWorkspaces.map(ws => (
                  <div key={ws.id} className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-zinc-100 flex items-center gap-2">
                        <Briefcase size={14} className="text-zinc-500" />
                        <span>{ws.nombre}</span>
                      </span>
                      <button
                        onClick={() => {
                          setAgencyId(activeAgency?.id || null);
                          localStorage.setItem('mc_current_tenant', ws.id);
                          navigate(`/workspace/mi-oficina`);
                        }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                      >
                        <span>Ingresar al mapa</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500">ID: {ws.id}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Miembros y Roles */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              <span>Miembros de la Organización</span>
            </h3>

            <div className="space-y-3">
              {agencyMembers.map(m => (
                <div key={m.usuario_id} className="p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-200">{m.usuario?.nombre_completo || 'Usuario'}</p>
                    <p className="text-xs text-zinc-500">{m.usuario?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[9px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full">
                        {m.rol}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        m.estado_invitacion === 'Aceptada' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {m.estado_invitacion}
                      </span>
                    </div>
                  </div>

                  {activeAgency?.tipo !== 'personal' && m.rol !== 'Propietario' && (
                    <button
                      onClick={() => onOpenPermModal(m)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Shield size={12} className="text-indigo-400" />
                      <span>Permisos</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Formulario de Perfil, Branding e Identidad */
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sección 1: Datos Fundacionales */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                <Building size={16} className="text-sky-400" />
                <span>Datos de la Organización</span>
              </h3>
              
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Nombre de la Organización / Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="MateCode S.A."
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-sky-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Misión de la Empresa</label>
                <textarea
                  rows={3}
                  placeholder="Nuestra misión es empoderar a..."
                  value={mision}
                  onChange={e => setMision(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Visión de la Empresa</label>
                <textarea
                  rows={3}
                  placeholder="Ser el referente global de soluciones..."
                  value={vision}
                  onChange={e => setVision(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-sky-500/50 resize-none"
                />
              </div>
            </div>

            {/* Sección 2: Branding Visual */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                <Palette size={16} className="text-emerald-400" />
                <span>Identidad Visual & Marca</span>
              </h3>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Enlace del Logotipo (URL)</label>
                <input
                  type="text"
                  placeholder="https://ejemplo.com/mi-logo.png"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Color Primario</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorPrimario}
                      onChange={e => setColorPrimario(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      placeholder="#10b981"
                      value={colorPrimario}
                      onChange={e => setColorPrimario(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-850 px-2 rounded-lg text-xs text-white uppercase outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Color Secundario</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorSecundario}
                      onChange={e => setColorSecundario(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      placeholder="#6366f1"
                      value={colorSecundario}
                      onChange={e => setColorSecundario(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-850 px-2 rounded-lg text-xs text-white uppercase outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Tipografía Principal</label>
                <select
                  value={tipografia}
                  onChange={e => setTipografia(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="Inter">Inter (Recomendada)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Geist">Geist</option>
                </select>
              </div>
            </div>

            {/* Sección 3: Redes Sociales */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                <Globe size={16} className="text-indigo-400" />
                <span>Enlaces de Redes Sociales</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Instagram</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/miusuario"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/company/miempresa"
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">YouTube</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/@miempresa"
                    value={youtube}
                    onChange={e => setYoutube(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">TikTok</label>
                  <input
                    type="text"
                    placeholder="https://tiktok.com/@miempresa"
                    value={tiktok}
                    onChange={e => setTiktok(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Datos de Marketing & Generación */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-zinc-800/60">
                <Megaphone size={16} className="text-pink-400" />
                <span>Estrategia de Marketing & Contenido</span>
              </h3>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Público Objetivo</label>
                <input
                  type="text"
                  placeholder="Ej: Emprendedores, Agencias de diseño, Pymes tecnológicas..."
                  value={publicoObjetivo}
                  onChange={e => setPublicoObjetivo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-pink-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Propuesta de Valor Única</label>
                <input
                  type="text"
                  placeholder="Ej: Creamos software de vanguardia con branding único en tiempo récord."
                  value={propuestaValor}
                  onChange={e => setPropuestaValor(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-pink-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Tono de Comunicación / Voz</label>
                <input
                  type="text"
                  placeholder="Ej: Profesional pero cercano, innovador, amigable y directo."
                  value={tonoVoz}
                  onChange={e => setTonoVoz(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white outline-none focus:border-pink-500/50"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-2xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
