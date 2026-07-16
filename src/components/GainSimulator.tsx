import { useState } from 'react';
import { motion } from 'motion/react';
import { Sliders, BarChart4, TrendingUp, Users } from 'lucide-react';

interface GainSimulatorProps {
  basePrice: number;
  compact?: boolean;
}

export default function GainSimulator({ basePrice, compact }: GainSimulatorProps) {
  const [estimatedVoters, setEstimatedVoters] = useState(500);
  const [pricePerVote, setPricePerVote] = useState(basePrice);

  const brut = estimatedVoters * pricePerVote;
  const commission = Math.round(brut * 0.07);
  const net = brut - commission;

  return (
    <div className={`${compact ? '' : 'bg-[#1a1d29] border border-gray-800 rounded-xl p-6'}`}>
      {!compact && (
        <div className="flex items-center gap-2 mb-5">
          <BarChart4 size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-white">Simulateur de gains</h3>
          <span className="text-[10px] text-slate-500 font-mono ml-auto">Estimation</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Users size={13} className="text-amber-500" /> Votants estimes
            </span>
            <span className="text-white font-bold font-mono">{estimatedVoters.toLocaleString('fr-FR')}</span>
          </div>
          <input
            type="range"
            min={10}
            max={10000}
            step={10}
            value={estimatedVoters}
            onChange={(e) => setEstimatedVoters(Number(e.target.value))}
            className="w-full h-1.5 bg-[#12141c] rounded-full appearance-none cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sliders size={13} className="text-amber-500" /> Prix du vote (FCFA)
            </span>
            <span className="text-white font-bold font-mono">{pricePerVote.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <input
            type="range"
            min={25}
            max={5000}
            step={25}
            value={pricePerVote}
            onChange={(e) => setPricePerVote(Number(e.target.value))}
            className="w-full h-1.5 bg-[#12141c] rounded-full appearance-none cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <motion.div
            key={`brut-${brut}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="bg-[#12141c] border border-gray-800 rounded-lg p-3 text-center"
          >
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Brut</p>
            <p className="text-sm font-black text-white font-mono mt-0.5">{brut.toLocaleString('fr-FR')} F</p>
          </motion.div>
          <motion.div
            key={`com-${commission}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="bg-[#12141c] border border-gray-800 rounded-lg p-3 text-center"
          >
            <p className="text-[10px] text-amber-500 uppercase font-mono tracking-wider">Commission 7%</p>
            <p className="text-sm font-black text-amber-400 font-mono mt-0.5">{commission.toLocaleString('fr-FR')} F</p>
          </motion.div>
          <motion.div
            key={`net-${net}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="bg-[#12141c] border border-green-500/20 rounded-lg p-3 text-center"
          >
            <p className="text-[10px] text-green-400 uppercase font-mono tracking-wider">Net</p>
            <p className="text-sm font-black text-green-400 font-mono mt-0.5">{net.toLocaleString('fr-FR')} F</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}