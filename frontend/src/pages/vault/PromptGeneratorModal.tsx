import React, { useState } from 'react';
import { Copy, Sparkles, CheckCircle2, Terminal, ChevronRight } from 'lucide-react';
import { useProjectBlueprintStore } from '../../store/useProjectBlueprintStore';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

interface PromptGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PromptGeneratorModal = ({ isOpen, onClose }: PromptGeneratorModalProps) => {
    const store = useProjectBlueprintStore();
    const [selectedBlock, setSelectedBlock] = useState('ADN y Estrategia');
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const generateMegaPrompt = () => {
        const { adn, funcional, diseno, stack, calidad, gestion } = store;

        const content = `
### 🏛️ MATECODE PROJECT BLUEPRINT - FULL CONTEXT

#### 1. ADN Y ESTRATEGIA
- Nombre: ${adn.nombre}
- Propósito: ${adn.proposito}
- Visión: ${adn.vision}
- Público: ${adn.publico}
- Diferenciador: ${adn.diferenciador}

#### 2. ARQUITECTURA FUNCIONAL
- Módulos: ${funcional.modulos}
- Flujos Críticos: ${funcional.flujos}
- Requerimientos Must-Have: ${funcional.funcionalidadesMust}
- Wishlist: ${funcional.wishlist}
- Comunicación: ${funcional.comunicacion}

#### 3. DISEÑO Y ESTRUCTURA (FASE 2)
- Entidades clave: ${diseno.entidades}
- Sitemap: ${diseno.sitemap}
- Roles: ${diseno.roles}
- UML de secuencia: ${diseno.uml}

#### 4. STACK TECNOLÓGICO
- Plataformas: ${stack.plataforma}
- Backend: ${stack.backend}
- Frontend: ${stack.frontend}
- Base de Datos: ${stack.bdd}
- Integraciones: ${stack.integraciones}
- Infraestructura: ${stack.infra}

#### 5. CALIDAD Y SEGURIDAD
- Auth: ${calidad.auth}
- RBAC: ${calidad.rbac}
- Estándares: ${calidad.estandares}
- Legal: ${calidad.legal}

#### 6. GESTIÓN Y ENTREGA
- Hitos: ${gestion.hitos}
- Riesgos: ${gestion.riesgos}

---
### 🚨 INSTRUCCIONES DE SALIDA PARA EL ARQUITECTO IA:
Actúa como un **Software Architect Senior**. Toma los requerimientos de arriba y expándelos detalladamente. 

REGLA CRÍTICA: Te pediré los resultados por partes para mantener la máxima calidad. 
Por ahora, solo genera la estructura técnica detallada para el bloque: **[${selectedBlock.toUpperCase()}]**. 

Tu respuesta debe ser **EXCLUSIVAMENTE** un código JSON válido que siga la taxonomía de MateCode, sin texto introductorio, sin bloques de código markdown, ni explicaciones adicionales. Solo el JSON puro.
`;
        return content.trim();
    };

    const handleCopy = () => {
        const prompt = generateMegaPrompt();
        navigator.clipboard.writeText(prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        
        Swal.fire({
            icon: 'success',
            title: '🚀 Prompt Copiado',
            text: 'Pegalo en GPT o Claude y traé el JSON resultante.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#18181b',
            color: '#fff'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] flex flex-col max-h-[90vh]">
                <header className="p-10 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Terminal size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Compilador de <span className="text-emerald-500">Prompts</span></h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">Exportación de Contexto para IA Arquitecto</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-white rounded-2xl transition-all">✕</button>
                </header>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    <section className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Seleccionar Bloque a Generar</label>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter">AI Ready</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['ADN y Estrategia', 'Arquitectura Funcional', 'Diseño y Estructura', 'Stack Tecnológico', 'Calidad y Seguridad', 'Gestión y Entrega'].map(block => (
                                <button 
                                    key={block}
                                    onClick={() => setSelectedBlock(block)}
                                    className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedBlock === block ? 'bg-emerald-500 text-zinc-950 border-emerald-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                >
                                    {block}
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="relative group">
                        <div className="absolute top-6 right-6 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCopied ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-white hover:bg-zinc-700 shadow-xl'}`}
                            >
                                {isCopied ? <><CheckCircle2 size={14} /> Copiado</> : <><Copy size={14} /> Copiar Mega-Prompt</>}
                            </button>
                        </div>
                        <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 p-10 font-mono text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                            {generateMegaPrompt()}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <Sparkles className="text-emerald-500 shrink-0" size={20} />
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                            <strong className="text-emerald-400">Instrucciones:</strong> Copiá el prompt de arriba y pegalo en tu IA favorita (GPT-4, Claude 3.5 o Gemini 1.5). La IA te devolverá un JSON estructurado. Una vez que lo tengas, volvé aquí para la <span className="italic">Fase 3: Importación Automática</span>.
                        </p>
                    </div>
                </div>

                <footer className="p-8 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                    >
                        Cerrar
                    </button>
                    <Link 
                        to="/app/projects/factory"
                        onClick={onClose}
                        className="px-10 py-4 bg-emerald-500 text-zinc-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                    >
                        Ir a La Fábrica <ChevronRight size={16} />
                    </Link>
                </footer>
            </div>
        </div>
    );
};
