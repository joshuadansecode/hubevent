import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Sparkles, Globe, Shield, Users, Heart, Layers, Sun, Moon, LogOut, UserCircle, ArrowLeft } from 'lucide-react';
import { User, Event, Category, Candidate, VotePack, Transaction } from './types';
import { useBackend } from './lib/backend';
import { useTranslation } from './lib/i18n';
import RoleSelector from './components/RoleSelector';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import PublicPortal from './components/PublicPortal';
import ResultsPage from './components/ResultsPage';

function ResultsRoute() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  return <ResultsPage eventId={eventId || ''} onBack={() => navigate('/')} />;
}

function LoginRoute() {
  const navigate = useNavigate();
  return <LoginPage onSwitchToRegister={() => navigate('/register')} />;
}

function RegisterRoute() {
  const navigate = useNavigate();
  return <RegisterPage onSwitchToLogin={() => navigate('/login')} />;
}

function AppLayout() {
  const { backend, user, loading, logout, setDemoUser } = useBackend();
  const navigate = useNavigate();
  const { lang, setLang } = useTranslation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hub_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hub_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votePacks, setVotePacks] = useState<VotePack[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (loading) return;
    Promise.all([
      backend.getEvents(),
      backend.getCategories(),
      backend.getCandidates(),
      backend.getVotePacks(),
      backend.getTransactions(),
    ]).then(([evts, cats, cands, packs, txs]) => {
      setEvents(evts);
      setCategories(cats);
      setCandidates(cands);
      setVotePacks(packs);
      setTransactions(txs);
    });
  }, [backend, loading, refreshKey]);

  const handleUserChange = useCallback((newUser: User) => {
    setDemoUser(newUser);
    setRefreshKey(k => k + 1);
  }, [setDemoUser]);

  const handleResetDatabase = useCallback(async () => {
    await backend.resetDatabase();
    setRefreshKey(k => k + 1);
  }, [backend]);

  const handleLogout = useCallback(() => {
    logout();
    setRefreshKey(k => k + 1);
    navigate('/');
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0d0f17] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500">Chargement...</p>
      </div>
    );
  }

  const isGuest = !user || user.role === 'public';
  const activeRole = user?.role || 'public';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0d0f17] text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased select-none transition-colors">

      {isGuest && (
        <RoleSelector
          currentUser={user || { id: 'guest', email: 'public@hubevent.africa', name: 'Public / Visiteur', role: 'public' }}
          onUserChange={handleUserChange}
          onResetData={handleResetDatabase}
        />
      )}

      <header className="bg-white dark:bg-[#12141c] border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/10 shrink-0">
              <Layers className="text-white" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wider">Hub<span className="text-amber-500">Event</span></span>
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded font-mono font-bold tracking-widest uppercase border border-amber-500/20">v1.0</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Digitalisation & Votes de Concours Africains</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-center"
            >
              {theme === 'light' ? <Moon size={15} className="text-slate-600" /> : <Sun size={15} className="text-amber-500" />}
            </button>

            {activeRole === 'admin' && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold font-mono">
                <Shield size={12} /> ADMIN
              </span>
            )}
            {activeRole === 'organizer' && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-semibold font-mono">
                <Users size={12} /> ORGANISATEUR
              </span>
            )}
            {activeRole === 'public' && !user && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold font-mono">
                <Globe size={12} /> PUBLIC
              </span>
            )}

            {user && user.role !== 'public' ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">{user.name}</span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors" title="Se deconnecter">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700 rounded-lg transition-colors">
                <UserCircle size={14} /> Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeRole === 'admin' && (
          <AdminDashboard
            events={events}
            transactions={transactions}
            categories={categories}
            candidates={candidates}
            onRefresh={handleRefresh}
          />
        )}
        {activeRole === 'organizer' && (
          <OrganizerDashboard
            events={events}
            categories={categories}
            candidates={candidates}
            votePacks={votePacks}
            transactions={transactions}
            organizerId={user?.organizerId || ''}
            onRefresh={handleRefresh}
          />
        )}
        {activeRole === 'public' && (
          <PublicPortal
            events={events}
            categories={categories}
            candidates={candidates}
            votePacks={votePacks}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-[#12141c] border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-center space-y-3">
        <div className="max-w-7xl mx-auto text-slate-500 dark:text-slate-400 text-xs space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            HubEvent — L'infrastructure numerique qui digitalise les concours, revele les talents et connecte les evenements d'Afrique.
          </p>
          <p className="max-w-2xl mx-auto leading-relaxed text-slate-500 dark:text-slate-400">
            Paiements chiffres SSL et integration certifiee SebPay (Orange Money, MTN, Moov, Wave, Airtel, M-Pesa, 14 operateurs). Commission standard de 7% sur les votes payants servant a l'hebergement et au maintien de la securite.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto text-slate-400 dark:text-slate-500">
            <span>Cotonou, Benin</span>
            <span>•</span>
            <span>Lome, Togo</span>
            <span>•</span>
            <span>Abidjan, Cote d'Ivoire</span>
          </div>
          <p className="pt-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">HubEvent (c) 2026. Tous droits reserves.</p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/results/:eventId" element={<ResultsRoute />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}