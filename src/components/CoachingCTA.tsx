import { motion } from 'motion/react';
import { Headphones, ArrowRight, CheckCircle, MessageSquare, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CoachingCTA() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-purple-950/20 to-slate-900/50 border border-purple-500/20 rounded-3xl p-8 sm:p-12"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-400 font-mono uppercase tracking-wider">
                Nouveau
              </span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider">
                Accompagnement Personnalise
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Vous voulez organiser un concours{' '}
              <span className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                sans vous prendre la tete ?
              </span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              L'equipe HubEvent s'occupe de tout : configuration, gestion des votes, 
              verification des comptes, communication et support. Vous suivez les 
              resultats en temps reel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Configuration complete de votre evenement',
                'Verification et validation des candidatures',
                'Support prioritaire 7j/7 par WhatsApp',
                'Rapports detailles et export PDF',
                'Paiement flexible apres evenement',
                'Consulting personnalise',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-purple-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-950/30"
            >
              Demander l'accompagnement <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-4 lg:pl-8">
            <div className="bg-[#1a1d29]/80 border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Nous contacter directement
              </h3>
              <div className="space-y-2">
                <a href="mailto:contact@hubevent.com"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-purple-400 transition-colors"
                >
                  <Mail size={16} className="text-purple-500 shrink-0" />
                  contact@hubevent.com
                </a>
                <a href="#"
                  className="flex items-center gap-2 text-sm text-slate-300 hover:text-purple-400 transition-colors"
                >
                  <MessageSquare size={16} className="text-purple-500 shrink-0" />
                  WhatsApp: +229 01 XX XX XX
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-[#1a1d29]/40 border border-gray-800/60 rounded-lg px-4 py-2">
              <Headphones size={14} className="text-purple-500" />
              Disponible au Benin, Togo, Cote d'Ivoire, Senegal, Burkina Faso
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
