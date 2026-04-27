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
            <linearGradient id="thermoBodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1f1d" />
              <stop offset="15%" stopColor="#2d3532" />
              <stop offset="35%" stopColor="#4a5753" />
              <stop offset="50%" stopColor="#5a6b65" />
              <stop offset="65%" stopColor="#3d4a45" />
              <stop offset="85%" stopColor="#252e2a" />
              <stop offset="100%" stopColor="#151b18" />
            </linearGradient>

            <linearGradient id="thermoCapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c0c5c9" />
              <stop offset="30%" stopColor="#e8edf2" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#c0c5c9" />
              <stop offset="100%" stopColor="#8b9095" />
            </linearGradient>

            <linearGradient id="spoutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d3532" />
              <stop offset="50%" stopColor="#4a5753" />
              <stop offset="100%" stopColor="#1a1f1d" />
            </linearGradient>

            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(16,185,129,0.9)" />
              <stop offset="30%" stopColor="rgba(45,212,191,0.8)" />
              <stop offset="60%" stopColor="rgba(20,184,166,0.85)" />
              <stop offset="100%" stopColor="rgba(13,148,136,0.9)" />
            </linearGradient>

            <linearGradient id="metal" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#71767b" />
              <stop offset="20%" stopColor="#a1a5aa" />
              <stop offset="40%" stopColor="#d1d5db" />
              <stop offset="50%" stopColor="#f3f4f6" />
              <stop offset="60%" stopColor="#d1d5db" />
              <stop offset="80%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#71767b" />
            </linearGradient>

            <radialGradient id="mateBody" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#8a5a3b" />
              <stop offset="30%" stopColor="#7a4f33" />
              <stop offset="70%" stopColor="#6b3f2b" />
              <stop offset="100%" stopColor="#3a2218" />
            </radialGradient>

            <filter id="pbrTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="0.4">
                <feDistantLight azimuth="45" elevation="60" />
              </feDiffuseLighting>
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            <filter id="metalShine">
              <feSpecularLighting specularConstant="1.2" specularExponent="25" lightingColor="#fff">
                <feDistantLight azimuth="45" elevation="45" />
              </feSpecularLighting>
              <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            <filter id="waterDistortion">
              <feTurbulence type="fractalNoise" baseFrequency="0.02 0.06" numOctaves="2" seed="2">
                <animate attributeName="baseFrequency" values="0.02 0.06;0.03 0.07;0.02 0.06" dur="3s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="2" />
            </filter>

            <clipPath id="mateInterior">
              <path d="M0,20 C0,88 80,88 80,20 C80,-18 0,-18 0,20" />
            </clipPath>

            <clipPath id="bombillaClipper">
              <rect x="-20" y="-10" width="40" height="58" />
            </clipPath>
          </defs>

          {/* 1. TERMO */}
          <g transform="translate(45,35) rotate(30, 30, 70)">
            <rect x="3" y="3" width="50" height="125" rx="22" fill="black" opacity="0.4" filter="blur(10px)" />
            <rect x="0" y="0" width="50" height="125" rx="22" fill="url(#thermoBodyGradient)" />
            <rect x="0" y="0" width="50" height="125" rx="22" fill="url(#pbrTexture)" opacity="0.15" />
            <rect x="-2" y="118" width="54" height="8" rx="4" fill="url(#metal)" opacity="0.9" />
            
            {/* CUELLO CONECTOR (Elimina el efecto de pico volador) */}
            <rect x="12" y="-30" width="26" height="30" fill="url(#thermoBodyGradient)" />
            <rect x="12" y="-30" width="26" height="30" fill="url(#pbrTexture)" opacity="0.1" />

            <path d="M15,-30 L35,-30 L32,-45 L18,-45 Z" fill="url(#spoutGradient)" />
            <path d="M32,-45 C35,-55 40,-60 42,-55 C44,-50 40,-42 35,-30" fill="url(#metal)" opacity="0.8" />

            <g transform="translate(17, -50)">
              <rect x="0" y="0" width="16" height="20" rx="3" fill="url(#thermoCapGradient)" filter="url(#metalShine)" />
              <rect x="7" y="0" width="2" height="20" fill="white" opacity="0.2" />
            </g>

            <path d="M-4,30 C-18,45 -18,95 -4,110" stroke="#2d3532" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>

          {/* 2. MATE Y AGUA */}
          <g transform="translate(140,165)">
            <ellipse cx="40" cy="70" rx="38" ry="14" fill="black" opacity="0.5" filter="blur(15px)" />

            {/* CUERPO DEL MATE */}
            <path d="M0,20 C0,88 80,88 80,20 C80,-18 0,-18 0,20" fill="url(#mateBody)" />
            <path d="M0,20 C0,88 80,88 80,20 C80,-18 0,-18 0,20" fill="url(#pbrTexture)" opacity="0.2" />

            {/* EL CHORRO (LIMPIO, SIN PUNTOS) */}
            {progress < 100 && (
                <g id="water-stream-clean" filter="url(#waterDistortion)">
                <motion.path
                    d="M-15,-158 Q15,-130 40,10"
                    stroke="url(#waterGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                    opacity="0.85"
                />
                </g>
            )}

            {/* LA BOMBILLA */}
            <g transform="translate(48,-48) rotate(15)" clipPath="url(#bombillaClipper)">
              <rect x="0" y="0" width="5" height="95" rx="2.5" fill="url(#metal)" filter="url(#metalShine)" />
              <rect x="2" y="10" width="1.2" height="75" fill="white" opacity="0.3"/>
              <ellipse cx="2.5" cy="0" rx="4.5" ry="3" fill="url(#metal)" filter="url(#metalShine)" />
              <ellipse cx="2.5" cy="0" rx="3.5" ry="2" fill="#d1d5db" />
            </g>

            {/* VIROLA Y YERBA */}
            <g>
              <ellipse cx="40" cy="5" rx="45" ry="14" fill="url(#metal)" filter="url(#metalShine)" />
              <ellipse cx="40" cy="5" rx="42" ry="11" fill="#1f2937" />
            </g>

            <g clipPath="url(#mateInterior)">
              <motion.ellipse
                cx="40" cy="30" rx="36" ry="8"
                fill="rgba(16,185,129,0.4)"
                animate={{ cy: [28, 32, 28], rx: [36, 37, 36] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </g>

            <ellipse cx="40" cy="3" rx="39" ry="10" fill="#2d4a2d" />
            <ellipse cx="40" cy="3" rx="39" ry="10" fill="url(#pbrTexture)" opacity="0.3" />
            <path d="M20,3 C25,-8 35,-12 45,-8 C55,-12 65,-8 70,3 Z" fill="#3a5c3a" opacity="0.8" />
          </g>

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