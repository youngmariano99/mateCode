import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageCropModal } from '../common/ImageCropModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editName: string;
  setEditName: (val: string) => void;
  editUsername: string;
  setEditUsername: (val: string) => void;
  editAvatarUrl: string;
  isUpdatingProfile: boolean;
  onSave: (e: React.FormEvent) => Promise<void>;
  handleAvatarSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cropModalOpen: boolean;
  setCropModalOpen: (val: boolean) => void;
  selectedImageSrc: string;
  isUploadingAvatar: boolean;
  handleAvatarCropConfirm: (blob: Blob) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  editName,
  setEditName,
  editUsername,
  setEditUsername,
  editAvatarUrl,
  isUpdatingProfile,
  onSave,
  handleAvatarSelect,
  cropModalOpen,
  setCropModalOpen,
  selectedImageSrc,
  isUploadingAvatar,
  handleAvatarCropConfirm,
}) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl z-10"
            >
              <div>
                <h3 className="text-lg font-bold text-white">Editar Perfil</h3>
                <p className="text-zinc-550 text-[10px] uppercase tracking-wider">Actualiza tu información personal</p>
              </div>

              <form onSubmit={onSave} className="space-y-4">
                {/* Avatar Uploader Field */}
                <div className="flex flex-col items-center gap-3 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest self-start">Foto de Perfil</span>
                  <div className="relative group">
                    {editAvatarUrl ? (
                      <img 
                        src={editAvatarUrl} 
                        alt="Avatar Preview" 
                        className="w-20 h-20 rounded-full border border-zinc-800 object-cover" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center">
                        {(editName || 'MC').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500" />
                      </div>
                    )}
                  </div>
                  <label className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-zinc-800">
                    {editAvatarUrl ? 'Cambiar Foto' : 'Subir Foto'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarSelect} 
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-550 uppercase tracking-widest mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/65 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder="Ej: Mariano Young"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-550 uppercase tracking-widest mb-1.5">
                    Nombre de Usuario (@username)
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-zinc-950/65 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors font-mono"
                    placeholder="Ej: marianodev"
                  />
                  <span className="text-[9px] text-zinc-650 mt-1 block">
                    Solo letras, números, puntos, guiones y barras bajas.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900/60">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                  >
                    {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={selectedImageSrc}
        aspectRatio={1}
        circular={true}
        onClose={() => setCropModalOpen(false)}
        onConfirm={handleAvatarCropConfirm}
      />
    </>
  );
};
