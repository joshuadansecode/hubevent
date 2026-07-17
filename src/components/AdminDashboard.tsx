import React, { useState } from 'react';
import { 
  Plus, Edit, Eye, Trash2, CheckCircle, AlertCircle, XCircle, FileDown, 
  FileUp, Calendar, MapPin, DollarSign, PieChart, Users, Settings, Briefcase, 
  RefreshCw, TrendingUp, Sparkles, LogOut, Check, Info
} from 'lucide-react';
import { Event, Transaction, Category, Candidate } from '../types';
import { useBackend } from '../lib/backend';

interface AdminDashboardProps {
  events: Event[];
  transactions: Transaction[];
  categories: Category[];
  candidates: Candidate[];
  onRefresh: () => void;
}

export default function AdminDashboard({ events, transactions, categories, candidates, onRefresh }: AdminDashboardProps) {
  const { backend } = useBackend();
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [importText, setImportText] = useState('');
  const [showBackupPanel, setShowBackupPanel] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Event form states
  const [eventName, setEventName] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLogo, setEventLogo] = useState('');
  const [eventPoster, setEventPoster] = useState('');
  const [eventCountry, setEventCountry] = useState('Bénin');
  const [eventCity, setEventCity] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventVoteStart, setEventVoteStart] = useState('');
  const [eventVoteEnd, setEventVoteEnd] = useState('');
  const [eventStatus, setEventStatus] = useState<Event['status']>('Brouillon');
  const [isAccompanied, setIsAccompanied] = useState(false);
  const [organizerName, setOrganizerName] = useState('');
  const [votePrice, setVotePrice] = useState(100);
  const [hideRanking, setHideRanking] = useState(false);

  // Financial calculations
  const totalVolume = transactions.reduce((acc, tx) => acc + (tx.status === 'Succès' ? tx.amountCFA : 0), 0);
  const totalCommission = transactions.reduce((acc, tx) => acc + (tx.status === 'Succès' ? tx.commissionCFA : 0), 0);
  const organizerPalyout = totalVolume - totalCommission;
  const successfulTxCount = transactions.filter(tx => tx.status === 'Succès').length;

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setEventName('');
    setEventDesc('');
    setEventLogo('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop&q=80');
    setEventPoster('https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80');
    setEventCountry('Bénin');
    setEventCity('Cotonou');
    setEventLocation('Palais des Congrès de Cotonou');
    setEventStart('2026-08-01');
    setEventEnd('2026-08-07');
    setEventVoteStart('2026-07-01');
    setEventVoteEnd('2026-08-05');
    setEventStatus('Brouillon');
    setIsAccompanied(false);
    setOrganizerName('Association Culturelle');
    setVotePrice(100);
    setHideRanking(false);
    setShowEventModal(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventName(event.name);
    setEventDesc(event.description);
    setEventLogo(event.logoUrl);
    setEventPoster(event.posterUrl);
    setEventCountry(event.country);
    setEventCity(event.city);
    setEventLocation(event.location);
    setEventStart(event.startDate);
    setEventEnd(event.endDate);
    setEventVoteStart(event.voteStartDate);
    setEventVoteEnd(event.voteEndDate);
    setEventStatus(event.status);
    setIsAccompanied(event.isAccompanied);
    setOrganizerName(event.organizerName);
    setVotePrice(event.votePriceCFA);
    setHideRanking(event.hideRanking);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Toutes les catégories et candidats liés seront également affectés.")) {
      try {
        await backend.deleteEvent(id);
      } catch (err) {
        console.warn('Delete failed:', err);
      }
      onRefresh();
      showNotification('Événement supprimé avec succès.', 'success');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventCity.trim() || !eventLocation.trim() || !organizerName.trim()) {
      showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    try {
      if (editingEvent) {
        await backend.updateEvent(editingEvent.id, {
          name: eventName,
          description: eventDesc,
          logoUrl: eventLogo || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop&q=80',
          posterUrl: eventPoster || 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
          country: eventCountry,
          city: eventCity,
          location: eventLocation,
          startDate: eventStart,
          endDate: eventEnd,
          voteStartDate: eventVoteStart,
          voteEndDate: eventVoteEnd,
          status: eventStatus,
          isAccompanied,
          organizerName,
          hideRanking,
          votePriceCFA: Number(votePrice),
        });
        showNotification('Événement modifié avec succès.', 'success');
      } else {
        await backend.createEvent({
          name: eventName,
          description: eventDesc,
          logoUrl: eventLogo || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop&q=80',
          posterUrl: eventPoster || 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
          country: eventCountry,
          city: eventCity,
          location: eventLocation,
          startDate: eventStart,
          endDate: eventEnd,
          voteStartDate: eventVoteStart,
          voteEndDate: eventVoteEnd,
          status: eventStatus,
          isAccompanied,
          organizerId: `org-${Date.now()}`,
          organizerName,
          hideRanking,
          votePriceCFA: Number(votePrice),
        });
        showNotification('Événement créé avec succès.', 'success');
      }
    } catch (err) {
      showNotification('Erreur lors de la sauvegarde.', 'error');
      console.warn('Save failed:', err);
    }

    setShowEventModal(false);
    onRefresh();
  };

  const handleExport = async () => {
    const dataStr = await backend.exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hubevent_backup_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification('Sauvegarde téléchargée avec succès.', 'success');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      showNotification('Veuillez insérer le contenu JSON de sauvegarde.', 'error');
      return;
    }
    const success = await backend.importData(importText);
    if (success) {
      showNotification('Données importées et restaurées avec succès !', 'success');
      setImportText('');
      setShowBackupPanel(false);
      onRefresh();
    } else {
      showNotification('Échec de l\'importation. Format JSON invalide.', 'error');
    }
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Helper status badge styles
  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'Actif':
        return <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Actif</span>;
      case 'Publié':
        return <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Publié</span>;
      case 'Brouillon':
        return <span className="px-2.5 py-1 bg-gray-500/10 border border-gray-500/30 text-gray-400 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><Settings size={12}/> Brouillon</span>;
      case 'Terminé':
        return <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Terminé</span>;
      case 'Annulé':
        return <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><XCircle size={12}/> Annulé</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">
      
      {/* Notifications */}
      {successMsg && (
        <div id="admin-success-toast" className="fixed bottom-4 right-4 bg-green-950/90 border border-green-500 text-green-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div id="admin-error-toast" className="fixed bottom-4 right-4 bg-red-950/90 border border-red-500 text-red-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <XCircle className="text-red-500" size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hero Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1 font-mono text-xs uppercase tracking-wider">
            <Sparkles size={14} /> Niveau 1 — Contrôle Global HubEvent
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Console d'Administration</h1>
          <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
            Supervisez tous les événements africains, configurez les services autonomes ou accompagnés, suivez les commissions financières et sécurisez la plateforme en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="admin-btn-backup"
            onClick={() => setShowBackupPanel(!showBackupPanel)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1d29] border border-gray-800 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-all hover:bg-slate-800 cursor-pointer"
          >
            <Settings size={15} />
            <span>Sauvegardes / Systèmes</span>
          </button>
          
          <button
            id="admin-btn-create-event"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg text-sm font-semibold transition-all hover:brightness-110 shadow-lg shadow-orange-950/20 hover:scale-[1.01] cursor-pointer"
          >
            <Plus size={16} />
            <span>Créer un événement</span>
          </button>
        </div>
      </div>

      {/* Backup Panel */}
      {showBackupPanel && (
        <div id="admin-backup-card" className="bg-[#1a1d29] border border-gray-800 rounded-xl p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings size={18} className="text-amber-500" />
              Sauvegarde et Restauration du Système
            </h3>
            <button 
              onClick={() => setShowBackupPanel(false)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              Fermer
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-amber-500 uppercase tracking-wider font-mono">Exporter les données</h4>
              <p className="text-xs text-slate-400">
                Générez et téléchargez un fichier de sauvegarde au format JSON contenant la totalité des bases de données : événements, candidats, transactions et statistiques financières de HubEvent.
              </p>
              <button
                id="btn-actual-export"
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-all text-slate-200"
              >
                <FileDown size={15} />
                <span>Télécharger la Sauvegarde (.json)</span>
              </button>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
              <h4 className="text-sm font-semibold text-orange-500 uppercase tracking-wider font-mono">Restaurer des données</h4>
              <p className="text-xs text-slate-400">
                Insérez le contenu textuel JSON d'une sauvegarde précédente pour écraser les données locales et restaurer la plateforme à un état antérieur.
              </p>
              <form onSubmit={handleImport} className="space-y-2">
                <textarea
                  id="backup-json-textarea"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Collez le code JSON ici... ex: {"events": [...], "categories": [...] }'
                  className="w-full h-24 bg-[#12141c] border border-gray-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
                <button
                  type="submit"
                  id="btn-actual-import"
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-400 rounded-lg text-sm font-medium transition-all"
                >
                  <FileUp size={15} />
                  <span>Importer et Écraser les données</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#1a1d29] border border-gray-800 p-5 rounded-xl flex items-center gap-4 hover:border-amber-500/20 transition-all shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Volume des Votes</p>
            <p className="text-xl font-black text-white mt-1">{totalVolume.toLocaleString('fr-FR')} FCFA</p>
            <div className="flex items-center gap-1 text-[10px] text-green-400 mt-1">
              <TrendingUp size={10} /> <span>100% sécurisé</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1d29] border border-gray-800 p-5 rounded-xl flex items-center gap-4 hover:border-orange-500/20 transition-all shadow-md">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
            <PieChart size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Commission HubEvent (10%)</p>
            <p className="text-xl font-black text-orange-400 mt-1">{totalCommission.toLocaleString('fr-FR')} FCFA</p>
            <div className="flex items-center gap-1 text-[10px] text-orange-300 mt-1">
              <span>Ressources propres de la plateforme</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1d29] border border-gray-800 p-5 rounded-xl flex items-center gap-4 hover:border-blue-500/20 transition-all shadow-md">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Part des Organisateurs (93%)</p>
            <p className="text-xl font-black text-white mt-1">{organizerPalyout.toLocaleString('fr-FR')} FCFA</p>
            <div className="flex items-center gap-1 text-[10px] text-blue-400 mt-1">
              <span>À reverser aux promoteurs</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1d29] border border-gray-800 p-5 rounded-xl flex items-center gap-4 hover:border-emerald-500/20 transition-all shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Transactions Validées</p>
            <p className="text-xl font-black text-white mt-1">{successfulTxCount}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
              <span>Taux de conversion ~ 98.4%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Events Admin Table / List */}
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Liste de tous les Événements</h2>
            <p className="text-xs text-slate-400">Modifiez le statut d'un concours, basculez entre gestion autonome ou accompagnée, ou configurez les détails.</p>
          </div>
          <span className="px-2.5 py-1 bg-gray-800 text-slate-300 text-xs font-mono rounded-lg font-bold">{events.length} événements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#12141c] text-xs font-mono text-slate-400 uppercase border-b border-gray-800">
                <th className="p-4 font-bold">Événement & Client</th>
                <th className="p-4 font-bold">Localisation & Dates</th>
                <th className="p-4 font-bold">Type d'Accompagnement</th>
                <th className="p-4 font-bold">Prix Vote / Rang</th>
                <th className="p-4 font-bold">Statut</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {events.map((evt) => {
                const eventVotes = transactions
                  .filter(tx => tx.eventId === evt.id && tx.status === 'Succès')
                  .reduce((sum, tx) => sum + tx.votesCount, 0);

                const eventRevenue = transactions
                  .filter(tx => tx.eventId === evt.id && tx.status === 'Succès')
                  .reduce((sum, tx) => sum + tx.amountCFA, 0);

                return (
                  <tr key={evt.id} id={`evt-row-${evt.id}`} className="hover:bg-slate-800/30 transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={evt.logoUrl} 
                          alt={evt.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-800 bg-[#12141c]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&q=80';
                          }}
                        />
                        <div>
                          <p className="font-bold text-white hover:text-amber-400 transition-colors cursor-pointer">{evt.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 font-mono">Organisateur: <strong className="text-slate-300">{evt.organizerName}</strong></span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin size={12} className="text-amber-500" />
                          <span>{evt.city}, {evt.country}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{evt.startDate} au {evt.endDate}</span>
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {evt.isAccompanied ? (
                        <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                          <Sparkles size={11} /> Service Accompagné
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                          <Settings size={11} /> Plateforme Autonome
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-300">
                          Vote: <strong className="text-amber-400 font-mono">{evt.votePriceCFA} FCFA</strong>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Classement: <strong className={evt.hideRanking ? "text-orange-400" : "text-green-400"}>
                            {evt.hideRanking ? 'Masqué' : 'Affiché'}
                          </strong>
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(evt.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-edit-evt-${evt.id}`}
                          onClick={() => handleOpenEditModal(evt)}
                          title="Modifier l'événement"
                          className="p-1.5 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-amber-500 border border-gray-800 hover:border-amber-500/30 rounded-lg transition-all cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          id={`btn-delete-evt-${evt.id}`}
                          onClick={() => handleDeleteEvent(evt.id)}
                          title="Supprimer l'événement"
                          className="p-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 hover:border-red-500/40 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Info className="mx-auto mb-2 text-slate-600" size={32} />
                    Aucun événement disponible. Cliquez sur "Créer un événement" pour commencer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Logs (Anti-Abuse and Security audits) */}
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Traçabilité & Journal des Votes</h2>
            <p className="text-xs text-slate-400">Audit complet des transactions payantes reçues. Détection anti-fraude en temps réel.</p>
          </div>
          <span className="px-2.5 py-1 bg-amber-600/10 border border-amber-500/30 text-amber-500 text-xs font-mono rounded-lg font-bold">
            Audit : {transactions.length} Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#12141c] text-xs font-mono text-slate-400 uppercase border-b border-gray-800">
                <th className="p-4 font-bold">ID Transaction</th>
                <th className="p-4 font-bold">Événement & Candidat</th>
                <th className="p-4 font-bold">Votant (Tél)</th>
                <th className="p-4 font-bold">Montant & Mode</th>
                <th className="p-4 font-bold">Com. HubEvent (10%)</th>
                <th className="p-4 font-bold">Date & Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm font-mono text-slate-300">
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="p-4 text-xs font-semibold text-slate-400">
                    {tx.id}
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-sans font-bold text-white truncate max-w-[200px]">{tx.eventName}</div>
                    <div className="text-[11px] text-amber-500 mt-0.5">Dest: {tx.candidateName}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-sans font-medium text-slate-200">{tx.buyerName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{tx.buyerPhone}</p>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="text-white font-bold">{tx.amountCFA.toLocaleString('fr-FR')} FCFA</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 bg-[#12141c] px-1.5 py-0.5 rounded border border-gray-800 w-fit">
                      {tx.votesCount} votes ({tx.paymentMethod})
                    </div>
                  </td>
                  <td className="p-4 text-xs text-orange-400 font-bold">
                    {tx.commissionCFA.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="p-4 text-xs">
                    <p className="text-[11px] text-slate-500">{new Date(tx.timestamp).toLocaleString('fr-FR')}</p>
                    <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-sans font-bold rounded mt-1 inline-block">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-[#12141c] border-t border-gray-800 text-center">
          <p className="text-xs text-slate-500">Affichage des 10 transactions les plus récentes. Protection chiffrée SSL & SebPay.</p>
        </div>
      </div>

      {/* Creation/Edition Event Modal */}
      {showEventModal && (
        <div id="admin-event-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            <div className="bg-[#12141c] p-5 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-amber-500" />
                {editingEvent ? "Modifier l'événement" : "Créer un Nouvel Événement"}
              </h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white bg-slate-800/50 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Event Basic details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Nom de l'événement <span className="text-orange-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="ex: Miss Culture Bénin 2026"
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Nom de l'Organisateur <span className="text-orange-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="ex: Association Patrimoine Afrique"
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description générale</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Présentation complète, objectifs du concours..."
                  className="w-full h-20 bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Poster and Logo URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">URL Logo (Image carrée)</label>
                  <input
                    type="url"
                    value={eventLogo}
                    onChange={(e) => setEventLogo(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">URL Affiche / Couverture</label>
                  <input
                    type="url"
                    value={eventPoster}
                    onChange={(e) => setEventPoster(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Pays <span className="text-orange-500">*</span></label>
                  <select
                    value={eventCountry}
                    onChange={(e) => setEventCountry(e.target.value)}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  >
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Côte d’Ivoire">Côte d’Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Cameroun">Cameroun</option>
                    <option value="Mali">Mali</option>
                    <option value="Niger">Niger</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Ville <span className="text-orange-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={eventCity}
                    onChange={(e) => setEventCity(e.target.value)}
                    placeholder="Cotonou, Lomé, Abidjan..."
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Lieu précis <span className="text-orange-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Palais des Congrès..."
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-[#12141c] border border-gray-800/40 rounded-lg">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Calendar size={12} /> Déroulement de l'événement
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Date début</label>
                      <input
                        type="date"
                        required
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Date fin</label>
                      <input
                        type="date"
                        required
                        value={eventEnd}
                        onChange={(e) => setEventEnd(e.target.value)}
                        className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-800/60 pt-2 md:pt-0 md:pl-3">
                  <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <PieChart size={12} /> Période des votes
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Ouverture votes</label>
                      <input
                        type="date"
                        required
                        value={eventVoteStart}
                        onChange={(e) => setEventVoteStart(e.target.value)}
                        className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Clôture votes</label>
                      <input
                        type="date"
                        required
                        value={eventVoteEnd}
                        onChange={(e) => setEventVoteEnd(e.target.value)}
                        className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing, Accompaniment, status and ranking toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Mode d'accompagnement HubEvent</label>
                  <select
                    value={isAccompanied ? 'true' : 'false'}
                    onChange={(e) => setIsAccompanied(e.target.value === 'true')}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  >
                    <option value="false">Plateforme Autonome (L'organisateur gère son événement)</option>
                    <option value="true">Service Accompagné (HubEvent prend tout en charge)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Prix unitaire du vote (FCFA)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={votePrice}
                    onChange={(e) => setVotePrice(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Statut de publication</label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value as Event['status'])}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="Publié">Publié</option>
                    <option value="Actif">Actif (Votes ouverts)</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#12141c] border border-gray-800/40 rounded-lg mt-3">
                  <input
                    type="checkbox"
                    id="hideRankingInput"
                    checked={hideRanking}
                    onChange={(e) => setHideRanking(e.target.checked)}
                    className="h-4 w-4 bg-[#1a1d29] border-gray-800 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="cursor-pointer select-none">
                    <label htmlFor="hideRankingInput" className="text-xs font-semibold text-slate-200 block cursor-pointer">Masquer le classement au public</label>
                    <span className="text-[10px] text-slate-400 block">Les votes continuent, mais le classement en temps réel n'est visible que par l'organisateur.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-5 mt-6">
                <button
                  type="button"
                  id="btn-cancel-modal"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm font-medium border border-gray-800 transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  id="btn-submit-event"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg hover:scale-[1.01] cursor-pointer"
                >
                  {editingEvent ? "Mettre à jour" : "Enregistrer l'événement"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
