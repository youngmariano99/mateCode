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

  return (
    <div className={`${isEmbedded ? 'relative w-full h-full min-h-[400px] rounded-3xl' : 'fixed inset-0 z-[9999]'} bg-[#030508] flex flex-col items-center justify-center overflow-hidden font-sans`}>
      
      {!isEmbedded && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_30%_30%,_#0d948822_0%,_transparent_50%)] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-full h-full bg-[radial-gradient(circle_at_70%_70%,_#0f766e22_0%,_transparent_50%)] blur-[100px]" />
        </div>
      )}

      <div className={`relative w-full max-w-xl ${isEmbedded ? 'h-[250px]' : 'h-[360px]'} flex items-center justify-center z-10 px-6`}>
        {/* Frame / Container for the cinematic video loop */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-[0_25px_60px_rgba(0,0,0,0.85),_0_0_50px_rgba(13,148,136,0.15)] flex items-center justify-center">
          <video
            src="/Mate_pouring_hot_water_202606071322.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
          />
          
          {/* Edge fades (vignette) to merge the video background with the general screen background */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_45px_rgba(3,5,8,0.95)]" />
          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#030508] to-transparent opacity-95 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#030508] to-transparent opacity-95 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#030508] to-transparent opacity-95 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#030508] to-transparent opacity-95 pointer-events-none" />
        </div>
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