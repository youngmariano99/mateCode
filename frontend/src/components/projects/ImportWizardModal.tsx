import React, { useState } from 'react';
import { 
    X, Dna, Rocket, Sparkles, ChevronRight, 
    ChevronLeft, Copy, CheckCircle2, Terminal,
    Database, Kanban, FileJson, AlertCircle,
    Box, Layout, Cpu, ShieldCheck, Calendar,
    Edit3, Trash2, Plus
} from 'lucide-react';
import { useProjectBlueprintStore } from '../../store/useProjectBlueprintStore';
import { useStagingAreaStore } from '../../store/useStagingAreaStore';
import { useProject } from '../../context/ProjectContext';
import { deployProjectToBackend } from '../../services/importService';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface ImportWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ImportWizardModal = ({ isOpen, onClose }: ImportWizardModalProps) => {
    const blueprintStore = useProjectBlueprintStore();
    const stagingStore = useStagingAreaStore();
    const { projectId } = useProject();
    
    const [step, setStep] = useState(1);
    const [activeBlueprintStep, setActiveBlueprintStep] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);
    const [activeFactoryTab, setActiveFactoryTab] = useState<'erd' | 'backlog'>('erd');

    if (!isOpen) return null;

    const blueprintSteps = [
        { id: 'adn', label: 'ADN & Visión', icon: Dna },
        { id: 'funcional', label: 'Arquitectura Funcional', icon: Box },
        { id: 'diseno', label: 'Diseño & Diagramas', icon: Layout },
        { id: 'stack', label: 'Stack Tecnológico', icon: Cpu },
        { id: 'calidad', label: 'Calidad & Seguridad', icon: ShieldCheck },
        { id: 'gestion', label: 'Gestión & Entrega', icon: Calendar },
    ];

    const generateMegaPrompt = () => {
        const { adn, funcional, diseno, stack, calidad, gestion } = blueprintStore;
        return `
### 🏛️ MATECODE PROJECT ARCHITECT BLUEPRINT
Actúa como un Arquitecto de Software Senior y Product Manager. Basado en el siguiente contexto, genera la estructura técnica del proyecto.

#### 1. ADN & VISIÓN
- Nombre: ${adn.nombre}
- Propósito: ${adn.proposito}
- Visión: ${adn.vision}

#### 2. ARQUITECTURA FUNCIONAL
- Módulos: ${funcional.modulos}
- Flujos Críticos: ${funcional.flujos}

#### 3. DISEÑO & DIAGRAMAS
- Entidades (ERD): ${diseno.entidades}
- Sitemap/Navegación: ${diseno.sitemap}
- Roles & Permisos: ${diseno.roles}

#### 4. STACK TECNOLÓGICO
- Plataforma: ${stack.plataforma}
- Backend: ${stack.backend} (Libs: ${stack.librerias_back})
- Frontend: ${stack.frontend} (Libs: ${stack.librerias_front})
- DB: ${stack.bdd}
- Testing: ${stack.testing}
- CI/CD: ${stack.despliegue}
- Infra: ${stack.infra}

#### 5. CALIDAD & SEGURIDAD
- Auth: ${calidad.auth}
- Estándares: ${calidad.estandares}

#### 6. GESTIÓN & ENTREGA
- Hitos: ${gestion.hitos}
- Riesgos: ${gestion.riesgos}

---
### 🚨 REQUERIMIENTO DE SALIDA (STRICT JSON):
Genera un objeto JSON válido con la siguiente estructura técnica:
1. "tables": Lista de objetos con { "nombre": string, "descripcion": string, "columnas": [ { "nombre": string, "tipo": string, "pk": bool, "fk": bool, "nullable": bool } ] }
2. "tickets": Lista de objetos con { "titulo": string, "descripcion": string, "tipo": "feature"|"bug"|"task", "prioridad": "baja"|"media"|"alta"|"critica" }

Asegúrate de que los tickets reflejen tareas reales sobre el stack elegido (${stack.backend}, ${stack.frontend}, etc.).
No incluyas explicaciones, solo el JSON puro.
`.trim();
    };

    const handleEditTable = async (table: any) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Tabla', background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `<input id="swal-name" class="swal2-input bg-zinc-950 text-white w-full" value="${table.nombre}">`,
            preConfirm: () => ({ nombre: (document.getElementById('swal-name') as HTMLInputElement).value })
        });
        if (formValues) stagingStore.updateItem('erd', table.id, formValues);
    };

    const handleEditTicket = async (ticket: any) => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Ticket', background: '#18181b', color: '#fff', confirmButtonColor: '#10b981',
            html: `<input id="swal-title" class="swal2-input bg-zinc-950 text-white w-full" value="${ticket.titulo}">`,
            preConfirm: () => ({ titulo: (document.getElementById('swal-title') as HTMLInputElement).value })
        });
        if (formValues) stagingStore.updateItem('backlog', ticket.id, formValues);
    };

    const handleCopyQuestionnaire = () => {
        const questionnaire = `
Tengo la siguiente idea de software: "[ESCRIBE TU IDEA AQUÍ]"

Actúa como Product Manager y Arquitecto de Software Senior de nivel Staff Engineer. Tu misión es analizar profundamente mi idea y completar el Blueprint de MateCode.

### 🚨 REGLAS DE ORO:
1. ANALIZA DETALLADAMENTE: No seas genérico. Si es un e-commerce, piensa en inventario, pagos, devoluciones, etc.
2. VERSIÓN COMPLETA: No dejes campos vacíos. Inventa o sugiere lo mejor según estándares actuales.
3. FORMATO JSON ESTRICTO: Responde ÚNICAMENTE con el objeto JSON.

### 📝 EJEMPLO DEL FORMATO ESPERADO:
{
  "adn": { "nombre": "Nombre Pro", "proposito": "Resuelve X problema...", "vision": "Escalabilidad a 1M usuarios" },
  "funcional": { "modulos": "Auth, Billing, Dashboard", "flujos": "User -> Signup -> Checkout" },
  "diseno": { "entidades": "User(id, email), Order(id, total)", "sitemap": "Home, Shop, Admin", "roles": "Admin, Buyer" },
  "stack": { 
    "backend": "Node.js (NestJS)", "frontend": "React (Next.js 14)", "bdd": "PostgreSQL", "infra": "AWS (EC2/S3)",
    "librerias_back": "Prisma ORM, Zod", "librerias_front": "Tailwind, Zustand", "testing": "Jest, Cypress", "despliegue": "GitHub Actions"
  },
  "calidad": { "auth": "JWT + RBAC", "estandares": "SOLID, Clean Code" },
  "gestion": { "hitos": "M1: UI, M2: API", "riesgos": "Seguridad de pagos" }
}

RESPONDE AHORA CON MI PROYECTO:
`.trim();
        navigator.clipboard.writeText(questionnaire);
        Swal.fire({ icon: 'info', title: 'Guía Maestra Copiada', text: 'Pégala en tu IA. Recibirás una arquitectura meticulosa.', background: '#18181b', color: '#fff' });
    };

    const handleImportAI = () => {
        try {
            if (!jsonInput.trim()) return;
            
            // Intentar extraer el JSON si la IA mandó texto extra
            const jsonMatch = jsonInput.match(/\{[\s\S]*\}/);
            const rawJson = jsonMatch ? jsonMatch[0] : jsonInput;
            const data = JSON.parse(rawJson);

            if (data.adn) blueprintStore.updateAdn(data.adn);
            if (data.funcional) blueprintStore.updateFuncional(data.funcional);
            if (data.diseno) blueprintStore.updateDiseno(data.diseno);
            if (data.stack) blueprintStore.updateStack(data.stack);
            if (data.calidad) blueprintStore.updateCalidad(data.calidad);
            if (data.gestion) blueprintStore.updateGestion(data.gestion);

            Swal.fire({ icon: 'success', title: 'Arquitectura Sincronizada', text: 'Se han rellenado todos los campos del Blueprint.', background: '#18181b', color: '#fff' });
            setJsonInput('');
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error de Parseo', text: 'El formato JSON no es válido o está incompleto.', background: '#18181b', color: '#fff' });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateMegaPrompt());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        Swal.fire({ icon: 'success', title: 'Prompt Copiado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#18181b', color: '#fff' });
    };

    const handleProcessJson = () => {
        const result = stagingStore.loadFromJson(activeFactoryTab, jsonInput);
        if (result.success) {
            Swal.fire({ icon: 'success', title: 'Validado', text: 'JSON procesado correctamente.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, background: '#18181b', color: '#fff' });
            setJsonInput('');
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.error, background: '#18181b', color: '#fff' });
        }
    };

    const handleFinalDeploy = async () => {
        if (!projectId) return Swal.fire('Error', 'Seleccioná un proyecto primero', 'error');
        try {
            setIsDeploying(true);
            await deployProjectToBackend(projectId, stagingStore.stagedErd, stagingStore.stagedBacklog);
            Swal.fire({ icon: 'success', title: '¡Proyecto Consolidado!', background: '#18181b', color: '#fff' });
            stagingStore.reset();
            onClose();
        } catch (err) {
            Swal.fire('Error', 'Falla en la inyección masiva', 'error');
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0B0F1A] border border-white/10 w-full max-w-6xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative">
                
                {/* Header & Stepper */}
                <header className="p-8 border-b border-white/5 bg-zinc-900/20 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <Rocket size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Acelerador de <span className="text-emerald-500">Importación</span></h2>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white rounded-xl transition-all">✕</button>
                    </div>

                    {/* The Stepper Pipeline */}
                    <nav className="flex items-center justify-center gap-4 max-w-2xl mx-auto w-full">
                        {[1, 2, 3].map((num) => (
                            <React.Fragment key={num}>
                                <div className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all ${step === num ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-zinc-500 border-white/5'}`}>
                                    <span className="text-xs font-black">{num}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                                        {num === 1 ? 'Blueprint' : num === 2 ? 'AI Prompt' : 'La Fábrica'}
                                    </span>
                                </div>
                                {num < 3 && <div className="h-px flex-1 bg-white/5 min-w-[20px]" />}
                            </React.Fragment>
                        ))}
                    </nav>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-1 space-y-4">
                                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-emerald-500" /> Extracción AI</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">¿No querés completar todo a mano?</p>
                                            <button onClick={handleCopyQuestionnaire} className="w-full py-3 bg-zinc-950 border border-white/5 text-[9px] font-black uppercase text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all">Copiar Guía ADN</button>
                                            
                                            <div className="pt-2">
                                                <textarea 
                                                    value={jsonInput} onChange={e => setJsonInput(e.target.value)}
                                                    placeholder="Pegá aquí la respuesta de la IA..." 
                                                    className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-3 text-[9px] text-zinc-400 outline-none focus:border-emerald-500/30 transition-all resize-none"
                                                />
                                                <button onClick={handleImportAI} className="w-full mt-2 py-3 bg-white text-black text-[9px] font-black uppercase rounded-xl hover:scale-105 transition-all">Importar Análisis</button>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-2">
                                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-4">Categorías</h3>
                                            {blueprintSteps.map((s, i) => (
                                                <button 
                                                    key={s.id} onClick={() => setActiveBlueprintStep(i)}
                                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeBlueprintStep === i ? 'bg-white/5 text-emerald-400 border border-emerald-500/20' : 'text-zinc-600'}`}
                                                >
                                                    <s.icon size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 bg-zinc-950/50 border border-white/5 p-8 rounded-[2.5rem] min-h-[400px]">
                                        {activeBlueprintStep === 0 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Nombre del Proyecto</label>
                                                    <input value={blueprintStore.adn.nombre} onChange={e => blueprintStore.updateAdn({ nombre: e.target.value })} placeholder="Ej: Nexus Platform" className="w-full bg-transparent border-b border-white/10 p-4 text-xl font-black text-white outline-none focus:border-emerald-500 transition-all" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Marca o nombre comercial identificativo.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Propósito & Pitch</label>
                                                    <textarea value={blueprintStore.adn.proposito} onChange={e => blueprintStore.updateAdn({ proposito: e.target.value })} placeholder="¿Qué problema resuelve?" className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none focus:border-emerald-500 transition-all h-24 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Define el valor principal del software.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Visión a largo plazo</label>
                                                    <input value={blueprintStore.adn.vision} onChange={e => blueprintStore.updateAdn({ vision: e.target.value })} placeholder="Ej: Escalar a nivel global..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">¿Dónde ves el proyecto en 2 años?</p>
                                                </div>
                                            </div>
                                        )}
                                        {activeBlueprintStep === 1 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Módulos del Sistema</label>
                                                    <textarea value={blueprintStore.funcional.modulos} onChange={e => blueprintStore.updateFuncional({ modulos: e.target.value })} placeholder="Ej: Auth, CRM, Facturación..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-32 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Divide el software en bloques lógicos.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Flujos Críticos</label>
                                                    <textarea value={blueprintStore.funcional.flujos} onChange={e => blueprintStore.updateFuncional({ flujos: e.target.value })} placeholder="Ej: Registro -> Pago -> Dashboard" className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-32 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">El camino principal que recorre el usuario.</p>
                                                </div>
                                            </div>
                                        )}
                                        {activeBlueprintStep === 2 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Entidades (ERD)</label>
                                                    <textarea value={blueprintStore.diseno.entidades} onChange={e => blueprintStore.updateDiseno({ entidades: e.target.value })} placeholder="Ej: User {id, email}, Product {name, price}..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-24 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Tablas principales de la base de datos.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Sitemap / Navegación</label>
                                                    <textarea value={blueprintStore.diseno.sitemap} onChange={e => blueprintStore.updateDiseno({ sitemap: e.target.value })} placeholder="Ej: /home, /admin, /settings..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-24 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Estructura de páginas del frontend.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Roles & Permisos</label>
                                                    <textarea value={blueprintStore.diseno.roles} onChange={e => blueprintStore.updateDiseno({ roles: e.target.value })} placeholder="Ej: Admin (Total), Buyer (Read/Write)..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-24 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Define quién puede hacer qué.</p>
                                                </div>
                                            </div>
                                        )}
                                        {activeBlueprintStep === 3 && (
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Backend Core</label>
                                                    <input value={blueprintStore.stack.backend} onChange={e => blueprintStore.updateStack({ backend: e.target.value })} placeholder="Ej: Node.js, .NET 8" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Lenguaje y framework.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Frontend Core</label>
                                                    <input value={blueprintStore.stack.frontend} onChange={e => blueprintStore.updateStack({ frontend: e.target.value })} placeholder="Ej: React 18, Next.js" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Framework de interfaz.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Base de Datos</label>
                                                    <input value={blueprintStore.stack.bdd} onChange={e => blueprintStore.updateStack({ bdd: e.target.value })} placeholder="Ej: PostgreSQL, Mongo" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Motor de persistencia.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Libs Backend</label>
                                                    <input value={blueprintStore.stack.librerias_back} onChange={e => blueprintStore.updateStack({ librerias_back: e.target.value })} placeholder="Ej: Prisma, JWT, MediatR" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">ORM, Auth, Utilidades.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Libs Frontend</label>
                                                    <input value={blueprintStore.stack.librerias_front} onChange={e => blueprintStore.updateStack({ librerias_front: e.target.value })} placeholder="Ej: Zustand, Tailwind" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Estado y Estilos.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Testing</label>
                                                    <input value={blueprintStore.stack.testing} onChange={e => blueprintStore.updateStack({ testing: e.target.value })} placeholder="Ej: Jest, Playwright" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Unitarios y E2E.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">CI-CD</label>
                                                    <input value={blueprintStore.stack.despliegue} onChange={e => blueprintStore.updateStack({ despliegue: e.target.value })} placeholder="Ej: GitHub Actions" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Automatización de despliegue.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Infraestructura</label>
                                                    <input value={blueprintStore.stack.infra} onChange={e => blueprintStore.updateStack({ infra: e.target.value })} placeholder="Ej: Docker, AWS, VPS" className="w-full bg-white/5 p-4 rounded-xl text-xs outline-none focus:border-emerald-500 border border-transparent transition-all" />
                                                    <p className="text-[8px] text-zinc-600 font-bold ml-1 uppercase italic">Hosting y contenedores.</p>
                                                </div>
                                            </div>
                                        )}
                                        {activeBlueprintStep === 4 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Seguridad & Auth</label>
                                                    <textarea value={blueprintStore.calidad.auth} onChange={e => blueprintStore.updateCalidad({ auth: e.target.value })} placeholder="Ej: Supabase JWT, OAuth2..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-32 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Mecanismos de protección de datos.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Estándares de Código</label>
                                                    <textarea value={blueprintStore.calidad.estandares} onChange={e => blueprintStore.updateCalidad({ estandares: e.target.value })} placeholder="Ej: SOLID, Clean Architecture, DDD..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-32 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Principios de desarrollo a seguir.</p>
                                                </div>
                                            </div>
                                        )}
                                        {activeBlueprintStep === 5 && (
                                            <div className="space-y-6">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Hitos de Entrega</label>
                                                    <textarea value={blueprintStore.gestion.hitos} onChange={e => blueprintStore.updateGestion({ hitos: e.target.value })} placeholder="Ej: M1: UI Kit, M2: Auth System..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-32 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Fechas u objetivos clave del proyecto.</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Riesgos Técnicos</label>
                                                    <textarea value={blueprintStore.gestion.riesgos} onChange={e => blueprintStore.updateGestion({ riesgos: e.target.value })} placeholder="Ej: Escalabilidad de BD, Latencia..." className="w-full bg-transparent border-b border-white/10 p-4 text-sm text-zinc-400 outline-none h-32 resize-none" />
                                                    <p className="text-[9px] text-zinc-600 font-bold ml-1 uppercase italic">Posibles obstáculos y mitigación.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center justify-center h-full text-center space-y-8"
                            >
                                <div className="p-6 bg-blue-500/10 rounded-full text-blue-500 animate-pulse">
                                    <Terminal size={48} />
                                </div>
                                <div className="max-w-md space-y-4">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Generar Mega-Prompt</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Copiá este contexto técnico y pegalo en tu IA favorita. Ella generará el JSON que necesitamos para el siguiente paso.</p>
                                </div>
                                <div className="w-full max-w-2xl relative">
                                    <div className="absolute top-4 right-4">
                                        <button onClick={handleCopy} className={`p-3 rounded-xl transition-all ${isCopied ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-white'}`}>
                                            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <pre className="bg-zinc-950 p-10 rounded-[2rem] border border-white/10 text-left font-mono text-[10px] text-zinc-500 overflow-hidden h-48">
                                        {generateMegaPrompt()}
                                    </pre>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={14} /> Una vez que tengas el JSON, avanzá al siguiente paso
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-2xl border border-white/5">
                                    <button onClick={() => setActiveFactoryTab('erd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeFactoryTab === 'erd' ? 'bg-emerald-500 text-black' : 'text-zinc-600'}`}>Tablas (ERD)</button>
                                    <button onClick={() => setActiveFactoryTab('backlog')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeFactoryTab === 'backlog' ? 'bg-emerald-500 text-black' : 'text-zinc-600'}`}>Tickets (Backlog)</button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inyección de JSON</h4>
                                        <button onClick={handleProcessJson} className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-lg hover:scale-105 transition-all">Validar e Inyectar</button>
                                    </div>
                                    <textarea 
                                        value={jsonInput} onChange={e => setJsonInput(e.target.value)}
                                        placeholder="Pega el JSON de la IA aquí..."
                                        className="w-full h-48 bg-zinc-950 border border-white/10 rounded-3xl p-6 font-mono text-[10px] text-emerald-400 outline-none focus:border-emerald-500/30 transition-all resize-none"
                                    />
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Aduana de Componentes</h4>
                                    <button 
                                        onClick={() => activeFactoryTab === 'erd' ? stagingStore.addItem('erd', { nombre: 'Nueva Tabla', columnas: [] }) : stagingStore.addItem('backlog', { titulo: 'Nueva Tarea', tipo: 'task', prioridad: 'media' })}
                                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 text-[9px] font-black uppercase text-zinc-400 hover:text-white rounded-lg transition-all"
                                    >
                                        <Plus size={12} /> Añadir Manual
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(activeFactoryTab === 'erd' ? stagingStore.stagedErd : stagingStore.stagedBacklog).map((item: any, i) => (
                                        <div key={i} className="group relative p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all">
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => activeFactoryTab === 'erd' ? handleEditTable(item) : handleEditTicket(item)} className="p-1.5 bg-zinc-800 text-emerald-400 rounded-md hover:bg-emerald-500 hover:text-black"><Edit3 size={10} /></button>
                                                <button onClick={() => stagingStore.removeItem(activeFactoryTab, item.id)} className="p-1.5 bg-zinc-800 text-red-500 rounded-md hover:bg-red-500 hover:text-white"><Trash2 size={10} /></button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${activeFactoryTab === 'erd' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                    {activeFactoryTab === 'erd' ? <Database size={14} /> : <Kanban size={14} />}
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <p className="text-[10px] font-black text-white truncate uppercase">{activeFactoryTab === 'erd' ? item.nombre : item.titulo}</p>
                                                    <p className="text-[8px] text-zinc-600 font-bold uppercase">{activeFactoryTab === 'erd' ? `${item.columnas?.length || 0} columnas` : item.tipo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {(activeFactoryTab === 'erd' ? stagingStore.stagedErd : stagingStore.stagedBacklog).length === 0 && (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sin elementos en aduana</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <footer className="p-8 border-t border-white/5 bg-zinc-900/20 flex justify-between items-center">
                    <button 
                        onClick={() => setStep(prev => Math.max(prev - 1, 1))}
                        disabled={step === 1}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-zinc-800' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <ChevronLeft size={16} /> Anterior
                    </button>

                    <div className="flex gap-4">
                        {step === 3 ? (
                            <button 
                                onClick={handleFinalDeploy}
                                disabled={isDeploying || (stagingStore.stagedErd.length === 0 && stagingStore.stagedBacklog.length === 0)}
                                className="px-10 py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isDeploying ? 'Consolidando...' : 'Finalizar y Desplegar'}
                            </button>
                        ) : (
                            <button 
                                onClick={() => setStep(prev => Math.min(prev + 1, 3))}
                                className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                            >
                                Siguiente Paso <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};
