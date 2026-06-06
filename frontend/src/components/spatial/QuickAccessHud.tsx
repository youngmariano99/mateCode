import { useEffect, useRef, useState } from "react";
import { 
  Zap, Link as LinkIcon, FileText, User, Copy, Plus, Trash2, 
  X, ExternalLink, StickyNote, Wrench, ShieldAlert, Bug, Camera 
} from "lucide-react";
import { api } from "../../lib/apiClient";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import Swal from "sweetalert2";
import { ImageCropModal } from "../common/ImageCropModal";
import { UploadAdapterFactory } from "../../services/UploadAdapters";

const SCRATCHPAD_KEY = "matecode_scratchpad_v1";
const BUGS_KEY = "matecode_platform_bugs";

interface CustomLink {
  id: string;
  name: string;
  url: string;
}

interface PlatformBug {
  id: string;
  title: string;
  section: string;
  context: string;
  consoleLogs?: string;
  resolved: boolean;
  date: string;
}

const DEFAULT_PROMPTS = [
  {
    title: "🗄️ Esquema DB (ERD)",
    description: "Diseñar tablas y relaciones SQL en formato JSON compatible.",
    prompt: `Actúa como Arquitecto de Base de Datos Senior. Diseña el esquema de tablas para un sistema con las siguientes características: [DESCRIBE EL CASO]. Devuelve únicamente el JSON válido en el formato requerido por MateCode:
{
  "project_name": "Nombre",
  "default_engine": "postgresql",
  "tables": [
    {
      "id": "t1",
      "name": "usuarios",
      "columns": [
        { "name": "id", "data_family": "uuid", "is_primary_key": true },
        { "name": "email", "data_family": "string" }
      ]
    }
  ],
  "relationships": []
}`
  },
  {
    title: "📋 Historias de Usuario BDD",
    description: "Escribir historias detalladas en formato Gherkin (Dado/Cuando/Entonces).",
    prompt: "Actúa como Product Owner Senior. Escribe 5 Historias de Usuario estructuradas en formato Gherkin (Dado que, Cuando, Entonces) para la funcionalidad de: [DESCRIBE LA FUNCIONALIDAD]."
  },
  {
    title: "🎨 Identidad Visual y UI",
    description: "Definir paleta de colores, tipografías y reglas estéticas.",
    prompt: "Genera una paleta de colores y reglas de diseño estéticas basadas en los siguientes pilares de identidad: [PILARES]. Retorna la paleta en formato HEX (Primario, Secundario, Acento, Fondo) y las tipografías idóneas de Google Fonts."
  },
  {
    title: "🇦🇷 Mentor Técnico Argentino",
    description: "Asistente con modismos argentinos y rigor técnico.",
    prompt: "Actúa como un programador senior argentino, muy buena onda, experimentado, que me ayuda a depurar y guiar mi código paso a paso usando modismos locales como 'che', 'viste', 'de una', pero manteniendo el rigor técnico absoluto."
  }
];

export const QuickAccessHud = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompts" | "links" | "notes" | "identity" | "bugs">("prompts");
  
  // Store context
  const { activeProjectId, activeRoom, workspaceId, projects } = useWorkspaceStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Profile info
  const [profile, setProfile] = useState<any>(null);

  // Avatar upload and cropping
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarImageSrc, setAvatarImageSrc] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarImageSrc(reader.result as string);
      setAvatarCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarCropConfirm = async (croppedBlob: Blob) => {
    setAvatarCropOpen(false);
    setIsUploadingAvatar(true);
    try {
      const adapter = UploadAdapterFactory.getAdapter();
      const url = await adapter.uploadImage(croppedBlob);
      
      const name = profile?.nombreCompleto || profile?.nombre_completo || "";
      const username = profile?.nombreUsuario || profile?.nombre_usuario || "";
      await api.put("/Workspace/profile", {
        nombreCompleto: name,
        nombreUsuario: username,
        fotoPerfilUrl: url
      });

      setProfile((prev: any) => ({
        ...prev,
        fotoPerfilUrl: url
      }));

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Foto de perfil actualizada',
        showConfirmButton: false,
        timer: 2000,
        background: '#18181b',
        color: '#fff'
      });
    } catch (err: any) {
      Swal.fire({
        title: 'Error al actualizar',
        text: err.message || 'No se pudo subir la foto de perfil.',
        icon: 'error',
        background: '#09090b',
        color: '#f4f4f5'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Scratchpad logic
  const [noteText, setNoteText] = useState("");
  const hydrated = useRef(false);

  // Custom links logic
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  // Platform Bugs logic
  const [bugs, setBugs] = useState<PlatformBug[]>([]);
  const [bugTitle, setBugTitle] = useState("");
  const [bugSection, setBugSection] = useState("");
  const [bugContext, setBugContext] = useState("");
  const [bugConsole, setBugConsole] = useState("");

  // Hydrate Scratchpad
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCRATCHPAD_KEY);
      if (saved !== null) setNoteText(saved);
    } catch {
      /* storage blocked */
    }
    hydrated.current = true;
  }, []);

  // Save Scratchpad
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(SCRATCHPAD_KEY, noteText);
    } catch {
      /* ignore */
    }
  }, [noteText]);

  // Hydrate Platform Bugs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BUGS_KEY);
      if (saved) {
        setBugs(JSON.parse(saved));
      }
    } catch {
      setBugs([]);
    }
  }, []);

  // Fetch Profile Info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get("/Workspace/profile");
        setProfile(data);
      } catch (err) {
        console.warn("Error fetching user profile", err);
      }
    };
    fetchProfile();
  }, [workspaceId]);

  // Hydrate Custom Links per Project
  useEffect(() => {
    if (!activeProjectId) {
      setCustomLinks([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`mc_quick_links_${activeProjectId}`);
      if (saved) {
        setCustomLinks(JSON.parse(saved));
      } else {
        setCustomLinks([]);
      }
    } catch {
      setCustomLinks([]);
    }
  }, [activeProjectId]);

  const saveCustomLinks = (links: CustomLink[]) => {
    if (!activeProjectId) return;
    try {
      localStorage.setItem(`mc_quick_links_${activeProjectId}`, JSON.stringify(links));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim() || !activeProjectId) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLink: CustomLink = {
      id: crypto.randomUUID(),
      name: newLinkName.trim(),
      url: formattedUrl
    };

    const updated = [...customLinks, newLink];
    setCustomLinks(updated);
    saveCustomLinks(updated);

    setNewLinkName("");
    setNewLinkUrl("");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Enlace agregado",
      showConfirmButton: false,
      timer: 1500,
      background: "#18181b",
      color: "#fff"
    });
  };

  const handleDeleteLink = (id: string) => {
    const updated = customLinks.filter(l => l.id !== id);
    setCustomLinks(updated);
    saveCustomLinks(updated);
  };

  const getActiveSectionLabel = () => {
    if (activeRoom && activeRoom !== "idle") {
      return `Sala: ${activeRoom} (Ruta: ${window.location.pathname})`;
    }
    return `Ruta: ${window.location.pathname}`;
  };

  const handleAddBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim()) return;

    const newBug: PlatformBug = {
      id: crypto.randomUUID(),
      title: bugTitle.trim(),
      section: bugSection.trim() || getActiveSectionLabel(),
      context: bugContext.trim(),
      consoleLogs: bugConsole.trim(),
      resolved: false,
      date: new Date().toLocaleString()
    };

    const updated = [newBug, ...bugs];
    setBugs(updated);
    localStorage.setItem(BUGS_KEY, JSON.stringify(updated));

    setBugTitle("");
    setBugContext("");
    setBugConsole("");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Bug reportado en la lista",
      showConfirmButton: false,
      timer: 1500,
      background: "#18181b",
      color: "#fff"
    });
  };

  const handleToggleResolveBug = (id: string) => {
    const updated = bugs.map(b => b.id === id ? { ...b, resolved: !b.resolved } : b);
    setBugs(updated);
    localStorage.setItem(BUGS_KEY, JSON.stringify(updated));
  };

  const handleDeleteBug = (id: string) => {
    const updated = bugs.filter(b => b.id !== id);
    setBugs(updated);
    localStorage.setItem(BUGS_KEY, JSON.stringify(updated));
  };

  const copyBugForAI = (bug: PlatformBug) => {
    const text = `[REPORTE DE BUG EN MATECODE]
-----------------------------------------
• Título: ${bug.title}
• Sección/Contexto: ${bug.section}
• Contexto/Pasos: ${bug.context || "No especificado"}
• Estado: ${bug.resolved ? "Resuelto" : "Pendiente"}
• Fecha: ${bug.date}
• Errores en Consola:
${bug.consoleLogs || "Ninguno reportado"}
-----------------------------------------
Por favor, analiza este error y dime cómo solucionarlo.`;

    copyToClipboard(text, "Reporte de Bug para IA");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `${label} copiado`,
      showConfirmButton: false,
      timer: 1500,
      background: "#18181b",
      color: "#fff"
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[350] font-sans flex flex-col items-end">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="w-80 h-[480px] bg-zinc-950/90 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-2xl overflow-hidden mb-4 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <header className="h-14 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
                Mate Tools
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </header>

          {/* Tab Bar */}
          <nav className="flex bg-zinc-900/30 border-b border-white/5 p-1 gap-1">
            <button 
              onClick={() => setActiveTab("prompts")}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "prompts" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Prompts Rápidos"
            >
              <Zap size={14} />
              <span>Prompts</span>
            </button>
            <button 
              onClick={() => setActiveTab("links")}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "links" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Enlaces de Proyecto"
            >
              <LinkIcon size={14} />
              <span>Enlaces</span>
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "notes" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Borrador de Notas"
            >
              <FileText size={14} />
              <span>Notas</span>
            </button>
            <button 
              onClick={() => setActiveTab("identity")}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "identity" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
              title="IDs del Workspace"
            >
              <User size={14} />
              <span>ID Info</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab("bugs");
                setBugSection(getActiveSectionLabel());
              }}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === "bugs" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-zinc-500 hover:text-zinc-300"}`}
              title="Reportar Bug de la Plataforma"
            >
              <Bug size={14} />
              <span>Bugs</span>
            </button>
          </nav>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* TABS 1: PROMPTS */}
            {activeTab === "prompts" && (
              <div className="space-y-3">
                {DEFAULT_PROMPTS.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase">{item.title}</h4>
                      <p className="text-[9px] text-zinc-500 mt-0.5 leading-snug">{item.description}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(item.prompt, item.title)}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy size={10} /> Copiar Prompt
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TABS 2: LINKS */}
            {activeTab === "links" && (
              <div className="space-y-4">
                {/* Static Preconfigured Links */}
                <div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Globales</span>
                  <div className="mt-1.5 space-y-1.5">
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-zinc-300 hover:text-white transition-all font-bold"
                    >
                      <span>Documentación MateCode</span>
                      <ExternalLink size={12} className="text-zinc-500" />
                    </a>
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-zinc-300 hover:text-white transition-all font-bold"
                    >
                      <span>Supabase Console</span>
                      <ExternalLink size={12} className="text-zinc-500" />
                    </a>
                  </div>
                </div>

                {/* Custom Project Links */}
                <div>
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">De este Proyecto</span>
                  {!activeProjectId ? (
                    <div className="mt-2 p-3 border border-dashed border-zinc-800 rounded-2xl text-center text-[9px] text-zinc-600 font-bold uppercase">
                      Selecciona un proyecto para configurar enlaces.
                    </div>
                  ) : (
                    <div className="mt-1.5 space-y-1.5">
                      {customLinks.length === 0 ? (
                        <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-[9px] text-zinc-600 text-center uppercase font-bold">
                          Sin enlaces personalizados
                        </div>
                      ) : (
                        customLinks.map((link) => (
                          <div key={link.id} className="flex items-center gap-2">
                            <a 
                              href={link.url}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-zinc-300 hover:text-white transition-all font-bold truncate"
                            >
                              <span className="truncate">{link.name}</span>
                              <ExternalLink size={12} className="text-zinc-500 shrink-0 ml-2" />
                            </a>
                            <button 
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      )}

                      {/* Add link form */}
                      <form onSubmit={handleAddLink} className="mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                        <input 
                          type="text"
                          required
                          value={newLinkName}
                          onChange={(e) => setNewLinkName(e.target.value)}
                          placeholder="Nombre (Ej: Figma)"
                          className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            required
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="URL (Ej: figma.com/file/...)"
                            className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
                          />
                          <button 
                            type="submit"
                            className="px-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl text-[9px] uppercase tracking-widest transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TABS 3: NOTES */}
            {activeTab === "notes" && (
              <div className="h-full flex flex-col">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="// Apuntes rápidos, IDs de prueba, variables..."
                  spellCheck={false}
                  className="w-full h-[320px] resize-none bg-black/30 border border-white/5 rounded-2xl p-4 text-zinc-300 font-mono text-[11px] outline-none focus:border-emerald-500/30 leading-relaxed custom-scrollbar"
                />
              </div>
            )}

            {/* TABS 4: IDENTITY */}
            {activeTab === "identity" && (
              <div className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Usuario Activo</span>
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl text-[10px]">
                    {/* Avatar Container with upload overlay */}
                    <div className="relative group w-10 h-10 rounded-full bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {(profile?.fotoPerfilUrl || profile?.foto_perfil_url) ? (
                        <img 
                          src={profile.fotoPerfilUrl || profile.foto_perfil_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={18} className="text-zinc-500" />
                      )}
                      
                      {isUploadingAvatar ? (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 border border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Camera size={12} className="text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarSelect} 
                            className="hidden" 
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white leading-none truncate">
                        {profile?.nombreCompleto || profile?.nombre_completo || "Cargando..."}
                      </p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1 truncate">
                        {profile?.nombreUsuario ? `@${profile.nombreUsuario}` : (profile?.nombre_usuario ? `@${profile.nombre_usuario}` : (profile?.email || "Sin email"))}
                      </p>
                    </div>

                    {profile && (
                      <button 
                        onClick={() => copyToClipboard(profile.nombreUsuario || profile.nombre_usuario || profile.email, "Usuario")}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all shrink-0"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Project ID */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ID del Proyecto</span>
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-[10px]">
                    <div className="truncate pr-2">
                      <p className="font-bold text-white leading-none truncate">{activeProject?.nombre || "Ninguno seleccionado"}</p>
                      <p className="text-[8px] text-zinc-500 font-mono mt-1 truncate">{activeProjectId || "N/A"}</p>
                    </div>
                    {activeProjectId && (
                      <button 
                        onClick={() => copyToClipboard(activeProjectId, "ID de Proyecto")}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tenant / Workspace ID */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ID del Espacio (Tenant)</span>
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl text-[10px]">
                    <div className="truncate pr-2">
                      <p className="text-[8px] text-zinc-500 font-mono truncate">{workspaceId || "N/A"}</p>
                    </div>
                    {workspaceId && (
                      <button 
                        onClick={() => copyToClipboard(workspaceId, "ID de Espacio")}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TABS 5: BUGS */}
            {activeTab === "bugs" && (
              <div className="space-y-5">
                {/* Form to add bug */}
                <form onSubmit={handleAddBug} className="p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-3">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Reportar Error en MateCode</h4>
                  
                  <input 
                    type="text"
                    required
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder="Título del error"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
                  />
                  
                  <input 
                    type="text"
                    required
                    value={bugSection}
                    onChange={(e) => setBugSection(e.target.value)}
                    placeholder="Sección (Auto-detectada)"
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30"
                  />

                  <textarea 
                    value={bugContext}
                    onChange={(e) => setBugContext(e.target.value)}
                    placeholder="Contexto / Pasos para reproducir..."
                    rows={2}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white outline-none focus:border-emerald-500/30 resize-none"
                  />

                  <textarea 
                    value={bugConsole}
                    onChange={(e) => setBugConsole(e.target.value)}
                    placeholder="Volcado de consola / Logs de error..."
                    rows={2}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[9px] text-white font-mono outline-none focus:border-emerald-500/30 resize-none"
                  />

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl text-[9px] uppercase tracking-widest transition-all"
                  >
                    Registrar Bug
                  </button>
                </form>

                {/* List of bugs */}
                <div className="space-y-3">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Historial de Bugs ({bugs.length})</span>
                  {bugs.length === 0 ? (
                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-[9px] text-zinc-600 text-center font-bold uppercase">
                      Sin errores registrados. ¡Todo marcha bien!
                    </div>
                  ) : (
                    bugs.map((bug) => (
                      <div key={bug.id} className={`p-3 bg-white/5 border rounded-2xl flex flex-col gap-2 transition-all ${bug.resolved ? "border-zinc-800 opacity-60" : "border-white/5 hover:bg-white/[0.08]"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 truncate">
                            <input 
                              type="checkbox"
                              checked={bug.resolved}
                              onChange={() => handleToggleResolveBug(bug.id)}
                              className="mt-1 accent-emerald-500 cursor-pointer"
                            />
                            <div className="truncate">
                              <h5 className={`text-[10px] font-black text-white uppercase truncate ${bug.resolved ? "line-through text-zinc-500" : ""}`}>{bug.title}</h5>
                              <p className="text-[7px] text-zinc-500 font-bold uppercase mt-0.5">{bug.section}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteBug(bug.id)}
                            className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {bug.context && (
                          <p className="text-[9px] text-zinc-400 leading-normal italic pl-5">"{bug.context}"</p>
                        )}

                        <div className="flex gap-2 pl-5 mt-1">
                          <button 
                            onClick={() => copyBugForAI(bug)}
                            className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
                          >
                            <Copy size={10} /> Copiar para IA
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimised Float Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full border border-white/10 backdrop-blur-2xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${isOpen ? "bg-emerald-500 text-zinc-950 scale-105 shadow-emerald-500/20 border-emerald-400/30" : "bg-[#0A0F1A]/80 hover:bg-[#141d33] text-emerald-400 hover:scale-105"}`}
        title="Herramientas Rápidas"
      >
        <Zap size={22} className={isOpen ? "fill-current shrink-0 animate-in spin-in-90 duration-500" : "shrink-0"} />
      </button>
    </div>

      {/* Image Crop Modal for User Avatar */}
      <ImageCropModal
        isOpen={avatarCropOpen}
        imageSrc={avatarImageSrc}
        aspectRatio={1}
        circular={true}
        onClose={() => setAvatarCropOpen(false)}
        onConfirm={handleAvatarCropConfirm}
      />
  );
};

export default QuickAccessHud;
