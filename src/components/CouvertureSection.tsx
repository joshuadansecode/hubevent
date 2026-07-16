import { motion } from 'motion/react';
import { Globe, ShieldCheck } from 'lucide-react';

const flagEmoji = (code: string) => {
  const base = 0x1F1E6;
  return String.fromCodePoint(...code.split('').map(c => base + c.charCodeAt(0) - 65));
};

const countries = [
  {
    name: 'Benin',
    code: 'BJ',
    dial: '229',
    operators: ['MTN', 'Moov', 'Celtiis'],
    payment: ['SebPay'],
  },
  {
    name: 'Togo',
    code: 'TG',
    dial: '228',
    operators: ['Moov', 'Togocel', 'T-Money'],
    payment: ['SebPay'],
  },
  {
    name: "Cote d'Ivoire",
    code: 'CI',
    dial: '225',
    operators: ['MTN', 'Orange', 'Moov', 'Wave'],
    payment: ['SebPay'],
  },
  {
    name: 'Senegal',
    code: 'SN',
    dial: '221',
    operators: ['Orange', 'Free', 'Wave', 'Expresso'],
    payment: ['SebPay'],
  },
  {
    name: 'Burkina Faso',
    code: 'BF',
    dial: '226',
    operators: ['Orange', 'Moov', 'Airtel', 'Coris', 'Wave'],
    payment: ['SebPay'],
  },
  {
    name: 'Mali',
    code: 'ML',
    dial: '223',
    operators: ['Orange', 'Wave'],
    payment: ['SebPay'],
  },
  {
    name: 'Guinee',
    code: 'GN',
    dial: '224',
    operators: ['Orange', 'MTN', 'E-money'],
    payment: ['SebPay'],
  },
  {
    name: 'Niger',
    code: 'NE',
    dial: '227',
    operators: ['Airtel', 'Moov', 'Wave'],
    payment: ['SebPay'],
  },
  {
    name: 'Gambie',
    code: 'GM',
    dial: '220',
    operators: ['Wave'],
    payment: ['SebPay'],
  },
  {
    name: 'Guinee-Bissau',
    code: 'GW',
    dial: '245',
    operators: ['Orange', 'MTN'],
    payment: ['SebPay'],
  },
  {
    name: 'Cameroun',
    code: 'CM',
    dial: '237',
    operators: ['Orange', 'MTN'],
    payment: ['SebPay'],
  },
  {
    name: 'Congo',
    code: 'CG',
    dial: '242',
    operators: ['MTN', 'Airtel'],
    payment: ['SebPay'],
  },
  {
    name: 'Gabon',
    code: 'GA',
    dial: '241',
    operators: ['Airtel', 'Moov'],
    payment: ['SebPay'],
  },
  {
    name: 'RDC',
    code: 'CD',
    dial: '243',
    operators: ['Orange', 'Vodacom', 'Airtel', 'M-Pesa'],
    payment: ['SebPay'],
  },
  {
    name: 'Tchad',
    code: 'TD',
    dial: '235',
    operators: ['Airtel', 'Moov'],
    payment: ['SebPay'],
  },
];

const coverageGlobale = [
  { label: 'SebPay', desc: 'Mobile Money (14 operateurs)', icon: Globe },
  { label: 'OTP SMS', desc: 'Verification securisee', icon: ShieldCheck },
];

export default function CouvertureSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Couverture
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Pays et operateurs supportes par HubEvent
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {countries.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#1a1d29] border border-gray-800 rounded-xl p-5 hover:border-amber-500/20 transition-all"
          >
              <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{flagEmoji(c.code)}</div>
              <div>
                <h3 className="text-sm font-bold text-white">{c.name}</h3>
                <span className="text-[10px] text-slate-500 font-mono">+{c.dial}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">
                  Operateurs
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.operators.map((op) => (
                    <span
                      key={op}
                      className="px-2 py-0.5 bg-[#12141c] border border-gray-700/50 rounded text-[10px] font-medium text-slate-300"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">
                  Paiement
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.payment.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] font-medium text-amber-400"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Couverture mondiale */}
      <div className="bg-[#1a1d29]/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={20} className="text-amber-500" />
          <h3 className="text-sm font-bold text-white">Couverture Mondiale</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {coverageGlobale.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-2 bg-[#12141c] border border-gray-700/50 rounded-lg"
            >
              <item.icon size={16} className="text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}