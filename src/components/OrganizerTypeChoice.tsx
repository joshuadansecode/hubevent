import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Headphones, ArrowRight, CheckCircle, Mail, Phone, MessageSquare, Send, Eye, X } from 'lucide-react';
import { useBackend } from '../lib/backend';

interface OrganizerTypeChoiceProps {
  user: { id: string; email: string; name: string };
  onComplete: (role: 'organizer' | 'observer') => void;
  onClose?: () => void;
}

export default function OrganizerTypeChoice({ user, onComplete, onClose }: OrganizerTypeChoiceProps) {
  const { backend } = useBackend();
  const [step, setStep] = useState<'choice' | 'accompanied-form' | 'submitted'>('choice');
  const [form, setForm] = useState({ phone: '', eventName: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSelfManage = () => onComplete('organizer');

  const handleAccompaniedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim() || !form.eventName.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await backend.initiateTransaction({
        eventId: 'accompanied-request',
        candidateId: user.id,
        buyerName: user.name,
        buyerPhone: form.phone,
        votesCount: 1,
        amountCFA: 0,
        packName: `Demande accompagnement: ${form.eventName}`,
        paymentMethod: 'SebPay',
      });
      setStep('submitted');
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a1d29] border border-gray-800 rounded-2xl max-w-lg w-full overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'choice' && (
            <motion.div key="choice" exit={{ opacity: 0 }} className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Bienvenue, {user.name} !</h2>
                {onClose && (
                  <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-400">
                Comment souhaitez-vous gérer votre concours sur HubEvent ?
              </p>

              <button onClick={handleSelfManage}
                className="w-full text-left p-5 bg-[#0f111a] border border-gray-800 hover:border-amber-500/40 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <UserCheck size={24} className="text-amber-500" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      Je gère moi-même
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">Autonome</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Vous créez et gérez vos événements, catégories et candidats en toute autonomie. 
                      HubEvent prend 7% de commission sur chaque vote. Idéal si vous avez déjà une équipe.
                    </p>
                    <ul className="pt-2 space-y-1">
                      {['Création illimitée d\'événements', 'Tableau de bord complet', 'Paiements Mobile Money intégrés', 'Rapports PDF et export CSV', 'Commission 7% seulement'].map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CheckCircle size={12} className="text-green-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:gap-2 transition-all">
                  Choisir <ArrowRight size={14} />
                </div>
              </button>

              <button onClick={() => setStep('accompanied-form')}
                className="w-full text-left p-5 bg-[#0f111a] border border-gray-800 hover:border-purple-500/40 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Headphones size={24} className="text-purple-500" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      Je veux être accompagné
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">Accompagné</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      L'équipe HubEvent s'occupe de tout : configuration, gestion des votes, 
                      communication. Vous suivez les résultats en temps réel. Idéal si vous voulez 
                      vous concentrer sur votre événement.
                    </p>
                    <ul className="pt-2 space-y-1">
                      {['Prise en charge complète', 'Consulting personnalisé', 'Support prioritaire 7j/7', 'Rapports détaillés', 'Paiement flexible'].map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CheckCircle size={12} className="text-purple-500 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-500 group-hover:gap-2 transition-all">
                  En savoir plus <ArrowRight size={14} />
                </div>
              </button>

              <p className="text-[10px] text-slate-600 text-center">
                Vous pouvez changer d'option plus tard. Les événements déjà créés restent accessibles.
              </p>
            </motion.div>
          )}

          {step === 'accompanied-form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Demande d'accompagnement</h2>
                <button onClick={() => setStep('choice')} className="text-slate-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-400">
                Décrivez-nous votre projet. L'équipe HubEvent vous contactera sous 48h pour discuter des modalités.
              </p>

              <form onSubmit={handleAccompaniedSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Votre nom</label>
                  <input type="text" value={user.name} disabled
                    className="w-full bg-[#0f111a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input type="email" value={user.email} disabled
                    className="w-full bg-[#0f111a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Téléphone <span className="text-red-400">*</span>
                  </label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+229 XX XX XX XX"
                    className="w-full bg-[#0f111a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-600 placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Nom de votre événement <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={form.eventName} onChange={e => setForm({ ...form, eventName: e.target.value })}
                    placeholder="Ex: Miss Bénin 2026"
                    className="w-full bg-[#0f111a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-600 placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Message (optionnel)</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={3} placeholder="Parlez-nous de votre projet, vos besoins spécifiques..."
                    className="w-full bg-[#0f111a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-600 placeholder:text-slate-600 resize-none" />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button type="submit" disabled={sending}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
                >
                  {sending ? 'Envoi en cours...' : <><Send size={16} /> Envoyer ma demande</>}
                </button>
              </form>

              <p className="text-[10px] text-slate-600 text-center">
                En envoyant ce formulaire, vous acceptez d'être contacté par l'équipe HubEvent.
              </p>
            </motion.div>
          )}

          {step === 'submitted' && (
            <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-purple-500" />
              </div>
              <h2 className="text-lg font-bold text-white">Demande envoyée !</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Merci {user.name} ! L'équipe HubEvent examinera votre demande et vous contactera 
                sur <strong className="text-white">{form.phone}</strong> dans les 48 heures.
              </p>
              <div className="bg-[#0f111a] border border-gray-800 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Mail size={14} className="text-purple-500" /> contact@hubevent.com
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <MessageSquare size={14} className="text-purple-500" /> WhatsApp: +229 01 XX XX XX XX
                </p>
              </div>
              <p className="text-xs text-slate-500">
                En attendant, vous pouvez explorer la plateforme en mode observateur.
              </p>
              <button onClick={() => onComplete('observer')}
                className="w-full py-3 bg-purple-600/20 border border-purple-600/30 hover:bg-purple-600/30 rounded-xl text-sm font-medium text-purple-400 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Explorer en mode observateur
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}