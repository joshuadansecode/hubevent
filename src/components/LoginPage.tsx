import React, { useState } from 'react';
import { useBackend } from '../lib/backend';
import { Layers, Mail, Lock, LogIn } from 'lucide-react';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginPage({ onSwitchToRegister }: Props) {
  const { login } = useBackend();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-[#0d0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-4">
            <Layers className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hub<span className="text-amber-500">Event</span></h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#12141c] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                placeholder="vous@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d0f17] text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                placeholder="Votre mot de passe"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            <LogIn size={16} />
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Pas encore de compte ?{' '}
            <button type="button" onClick={onSwitchToRegister} className="text-amber-600 hover:underline font-medium cursor-pointer">
              Créer un compte
            </button>
          </p>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-2">Comptes de démonstration</p>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p>Admin : admin@hubevent.com / admin123</p>
              <p>Organisateur : organisateur@hubevent.com / admin123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
