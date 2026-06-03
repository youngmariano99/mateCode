import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Eye, Copy, ExternalLink, Key } from 'lucide-react';
import { useSecretsStore } from '../../store/useSecretsStore';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

export const SecretsPanel: React.FC = () => {
  const { secrets, fetchSecrets, createSecret, revealSecret, deleteSecret } = useSecretsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revealedSecretId, setRevealedSecretId] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string>('');
  const [form, setForm] = useState({
    servicio: '',
    usuario: '',
    passwordPlano: '',
    urlAcceso: '',
    rolesPermitidos: ''
  });

  useEffect(() => {
    fetchSecrets();
  }, []);

  const handleReveal = async (secretId: string, servicio: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar Lectura Auditada?',
      text: `Al revelar las credenciales de "${servicio}", esta acción será registrada con tu firma inmutable en el registro de auditoría de la agencia.`,
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, revelar y registrar',
      cancelButtonText: 'Cancelar'
    });

    if (isConfirmed) {
      try {
        const password = await revealSecret(secretId);
        setRevealedSecretId(secretId);
        setRevealedPassword(password);
      } catch (err: any) {
        Swal.fire({
          title: 'Error de Seguridad',
          text: err.message || 'No posees permisos de desencripción para este secreto.',
          icon: 'error',
          background: '#09090b',
          color: '#f4f4f5'
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Copiado al portapapeles',
      showConfirmButton: false,
      timer: 1500,
      background: '#09090b',
      color: '#f4f4f5'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roles = form.rolesPermitidos.split(',').map(s => s.trim()).filter(Boolean);
      await createSecret({
        servicio: form.servicio,
        usuario: form.usuario,
        passwordPlano: form.passwordPlano,
        urlAcceso: form.urlAcceso,
        rolesPermitidos: roles
      });
      setIsModalOpen(false);
      setForm({
        servicio: '',
        usuario: '',
        passwordPlano: '',
        urlAcceso: '',
        rolesPermitidos: ''
      });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar credencial?',
      icon: 'warning',
      showCancelButton: true,
      background: '#09090b',
      color: '#f4f4f5',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) {
      await deleteSecret(id);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Bóveda de Accesos Cifrados</span>
            <Shield size={24} className="text-emerald-400" />
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Cifrado simétrico AES-256 de doble nivel. Cada desencripción queda plasmada en el log de auditoría.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={14} />
          <span>Nueva Credencial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secrets.length === 0 ? (
          <div className="col-span-full p-12 border border-dashed border-zinc-800 text-center rounded-3xl text-zinc-600 text-sm">
            No hay credenciales cimentadas en la bóveda de seguridad.
          </div>
        ) : (
          secrets.map(sec => (
            <div key={sec.id} className="bg-zinc-900/40 border border-zinc-800/60 p-6 rounded-3xl flex flex-col justify-between min-h-[180px] group">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-sm text-white">{sec.servicio}</span>
                  <button 
                    onClick={() => handleDelete(sec.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex justify-between bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                    <span className="text-zinc-500">Usuario:</span>
                    <span className="text-zinc-300 font-mono">{sec.usuario || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900 items-center">
                    <span className="text-zinc-500">Clave:</span>
                    {revealedSecretId === sec.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono font-bold select-all">{revealedPassword}</span>
                        <button 
                          onClick={() => copyToClipboard(revealedPassword)} 
                          className="text-zinc-400 hover:text-white"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReveal(sec.id, sec.servicio)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400 border border-zinc-700 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Eye size={11} />
                        <span>Revelar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {sec.url_acceso && (
                <a 
                  href={sec.url_acceso.startsWith('http') ? sec.url_acceso : `https://${sec.url_acceso}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1 mt-5 self-start transition-colors"
                >
                  <span>Enlace de acceso</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="text-emerald-400" />
              <span>Cimentar Credencial Segura</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Servicio / Plataforma</label>
                <input required type="text" placeholder="Ej: Vercel Production, AWS Key" value={form.servicio} onChange={e => setForm({ ...form, servicio: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nombre de Usuario / API Client ID</label>
                <input type="text" value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Clave Secreta / Token (Texto Plano)</label>
                <input required type="password" value={form.passwordPlano} onChange={e => setForm({ ...form, passwordPlano: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">URL de Acceso</label>
                <input type="text" placeholder="https://console.aws.amazon.com" value={form.urlAcceso} onChange={e => setForm({ ...form, urlAcceso: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-xs text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold">Cifrar & Guardar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
