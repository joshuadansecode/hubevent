import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

type Lang = 'fr' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    'app.name': 'HubEvent',
    'app.tagline': 'Digitalisation & Votes de Concours Africains',
    'app.desc': "L'infrastructure numerique qui digitalise les concours, revele les talents et connecte les evenements d'Afrique.",
    'nav.login': 'Connexion',
    'nav.back': 'Retour',
    'nav.logout': 'Deconnexion',
    'nav.theme': 'Theme',
    'role.public': 'Public',
    'role.organizer': 'Organisateur',
    'role.admin': 'Admin',
    'search.placeholder': 'Rechercher un evenement ou concours...',
    'event.vote': 'Voter',
    'event.results': 'Voir les resultats',
    'event.share': 'Partager',
    'event.shareResults': 'Partager les resultats',
    'candidates': 'Candidats',
    'votes': 'votes',
    'noCandidates': 'Aucun candidat pour cet evenement.',
    'totalVotes': 'Total des votes',
    'ranking': 'Classement',
    'contact': 'Contactez-nous',
    'support': 'Support disponible 7j/7',
    'footer.copyright': 'Tous droits reserves.',
    'features.title': 'Pourquoi HubEvent ?',
    'features.subtitle': 'La plateforme tout-en-un pour vos concours et votes en Afrique',
    'coverage.title': 'Couverture',
    'coverage.subtitle': 'Pays et operateurs supportes par HubEvent',
    'simulator.title': 'Simulateur de gains',
    'simulator.voters': 'Votants estimes',
    'simulator.price': 'Prix du vote (FCFA)',
    'simulator.gross': 'Brut',
    'simulator.fee': 'Commission 10%',
    'simulator.net': 'Net',
    'checklist.completed': 'Etapes completes',
    'checklist.pending': 'Packs de vote a configurer dans le tableau de bord',
    'checklist.share': 'Lien public a partager aux candidats',
    'onboarding.congrats': 'Votre scrutin est pret !',
    'onboarding.desc': 'Felicitations, vous venez de configurer votre evenement sur HubEvent Africa.',
  },
  en: {
    'app.name': 'HubEvent',
    'app.tagline': 'Digitalization & African Contest Voting',
    'app.desc': 'The digital infrastructure that digitalizes contests, reveals talent, and connects events across Africa.',
    'nav.login': 'Login',
    'nav.back': 'Back',
    'nav.logout': 'Logout',
    'nav.theme': 'Theme',
    'role.public': 'Public',
    'role.organizer': 'Organizer',
    'role.admin': 'Admin',
    'search.placeholder': 'Search for an event or contest...',
    'event.vote': 'Vote',
    'event.results': 'View results',
    'event.share': 'Share',
    'event.shareResults': 'Share results',
    'candidates': 'Candidates',
    'votes': 'votes',
    'noCandidates': 'No candidates for this event.',
    'totalVotes': 'Total votes',
    'ranking': 'Ranking',
    'contact': 'Contact us',
    'support': 'Support available 7/7',
    'footer.copyright': 'All rights reserved.',
    'features.title': 'Why HubEvent ?',
    'features.subtitle': 'The all-in-one platform for your contests and votes in Africa',
    'coverage.title': 'Coverage',
    'coverage.subtitle': 'Countries and operators supported by HubEvent',
    'simulator.title': 'Revenue Simulator',
    'simulator.voters': 'Estimated voters',
    'simulator.price': 'Vote price (FCFA)',
    'simulator.gross': 'Gross',
    'simulator.fee': 'Commission 10%',
    'simulator.net': 'Net',
    'checklist.completed': 'Completed steps',
    'checklist.pending': 'Configure vote packs in your dashboard',
    'checklist.share': 'Share public link with candidates',
    'onboarding.congrats': 'Your event is ready!',
    'onboarding.desc': 'Congratulations, you have configured your event on HubEvent Africa.',
  },
};

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('hub_lang');
    if (saved === 'en' || saved === 'fr') return saved;
    return 'fr';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('hub_lang', l);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LangContext);
}