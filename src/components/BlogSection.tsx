import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  author: string;
  tags: string[];
}

interface BlogSectionProps {
  articles?: BlogArticle[];
}

const placeholderArticles: BlogArticle[] = [];

export default function BlogSection({ articles = placeholderArticles }: BlogSectionProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Actualites & Blog
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Decouvrez les dernieres actualites et conseils pour vos concours
          </p>
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#1a1d29] border border-gray-800 hover:border-amber-500/20 rounded-2xl overflow-hidden transition-all group cursor-pointer"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400&q=80';
                  }}
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <Calendar size={12} />
                  <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</span>
                  <span>•</span>
                  <span>{article.author}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[9px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-bold text-white group-hover:text-amber-400 transition-all text-sm leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:gap-2 transition-all pt-1">
                  Lire l'article <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1d29]/50 border border-dashed border-gray-700 rounded-xl p-8 text-center space-y-3">
          <Calendar size={32} className="mx-auto text-slate-600" />
          <p className="text-sm text-slate-500">
            Aucun article pour le moment.
          </p>
          <p className="text-xs text-slate-600">
            Le blog HubEvent arrive bientot. Suivez-nous pour ne rien manquer !
          </p>
        </div>
      )}
    </div>
  );
}
