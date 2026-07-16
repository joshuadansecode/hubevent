import React, { useState, useEffect } from 'react';
import { Timer, Clock, AlertCircle } from 'lucide-react';

interface EventCountdownProps {
  voteEndDate: string;
}

export default function EventCountdown({ voteEndDate }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Set target to end of the voteEndDate day (23:59:59)
      const targetDate = new Date(voteEndDate);
      // If the format is just YYYY-MM-DD, parsing it as-is can sometimes interpret it as UTC midnight.
      // Let's set it to local end of the day to make it user-friendly.
      if (!voteEndDate.includes('T')) {
        targetDate.setHours(23, 59, 59, 999);
      }
      
      const difference = targetDate.getTime() - Date.now();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [voteEndDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider animate-pulse">
        <AlertCircle size={14} className="shrink-0" />
        <span>Fermeture des votes : Temps écoulé</span>
      </div>
    );
  }

  // Helper to pad numbers with a leading zero
  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#11131a]/80 border border-amber-500/20 rounded-2xl p-3 sm:px-4 sm:py-2.5 backdrop-blur-md shadow-lg shadow-amber-950/10">
      <div className="flex items-center gap-1.5 text-amber-500">
        <Clock size={16} className="animate-pulse" />
        <span className="text-[10px] font-black uppercase font-mono tracking-widest text-slate-400">
          Clôture des votes dans :
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Days */}
        <div className="flex items-center gap-1">
          <div className="bg-[#1e2230] border border-gray-800 rounded-lg w-10 h-10 flex items-center justify-center font-mono text-base font-black text-white shadow-inner">
            {formatNum(timeLeft.days)}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">j</span>
        </div>

        <span className="text-amber-500 font-black animate-pulse">:</span>

        {/* Hours */}
        <div className="flex items-center gap-1">
          <div className="bg-[#1e2230] border border-gray-800 rounded-lg w-10 h-10 flex items-center justify-center font-mono text-base font-black text-white shadow-inner">
            {formatNum(timeLeft.hours)}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">h</span>
        </div>

        <span className="text-amber-500 font-black animate-pulse">:</span>

        {/* Minutes */}
        <div className="flex items-center gap-1">
          <div className="bg-[#1e2230] border border-gray-800 rounded-lg w-10 h-10 flex items-center justify-center font-mono text-base font-black text-white shadow-inner">
            {formatNum(timeLeft.minutes)}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">m</span>
        </div>

        <span className="text-amber-500 font-black animate-pulse">:</span>

        {/* Seconds */}
        <div className="flex items-center gap-1">
          <div className="bg-[#1e2230] border border-gray-800 rounded-lg w-10 h-10 flex items-center justify-center font-mono text-base font-black text-amber-500 shadow-inner">
            {formatNum(timeLeft.seconds)}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">s</span>
        </div>
      </div>
    </div>
  );
}
