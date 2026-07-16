import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, Award, Heart, Share2, Info, ChevronRight, 
  ChevronLeft, Phone, ShieldCheck, CheckCircle, Smartphone, 
  X, QrCode, Play, ExternalLink, Globe, Star, ArrowLeft, Loader2, Video
} from 'lucide-react';
import { motion } from 'motion/react';
import { Event, Category, Candidate, VotePack, Transaction } from '../types';
import { useBackend } from '../lib/backend';
import EventCountdown from './EventCountdown';
import LandingFeatures from './LandingFeatures';
import TrustedLogos from './TrustedLogos';
import BlogSection from './BlogSection';
import CoachingCTA from './CoachingCTA';
import WhatsAppButton from './WhatsAppButton';

interface PublicPortalProps {
  events: Event[];
  categories: Category[];
  candidates: Candidate[];
  votePacks: VotePack[];
  onRefresh: () => void;
}

export default function PublicPortal({ 
  events, categories, candidates, votePacks, onRefresh 
}: PublicPortalProps) {
  const { backend } = useBackend();

  // Navigation states
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Tous');

  // Checkout flows
  const [checkoutCandidate, setCheckoutCandidate] = useState<Candidate | null>(null);
  const [voteCount, setVoteCount] = useState(1);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [lastTxId, setLastTxId] = useState('');
  const paymentMethod = 'SebPay';

  // Anti-fraud SMS OTP verification states
  const [isVerifyingSMS, setIsVerifyingSMS] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [userEnteredOTP, setUserEnteredOTP] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [smsError, setSmsError] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isVerifyingSMS && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifyingSMS, otpTimer]);

  // Deep-linking URL parameter loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('event');
    const candidateIdParam = params.get('candidate');
    if (eventIdParam) {
      setSelectedEventId(eventIdParam);
    }
    if (candidateIdParam) {
      setSelectedCandidateId(candidateIdParam);
    }
  }, []);

  // QR Code display toggle
  const [showQrModal, setShowQrModal] = useState<string | null>(null); // Candidate ID

  // WhatsApp sharing style toggle
  const [whatsappMessageType, setWhatsappMessageType] = useState<'viral' | 'short'>('viral');

  // Alerts
  const [infoMsg, setInfoMsg] = useState('');

  const handleShowInfo = (msg: string) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(''), 4000);
  };

  // Filter events
  const filteredEvents = events.filter(evt => {
    if (evt.status === 'Brouillon') return false; // Hide drafts from public
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'Tous' || evt.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const activeEvent = events.find(e => e.id === selectedEventId);
  const activeCandidate = candidates.find(c => c.id === selectedCandidateId);

  // Helper status style
  const getEventBadge = (status: Event['status']) => {
    switch (status) {
      case 'Actif':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/20 flex items-center gap-1 w-fit animate-pulse">● Votes Ouverts</span>;
      case 'Publié':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">Annoncé</span>;
      case 'Terminé':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">Terminé</span>;
      case 'Annulé':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">Annulé</span>;
      default:
        return null;
    }
  };

  // Calculate prices for voting
  const getVotePrice = () => {
    if (!activeEvent) return 100;
    if (selectedPackId) {
      const pack = votePacks.find(p => p.id === selectedPackId);
      return pack ? pack.priceCFA : 100;
    }
    return voteCount * activeEvent.votePriceCFA;
  };

  const getVoteCountForTx = () => {
    if (selectedPackId) {
      const pack = votePacks.find(p => p.id === selectedPackId);
      return pack ? pack.votesCount : 1;
    }
    return voteCount;
  };

  const handleInitiateVote = (cand: Candidate, pack?: VotePack) => {
    setCheckoutCandidate(cand);
    setIsPaymentSuccess(false);
    setBuyerName('');
    setBuyerPhone('');
    setIsVerifyingSMS(false);
    setGeneratedOTP('');
    setUserEnteredOTP('');
    setOtpTimer(60);
    setSmsError('');
    
    if (pack) {
      setSelectedPackId(pack.id);
      setVoteCount(pack.votesCount);
    } else {
      setSelectedPackId(null);
      setVoteCount(1);
    }
  };

  const handleProcessCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCandidate || !activeEvent) return;
    if (!buyerName.trim() || !buyerPhone.trim()) {
      alert("Veuillez remplir vos informations de contact pour le reçu.");
      return;
    }

    setIsSendingSMS(true);
    setSmsError('');

    // Simulate SMS gateway API transmission (MTN / Orange / Moov Africa Gateway)
    setTimeout(() => {
      try {
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOTP(otpCode);
        setIsVerifyingSMS(true);
        setIsSendingSMS(false);
        setOtpTimer(60);
        setUserEnteredOTP('');
      } catch (err: any) {
        setIsSendingSMS(false);
        alert("Erreur lors de la tentative d'envoi du SMS OTP.");
      }
    }, 1200);
  };

  const handleVerifyAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCandidate || !activeEvent) return;
    if (userEnteredOTP !== generatedOTP) {
      setSmsError("Le code de validation (OTP) est incorrect ou a expiré. Veuillez saisir le code à 4 chiffres généré pour test.");
      return;
    }

    setSmsError('');
    setIsProcessingPayment(true);

    // Simulate SebPay Mobile Money transaction processing
    setTimeout(async () => {
      try {
        const finalVotes = getVoteCountForTx();
        const finalAmount = getVotePrice();
        const pack = selectedPackId ? votePacks.find(p => p.id === selectedPackId) : undefined;

        const tx = await backend.processVoteTransaction(
          activeEvent.id,
          checkoutCandidate.id,
          buyerName,
          buyerPhone,
          finalVotes,
          finalAmount,
          pack ? pack.name : undefined,
          paymentMethod
        );

        setLastTxId(tx.id);
        setIsProcessingPayment(false);
        setIsPaymentSuccess(true);
        setIsVerifyingSMS(false);
        onRefresh();
      } catch (err: any) {
        setIsProcessingPayment(false);
        setSmsError(err.message || "Une erreur s'est produite lors de la validation du vote.");
      }
    }, 2000);
  };

  return (
    <div className="w-full bg-[#12141c] text-slate-100 font-sans pb-16">
      
      {/* Toast Alert */}
      {infoMsg && (
        <div id="toast-message" className="fixed bottom-4 right-4 bg-[#1a1d29] border border-amber-500 text-amber-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <Info size={16} />
          <span className="text-sm">{infoMsg}</span>
        </div>
      )}

      {/* Hero / Header Showcase */}
      {!selectedEventId && (
        <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/20 via-transparent to-transparent py-16 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.06),transparent_50%)]"></div>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-500 font-mono uppercase tracking-wider">
                Propulser la Culture & les Talents Africains
              </span>
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-semibold text-blue-400 font-mono uppercase tracking-wider">
                5 pays
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Votez pour vos candidats <br />
              <span 
                className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
              >
                favoris en toute transparence
              </span>
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              HubEvent est la plateforme de reference pour l'organisation et le vote sécurisé de vos concours, festivals et awards preferes a travers l'Afrique.
            </p>

            {/* Country badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {['Benin', 'Togo', "Cote d'Ivoire", 'Senegal', 'Burkina Faso'].map((country) => (
                <span
                  key={country}
                  className="px-2.5 py-1 bg-[#1a1d29] border border-gray-800 rounded-lg text-[10px] font-medium text-slate-300"
                >
                  {country}
                </span>
              ))}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 max-w-2xl mx-auto">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un événement ou concours..."
                  className="w-full bg-[#1a1d29] border border-gray-800 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all placeholder:text-slate-500"
                />
              </div>

              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full sm:w-48 bg-[#1a1d29] border border-gray-800 rounded-xl px-4 py-3 text-sm text-slate-300 font-medium focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                <option value="Tous">Tous les pays</option>
                <option value="Bénin">Bénin</option>
                <option value="Togo">Togo</option>
                <option value="Côte d’Ivoire">Côte d’Ivoire</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Burkina Faso">Burkina Faso</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <LandingFeatures />

      {/* LANDING PAGE - LIST EVENTS */}
      {!selectedEventId && (<>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> Concours Actifs & Recommandés
            </h2>
            <span className="text-xs text-slate-500 font-mono">{filteredEvents.length} événements trouvés</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <div 
                key={evt.id} 
                id={`public-evt-card-${evt.id}`}
                onClick={() => setSelectedEventId(evt.id)}
                className="bg-[#1a1d29] border border-gray-800 hover:border-amber-500/30 rounded-2xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Poster graphic */}
                  <div className="relative h-44 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d29] to-transparent z-10"></div>
                    <img 
                      src={evt.posterUrl} 
                      alt={evt.name} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=500&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 z-20">
                      {getEventBadge(evt.status)}
                    </div>
                  </div>

                  {/* Information block */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <span className="flex items-center gap-0.5"><MapPin size={12} className="text-amber-500" /> {evt.city}, {evt.country}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Calendar size={12} /> {evt.startDate.split('-')[0]}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-all leading-snug">{evt.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{evt.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-gray-800/40 mt-3 flex items-center justify-between text-xs font-medium text-amber-500">
                  <span>En savoir plus & voter</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500">
                Aucun concours ne correspond à vos critères de recherche.
              </div>
            )}
          </div>
        </div>

        <TrustedLogos events={events} />
        <BlogSection />
        <CoachingCTA />
        </>)}

      {/* EVENT DETAILED PAGE */}
      {selectedEventId && activeEvent && !selectedCandidateId && (
        <div className="animate-fade-in">
          
          {/* Header Banner image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/50 to-transparent z-10"></div>
            <img 
              src={activeEvent.posterUrl} 
              alt={activeEvent.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80';
              }}
            />
            
            {/* Top Back Nav Button */}
            <button 
              onClick={() => setSelectedEventId(null)}
              className="absolute top-6 left-6 z-20 flex items-center gap-1.5 px-4 py-2 bg-slate-950/80 backdrop-blur-md hover:bg-slate-950 text-white rounded-full text-xs font-semibold cursor-pointer border border-gray-800 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Retour à la liste</span>
            </button>
          </div>

          {/* Event Content Hub */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-8">
            
            {/* Intro Meta card */}
            <div className="bg-[#1a1d29] border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="md:col-span-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {getEventBadge(activeEvent.status)}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#12141c] text-slate-300 border border-gray-800">
                    Tarif vote : {activeEvent.votePriceCFA} FCFA
                  </span>
                  <Link
                    to={`/results/${activeEvent.id}`}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                  >
                    Voir les resultats
                  </Link>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{activeEvent.name}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">{activeEvent.description}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1"><MapPin size={13} className="text-amber-500" /> {activeEvent.location}, {activeEvent.city}, {activeEvent.country}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar size={13} /> Votes ouverts jusqu'au {new Date(activeEvent.voteEndDate).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="pt-2">
                  <EventCountdown voteEndDate={activeEvent.voteEndDate} />
                </div>
              </div>

              {/* Event Logo representation */}
              <div className="flex justify-center md:justify-end shrink-0">
                <img 
                  src={activeEvent.logoUrl} 
                  alt={activeEvent.name} 
                  className="w-24 h-24 rounded-xl object-cover border-2 border-amber-500 bg-[#12141c]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&q=80';
                  }}
                />
              </div>
            </div>

            {/* Leaderboard display condition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Candidates Grid */}
              <div className="lg:col-span-2 space-y-6">
                
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono border-b border-gray-800 pb-2">
                  Candidats par Catégorie
                </h3>

                {categories.filter(cat => cat.eventId === activeEvent.id && cat.status === 'Actif').map(cat => {
                  const catCandidates = candidates.filter(cand => cand.categoryId === cat.id);
                  
                  return (
                    <div key={cat.id} className="space-y-4">
                      <div className="p-3 bg-gradient-to-r from-amber-950/20 to-transparent border-l-4 border-amber-500 pl-4">
                        <h4 className="text-base font-extrabold text-white">{cat.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {catCandidates.map(cand => (
                          <div 
                            key={cand.id} 
                            className="bg-[#1a1d29] border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden flex transition-all hover:scale-[1.01] group relative"
                          >
                            <img 
                              src={cand.photoUrl} 
                              alt={cand.name} 
                              onClick={() => setSelectedCandidateId(cand.id)}
                              className="w-24 sm:w-28 h-32 object-cover shrink-0 bg-[#12141c] cursor-pointer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80';
                              }}
                            />
                            <div className="p-4 flex flex-col justify-between w-full">
                              <div>
                                <h5 
                                  onClick={() => setSelectedCandidateId(cand.id)}
                                  className="text-sm font-black text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                                >
                                  {cand.name}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cand.community}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">{cand.presentation}</p>
                              </div>

                              <div className="flex items-center justify-between gap-2 border-t border-gray-800/60 pt-2.5 mt-2">
                                <span className="text-xs font-bold font-mono text-amber-500">
                                  {cand.votesCount.toLocaleString('fr-FR')} votes
                                </span>
                                
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const shareUrl = window.location.origin + window.location.pathname + `?event=${activeEvent.id}&candidate=${cand.id}`;
                                      navigator.clipboard.writeText(shareUrl);
                                      handleShowInfo(`Lien de vote pour ${cand.name} copié !`);
                                    }}
                                    className="p-1.5 bg-[#12141c] hover:bg-amber-500/10 hover:text-amber-500 border border-gray-800 rounded-lg text-slate-400 hover:border-amber-500/30 transition-all cursor-pointer"
                                    title="Copier le lien de partage direct"
                                  >
                                    <Share2 size={13} />
                                  </button>

                                  {activeEvent.status === 'Actif' ? (
                                    <button
                                      id={`btn-vote-now-${cand.id}`}
                                      onClick={() => handleInitiateVote(cand)}
                                      className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded text-xs font-semibold hover:brightness-110 transition-all cursor-pointer"
                                    >
                                      Voter
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-500">Votes clos</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {catCandidates.length === 0 && (
                          <p className="text-xs text-slate-500 italic p-4">Aucun candidat enregistré dans cette catégorie.</p>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Leaderboard or hidden state */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono border-b border-gray-800 pb-2">
                  Classement Général
                </h3>

                {activeEvent.hideRanking ? (
                  <div id="hidden-ranking-box" className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6 text-center space-y-3">
                    <Award size={36} className="mx-auto text-orange-500 animate-pulse" />
                    <h4 className="text-sm font-bold text-white">Classement Privé</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      L'organisateur de cet événement a choisi de masquer le classement en direct afin de préserver le suspense et garantir l'authenticité de la révélation finale lors de la grande cérémonie.
                    </p>
                    <span className="text-[10px] text-amber-500 font-mono bg-amber-500/10 px-2 py-1 rounded inline-block">Les votes restent ouverts !</span>
                  </div>
                ) : (
                  <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-4 space-y-3 overflow-hidden">
                    {candidates
                      .filter(c => c.eventId === activeEvent.id)
                      .sort((a, b) => b.votesCount - a.votesCount)
                      .map((cand, idx) => {
                        const eventVotesSum = candidates
                          .filter(c => c.eventId === activeEvent.id)
                          .reduce((sum, c) => sum + c.votesCount, 0);
                        const percent = eventVotesSum > 0 ? Math.round((cand.votesCount / eventVotesSum) * 100) : 0;

                        let rankStyle = "bg-slate-800 text-slate-400";
                        if (idx === 0) rankStyle = "bg-amber-500/20 text-amber-400 border border-amber-500/20";
                        else if (idx === 1) rankStyle = "bg-slate-400/25 text-slate-300";

                        return (
                          <motion.div 
                            key={cand.id} 
                            layout
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="flex items-center justify-between gap-2 p-2 bg-[#12141c]/40 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${rankStyle}`}>
                                {idx + 1}
                              </span>
                              <p className="text-xs font-bold text-slate-200 truncate">{cand.name}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold font-mono text-amber-500">{cand.votesCount} <span className="text-[9px] font-normal text-slate-500">v.</span></span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{percent}%</span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* CANDIDATE SPECIFIC PAGE */}
      {selectedEventId && activeEvent && selectedCandidateId && activeCandidate && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
          
          {/* Back button and countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button 
              id="btn-back-to-event"
              onClick={() => setSelectedCandidateId(null)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1a1d29] border border-gray-800 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all self-start"
            >
              <ArrowLeft size={14} />
              <span>Retour au concours</span>
            </button>
            <EventCountdown voteEndDate={activeEvent.voteEndDate} />
          </div>

          {/* Profile Card details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Portrait Image column */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#1a1d29] border border-gray-800 p-3 rounded-2xl">
                <img 
                  src={activeCandidate.photoUrl} 
                  alt={activeCandidate.name} 
                  className="w-full h-96 object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80';
                  }}
                />
              </div>

              {/* Vote CTA box */}
              {activeEvent.status === 'Actif' ? (
                <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-5 text-center space-y-3 shadow-lg">
                  <h4 className="text-xs font-bold font-mono text-amber-500 uppercase tracking-wider">SOUTENEZ CETTE CANDIDATURE</h4>
                  <p className="text-slate-300 text-xs">Aidez {activeCandidate.name} à remporter la compétition en votant maintenant.</p>
                  
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button
                      id="btn-vote-candidate-page-simple"
                      onClick={() => handleInitiateVote(activeCandidate)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold transition-all hover:brightness-110 shadow-md cursor-pointer"
                    >
                      Voter (À partir de {activeEvent.votePriceCFA} FCFA)
                    </button>
                    
                    {/* Fast packs suggestion */}
                    <div className="flex justify-center gap-1 text-[10px] text-slate-400">
                      <span>Paiement sécurisé par <strong>SebPay</strong></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-4 text-center text-slate-500 text-xs">
                  Les votes pour cet événement sont clos.
                </div>
              )}
            </div>

            {/* Candidate Info Columns */}
            <div className="md:col-span-7 space-y-6">
              
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {activeCandidate.community}
                </span>
                <h2 className="text-3xl font-black text-white mt-1.5 leading-snug">{activeCandidate.name}</h2>
                <p className="text-sm font-bold text-slate-400 mt-1">Candidat officiel au {activeEvent.name}</p>
                
                <div className="flex items-center gap-2 mt-3 font-mono text-sm">
                  <Heart className="text-red-500 fill-red-500" size={16} />
                  <span>Votes cumulés : <strong className="text-amber-500 font-black text-base">{activeCandidate.votesCount.toLocaleString('fr-FR')}</strong></span>
                </div>
              </div>

              {/* Bio & Presentation */}
              <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-6 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Biographie</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeCandidate.bio || "Aucune biographie disponible pour le moment."}</p>
                </div>

                <div className="space-y-1 border-t border-gray-800/60 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Slogan & Présentation</h4>
                  <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">"{activeCandidate.presentation || "Célébrer la grandeur de notre culture."}"</p>
                </div>
              </div>

              {/* Social project description */}
              <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-6 space-y-2">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Star size={14} /> Le Projet Solidaire Défendu
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeCandidate.project || "Le candidat s'engage à promouvoir l'émancipation sociale de sa communauté à travers des actions culturelles locales."}
                </p>
              </div>

              {/* Video Mock/Player */}
              {activeCandidate.videoUrl && (
                <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 border-b border-gray-800 flex items-center gap-1.5 bg-[#12141c]">
                    <Video size={16} className="text-red-500" />
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Vidéo de Présentation Officielle</h4>
                  </div>
                  <div className="relative aspect-video">
                    <iframe
                      src={activeCandidate.videoUrl}
                      title={`Vidéo de ${activeCandidate.name}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* QR Code and Sharing tools */}
              <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl shrink-0 cursor-pointer" onClick={() => setShowQrModal(activeCandidate.id)}>
                  {/* Visual QR Code Mock */}
                  <div className="p-1 border border-gray-200 rounded-lg">
                    <QrCode size={70} className="text-[#12141c]" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <QrCode size={14} className="text-amber-500" /> QR Code Officiel du Candidat
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Scannez ou téléchargez ce QR Code unique pour rediriger directement vos soutiens vers cette page de vote. Idéal pour vos affiches de campagne physique.
                  </p>
                  <button 
                    onClick={() => setShowQrModal(activeCandidate.id)}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center justify-center sm:justify-start gap-1 mt-1 cursor-pointer mx-auto sm:mx-0"
                  >
                    <span>Agrandir le QR Code</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>

              {/* Social Sharing & Viral WhatsApp Campaign Tool */}
              <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-5 space-y-4 shadow-md animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/60 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                      Partage Viral WhatsApp & Réseaux
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Maximisez les chances de victoire de <strong>{activeCandidate.name}</strong> en mobilisant vos groupes.
                    </p>
                  </div>
                </div>

                {/* WhatsApp Message Template Configurator */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Modèle de message pré-rédigé :</span>
                    <div className="flex bg-[#12141c] p-1 rounded-lg border border-gray-800 gap-1">
                      {(['viral', 'short'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setWhatsappMessageType(style)}
                          className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer uppercase tracking-wider transition-all ${
                            whatsappMessageType === style
                              ? 'bg-[#25D366] text-slate-950 font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {style === 'viral' ? 'Complet & Viral' : 'Court & Direct'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const shareUrl = window.location.origin + window.location.pathname + `?event=${activeEvent.id}&candidate=${activeCandidate.id}`;
                    
                    const viralText = `🌟 *Soutien à la Candidature de ${activeCandidate.name} !* 🌟\n\nJe viens de soutenir *${activeCandidate.name}* (${activeCandidate.community}) au grand concours *"${activeEvent.name}"* ! 🏆✨\n\nChaque voix compte pour faire la différence et mener notre candidat à la victoire. Rejoignez la dynamique et apportez votre force en votant dès maintenant en moins de 2 minutes !\n\n👉 *Votez ici :* ${shareUrl}\n\nPaiement sécurisé par SebPay (Orange Money, MTN, Moov, Wave, Airtel, M-Pesa, etc.). Partagez ce message dans vos groupes ! 🔥⚡`;
                    
                    const shortText = `🚀 Soutenez la candidature de *${activeCandidate.name}* au concours *"${activeEvent.name}"* !\nVotez directement en ligne ici en moins d'une minute via SebPay :\n👉 ${shareUrl}\n\nMerci pour votre force ! 💪🔥`;
                    
                    const activeText = whatsappMessageType === 'viral' ? viralText : shortText;

                    return (
                      <div className="space-y-3">
                        {/* WhatsApp Bubble Mockup */}
                        <div className="bg-[#0b141a] border border-[#25D366]/20 rounded-2xl p-4 relative overflow-hidden shadow-inner">
                          {/* Chat header banner mimicking WhatsApp */}
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2.5">
                            <div className="w-5 h-5 rounded-full bg-[#128C7E] flex items-center justify-center text-[9px] font-black text-white">
                              H
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-200">HubEvent Broadcast</p>
                              <p className="text-[8px] text-[#25D366]">En ligne</p>
                            </div>
                          </div>

                          {/* Chat Bubble */}
                          <div className="bg-[#202c33] text-slate-100 rounded-xl rounded-tl-none p-3 text-xs font-sans max-w-[90%] space-y-1 relative border border-slate-700/50 shadow">
                            <span className="text-amber-400 font-bold block text-[10px] uppercase font-mono tracking-wider">Aperçu du SMS / Message WhatsApp</span>
                            <p className="whitespace-pre-line text-slate-300 font-sans leading-relaxed text-[11px]">
                              {activeText}
                            </p>
                            <div className="text-[9px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                              <span>13:45</span>
                              <span className="text-[#53bdeb]">✓✓</span>
                            </div>
                          </div>

                          {/* Decorative overlay background pattern */}
                          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                            <Share2 size={120} />
                          </div>
                        </div>

                        {/* Custom Actions block for Viral campaign */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-black transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-md shadow-emerald-950/20"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.18 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.09-2.885-6.948C16.512 2.016 14.04 1.01 11.417 1.01c-5.44 0-9.866 4.372-9.87 9.802 0 1.725.485 3.41 1.402 4.888L1.94 21.053l5.586-1.46c-.84-.5-1.58-1.2-1.88-2.44z" />
                            </svg>
                            <span>Partager directement sur WhatsApp</span>
                          </a>

                          <div className="grid grid-cols-3 gap-2">
                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-3 px-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] dark:text-[#4f95f7] border border-[#1877F2]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              title="Partager sur Facebook"
                            >
                              <span>Facebook</span>
                            </a>

                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                `Soutenez la candidature de ${activeCandidate.name} au concours "${activeEvent.name}" ! Rejoignez-nous et votez ici :`
                              )}&url=${encodeURIComponent(shareUrl)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-800 hover:bg-slate-700 text-white border border-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              title="Partager sur Twitter / X"
                            >
                              <span>Twitter</span>
                            </a>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                handleShowInfo("Lien de vote direct copié avec succès !");
                              }}
                              className="flex items-center justify-center gap-1.5 py-3 px-2 bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              title="Copier le lien"
                            >
                              <span>Copier</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>

          </div>

          {/* VOTE PACKS DISCOVERY CAROUSEL */}
          {activeEvent.status === 'Actif' && votePacks.filter(p => p.eventId === activeEvent.id).length > 0 && (
            <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                🚀 Offres de Soutien Groupé — Packs de Votes
              </h3>
              <p className="text-xs text-slate-400">Choisissez un pack de votes pour maximiser l'impact de votre soutien et bénéficier de réductions importantes.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {votePacks.filter(p => p.eventId === activeEvent.id).map(pack => {
                  const percentOff = pack.discountPercent || Math.round((1 - (pack.priceCFA / (pack.votesCount * activeEvent.votePriceCFA))) * 100);
                  
                  return (
                    <div key={pack.id} className="bg-[#12141c] border border-gray-800 p-4 rounded-xl flex flex-col justify-between hover:border-amber-500/30 transition-all group">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{pack.name}</span>
                          {percentOff > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[9px] font-bold">-{percentOff}%</span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-white mt-1 font-mono">{pack.votesCount} votes</p>
                        <p className="text-base font-extrabold text-amber-500 font-mono">{pack.priceCFA.toLocaleString('fr-FR')} FCFA</p>
                      </div>

                      <button
                        id={`btn-buy-pack-${pack.id}`}
                        onClick={() => handleInitiateVote(activeCandidate, pack)}
                        className="w-full mt-4 py-2 bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        Acheter ce pack
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* QR CODE MODAL POPUP */}
      {showQrModal && (
        <div id="qr-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xs w-full overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-up">
            <div className="flex justify-between items-center text-slate-800">
              <span className="text-xs font-bold font-mono">HubEvent Scan</span>
              <button 
                onClick={() => setShowQrModal(null)}
                className="p-1 hover:bg-gray-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 font-semibold">{candidates.find(c => c.id === showQrModal)?.name}</p>
            
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-center">
              {/* Giant QR code mock */}
              <div className="border border-slate-300 p-2.5 bg-white rounded-xl">
                <QrCode size={180} className="text-[#12141c]" />
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Imprimez ce QR Code sur vos flyers physiques de campagne. Vos fans voteront directement en 1 clic en le scannant.
            </p>

            <button 
              onClick={() => {
                handleShowInfo("Téléchargement du QR Code simulé !");
                setShowQrModal(null);
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-xs font-semibold hover:brightness-110 transition-all cursor-pointer"
            >
              Télécharger l'image PNG
            </button>
          </div>
        </div>
      )}

      {/* VOTE CHECKOUT DRAWER / MODAL SIMULATOR */}
      {checkoutCandidate && activeEvent && (
        <div id="checkout-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            
            {/* Header */}
            <div className="bg-[#12141c] p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Passerelle de vote sécurisée</h3>
              </div>
              <button 
                onClick={() => setCheckoutCandidate(null)}
                className="text-gray-400 hover:text-white bg-slate-800/40 p-1.5 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Form / Receipt representation */}
            {!isPaymentSuccess ? (
              isVerifyingSMS ? (
                <form onSubmit={handleVerifyAndPay} className="p-5 space-y-4">
                  {/* Candidate mini card receipt */}
                  <div className="flex items-center gap-3 p-3 bg-[#12141c]/40 border border-gray-800 rounded-xl">
                    <img 
                      src={checkoutCandidate.photoUrl} 
                      alt={checkoutCandidate.name} 
                      className="w-10 h-12 object-cover rounded-lg border border-gray-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80';
                      }}
                    />
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono block">SOUTIEN DIRECT</span>
                      <h4 className="text-xs font-bold text-white">{checkoutCandidate.name}</h4>
                      <span className="text-[10px] text-slate-400 block">{activeEvent.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center py-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-1">
                      <ShieldCheck size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-white">Validation anti-fraude requise</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      Un code de validation SMS à usage unique (OTP) a été envoyé au numéro suivant pour certifier votre vote :
                    </p>
                    <p className="text-sm font-black text-amber-500 font-mono mt-1">{buyerPhone}</p>
                  </div>

                  {/* Simulated SMS Box */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Simulateur Réseau SMS (Bac à sable)
                      </span>
                      <span>Instant Présent</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      HubEvent OTP : Votre code de sécurité de vote est <strong className="text-amber-500 text-sm bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 tracking-widest">{generatedOTP}</strong>. Ne le partagez jamais.
                    </p>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Note de test : En production, ce SMS est réellement envoyé sur le téléphone du votant via notre gateway SMS africaine (MTN, Orange, Moov, Wave, SebPay).
                    </p>
                  </div>

                  {/* OTP Code Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">Saisir le code de validation reçu (4 chiffres)</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={userEnteredOTP}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setUserEnteredOTP(val);
                      }}
                      placeholder="••••"
                      className="w-full bg-[#12141c] border border-gray-800 rounded-xl py-3 text-center text-xl font-bold font-mono tracking-[0.75em] text-amber-500 focus:outline-none"
                    />
                  </div>

                  {smsError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                      {smsError}
                    </div>
                  )}

                  {/* Countdown timer & resend */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>
                      {otpTimer > 0 ? (
                        <span>Renvoyer le code dans <strong className="text-amber-500">{otpTimer}s</strong></span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                            setGeneratedOTP(newCode);
                            setOtpTimer(60);
                            setSmsError('');
                            handleShowInfo("Un nouveau code de validation a été envoyé par SMS.");
                          }}
                          className="text-amber-500 hover:underline font-bold cursor-pointer animate-pulse"
                        >
                          Renvoyer le code OTP
                        </button>
                      )}
                    </span>
                    <span>API-v2: SECURE_VOTE</span>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="submit"
                    id="btn-verify-otp-submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Vérification & Paiement en cours...</span>
                      </>
                    ) : (
                      <span>Vérifier & Payer {getVotePrice().toLocaleString('fr-FR')} FCFA</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyingSMS(false);
                      setSmsError('');
                      setUserEnteredOTP('');
                    }}
                    className="w-full py-2 bg-slate-800/40 hover:bg-slate-800/80 text-slate-400 hover:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Retour / Modifier mes informations
                  </button>
                </form>
              ) : (
                <form onSubmit={handleProcessCheckout} className="p-5 space-y-4">
                  
                  {/* Candidate mini card receipt */}
                  <div className="flex items-center gap-3 p-3 bg-[#12141c] border border-gray-800/40 rounded-xl">
                    <img 
                      src={checkoutCandidate.photoUrl} 
                      alt={checkoutCandidate.name} 
                      className="w-10 h-12 object-cover rounded-lg border border-gray-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80';
                      }}
                    />
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono block">SOUTIEN DIRECT</span>
                      <h4 className="text-xs font-bold text-white">{checkoutCandidate.name}</h4>
                      <span className="text-[10px] text-slate-400 block">{activeEvent.name}</span>
                    </div>
                  </div>

                  {/* Vote volume configurations if not buying fixed pack */}
                  {!selectedPackId ? (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 flex justify-between">
                        <span>Quantité de votes</span>
                        <strong className="text-amber-500 font-mono">{voteCount * activeEvent.votePriceCFA} FCFA</strong>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          id="btn-decrement-vote"
                          onClick={() => setVoteCount(Math.max(1, voteCount - 1))}
                          className="w-10 h-10 rounded-lg bg-[#12141c] border border-gray-800 flex items-center justify-center text-slate-300 font-bold hover:bg-slate-800 cursor-pointer text-lg"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={voteCount}
                          onChange={(e) => setVoteCount(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-[#12141c] border border-gray-800 rounded-lg py-2.5 text-center text-sm font-mono text-slate-200 focus:outline-none"
                        />
                        <button
                          type="button"
                          id="btn-increment-vote"
                          onClick={() => setVoteCount(voteCount + 1)}
                          className="w-10 h-10 rounded-lg bg-[#12141c] border border-gray-800 flex items-center justify-center text-slate-300 font-bold hover:bg-slate-800 cursor-pointer text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#12141c] border border-gray-800 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400">Pack sélectionné</p>
                        <p className="text-sm font-bold text-white">{votePacks.find(p => p.id === selectedPackId)?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-amber-500 font-mono">{getVotePrice().toLocaleString('fr-FR')} FCFA</p>
                        <p className="text-[10px] text-slate-400 font-mono">{getVoteCountForTx()} votes inclus</p>
                      </div>
                    </div>
                  )}

                  {/* Secure info verification for tracking & anti-fraud */}
                  <div className="space-y-3 p-3.5 bg-gray-900/40 border border-gray-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">✍️ INFORMATIONS DE SÉCURITÉ DU VOTANT</span>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold block">Votre nom complet</label>
                        <input
                          type="text"
                          required
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="ex: Yao KOFFI"
                          className="w-full bg-[#12141c] border border-gray-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold block">Téléphone Mobile (WhatsApp / Reçu)</label>
                        <input
                          type="tel"
                          required
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          placeholder="ex: +229 97 00 00 00"
                          className="w-full bg-[#12141c] border border-gray-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method - SebPay */}
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe size={20} className="text-amber-500" />
                      <div>
                        <p className="text-sm font-bold text-white">SebPay</p>
                        <p className="text-[10px] text-slate-400">
                          Orange Money, MTN, Moov, Wave, Airtel, M-Pesa, T-Money, Vodacom...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security trace notification */}
                  <div className="flex items-start gap-2 text-[10px] text-slate-400">
                    <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={13} />
                    <span>Votre transaction est certifiée. 7% de commission applicables au maintien de la plateforme technique HubEvent.</span>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    type="submit"
                    id="btn-process-checkout-payment"
                    disabled={isSendingSMS}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-sm font-extrabold transition-all shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingSMS ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Envoi du code de validation SMS...</span>
                      </>
                    ) : (
                      <span>Valider mon numéro & Payer {getVotePrice().toLocaleString('fr-FR')} FCFA</span>
                    )}
                  </button>

                </form>
              )
            ) : (
              // Receipt Payment Success Screen
              <div className="p-6 text-center space-y-4 animate-scale-up">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} />
                </div>
                
                <div>
                  <h3 className="text-base font-black text-white">Vote Enregistré avec Succès !</h3>
                  <p className="text-xs text-slate-400 mt-1">Merci pour votre soutien. Les votes ont été comptabilisés en direct sur le leaderboard.</p>
                </div>

                <div className="bg-[#12141c] p-4 rounded-xl text-left text-xs font-mono space-y-2 border border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID TRANSACTION:</span>
                    <span className="text-slate-300 font-bold">{lastTxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DESTINATAIRE:</span>
                    <span className="text-slate-300">{checkoutCandidate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">VOTES COMPTABILISÉS:</span>
                    <span className="text-amber-500 font-bold">+{getVoteCountForTx()} votes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MONTANT PAYÉ:</span>
                    <span className="text-green-400 font-bold">{getVotePrice().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ACHETEUR:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{buyerName} ({buyerPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MÉTHODE:</span>
                    <span className="text-slate-300">{paymentMethod}</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-close-receipt"
                  onClick={() => {
                    setCheckoutCandidate(null);
                    setIsPaymentSuccess(false);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Fermer le reçu de paiement
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
}
