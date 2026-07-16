import { motion } from 'motion/react';
import {
  Smartphone, ShieldCheck, TrendingUp, Zap,
  Award, BarChart3, Mail, Headphones
} from 'lucide-react';
import CouvertureSection from './CouvertureSection';

const features = [
  { icon: Smartphone, title: 'Paiement Mobile Money', desc: 'MTN, Orange, Moov acceptes en toute securite' },
  { icon: ShieldCheck, title: 'Securite Renforcee', desc: 'Double verification par SMS OTP anti-fraude' },
  { icon: TrendingUp, title: 'Resultats Temps Reel', desc: 'Classement et votes mis a jour instantanement' },
  { icon: Zap, title: 'Vote Instantane', desc: 'Soutenez votre candidat en moins de 2 minutes' },
  { icon: Award, title: 'Commission 7%', desc: 'Tarif le plus competitif du marche africain' },
  { icon: BarChart3, title: 'Tableau de Bord', desc: 'Statistiques detaillees pour les organisateurs' },
];

export default function LandingFeatures() {
  return (
    <>
      {/* FEATURES SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pourquoi HubEvent ?
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            La plateforme tout-en-un pour vos concours et votes en Afrique
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="bg-[#1a1d29] border border-gray-800 hover:border-amber-500/20 rounded-xl p-5 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                <feat.icon size={20} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <CouvertureSection />

      {/* CONTACT */}
      <div className="bg-gradient-to-t from-amber-950/10 to-transparent py-16 border-t border-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Contactez-nous
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-amber-500" />
              <span>contact@hubevent.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones size={16} className="text-amber-500" />
              <span>Support disponible 7j/7</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Africa francophone
          </p>
        </div>
      </div>
    </>
  );
}