import { Event, Category, Candidate, VotePack, Transaction, User } from '../types';

// Seed data helper
const DEFAULT_EVENTS: Event[] = [
  {
    id: 'evt-1',
    name: 'Festival HWENDO-CULTURE 2026',
    logoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&q=80',
    description: "Le plus grand festival de célébration et de revalorisation du patrimoine culturel béninois et africain. Venez célébrer nos traditions, notre art culinaire d'exception, nos chants folkloriques et nos danses ancestrales d'une richesse incomparable.",
    country: 'Bénin',
    city: 'Cotonou',
    location: 'Palais des Congrès de Cotonou',
    startDate: '2026-08-01',
    endDate: '2026-08-07',
    voteStartDate: '2026-07-01',
    voteEndDate: '2026-08-05',
    status: 'Actif',
    isAccompanied: false, // Autonome
    organizerId: 'org-1',
    organizerName: 'Association Patrimoine Afrique',
    hideRanking: false,
    votePriceCFA: 100,
  },
  {
    id: 'evt-2',
    name: 'Concours National de Slam & Poésie 2026',
    logoUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=150&h=150&fit=crop&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1484755560695-a4c7300c5c29?w=800&q=80',
    description: "La finale nationale réunissant les plus belles plumes et voix d'Afrique de l'Ouest francophone pour célébrer le pouvoir des mots, de la parole engagée et de la poésie urbaine contemporaine.",
    country: 'Togo',
    city: 'Lomé',
    location: 'Institut Français du Togo',
    startDate: '2026-09-15',
    endDate: '2026-09-17',
    voteStartDate: '2026-07-05',
    voteEndDate: '2026-09-15',
    status: 'Publié',
    isAccompanied: true, // Accompagné
    organizerId: 'org-2',
    organizerName: 'Lomé Slam Collective',
    hideRanking: false,
    votePriceCFA: 150,
  },
  {
    id: 'evt-3',
    name: 'Awards de la Musique Africaine (AMA) 2026',
    logoUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop&q=80',
    posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    description: "Célébration annuelle des meilleurs talents de la musique contemporaine africaine. Les plus grands artistes d'Afrique centrale et de l'ouest réunis pour une soirée d'exception.",
    country: 'Côte d’Ivoire',
    city: 'Abidjan',
    location: 'Sofitel Hôtel Ivoire',
    startDate: '2026-10-10',
    endDate: '2026-10-11',
    voteStartDate: '2026-07-12',
    voteEndDate: '2026-10-09',
    status: 'Actif',
    isAccompanied: false,
    organizerId: 'org-3',
    organizerName: 'AfroBeats Agency',
    hideRanking: true, // Classement masqué !
    votePriceCFA: 200,
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  // Categories for Event 1
  {
    id: 'cat-1-1',
    eventId: 'evt-1',
    name: 'Miss HWENDO-CULTURE',
    description: "Élection de l'ambassadrice de la beauté originelle, de la grâce, de la coiffure traditionnelle et de l'intelligence culturelle.",
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80',
    voteType: 'both',
    maxCandidates: 10,
    status: 'Actif'
  },
  {
    id: 'cat-1-2',
    eventId: 'evt-1',
    name: 'Art Culinaire & Saveurs Locales',
    description: "Compétition de gastronomie traditionnelle mettant à l'honneur les plats typiques mijotés au feu de bois.",
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
    voteType: 'simple',
    maxCandidates: 8,
    status: 'Actif'
  },
  {
    id: 'cat-1-3',
    eventId: 'evt-1',
    name: 'Danses & Rythmes Traditionnels',
    description: "Groupes de danses folkloriques (Zinli, Agbadja, Gbon) en compétition pour le trophée de la troupe la plus authentique.",
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    voteType: 'both',
    maxCandidates: 12,
    status: 'Actif'
  },
  // Categories for Event 2
  {
    id: 'cat-2-1',
    eventId: 'evt-2',
    name: 'Slam Solo',
    description: "Performances poétiques individuelles de 3 minutes a capella ou sur fond sonore minimaliste.",
    imageUrl: 'https://images.unsplash.com/photo-1484755560695-a4c7300c5c29?w=500&q=80',
    voteType: 'both',
    maxCandidates: 15,
    status: 'Actif'
  },
  // Categories for Event 3
  {
    id: 'cat-3-1',
    eventId: 'evt-3',
    name: 'Meilleur Artiste Révélation',
    description: "La relève de la musique africaine qui fait trembler les charts et réinvente l'afro-pop.",
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    voteType: 'both',
    maxCandidates: 6,
    status: 'Actif'
  }
];

const DEFAULT_CANDIDATES: Candidate[] = [
  // Candidates for Miss HWENDO-CULTURE (evt-1, cat-1-1)
  {
    id: 'cand-1-1-1',
    categoryId: 'cat-1-1',
    eventId: 'evt-1',
    name: 'Amina SOGLO',
    photoUrl: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&h=500&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    bio: "Amina, 22 ans, étudiante brillante en Master de Lettres Modernes à l'UAC. Elle est passionnée par l'histoire du Dahomey et pratique l'art délicat des coiffures traditionnelles tressées depuis son enfance.",
    presentation: "Je porte fièrement l'héritage de nos mères à travers mon langage, ma prestance et mes coiffures. Ma culture n'est pas un folklore, c'est ma boussole.",
    community: 'Communauté Fon (Abomey)',
    project: "Valorisation du Kanvô (pagne tissé béninois) à travers des ateliers de couture modernes dans les écoles de filles, afin d'allier insertion professionnelle, entrepreneuriat culturel et autonomie financière.",
    socialLinks: {
      facebook: 'https://facebook.com/amina.soglo',
      instagram: 'https://instagram.com/amina.soglo'
    },
    votesCount: 1420
  },
  {
    id: 'cand-1-1-2',
    categoryId: 'cat-1-1',
    eventId: 'evt-1',
    name: 'Victoire TOSSOU',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80'
    ],
    videoUrl: '',
    bio: "Victoire, 24 ans, jeune diplômée en Agro-économie. Elle gère une petite ferme écologique périurbaine et milite activement au sein de plusieurs associations locales pour l'éducation des enfants vulnérables.",
    presentation: "Je crois profondément que l'Afrique se lèvera par sa terre et son génie créateur. Ma candidature est celle des femmes d'action.",
    community: 'Communauté Yoruba (Porto-Novo)',
    project: "Sensibilisation et distribution de paniers de cultures maraîchères locales biologiques auprès des cantines scolaires. Ce projet associe la réintroduction des légumes traditionnels (tchiayo, crin-crin) et la lutte contre la malnutrition.",
    socialLinks: {
      instagram: 'https://instagram.com/victoire.tossou',
      twitter: 'https://twitter.com/victoire_t'
    },
    votesCount: 1180
  },
  {
    id: 'cand-1-1-3',
    categoryId: 'cat-1-1',
    eventId: 'evt-1',
    name: 'Esmeralda KPADONOU',
    photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&q=80',
    gallery: [],
    videoUrl: '',
    bio: "Esmeralda, 21 ans, étudiante en droit des affaires et danseuse amatrice de Zinli. Déterminée et éloquente, elle souhaite mettre sa verve juridique au service du patrimoine oral africain.",
    presentation: "Les mots de nos ancêtres recèlent des trésors de sagesse juridique et sociale. Je veux être la voix qui les propage pour inspirer notre jeunesse.",
    community: 'Communauté Goun (Porto-Novo)',
    project: "Digitalisation des contes traditionnels de sagesse sous forme de livres audio interactifs bilingues (français/goun) pour préserver la mémoire collective et enrichir l'éducation civique des plus jeunes.",
    socialLinks: {
      facebook: 'https://facebook.com/esme.kpadonou'
    },
    votesCount: 950
  },

  // Candidates for Art Culinaire (evt-1, cat-1-2)
  {
    id: 'cand-1-2-1',
    categoryId: 'cat-1-2',
    eventId: 'evt-1',
    name: 'Maman Divine (Le secret du feu)',
    photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Divine, cordon bleu réputée pour ses sauces graine et d'arachide mitonnées avec patience dans des marmites en argile cuite.",
    presentation: "La cuisine est l'âme d'un peuple. Chez moi, chaque ingrédient raconte une histoire et chaque épice soigne.",
    community: 'Ouidah',
    project: "Création d'un label de qualité pour la street-food béninoise traditionnelle et formation de 50 jeunes femmes aux normes d'hygiène tout en maintenant les recettes authentiques.",
    socialLinks: {},
    votesCount: 840
  },
  {
    id: 'cand-1-2-2',
    categoryId: 'cat-1-2',
    eventId: 'evt-1',
    name: 'Chef Landry KOFFI',
    photoUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Jeune chef autodidacte de Cotonou, Landry revisite les classiques du terroir africain avec une présentation digne des plus grands palaces.",
    presentation: "Sublimer nos plats traditionnels sans jamais trahir leurs racines gustatives, voilà mon défi quotidien.",
    community: 'Cotonou',
    project: "Lancement d'un festival de la gastronomie nomade béninoise pour stimuler le tourisme culinaire local.",
    socialLinks: {},
    votesCount: 790
  },

  // Candidates for Danses (evt-1, cat-1-3)
  {
    id: 'cand-1-3-1',
    categoryId: 'cat-1-3',
    eventId: 'evt-1',
    name: "Les Tambours Sacrés d'Adjara",
    photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Compagnie fondée en 2012, regroupant 14 artistes qui perpétuent les danses royales et rituelles du Sud-Bénin.",
    presentation: "Nos pieds frappent la terre pour réveiller la fierté d'être africain. Notre rythme est universel.",
    community: 'Adjara (Ouémé)',
    project: "Création d'une école nomade des rythmes du Bénin pour enseigner gratuitement la percussion traditionnelle dans les zones rurales enclavées.",
    socialLinks: {},
    votesCount: 2340
  },
  {
    id: 'cand-1-3-2',
    categoryId: 'cat-1-3',
    eventId: 'evt-1',
    name: "La Troupe Zémidjan de Ouidah",
    photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Une compagnie jeune et explosive mêlant danses rituelles vaudoues et acrobaties urbaines contemporaines.",
    presentation: "Nous jetons un pont de feu entre notre passé glorieux et le futur dynamique de l'art chorégraphique.",
    community: 'Ouidah',
    project: "Sensibilisation aux fléaux environnementaux par des spectacles de danse théâtralisés gratuits sur les plages africaines.",
    socialLinks: {},
    votesCount: 1950
  },

  // Candidates for Slam (evt-2, cat-2-1)
  {
    id: 'cand-2-1-1',
    categoryId: 'cat-2-1',
    eventId: 'evt-2',
    name: 'Merveille la plume',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Slameuse féministe et poétesse engagée de 23 ans. Elle s'est fait connaître lors de scènes ouvertes à Lomé pour ses textes poignants sur l'éducation des filles.",
    presentation: "Je n'écris pas avec de l'encre, j'écris avec mes tripes et mon amour pour la justice sociale.",
    community: 'Lomé',
    project: "Le projet 'Slam de Vie' : ateliers d'écriture et de déclamations dans les maisons d'arrêt pour femmes afin de favoriser la réinsertion par l'art.",
    socialLinks: {},
    votesCount: 650
  },
  {
    id: 'cand-2-1-2',
    categoryId: 'cat-2-1',
    eventId: 'evt-2',
    name: 'Komi le Verbe',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Poète-conteur de Kara. Il mêle la puissance du slam moderne aux proverbes traditionnels kabiyè pour créer des contes sonores uniques.",
    presentation: "Mes vers racontent les blessures de notre temps et l'irrésistible résilience de notre peuple.",
    community: 'Kara (Nord Togo)',
    project: "Enregistrement d'un album slam éducatif axé sur l'environnement et l'écocitoyenneté pour distribution gratuite dans les écoles rurales.",
    socialLinks: {},
    votesCount: 590
  },

  // Candidates for Music AMA (evt-3, cat-3-1)
  {
    id: 'cand-3-1-1',
    categoryId: 'cat-3-1',
    eventId: 'evt-3',
    name: 'K-Ly SESS',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Étoile montante de l'afro-soul d'Abidjan. Sa voix suave et ses textes engagés en dioula et en français conquièrent l'Afrique de l'ouest.",
    presentation: "La musique est une thérapie collective. Je chante nos combats quotidiens et nos éclats de joie.",
    community: 'Abidjan',
    project: "Financer des bourses d'études de musique pour 10 jeunes filles talentueuses issues de quartiers défavorisés d'Abidjan.",
    socialLinks: {},
    votesCount: 3820
  },
  {
    id: 'cand-3-1-2',
    categoryId: 'cat-3-1',
    eventId: 'evt-3',
    name: 'Yvan le Rythme',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop&q=80',
    gallery: [],
    bio: "Jeune prodige de la guitare acoustique originaire de Man, Yvan propose une fusion révolutionnaire entre l'afrobeat mondial et la musique traditionnelle Dan.",
    presentation: "Rapprocher nos ancêtres de la génération TikTok par la magie des cordes pincées.",
    community: 'Man (Ouest Côte d’Ivoire)',
    project: "Création d'un studio d'enregistrement communautaire solaire mobile dans l'ouest montagneux de la Côte d'Ivoire.",
    socialLinks: {},
    votesCount: 3510
  }
];

const DEFAULT_VOTE_PACKS: VotePack[] = [
  { id: 'pack-bronze', eventId: 'evt-1', name: 'Pack Bronze', votesCount: 10, priceCFA: 900, discountPercent: 10 },
  { id: 'pack-gold', eventId: 'evt-1', name: 'Pack Gold', votesCount: 100, priceCFA: 9000, discountPercent: 10 },
  { id: 'pack-premium', eventId: 'evt-1', name: 'Pack Premium', votesCount: 1000, priceCFA: 85000, discountPercent: 15 },

  { id: 'pack-poet', eventId: 'evt-2', name: 'Pack Poète', votesCount: 20, priceCFA: 2500, discountPercent: 16 },
  { id: 'pack-orateur', eventId: 'evt-2', name: 'Pack Orateur', votesCount: 80, priceCFA: 9000, discountPercent: 25 },

  { id: 'pack-ama-fan', eventId: 'evt-3', name: 'Pack Fan', votesCount: 50, priceCFA: 9000, discountPercent: 10 },
  { id: 'pack-ama-vip', eventId: 'evt-3', name: 'Pack VIP Star', votesCount: 200, priceCFA: 35000, discountPercent: 12.5 }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    eventId: 'evt-1',
    eventName: 'Festival HWENDO-CULTURE 2026',
    candidateId: 'cand-1-1-1',
    candidateName: 'Amina SOGLO',
    buyerName: 'Gaston HOUESSOU',
    buyerPhone: '+229 97 45 88 12',
    amountCFA: 9000,
    votesCount: 100,
    packName: 'Pack Gold',
    paymentMethod: 'Mobile Money',
    status: 'Succès',
    timestamp: '2026-07-14T10:15:00-07:00',
    commissionCFA: 630, // 7%
    organizerShareCFA: 8370 // 93%
  },
  {
    id: 'tx-002',
    eventId: 'evt-1',
    eventName: 'Festival HWENDO-CULTURE 2026',
    candidateId: 'cand-1-1-2',
    candidateName: 'Victoire TOSSOU',
    buyerName: 'Bernadette KANHONOU',
    buyerPhone: '+229 61 22 34 56',
    amountCFA: 900,
    votesCount: 10,
    packName: 'Pack Bronze',
    paymentMethod: 'SebPay',
    status: 'Succès',
    timestamp: '2026-07-14T14:30:22-07:00',
    commissionCFA: 63,
    organizerShareCFA: 837
  },
  {
    id: 'tx-003',
    eventId: 'evt-2',
    eventName: 'Concours National de Slam & Poésie 2026',
    candidateId: 'cand-2-1-1',
    candidateName: 'Merveille la plume',
    buyerName: 'Amavi SOGADJI',
    buyerPhone: '+228 90 44 11 02',
    amountCFA: 2500,
    votesCount: 20,
    packName: 'Pack Poète',
    paymentMethod: 'Mobile Money',
    status: 'Succès',
    timestamp: '2026-07-15T08:11:45-07:00',
    commissionCFA: 175,
    organizerShareCFA: 2325
  },
  {
    id: 'tx-004',
    eventId: 'evt-1',
    eventName: 'Festival HWENDO-CULTURE 2026',
    candidateId: 'cand-1-3-1',
    candidateName: "Les Tambours Sacrés d'Adjara",
    buyerName: 'Anicet KOFFI',
    buyerPhone: '+229 95 77 12 30',
    amountCFA: 85000,
    votesCount: 1000,
    packName: 'Pack Premium',
    paymentMethod: 'Carte Bancaire',
    status: 'Succès',
    timestamp: '2026-07-15T09:44:10-07:00',
    commissionCFA: 5950,
    organizerShareCFA: 79050
  },
  {
    id: 'tx-005',
    eventId: 'evt-3',
    eventName: 'Awards de la Musique Africaine (AMA) 2026',
    candidateId: 'cand-3-1-1',
    candidateName: 'K-Ly SESS',
    buyerName: 'Mariama SYLLA',
    buyerPhone: '+225 07 88 99 11',
    amountCFA: 35000,
    votesCount: 200,
    packName: 'Pack VIP Star',
    paymentMethod: 'Mobile Money',
    status: 'Succès',
    timestamp: '2026-07-15T11:22:00-07:00',
    commissionCFA: 2450,
    organizerShareCFA: 32550
  },
  {
    id: 'tx-006',
    eventId: 'evt-1',
    eventName: 'Festival HWENDO-CULTURE 2026',
    candidateId: 'cand-1-2-1',
    candidateName: 'Maman Divine',
    buyerName: 'Ablavi DJOSSOU',
    buyerPhone: '+229 97 10 20 30',
    amountCFA: 1500, // 15 simple votes * 100 FCFA
    votesCount: 15,
    paymentMethod: 'Mobile Money',
    status: 'Succès',
    timestamp: '2026-07-15T12:05:12-07:00',
    commissionCFA: 105,
    organizerShareCFA: 1395
  }
];

export class LocalDB {
  static getEvents(): Event[] {
    const data = localStorage.getItem('hub_events');
    if (!data) {
      this.saveEvents(DEFAULT_EVENTS);
      return DEFAULT_EVENTS;
    }
    return JSON.parse(data);
  }

  static saveEvents(events: Event[]): void {
    localStorage.setItem('hub_events', JSON.stringify(events));
  }

  static getCategories(): Category[] {
    const data = localStorage.getItem('hub_categories');
    if (!data) {
      this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem('hub_categories', JSON.stringify(categories));
  }

  static getCandidates(): Candidate[] {
    const data = localStorage.getItem('hub_candidates');
    if (!data) {
      this.saveCandidates(DEFAULT_CANDIDATES);
      return DEFAULT_CANDIDATES;
    }
    return JSON.parse(data);
  }

  static saveCandidates(candidates: Candidate[]): void {
    localStorage.setItem('hub_candidates', JSON.stringify(candidates));
  }

  static getVotePacks(): VotePack[] {
    const data = localStorage.getItem('hub_votepacks');
    if (!data) {
      this.saveVotePacks(DEFAULT_VOTE_PACKS);
      return DEFAULT_VOTE_PACKS;
    }
    return JSON.parse(data);
  }

  static saveVotePacks(packs: VotePack[]): void {
    localStorage.setItem('hub_votepacks', JSON.stringify(packs));
  }

  static getTransactions(): Transaction[] {
    const data = localStorage.getItem('hub_transactions');
    if (!data) {
      this.saveTransactions(DEFAULT_TRANSACTIONS);
      return DEFAULT_TRANSACTIONS;
    }
    return JSON.parse(data);
  }

  static saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem('hub_transactions', JSON.stringify(transactions));
  }

  // Transaction execution helper
  static processVoteTransaction(
    eventId: string,
    candidateId: string,
    buyerName: string,
    buyerPhone: string,
    votesCount: number,
    amountCFA: number,
    packName?: string,
    paymentMethod: Transaction['paymentMethod'] = 'Mobile Money'
  ): Transaction {
    const events = this.getEvents();
    const candidates = this.getCandidates();
    const transactions = this.getTransactions();

    const targetEvent = events.find(e => e.id === eventId);
    const targetCandidate = candidates.find(c => c.id === candidateId);

    if (!targetEvent || !targetCandidate) {
      throw new Error("L'événement ou le candidat sélectionné n'existe pas.");
    }

    // Calcul de la commission de 7%
    const commissionCFA = Math.round(amountCFA * 0.07);
    const organizerShareCFA = amountCFA - commissionCFA;

    const newTx: Transaction = {
      id: `tx-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`,
      eventId,
      eventName: targetEvent.name,
      candidateId,
      candidateName: targetCandidate.name,
      buyerName: buyerName || 'Acheteur Anonyme',
      buyerPhone: buyerPhone || 'N/A',
      amountCFA,
      votesCount,
      packName,
      paymentMethod,
      status: 'Succès',
      timestamp: new Date().toISOString(),
      commissionCFA,
      organizerShareCFA
    };

    // Update candidate vote count
    const updatedCandidates = candidates.map(c => {
      if (c.id === candidateId) {
        return { ...c, votesCount: c.votesCount + votesCount };
      }
      return c;
    });

    this.saveCandidates(updatedCandidates);

    // Save transaction
    transactions.unshift(newTx);
    this.saveTransactions(transactions);

    return newTx;
  }

  // Backup and restore data (for professional client-accompagné export or offline utility)
  static exportDataString(): string {
    const fullData = {
      events: this.getEvents(),
      categories: this.getCategories(),
      candidates: this.getCandidates(),
      votePacks: this.getVotePacks(),
      transactions: this.getTransactions()
    };
    return JSON.stringify(fullData, null, 2);
  }

  static importDataString(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.events && data.categories && data.candidates && data.transactions) {
        this.saveEvents(data.events);
        this.saveCategories(data.categories);
        this.saveCandidates(data.candidates);
        if (data.votePacks) this.saveVotePacks(data.votePacks);
        this.saveTransactions(data.transactions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static resetDatabase(): void {
    localStorage.removeItem('hub_events');
    localStorage.removeItem('hub_categories');
    localStorage.removeItem('hub_candidates');
    localStorage.removeItem('hub_votepacks');
    localStorage.removeItem('hub_transactions');
    this.getEvents();
    this.getCategories();
    this.getCandidates();
    this.getVotePacks();
    this.getTransactions();
  }
}
