import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PublicLayout } from '../../layouts/PublicLayout';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
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
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Nombre Completo
            </label>
            <input
              name="name"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
              placeholder="Ej: Mariano Dev"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">
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
             <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-sm"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
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
