import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Calendar, Tag, UserPlus, Trophy, ArrowRight, ArrowLeft, 
  Check, HelpCircle, AlertCircle, Info, Flame, MapPin, DollarSign, Image,
  ClipboardCheck, BarChart4, Upload
} from 'lucide-react';
import { Event, Category, Candidate, VotePack } from '../types';
import { useBackend } from '../lib/backend';
import GainSimulator from './GainSimulator';

interface OrganizerOnboardingProps {
  organizerId: string;
  organizerName: string;
  onComplete: (newEventId: string) => void;
  onClose: () => void;
}

export default function OrganizerOnboarding({ 
  organizerId, organizerName, onComplete, onClose 
}: OrganizerOnboardingProps) {
  const { backend } = useBackend();
  const [step, setStep] = useState(1);
  
  // Step 1: Event Form States
  const [evtName, setEvtName] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtCountry, setEvtCountry] = useState('Bénin');
  const [evtCity, setEvtCity] = useState('Cotonou');
  const [evtVotePrice, setEvtVotePrice] = useState(150);
  const [evtEndDate, setEvtEndDate] = useState('2026-10-31');
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);

  // Step 2: Category Form States
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [createdCategory, setCreatedCategory] = useState<Category | null>(null);

  // Step 3: Candidate Form States
  const [candName, setCandName] = useState('');
  const [candCommunity, setCandCommunity] = useState('');
  const [candProject, setCandProject] = useState('');
  const [candPhotoPreview, setCandPhotoPreview] = useState('');
  const [createdCandidate, setCreatedCandidate] = useState<Candidate | null>(null);

  const handleOnboardPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCandPhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Errors / validation
  const [error, setError] = useState('');

  // Handle Event Creation
  const handleCreateEvent = async () => {
    if (!evtName.trim()) {
      setError('Le nom de l\'événement est obligatoire.');
      return;
    }
    setError('');

    try {
      const newEvent = await backend.createEvent({
        name: evtName,
        logoUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80',
        posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
        description: evtDesc || `Événement culturel organisé par ${organizerName}`,
        country: evtCountry,
        city: evtCity,
        location: `${evtCity}, ${evtCountry}`,
        startDate: '2026-07-16',
        endDate: evtEndDate,
        voteStartDate: '2026-07-16',
        voteEndDate: evtEndDate,
        status: 'Actif',
        isAccompanied: false,
        organizerId: organizerId,
        organizerName: organizerName,
        hideRanking: false,
        votePriceCFA: Number(evtVotePrice) || 100,
      });

      setCreatedEvent(newEvent);

      // Auto-generer 3 packs de vote par defaut
      const basePrice = Number(evtVotePrice) || 100;
      const autoPacks: Omit<VotePack, 'id'>[] = [
        { eventId: newEvent.id, name: 'Pack Bronze', votesCount: 5, priceCFA: basePrice * 4, discountPercent: 20 },
        { eventId: newEvent.id, name: 'Pack Silver', votesCount: 10, priceCFA: basePrice * 7, discountPercent: 30 },
        { eventId: newEvent.id, name: 'Pack Gold', votesCount: 25, priceCFA: basePrice * 15, discountPercent: 40 },
      ];
      for (const pack of autoPacks) {
        await backend.createVotePack(pack);
      }

      setStep(2);
    } catch (err) {
      setError("Erreur lors de la création de l'événement.");
    }
  };

  // Handle Category Creation
  const handleCreateCategory = async () => {
    if (!createdEvent) return;
    if (!catName.trim()) {
      setError('Le nom de la catégorie est obligatoire.');
      return;
    }
    setError('');

    try {
      const newCategory = await backend.createCategory({
        eventId: createdEvent.id,
        name: catName,
        description: catDesc || `Catégorie officielle pour ${createdEvent.name}`,
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80',
        voteType: 'both',
        maxCandidates: 15,
        status: 'Actif',
      });

      setCreatedCategory(newCategory);
      setStep(3);
    } catch (err) {
      setError("Erreur lors de la création de la catégorie.");
    }
  };

  // Handle Candidate Creation
  const handleCreateCandidate = async () => {
    if (!createdEvent || !createdCategory) return;
    if (!candName.trim()) {
      setError('Le nom du candidat est obligatoire.');
      return;
    }
    setError('');

    try {
      const newCandidate = await backend.createCandidate({
        categoryId: createdCategory.id,
        eventId: createdEvent.id,
        name: candName,
        photoUrl: candPhotoPreview || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&q=80',
        gallery: [],
        videoUrl: '',
        bio: `Je suis ravi de participer à ${createdEvent.name} dans la catégorie ${createdCategory.name}.`,
        presentation: candProject || 'Projet à défendre pour l\'Afrique.',
        community: candCommunity || evtCountry,
        project: candProject || 'Innovation culturelle et solidarité.',
        socialLinks: {},
        votesCount: 0,
      });

      setCreatedCandidate(newCandidate);
      setStep(4);
    } catch (err) {
      setError("Erreur lors de la création du candidat.");
    }
  };

  // Skip Step 3 (Candidat)
  const handleSkipCandidate = () => {
    setError('');
    setStep(4);
  };

  // Complete Onboarding
  const handleFinish = () => {
    if (createdEvent) {
      // Mark onboarding completed in localStorage for this organizer
      localStorage.setItem(`hubevent_onboarding_completed_${organizerId}`, 'true');
      onComplete(createdEvent.id);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#171923] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8 text-slate-100"
      >
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header step progress */}
        <div className="flex items-center justify-between gap-2 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Assistant de Configuration</h2>
              <p className="text-[10px] text-slate-400 font-medium">Configurez votre scrutin en 4 étapes simples</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black font-mono transition-all duration-300 ${
                  step === s 
                    ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/20' 
                    : step > s 
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-500' 
                      : 'bg-gray-800 text-slate-500'
                }`}
              >
                {step > s ? <Check size={8} strokeWidth={4} /> : s}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP CONTENT */}
        <div className="py-6 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Create Event */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Calendar className="text-amber-500" size={16} />
                    Étape 1 : Créer votre premier événement
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Saisissez les informations de base de votre festival, concours d'artistes, ou événement d'awards pour lancer la plateforme.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Nom de l'événement *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Bénin Music Awards 2026, Miss Togo..."
                      value={evtName}
                      onChange={(e) => setEvtName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Description de l'événement</label>
                    <textarea 
                      placeholder="Décrivez les objectifs ou le cadre de votre événement..."
                      rows={2}
                      value={evtDesc}
                      onChange={(e) => setEvtDesc(e.target.value)}
                      className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Pays de l'événement</label>
                      <input 
                        type="text" 
                        value={evtCountry}
                        onChange={(e) => setEvtCountry(e.target.value)}
                        className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Ville</label>
                      <input 
                        type="text" 
                        value={evtCity}
                        onChange={(e) => setEvtCity(e.target.value)}
                        className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Prix par vote (FCFA)</label>
                      <input 
                        type="number" 
                        value={evtVotePrice}
                        onChange={(e) => setEvtVotePrice(Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Date de fermeture</label>
                      <input 
                        type="date" 
                        value={evtEndDate}
                        onChange={(e) => setEvtEndDate(e.target.value)}
                        className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-mono font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleCreateEvent}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Créer l'Événement</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Create Category */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase font-mono tracking-wider">Événement créé avec succès !</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Tag className="text-amber-500" size={16} />
                    Étape 2 : Configurer votre première catégorie
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Les catégories servent à regrouper les candidats qui s'affrontent pour un prix spécifique.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Nom de la catégorie *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Meilleur Artiste Masculin, Catégorie Danse..."
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Description de la catégorie</label>
                    <textarea 
                      placeholder="Indiquez les critères d'éligibilité ou les détails de cette division..."
                      rows={3}
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/40 border border-gray-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                    <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>Par défaut, les votes simples et les packs de vote seront tous les deux activés pour permettre un maximum de flexibilité à votre public.</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleCreateCategory}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Enregistrer la Catégorie</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Create Candidate */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase font-mono tracking-wider">Catégorie ajoutée !</span>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <UserPlus className="text-amber-500" size={16} />
                    Étape 3 : Ajouter un premier candidat (Optionnel)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Créez le profil d'un candidat pour tester le scrutin en direct. Vous pourrez en ajouter d'autres plus tard.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Nom du candidat *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Koffi DJ, Saliou Diallo..."
                      value={candName}
                      onChange={(e) => setCandName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Photo du candidat</label>
                    <div className="flex items-center gap-3">
                      {candPhotoPreview && (
                        <img src={candPhotoPreview} alt="" className="w-12 h-14 rounded-lg object-cover border border-gray-800" />
                      )}
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900/50 border border-dashed border-gray-700 rounded-xl text-xs text-slate-400 hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-pointer">
                        <Upload size={14} />
                        <span>{candPhotoPreview ? 'Changer la photo' : 'Uploader une photo'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleOnboardPhotoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Communauté représentée</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Bénin, Togo, Diaspora..."
                        value={candCommunity}
                        onChange={(e) => setCandCommunity(e.target.value)}
                        className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Catégorie cible</label>
                      <div className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-bold font-mono">
                        {createdCategory?.name}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 font-mono tracking-wider">Projet défendu / Slogan</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Promouvoir le rap africain authentique..."
                      value={candProject}
                      onChange={(e) => setCandProject(e.target.value)}
                      className="w-full bg-slate-900/50 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={handleSkipCandidate}
                    className="text-xs text-slate-400 hover:text-white font-semibold transition-all cursor-pointer"
                  >
                    Passer cette étape
                  </button>

                  <button
                    onClick={handleCreateCandidate}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Créer le Candidat</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Recap Checklist & Simulateur */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2 py-4">
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-bounce">
                    <Trophy size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white">Votre scrutin est pret !</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Felicitations, vous venez de configurer votre evenement sur HubEvent Africa.
                  </p>
                </div>

                {/* Checklist */}
                <div className="bg-[#12141c]/50 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                    <ClipboardCheck size={14} className="text-amber-500" /> Etapes completes
                  </p>
                  <div className="flex items-center gap-2 text-green-400">
                    <Check size={14} />
                    <span>Evenement cree : <strong className="text-slate-200">{evtName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <Check size={14} />
                    <span>Categorie ajoutee : <strong className="text-slate-200">{catName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <Check size={14} />
                    <span>Candidat ajoute : <strong className="text-slate-200">{candName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <HelpCircle size={14} />
                    <span>Packs de vote a configurer dans le tableau de bord</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <HelpCircle size={14} />
                    <span>Lien public a partager aux candidats</span>
                  </div>
                </div>

                {/* Simulateur de gains */}
                <div className="bg-[#12141c]/50 border border-gray-800 rounded-2xl p-4">
                  <p className="font-bold text-slate-300 text-xs flex items-center gap-1.5 mb-3">
                    <BarChart4 size={14} className="text-amber-500" /> Simulation de gains
                  </p>
                  <GainSimulator basePrice={Number(evtVotePrice)} compact />
                </div>

                {/* Prochaines etapes */}
                <div className="bg-[#12141c]/50 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs">
                  <p className="font-bold text-slate-300">Prochaines etapes :</p>
                  <div className="flex gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="leading-relaxed">
                      Ajouter des packs de vote pour proposer des remises dans votre tableau de bord.
                    </p>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="leading-relaxed">
                      Partager le lien public aux candidats pour qu'ils invitent leurs communautes a voter.
                    </p>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <p className="leading-relaxed">
                      Suivre la collecte en temps reel et generer des rapports.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-950/20 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <span>Lancer mon Tableau de Bord</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Info footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-gray-800 pt-4 font-mono font-medium">
          <span>Plateforme sécurisée certifiée HubEvent</span>
          <span>Bénin • Togo • Côte d'Ivoire</span>
        </div>
      </motion.div>
    </div>
  );
}
