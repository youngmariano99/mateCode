import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MateLoadingScreen
 * ---------------------------------------------------------------------------
 * High-fidelity loading screen with an illustrated mate/termo SVG animation.
 * Features dynamic filling, steam effects, and rolling log messages.
 * ---------------------------------------------------------------------------
 */

interface MateLoadingScreenProps {
  onFinished?: () => void;
  isEmbedded?: boolean;
  message?: string;
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

export const MateLoadingScreen: React.FC<MateLoadingScreenProps> = ({ onFinished, isEmbedded, message }) => {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(0);

  // Auto-progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 0.6, 100);
        if (next >= 100) {
          clearInterval(interval);
          if (onFinished) setTimeout(() => onFinished(), 1000);
          return 100;
        }
        return next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [onFinished]);

  // Log rotation
  useEffect(() => {
    const logInterval = setInterval(() => {
      setCurrentLog(prev => (prev + 1) % MATE_LOGS.length);
    }, 1800);
    return () => clearInterval(logInterval);
  }, []);

  const value = Math.max(0, Math.min(100, progress));

  // Geometry constants for the mate liquid level
  const MATE_X = 230;
  const MATE_Y = 220;
  const MATE_W = 110;
  const MATE_H = 140;

  // The liquid rises from bottom to top based on `value`
  const liquidHeight = (MATE_H - 20) * (value / 100);
  const liquidY = MATE_Y + (MATE_H - 20) - liquidHeight;

  return (
    <div className={`${isEmbedded ? 'relative w-full h-full min-h-[400px] rounded-3xl' : 'fixed inset-0 z-[9999]'} bg-[#030508] flex flex-col items-center justify-center overflow-hidden font-sans`}>
      
      {!isEmbedded && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_30%_30%,_#10b98122_0%,_transparent_50%)] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-[radial-gradient(circle_at_70%_70%,_#064e3b22_0%,_transparent_50%)] blur-[100px]" />
        </div>
      )}

      {/* Local CSS Animations for the SVG */}
      <style>{`
        @keyframes mate-water-flow {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        @keyframes mate-steam-rise {
          0%   { transform: translateY(0px);   opacity: 0; }
          20%  { opacity: 0.45; }
          80%  { opacity: 0.25; }
          100% { transform: translateY(-22px); opacity: 0; }
        }
        .mate-water-anim {
          stroke-dasharray: 15 5;
          animation: mate-water-flow 1.1s linear infinite;
        }
        .mate-steam-line {
          transform-origin: center;
          transform-box: fill-box;
          animation: mate-steam-rise 3.4s ease-in-out infinite;
        }
        .mate-steam-line.s2 { animation-duration: 4.1s; animation-delay: -1.2s; }
        .mate-steam-line.s3 { animation-duration: 3.7s; animation-delay: -2.3s; }
      `}</style>

      <div className={`relative w-full max-w-xl ${isEmbedded ? 'h-[250px]' : 'h-[450px]'} flex items-center justify-center z-10`}>
        <svg
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
        >
          <defs>
            <linearGradient id="termoBody" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="60%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="termoNeck" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="mateLeather" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="50%" stopColor="#3f2a1d" />
              <stop offset="100%" stopColor="#0c0a09" />
            </linearGradient>
            <linearGradient id="virola" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="waterGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <radialGradient id="mateBody" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="yerbaMass" cx="35%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
            <clipPath id="mateClip">
              <path
                d="M 240 230
                   Q 218 260 232 320
                   Q 250 360 285 360
                   Q 320 360 338 320
                   Q 352 260 330 230
                   Z"
              />
            </clipPath>
          </defs>

          {/* TERMO */}
          <g id="termo" transform="rotate(45 130 130)">
            <rect x="80" y="60" width="60" height="180" rx="6" fill="url(#termoBody)" />
            <rect x="80" y="225" width="60" height="6" fill="#0f172a" />
            <rect x="90" y="42" width="40" height="22" fill="url(#termoNeck)" />
            <rect x="88" y="60" width="44" height="4" fill="#475569" />
            <rect x="92" y="22" width="36" height="22" rx="3" fill="#0f172a" />
            <path d="M 128 26 L 138 30 L 138 36 L 128 40 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="0.5" />
            <ellipse cx="136" cy="33" rx="1.5" ry="2" fill="#020617" />
            <rect x="98" y="64" width="4" height="160" fill="#ffffff" opacity="0.1" />
          </g>

          {/* WATER STREAM */}
          {value < 100 && (
            <g id="water-stream">
              <path
                d="M 207 66 Q 225 120 248 170 Q 262 205 270 233"
                stroke="#7dd3fc"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
                className="mate-water-anim"
              />
              <path
                d="M 207 66 Q 225 120 248 170 Q 262 205 270 233"
                stroke="#ffffff"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
                opacity="0.55"
              />
              <ellipse cx="270" cy="233" rx="6" ry="1.8" fill="#bae6fd" opacity="0.7" />
            </g>
          )}

          {/* STEAM */}
          <g id="steam" opacity="0.9">
            <path className="mate-steam-line s1" d="M 268 215 q 5 -8 0 -16 t 0 -16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
            <path className="mate-steam-line s2" d="M 286 212 q -5 -8 0 -16 t 0 -16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
            <path className="mate-steam-line s3" d="M 302 216 q 5 -8 0 -16 t 0 -16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
          </g>

          {/* MATE */}
          <g id="mate">
            <ellipse cx="285" cy="370" rx="65" ry="6" fill="#000" opacity="0.4" />
            <path
              d="M 240 230 Q 218 260 232 320 Q 250 365 285 365 Q 320 365 338 320 Q 352 260 330 230 Z"
              fill="url(#mateBody)"
              stroke="#000000"
              strokeWidth="1.8"
            />
            
            {/* Liquid Level */}
            <g id="liquid-level" clipPath="url(#mateClip)">
              <rect x={MATE_X} y={liquidY} width={MATE_W} height={liquidHeight + 20} fill="url(#waterGradient)" opacity="0.85" />
              <rect x={MATE_X} y={liquidY} width={MATE_W} height={2} fill="#ecfeff" opacity="0.6" />
            </g>

            {/* Virola */}
            <ellipse cx="285" cy="230" rx="52" ry="13" fill="url(#virola)" stroke="#334155" strokeWidth="1.5" />
            <path d="M 246 228 Q 285 218 324 228" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.7" />

            {/* Mouth */}
            <ellipse cx="285" cy="232" rx="44" ry="9" fill="#0f172a" />
            
            {/* Yerba */}
            <g id="yerba" clipPath="url(#mateClip)">
              <ellipse cx="285" cy="232" rx="46" ry="10" fill="url(#yerbaMass)" />
              <path
                d="M 240 232 Q 250 218 268 220 Q 278 222 284 228 Q 290 232 296 230 Q 305 229 312 232 Q 318 234 325 233 L 330 236 Q 300 240 260 239 Q 245 238 240 234 Z"
                fill="url(#yerbaMass)"
                stroke="#022c22"
                strokeWidth="0.6"
              />
              <circle cx="252" cy="228" r="1.1" fill="#10b981" opacity="0.55" />
              <circle cx="262" cy="225" r="0.9" fill="#10b981" opacity="0.5" />
              <circle cx="272" cy="227" r="1" fill="#10b981" opacity="0.55" />
            </g>

            {/* Bombilla */}
            <g id="bombilla">
              <path d="M 308 238 L 350 178 Q 354 168 362 168" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.55" />
              <path d="M 306 236 L 348 176 Q 352 166 360 166" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M 307 234 L 347 178 Q 351 169 358 168" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />
              <ellipse cx="361" cy="166" rx="4" ry="2.6" fill="#cbd5e1" stroke="#475569" strokeWidth="0.7" transform="rotate(35 361 166)" />
            </g>
          </g>
        </svg>
      </div>

      <div className={`flex flex-col items-center w-full max-w-sm px-10 z-20 ${isEmbedded ? 'mt-[-10px]' : 'mt-[-40px]'}`}>
        <div className="h-8 flex items-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLog}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse" />
              <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-[0.4em] font-black text-center">
                {message || MATE_LOGS[currentLog]}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full h-[2px] bg-white/[0.05] relative overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
        
        <div className="mt-2 flex justify-between w-full opacity-40">
           <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Cebando Datos</span>
           <span className="text-[8px] font-black font-mono text-white">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};