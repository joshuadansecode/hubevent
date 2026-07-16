export type EventStatus = 'Brouillon' | 'Publié' | 'Actif' | 'Terminé' | 'Annulé';

export interface Event {
  id: string;
  name: string;
  logoUrl: string;
  posterUrl: string;
  description: string;
  country: string;
  city: string;
  location: string;
  startDate: string;
  endDate: string;
  voteStartDate: string;
  voteEndDate: string;
  status: EventStatus;
  isAccompanied: boolean; // true = service accompagné, false = plateforme autonome
  organizerId: string;
  organizerName: string;
  hideRanking: boolean; // S'il faut masquer le classement au public
  votePriceCFA: number; // Prix par défaut du vote simple (ex: 100 FCFA)
}

export interface Category {
  id: string;
  eventId: string;
  name: string;
  description: string;
  imageUrl: string;
  voteType: 'simple' | 'pack' | 'both';
  maxCandidates: number;
  status: 'Actif' | 'Inactif';
}

export interface Candidate {
  id: string;
  categoryId: string;
  eventId: string;
  name: string;
  photoUrl: string;
  gallery: string[];
  videoUrl?: string;
  bio: string;
  presentation: string;
  community: string; // Communauté représentée
  project: string; // Projet défendu
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  votesCount: number;
}

export interface VotePack {
  id: string;
  eventId: string;
  name: string;
  votesCount: number;
  priceCFA: number;
  discountPercent?: number;
}

export interface Transaction {
  id: string;
  eventId: string;
  eventName: string;
  candidateId: string;
  candidateName: string;
  buyerName: string;
  buyerPhone: string;
  amountCFA: number;
  votesCount: number;
  packName?: string;
  paymentMethod: 'Mobile Money' | 'SebPay' | 'Carte Bancaire';
  status: 'Succès' | 'En attente' | 'Échoué';
  timestamp: string;
  commissionCFA: number; // 7%
  organizerShareCFA: number; // 93%
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organizer' | 'public';
  organizerId?: string; // Si le rôle est organisateur
}
