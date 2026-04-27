import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MateLoadingScreenProps {
  onFinished?: () => void;
}

const MATE_LOGS = [
  "Calentando caldera de SignalR a 80°C...",
  "Acomodando la yerba del backlog...",
  "Limpiando bombilla de sockets...",
  "Infusionando ésteres de persistencia...",
  "Cebando el primer amargo de datos...",
  "Hidratando la matriz de presencia...",
  "Verificando temperatura del ADN...",
  "Ritual de cebado completado con éxito."
];

/**
 * MATE LOADING SCREEN - DEFINITIVE HYBRID RENDER (FINAL FIX)
 * ---------------------------------------------------------
 * Versión estabilizada con física de agua global y jerarquía de capas corregida.
 */
export const MateLoadingScreen: React.FC<MateLoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 0.6, 100);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => onFinished?.(), 2000);
          return 100;
        }
        return next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [onFinished]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setCurrentLog(prev => (prev + 1) % MATE_LOGS.length);
    }, 1800);
    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030508] flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Cinematic Bokeh Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_30%_30%,_#10b98122_0%,_transparent_50%)] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-[radial-gradient(circle_at_70%_70%,_#064e3b22_0%,_transparent_50%)] blur-[100px]" />
      </div>

      <div className="relative w-full max-w-xl h-[500px] flex items-center justify-center z-10">
        
        {/* THE DEFINITIVE RENDER SVG */}
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_40px_100px_rgba(0,0,0,0.9)]">
          <defs>
            <linearGradient id="metal" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#18181b"/>
              <stop offset="20%" stopColor="#3f3f46"/>
              <stop offset="40%" stopColor="#a1a1aa"/>
              <stop offset="50%" stopColor="#f4f4f5"/>
              <stop offset="60%" stopColor="#a1a1aa"/>
              <stop offset="80%" stopColor="#3f3f46"/>
              <stop offset="100%" stopColor="#18181b"/>
            </linearGradient>

            <linearGradient id="thermoBody" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#1a2220"/>
              <stop offset="20%" stopColor="#2c3633"/>
              <stop offset="50%" stopColor="#4f5f5a"/>
              <stop offset="80%" stopColor="#2c3633"/>
              <stop offset="100%" stopColor="#1a2220"/>
            </linearGradient>

            <radialGradient id="mateBody" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#8a5a3b"/>
              <stop offset="70%" stopColor="#6b3f2b"/>
              <stop offset="100%" stopColor="#3a2218"/>
            </radialGradient>

            <filter id="pbrTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="0.4">
                <feDistantLight azimuth="45" elevation="60" />
              </feDiffuseLighting>
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            <filter id="metalShine">
               <feSpecularLighting specularConstant="1.5" specularExponent="30" lightingColor="#fff">
                  <feDistantLight azimuth="45" elevation="45" />
               </feSpecularLighting>
               <feComposite operator="in" in2="SourceGraphic" />
            </filter>
          </defs>

          {/* 1. EL CHORRO (CAPA BASE GLOBAL) */}
          {progress < 100 && (
              <g id="water-stream-global">
                <motion.path
                    d="M100,55 Q135,70 175,165"
                    stroke="rgba(16,185,129,0.2)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                    style={{ filter: "blur(4px)" }}
                />
                <motion.path
                    d="M100,55 Q135,70 175,165"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    animate={{ strokeDashoffset: [0, -40] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{ strokeDasharray: "15 10" }}
                />
              </g>
          )}

          {/* 2. TERMO (POSICIÓN FIJA) */}
          <g transform="translate(60,40) rotate(32, 20, 60)">
            <rect x="5" y="5" width="40" height="120" rx="20" fill="black" opacity="0.3" filter="blur(8px)"/>
            <rect x="0" y="0" width="40" height="120" rx="20" fill="url(#thermoBody)" filter="url(#pbrTexture)" />
            <rect x="6" y="5" width="4" height="110" fill="white" opacity="0.12"/>
            <rect x="30" y="5" width="3" height="110" fill="black" opacity="0.2"/>
            <g transform="translate(8, -25)">
                <rect x="0" y="0" width="24" height="25" fill="url(#metal)" filter="url(#metalShine)" />
                <rect x="0" y="8" width="24" height="1.5" fill="black" opacity="0.2"/>
                <rect x="12" y="0" width="2" height="25" fill="white" opacity="0.4"/>
            </g>
            <path d="M12,-25 L28,-25 L20,-42 Z" fill="#09090b"/>
            <path d="M0,30 C-22,45 -22,95 0,110" stroke="#1f2937" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          </g>

          {/* 3. MATE Y BOMBILLA (JERARQUÍA CORREGIDA) */}
          <g transform="translate(140,165)">
            {/* Sombra */}
            <ellipse cx="40" cy="70" rx="35" ry="12" fill="black" opacity="0.6" filter="blur(12px)"/>

            {/* BOMBILLA DETRÁS (Solo se verá lo que sobresale) */}
            <g transform="translate(30,-45) rotate(-14)">
              <rect x="0" y="0" width="5" height="90" rx="3" fill="url(#metal)" filter="url(#metalShine)" />
              <rect x="2.5" y="10" width="1.2" height="70" fill="white" opacity="0.4"/>
            </g>

            {/* CUERPO DEL MATE (Tapa la base de la bombilla) */}
            <path 
              d="M0,20 C0,85 80,85 80,20 C80,-15 0,-15 0,20" 
              fill="url(#mateBody)" 
            />

            {/* VIROLA */}
            <g>
                <ellipse cx="40" cy="5" rx="43" ry="13" fill="url(#metal)" filter="url(#metalShine)" />
                <ellipse cx="40" cy="5" rx="40" ry="10" fill="#111" />
            </g>

            {/* YERBA (Tapa el punto de inserción de la bombilla) */}
            <ellipse cx="40" cy="5" rx="38" ry="9" fill="#2d4a2d"/>
            <ellipse cx="40" cy="5" rx="38" ry="9" fill="url(#pbrTexture)" opacity="0.4"/>
            {[...Array(6)].map((_, i) => (
                <circle key={i} cx={20 + i*8} cy={3 + Math.random()*5} r="1.5" fill="#6b8e23" opacity="0.4" />
            ))}
          </g>

          {/* 4. VAPOR */}
          {progress > 12 && (
            <g opacity="0.3">
              {[0, 1, 2].map(i => (
                <motion.circle
                  key={i}
                  cx={175 + i*12}
                  cy={150}
                  r={4 + i}
                  fill="white"
                  animate={{ 
                    y: [0, -60], 
                    opacity: [0, 1, 0],
                    scale: [1, 2]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
                  style={{ filter: "blur(10px)" }}
                />
              ))}
            </g>
          )}
        </svg>

        {/* HUD Percentage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[220px] font-black text-white/[0.012] tracking-tighter italic leading-none">
                {Math.floor(progress)}
            </span>
        </div>
      </div>

      {/* TECHNICAL SYSTEM UI */}
      <div className="mt-[-20px] flex flex-col items-center w-full max-w-sm px-10 z-20">
        
        <div className="h-8 flex items-center mb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentLog}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
                    <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] font-black">
                        {MATE_LOGS[currentLog]}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="w-full h-[1px] bg-white/[0.05] relative overflow-hidden">
            <motion.div 
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
            />
        </div>
      </div>

      <div className="absolute bottom-10 opacity-10 text-[10px] font-black text-white uppercase tracking-[1.2em]">
        MateCode Standard • v2.4
      </div>

    </div>
  );
};
