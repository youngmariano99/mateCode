import { useEffect, useRef, useState } from "react";
import { 
  Zap, Link as LinkIcon, FileText, User, X, Wrench, Bug 
} from "lucide-react";
import { api } from "../../lib/apiClient";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import Swal from "sweetalert2";
import { ImageCropModal } from "../common/ImageCropModal";
import { UploadAdapterFactory } from "../../services/UploadAdapters";
import { HudPromptsTab } from "./hud/HudPromptsTab";
import { HudLinksTab } from "./hud/HudLinksTab";
import { HudNotesTab } from "./hud/HudNotesTab";
import { HudIdentityTab } from "./hud/HudIdentityTab";
import { HudBugsTab } from "./hud/HudBugsTab";
import type { PlatformBug } from "./hud/HudBugsTab";

const SCRATCHPAD_KEY = "matecode_scratchpad_v1";
const BUGS_KEY = "matecode_platform_bugs";

interface CustomLink {
  id: string;
  name: string;
  url: string;
}

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
            {activeTab === "prompts" && (
              <HudPromptsTab onCopyToClipboard={copyToClipboard} />
            )}

            {activeTab === "links" && (
              <HudLinksTab
                activeProjectId={activeProjectId}
                customLinks={customLinks}
                newLinkName={newLinkName}
                setNewLinkName={setNewLinkName}
                newLinkUrl={newLinkUrl}
                setNewLinkUrl={setNewLinkUrl}
                onAddLink={handleAddLink}
                onDeleteLink={handleDeleteLink}
              />
            )}

            {activeTab === "notes" && (
              <HudNotesTab
                noteText={noteText}
                setNoteText={setNoteText}
              />
            )}

            {activeTab === "identity" && (
              <HudIdentityTab
                profile={profile}
                activeProjectId={activeProjectId}
                activeProject={activeProject}
                workspaceId={workspaceId}
                isUploadingAvatar={isUploadingAvatar}
                onAvatarSelect={handleAvatarSelect}
                onCopyToClipboard={copyToClipboard}
              />
            )}

            {activeTab === "bugs" && (
              <HudBugsTab
                bugs={bugs}
                bugTitle={bugTitle}
                setBugTitle={setBugTitle}
                bugSection={bugSection}
                setBugSection={setBugSection}
                bugContext={bugContext}
                setBugContext={setBugContext}
                bugConsole={bugConsole}
                setBugConsole={setBugConsole}
                onAddBug={handleAddBug}
                onToggleResolveBug={handleToggleResolveBug}
                onDeleteBug={handleDeleteBug}
                onCopyBugForAI={copyBugForAI}
              />
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

      {/* Image Crop Modal for User Avatar */}
      <ImageCropModal
        isOpen={avatarCropOpen}
        imageSrc={avatarImageSrc}
        aspectRatio={1}
        circular={true}
        onClose={() => setAvatarCropOpen(false)}
        onConfirm={handleAvatarCropConfirm}
      />
    </div>
  );
};

export default QuickAccessHud;
