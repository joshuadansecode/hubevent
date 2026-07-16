import { motion } from 'motion/react';
import { Event } from '../types';

interface TrustedLogosProps {
  events: Event[];
}

export default function TrustedLogos({ events }: TrustedLogosProps) {
  const withLogos = events.filter(e => e.logoUrl && e.logoUrl.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ils nous font confiance
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Organisateurs et evenements qui utilisent HubEvent
        </p>
      </div>

      {withLogos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
          {withLogos.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-[#1a1d29] border border-gray-800 rounded-xl p-4 flex items-center justify-center h-24 group hover:border-amber-500/20 transition-all"
            >
              <img
                src={evt.logoUrl}
                alt={evt.name}
                className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1d29]/50 border border-dashed border-gray-700 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500">
            Aucun evenement pour le moment. Soyez le premier a nous faire confiance !
          </p>
        </div>
      )}
    </div>
  );
}
