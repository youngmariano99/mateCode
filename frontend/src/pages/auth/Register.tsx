import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PublicLayout } from '../../layouts/PublicLayout';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password criteria checks
  const hasMinLength = password.length >= 9;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&._-]/.test(password);
  const isPasswordSecure = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Por favor, ingresa un nombre de usuario.");
      return;
    }

    if (!isPasswordSecure) {
      alert("Por favor, asegúrate de que la contraseña cumpla con todos los requisitos de seguridad.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username: username.trim().toLowerCase(),
        }
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert("¡Cuenta creada exitosamente! Podés iniciar sesión ahora.");
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <PublicLayout>
      <form className="mt-6 space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-550 uppercase tracking-widest mb-1 ml-1">
              Nombre de Usuario (@username)
            </label>
            <input
              name="username"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
              placeholder="Ej: marianodev"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-550 uppercase tracking-widest mb-1 ml-1">
              Nombre y Apellido Real
            </label>
            <input
              name="name"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
              placeholder="Ej: Mariano Young"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-550 uppercase tracking-widest mb-1 ml-1">
              Correo Electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
              placeholder="ejemplo@matecode.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-zinc-550 dark:text-zinc-550 uppercase tracking-widest mb-1 ml-1">
              Contraseña Segura
            </label>
            <input
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
              placeholder="Escribe una contraseña robusta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Password checklist indicators */}
            <div className="mt-2.5 bg-zinc-950/40 border border-zinc-900 rounded-xl p-3 space-y-1.5 text-[10px] text-zinc-500">
              <span className="block font-black uppercase tracking-wider text-[8px] text-zinc-400 mb-1">Requisitos de Seguridad:</span>
              <div className="flex items-center gap-1.5">
                <span className={hasMinLength ? "text-emerald-400" : "text-zinc-650"}>{hasMinLength ? "✓" : "○"}</span>
                <span className={hasMinLength ? "text-zinc-300" : "text-zinc-500"}>Mínimo 9 caracteres</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={hasUppercase ? "text-emerald-400" : "text-zinc-650"}>{hasUppercase ? "✓" : "○"}</span>
                <span className={hasUppercase ? "text-zinc-300" : "text-zinc-500"}>Al menos 1 mayúscula</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={hasNumber ? "text-emerald-400" : "text-zinc-650"}>{hasNumber ? "✓" : "○"}</span>
                <span className={hasNumber ? "text-zinc-300" : "text-zinc-500"}>Al menos 1 número</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={hasSpecial ? "text-emerald-400" : "text-zinc-650"}>{hasSpecial ? "✓" : "○"}</span>
                <span className={hasSpecial ? "text-zinc-300" : "text-zinc-500"}>Al menos 1 carácter especial (@, $, !, %, *, ?, &, ., _, -)</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || !isPasswordSecure}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? "Preparando el mate..." : "Crear mi Cuenta 🧉"}
          </button>
        </div>

        <div className="text-center text-sm mt-4">
          <span className="text-zinc-500 dark:text-zinc-500">¿Ya tienes cuenta? </span>
          <Link to="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </PublicLayout>
  );
}
