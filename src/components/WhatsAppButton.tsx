import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const WHATSAPP_NUMBER = '2290194192032';

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20HubEvent%2C%20j%27ai%20besoin%20d%27aide.`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3 rounded-full shadow-xl shadow-emerald-950/30 hover:shadow-emerald-900/40 transition-all group"
    >
      <MessageCircle size={22} className="fill-white" strokeWidth={1.5} />
      <span className="text-sm font-semibold hidden group-hover:inline transition-all">
        Support
      </span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
    </motion.a>
  );
}