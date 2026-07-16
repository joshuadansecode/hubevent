import React from 'react';
import { Shield, User as UserIcon, Users, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface RoleSelectorProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onResetData: () => void;
}

export default function RoleSelector({ currentUser, onUserChange, onResetData }: RoleSelectorProps) {
  const users: User[] = [
    { id: 'usr-pub', email: 'public@hubevent.africa', name: 'Public / Visiteur', role: 'public' },
    { id: 'usr-org-1', email: 'patrimoine@hubevent.africa', name: 'Organisateur Autonome (Hwendo)', role: 'organizer', organizerId: 'org-1' },
    { id: 'usr-org-2', email: 'lomeslam@hubevent.africa', name: 'Organisateur Accompagné (Slam)', role: 'organizer', organizerId: 'evt-2' },
    { id: 'usr-admin', email: 'admin@hubevent.africa', name: 'Admin HubEvent (Niveau 1)', role: 'admin' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 sticky top-0 z-50 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-mono font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <span>DÉMO INTERACTIVE — NIVEAUX D'ACCÈS</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center">
          {users.map((u) => {
            const isActive = currentUser.role === u.role && 
              (u.role !== 'organizer' || currentUser.organizerId === u.organizerId);
            
            return (
              <button
                key={u.id}
                id={`role-btn-${u.id}`}
                onClick={() => onUserChange(u)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {u.role === 'admin' && <Shield size={13} />}
                {u.role === 'organizer' && <Users size={13} />}
                {u.role === 'public' && <UserIcon size={13} />}
                <span>{u.name}</span>
              </button>
            );
          })}

          <button
            id="reset-db-btn"
            onClick={() => {
              if (window.confirm('Voulez-vous réinitialiser toutes les données aux valeurs de démonstration ?')) {
                onResetData();
              }
            }}
            title="Réinitialiser les données"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-900 text-red-300 hover:bg-red-900/40 hover:border-red-700 transition-all cursor-pointer font-medium"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </div>
    </div>
  );
}
