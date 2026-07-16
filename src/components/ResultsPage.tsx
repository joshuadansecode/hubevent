import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Award, Medal, Star, Share2, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Event, Candidate } from '../types';
import { useBackend } from '../lib/backend';

interface ResultsPageProps {
  eventId: string;
  onBack?: () => void;
}

const rankIcons = [Trophy, Award, Medal];
const rankColors = [
  'from-amber-400 to-yellow-500',
  'from-slate-300 to-slate-400',
  'from-amber-700 to-amber-800',
];

export default function ResultsPage({ eventId, onBack }: ResultsPageProps) {
  const { backend } = useBackend();
  const [event, setEvent] = useState<Event | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    backend.getEvents().then(events => {
      const found = events.find(e => e.id === eventId);
      setEvent(found || null);
    });
    backend.getCandidates().then(allCandidates => {
      const eventCandidates = allCandidates.filter(c => c.eventId === eventId);
      setCandidates(eventCandidates.sort((a, b) => b.votesCount - a.votesCount));
    });
  }, [eventId, backend]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#12141c] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-sm">Evenement introuvable</p>
          {onBack && (
            <button onClick={onBack} className="text-amber-500 text-xs underline">
              Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalVotes = candidates.reduce((s, c) => s + c.votesCount, 0);

  return (
    <div className="min-h-screen bg-[#12141c] text-slate-100 pb-16">
      {/* Back button */}
      {onBack && (
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-500 transition-all"
          >
            <ArrowLeft size={14} /> Retour
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-950/20 via-transparent to-transparent py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <Trophy size={32} className="text-amber-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Resultats : {event.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-amber-500" /> {event.city}, {event.country}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-amber-500" /> {event.startDate} - {event.endDate}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} className="text-amber-500" /> {candidates.length} candidats
            </span>
          </div>

          {/* Share button */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1d29] border border-gray-800 rounded-lg text-xs text-slate-300 hover:text-amber-500 transition-all"
          >
            <Share2 size={13} /> Partager les resultats
          </button>
        </div>
      </div>

      {/* Podium */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 mb-10">
        <div className="flex items-end justify-center gap-3 sm:gap-6">
          {candidates.slice(0, 3).map((cand, i) => {
            const Icon = rankIcons[i];
            const isFirst = i === 0;
            return (
              <motion.div
                key={cand.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`flex flex-col items-center ${isFirst ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-b ${rankColors[i]} flex items-center justify-center mb-2 shadow-lg`}>
                  <Icon size={20} className="text-slate-950" />
                </div>
                <img
                  src={cand.photoUrl}
                  alt={cand.name}
                  className={`${isFirst ? 'w-20 h-24' : 'w-16 h-20'} rounded-xl object-cover border-2 border-amber-500/30 shadow-xl`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80';
                  }}
                />
                <p className={`font-bold text-center mt-2 ${isFirst ? 'text-base text-white' : 'text-sm text-slate-300'}`}>
                  {cand.name}
                </p>
                <p className={`font-mono font-black ${isFirst ? 'text-lg text-amber-500' : 'text-sm text-slate-400'}`}>
                  {cand.votesCount.toLocaleString('fr-FR')}
                </p>
                <p className="text-[10px] text-slate-500">{cand.community}</p>
              </motion.div>
            );
          })}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            Aucun candidat pour cet evenement.
          </div>
        )}
      </div>

      {/* Full ranking */}
      {candidates.length > 3 && (
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono flex items-center gap-2">
            <Star size={14} className="text-amber-500" /> Classement complet
          </h2>
          <div className="space-y-2">
            {candidates.slice(3).map((cand, i) => {
              const rank = i + 4;
              const pct = totalVotes > 0 ? Math.round((cand.votesCount / totalVotes) * 100) : 0;
              return (
                <div
                  key={cand.id}
                  className="bg-[#1a1d29] border border-gray-800 rounded-xl p-4 flex items-center gap-3"
                >
                  <span className="text-xs font-mono font-bold text-slate-500 w-6 shrink-0 text-center">
                    #{rank}
                  </span>
                  <img
                    src={cand.photoUrl}
                    alt={cand.name}
                    className="w-10 h-12 rounded-lg object-cover border border-gray-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{cand.name}</p>
                    <p className="text-[10px] text-slate-400">{cand.community}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-amber-500 font-mono">
                      {cand.votesCount.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats summary */}
      {candidates.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 mt-8">
          <div className="bg-[#1a1d29]/50 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400">
              Total des votes : <strong className="text-amber-500 font-mono">{totalVotes.toLocaleString('fr-FR')}</strong>
              {' '}· {candidates.length} candidats · {event.country}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}