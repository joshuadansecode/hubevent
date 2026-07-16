import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Event, Category, Candidate, VotePack, Transaction, User } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────

export type RegisterData = {
  email: string;
  password: string;
  name: string;
  phone?: string;
};

export type InitiateTransactionData = {
  eventId: string;
  candidateId: string;
  buyerName: string;
  buyerPhone: string;
  votesCount: number;
  amountCFA: number;
  packName?: string;
  paymentMethod?: Transaction['paymentMethod'];
};

// ── Interface ─────────────────────────────────────────────────────────────

export interface BackendAdapter {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  register(data: RegisterData): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getSession(): Promise<{ user: User | null }>;
  onAuthChange(callback: (user: User | null) => void): () => void;

  getEvents(params?: { country?: string; status?: string }): Promise<Event[]>;
  getEvent(id: string): Promise<Event | null>;
  createEvent(data: Omit<Event, 'id'>): Promise<Event>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  getCategoriesByEvent(eventId: string): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(data: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  getCandidates(): Promise<Candidate[]>;
  getCandidatesByEvent(eventId: string): Promise<Candidate[]>;
  getCandidatesByCategory(categoryId: string): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | null>;
  createCandidate(data: Omit<Candidate, 'id'>): Promise<Candidate>;
  updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate>;
  deleteCandidate(id: string): Promise<void>;

  getVotePacks(): Promise<VotePack[]>;
  getVotePacksByEvent(eventId: string): Promise<VotePack[]>;
  createVotePack(data: Omit<VotePack, 'id'>): Promise<VotePack>;
  updateVotePack(id: string, data: Partial<VotePack>): Promise<VotePack>;
  deleteVotePack(id: string): Promise<void>;

  getTransactions(): Promise<Transaction[]>;
  getTransactionsByEvent(eventId: string): Promise<Transaction[]>;
  initiateTransaction(data: InitiateTransactionData): Promise<Transaction>;
  processVoteTransaction(
    eventId: string, candidateId: string, buyerName: string, buyerPhone: string,
    votesCount: number, amountCFA: number, packName?: string,
    paymentMethod?: Transaction['paymentMethod'],
  ): Promise<Transaction>;

  exportData(): Promise<string>;
  importData(json: string): Promise<boolean>;
  resetDatabase(): Promise<void>;

  setUserRole?(userId: string, role: User['role']): Promise<void>;
}

// ── Provider ──────────────────────────────────────────────────────────────

interface BackendContextType {
  backend: BackendAdapter;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setDemoUser: (user: User) => void;
  setUserRole: (role: User['role']) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | null>(null);

export function BackendProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const localRef = useRef<import('./localdb-adapter').LocalDBAdapter | null>(null);
  const supabaseRef = useRef<import('./supabase-adapter').SupabaseAdapter | null>(null);
  const [backend, setBackend] = useState<BackendAdapter>(null!);

  useEffect(() => {
    // Lazy init to avoid circular imports during module loading
    import('./localdb-adapter').then(({ LocalDBAdapter }) => {
      const local = new LocalDBAdapter();
      localRef.current = local;
      import('./supabase-adapter').then(({ SupabaseAdapter }) => {
        const supabase = new SupabaseAdapter();
        supabaseRef.current = supabase;

        supabase.getSession().then(({ user: su }) => {
          if (su) {
            setUser(su);
            setBackend(supabase);
            setLoading(false);
          } else {
            local.getSession().then(({ user: lu }) => {
              setUser(lu);
              setBackend(local);
              setLoading(false);
            });
          }
        });

        const unsub = supabase.onAuthChange((supaUser) => {
          if (supaUser) {
            setUser(supaUser);
            setBackend(supabase);
          }
        });

        return () => unsub();
      });
    });
  }, []);

  const login = async (email: string, password: string) => {
    const result = await supabaseRef.current!.login(email, password);
    setUser(result.user);
    setBackend(supabaseRef.current!);
  };

  const register = async (data: RegisterData) => {
    const result = await supabaseRef.current!.register(data);
    setUser(result.user);
    setBackend(supabaseRef.current!);
  };

  const logout = async () => {
    try { await supabaseRef.current?.logout(); } catch { /* ignore */ }
    localRef.current?.logout();
    setUser(null);
    setBackend(localRef.current!);
  };

  const setDemoUser = (user: User) => {
    localRef.current?.setUser(user);
    setUser(user);
    setBackend(localRef.current!);
  };

  const setUserRole = async (role: User['role']) => {
    if (!user) return;
    await backend?.setUserRole?.(user.id, role);
    setUser({ ...user, role });
  };

  if (!backend) {
    return (
      <div className="min-h-screen bg-[#0d0f17] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        <p className="text-sm text-slate-500">Chargement...</p>
      </div>
    );
  }

  return (
    <BackendContext.Provider value={{ backend, user, loading, login, register, logout, setDemoUser, setUserRole }}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend() {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error('useBackend must be used within BackendProvider');
  return ctx;
}
