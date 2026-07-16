import { Event, Category, Candidate, VotePack, Transaction, User } from '../types';
import { supabase } from './supabase-client';
import { BackendAdapter, RegisterData, InitiateTransactionData } from './backend';

const SNAKE_EVENTS = 'id, name, logo_url, poster_url, description, country, city, location, start_date, end_date, vote_start_date, vote_end_date, status, is_accompanied, organizer_id, organizer_name, hide_ranking, vote_price_cfa';

const SNAKE_CATEGORIES = 'id, event_id, name, description, image_url, vote_type, max_candidates, status';

const SNAKE_CANDIDATES = 'id, category_id, event_id, name, photo_url, gallery, video_url, bio, presentation, community, project, social_links, votes_count';

const SNAKE_VOTE_PACKS = 'id, event_id, name, votes_count, price_cfa, discount_percent';

const SNAKE_TRANSACTIONS = 'id, event_id, event_name, candidate_id, candidate_name, buyer_name, buyer_phone, amount_cfa, votes_count, pack_name, payment_method, status, commission_cfa, organizer_share_cfa, user_id, otp_verified';

function toEvent(row: any): Event {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url || '',
    posterUrl: row.poster_url || '',
    description: row.description || '',
    country: row.country || '',
    city: row.city || '',
    location: row.location || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    voteStartDate: row.vote_start_date || '',
    voteEndDate: row.vote_end_date || '',
    status: row.status,
    isAccompanied: row.is_accompanied || false,
    organizerId: row.organizer_id || '',
    organizerName: row.organizer_name || '',
    hideRanking: row.hide_ranking || false,
    votePriceCFA: row.vote_price_cfa || 0,
  };
}

function toCategory(row: any): Category {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    description: row.description || '',
    imageUrl: row.image_url || '',
    voteType: row.vote_type,
    maxCandidates: row.max_candidates || 0,
    status: row.status,
  };
}

function toCandidate(row: any): Candidate {
  return {
    id: row.id,
    categoryId: row.category_id,
    eventId: row.event_id,
    name: row.name,
    photoUrl: row.photo_url || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    videoUrl: row.video_url || '',
    bio: row.bio || '',
    presentation: row.presentation || '',
    community: row.community || '',
    project: row.project || '',
    socialLinks: row.social_links || {},
    votesCount: row.votes_count || 0,
  };
}

function toVotePack(row: any): VotePack {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    votesCount: row.votes_count,
    priceCFA: row.price_cfa,
    discountPercent: row.discount_percent || undefined,
  };
}

function toTransaction(row: any): Transaction {
  return {
    id: row.id,
    eventId: row.event_id,
    eventName: row.event_name || '',
    candidateId: row.candidate_id,
    candidateName: row.candidate_name || '',
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    amountCFA: row.amount_cfa,
    votesCount: row.votes_count,
    packName: row.pack_name || undefined,
    paymentMethod: row.payment_method as Transaction['paymentMethod'],
    status: row.status === 'confirmé' ? 'Succès' : row.status === 'échoué' ? 'Échoué' : 'En attente',
    timestamp: row.created_at || '',
    commissionCFA: row.commission_cfa,
    organizerShareCFA: row.organizer_share_cfa,
  };
}

function toUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    organizerId: row.organizer_id || undefined,
  };
}

export class SupabaseAdapter implements BackendAdapter {
  private authListeners: Array<(user: User | null) => void> = [];

  // ── Auth helpers ───────────────────────────────────────────────────

  private async getProfile(authUserId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();
    if (error || !data) return null;
    return toUser(data);
  }

  private async createProfile(authUser: any, data?: RegisterData): Promise<User | null> {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        name: data?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur',
        role: (data?.role || authUser.user_metadata?.role || 'public') as any,
      });
    if (insertError) return null;
    return this.getProfile(authUser.id);
  }

  private notify(user: User | null) {
    for (const listener of this.authListeners) listener(user);
  }

  // ── Auth ──────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const user = await this.getProfile(data.user.id) ||
      await this.createProfile(data.user);
    if (!user) {
      throw new Error(
        "Profil introuvable. Exécutez d'abord le script de correction (supabase-fix-trigger.sql) dans Supabase SQL Editor.",
      );
    }
    return { user, token: data.session.access_token };
  }

  async register(data: RegisterData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role: 'organizer', phone: data.phone },
      },
    });
    if (error) {
      if (error.message?.includes('Database error') || error.status === 500) {
        const signIn = await supabase.auth.signInWithPassword({
          email: data.email, password: data.password,
        });
        if (signIn.error) {
          throw new Error(
            "L'inscription a échoué. Exécutez d'abord le script de correction dans Supabase SQL Editor (supabase-fix-trigger.sql), puis réessayez.",
          );
        }
        const user = await this.getProfile(signIn.data.user.id) ||
          await this.createProfile(signIn.data.user, data);
        if (!user) throw new Error("Impossible de créer le profil.");
        return { user, token: signIn.data.session.access_token };
      }
      throw new Error(error.message);
    }
    if (!authData.user) throw new Error("Erreur lors de l'inscription");
    const user = await this.getProfile(authData.user.id) ||
      await this.createProfile(authData.user, data);
    if (!user) throw new Error("Impossible de récupérer le profil créé.");
    return { user, token: authData.session?.access_token || '' };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    this.notify(null);
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return { user: null };
    const user = await this.getProfile(data.session.user.id);
    return { user };
  }

  onAuthChange(callback: (user: User | null) => void) {
    this.authListeners.push(callback);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const user = await this.getProfile(session.user.id);
          this.notify(user);
          callback(user);
          return;
        }
      }
      if (event === 'SIGNED_OUT') {
        this.notify(null);
        callback(null);
      }
    });
    return () => {
      subscription.unsubscribe();
      this.authListeners = this.authListeners.filter(l => l !== callback);
    };
  }

  // ── Events ────────────────────────────────────────────────────────

  async getEvents(params?: { country?: string; status?: string }) {
    let query = supabase.from('events').select(SNAKE_EVENTS);
    if (params?.country) query = query.eq('country', params.country);
    if (params?.status) query = query.eq('status', params.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(toEvent);
  }

  async getEvent(id: string) {
    const { data, error } = await supabase.from('events').select(SNAKE_EVENTS).eq('id', id).single();
    if (error) return null;
    return toEvent(data);
  }

  async createEvent(data: Omit<Event, 'id'>) {
    const { data: row, error } = await supabase.from('events').insert({
      name: data.name,
      logo_url: data.logoUrl || null,
      poster_url: data.posterUrl || null,
      description: data.description || null,
      country: data.country || null,
      city: data.city || null,
      location: data.location || null,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      vote_start_date: data.voteStartDate || null,
      vote_end_date: data.voteEndDate || null,
      status: data.status,
      is_accompanied: data.isAccompanied,
      organizer_id: data.organizerId || null,
      organizer_name: data.organizerName || null,
      hide_ranking: data.hideRanking,
      vote_price_cfa: data.votePriceCFA || null,
    }).select(SNAKE_EVENTS).single();
    if (error) throw new Error(error.message);
    return toEvent(row);
  }

  async updateEvent(id: string, data: Partial<Event>) {
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.logoUrl !== undefined) updates.logo_url = data.logoUrl;
    if (data.posterUrl !== undefined) updates.poster_url = data.posterUrl;
    if (data.description !== undefined) updates.description = data.description;
    if (data.country !== undefined) updates.country = data.country;
    if (data.city !== undefined) updates.city = data.city;
    if (data.location !== undefined) updates.location = data.location;
    if (data.startDate !== undefined) updates.start_date = data.startDate;
    if (data.endDate !== undefined) updates.end_date = data.endDate;
    if (data.voteStartDate !== undefined) updates.vote_start_date = data.voteStartDate;
    if (data.voteEndDate !== undefined) updates.vote_end_date = data.voteEndDate;
    if (data.status !== undefined) updates.status = data.status;
    if (data.isAccompanied !== undefined) updates.is_accompanied = data.isAccompanied;
    if (data.organizerId !== undefined) updates.organizer_id = data.organizerId;
    if (data.organizerName !== undefined) updates.organizer_name = data.organizerName;
    if (data.hideRanking !== undefined) updates.hide_ranking = data.hideRanking;
    if (data.votePriceCFA !== undefined) updates.vote_price_cfa = data.votePriceCFA;
    const { data: row, error } = await supabase.from('events').update(updates).eq('id', id).select(SNAKE_EVENTS).single();
    if (error) throw new Error(error.message);
    return toEvent(row);
  }

  async deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Categories ────────────────────────────────────────────────────

  async getCategories() {
    const { data, error } = await supabase.from('categories').select(SNAKE_CATEGORIES);
    if (error) throw new Error(error.message);
    return (data || []).map(toCategory);
  }

  async getCategoriesByEvent(eventId: string) {
    const { data, error } = await supabase.from('categories').select(SNAKE_CATEGORIES).eq('event_id', eventId);
    if (error) throw new Error(error.message);
    return (data || []).map(toCategory);
  }

  async getCategory(id: string) {
    const { data, error } = await supabase.from('categories').select(SNAKE_CATEGORIES).eq('id', id).single();
    if (error) return null;
    return toCategory(data);
  }

  async createCategory(data: Omit<Category, 'id'>) {
    const { data: row, error } = await supabase.from('categories').insert({
      event_id: data.eventId,
      name: data.name,
      description: data.description || null,
      image_url: data.imageUrl || null,
      vote_type: data.voteType,
      max_candidates: data.maxCandidates || null,
      status: data.status,
    }).select(SNAKE_CATEGORIES).single();
    if (error) throw new Error(error.message);
    return toCategory(row);
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const updates: any = {};
    if (data.eventId !== undefined) updates.event_id = data.eventId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.imageUrl !== undefined) updates.image_url = data.imageUrl;
    if (data.voteType !== undefined) updates.vote_type = data.voteType;
    if (data.maxCandidates !== undefined) updates.max_candidates = data.maxCandidates;
    if (data.status !== undefined) updates.status = data.status;
    const { data: row, error } = await supabase.from('categories').update(updates).eq('id', id).select(SNAKE_CATEGORIES).single();
    if (error) throw new Error(error.message);
    return toCategory(row);
  }

  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Candidates ────────────────────────────────────────────────────

  async getCandidates() {
    const { data, error } = await supabase.from('candidates').select(SNAKE_CANDIDATES);
    if (error) throw new Error(error.message);
    return (data || []).map(toCandidate);
  }

  async getCandidatesByEvent(eventId: string) {
    const { data, error } = await supabase.from('candidates').select(SNAKE_CANDIDATES).eq('event_id', eventId);
    if (error) throw new Error(error.message);
    return (data || []).map(toCandidate);
  }

  async getCandidatesByCategory(categoryId: string) {
    const { data, error } = await supabase.from('candidates').select(SNAKE_CANDIDATES).eq('category_id', categoryId);
    if (error) throw new Error(error.message);
    return (data || []).map(toCandidate);
  }

  async getCandidate(id: string) {
    const { data, error } = await supabase.from('candidates').select(SNAKE_CANDIDATES).eq('id', id).single();
    if (error) return null;
    return toCandidate(data);
  }

  async createCandidate(data: Omit<Candidate, 'id'>) {
    const { data: row, error } = await supabase.from('candidates').insert({
      category_id: data.categoryId,
      event_id: data.eventId,
      name: data.name,
      photo_url: data.photoUrl || null,
      gallery: data.gallery || [],
      video_url: data.videoUrl || null,
      bio: data.bio || null,
      presentation: data.presentation || null,
      community: data.community || null,
      project: data.project || null,
      social_links: data.socialLinks || null,
      votes_count: data.votesCount || 0,
    }).select(SNAKE_CANDIDATES).single();
    if (error) throw new Error(error.message);
    return toCandidate(row);
  }

  async updateCandidate(id: string, data: Partial<Candidate>) {
    const updates: any = {};
    if (data.categoryId !== undefined) updates.category_id = data.categoryId;
    if (data.eventId !== undefined) updates.event_id = data.eventId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.photoUrl !== undefined) updates.photo_url = data.photoUrl;
    if (data.gallery !== undefined) updates.gallery = data.gallery;
    if (data.videoUrl !== undefined) updates.video_url = data.videoUrl;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.presentation !== undefined) updates.presentation = data.presentation;
    if (data.community !== undefined) updates.community = data.community;
    if (data.project !== undefined) updates.project = data.project;
    if (data.socialLinks !== undefined) updates.social_links = data.socialLinks;
    if (data.votesCount !== undefined) updates.votes_count = data.votesCount;
    const { data: row, error } = await supabase.from('candidates').update(updates).eq('id', id).select(SNAKE_CANDIDATES).single();
    if (error) throw new Error(error.message);
    return toCandidate(row);
  }

  async deleteCandidate(id: string) {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Vote Packs ────────────────────────────────────────────────────

  async getVotePacks() {
    const { data, error } = await supabase.from('vote_packs').select(SNAKE_VOTE_PACKS);
    if (error) throw new Error(error.message);
    return (data || []).map(toVotePack);
  }

  async getVotePacksByEvent(eventId: string) {
    const { data, error } = await supabase.from('vote_packs').select(SNAKE_VOTE_PACKS).eq('event_id', eventId);
    if (error) throw new Error(error.message);
    return (data || []).map(toVotePack);
  }

  async createVotePack(data: Omit<VotePack, 'id'>) {
    const { data: row, error } = await supabase.from('vote_packs').insert({
      event_id: data.eventId,
      name: data.name,
      votes_count: data.votesCount,
      price_cfa: data.priceCFA,
      discount_percent: data.discountPercent || null,
    }).select(SNAKE_VOTE_PACKS).single();
    if (error) throw new Error(error.message);
    return toVotePack(row);
  }

  async updateVotePack(id: string, data: Partial<VotePack>) {
    const updates: any = {};
    if (data.eventId !== undefined) updates.event_id = data.eventId;
    if (data.name !== undefined) updates.name = data.name;
    if (data.votesCount !== undefined) updates.votes_count = data.votesCount;
    if (data.priceCFA !== undefined) updates.price_cfa = data.priceCFA;
    if (data.discountPercent !== undefined) updates.discount_percent = data.discountPercent;
    const { data: row, error } = await supabase.from('vote_packs').update(updates).eq('id', id).select(SNAKE_VOTE_PACKS).single();
    if (error) throw new Error(error.message);
    return toVotePack(row);
  }

  async deleteVotePack(id: string) {
    const { error } = await supabase.from('vote_packs').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Transactions ──────────────────────────────────────────────────

  async getTransactions() {
    const { data, error } = await supabase.from('transactions').select(SNAKE_TRANSACTIONS).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(toTransaction);
  }

  async getTransactionsByEvent(eventId: string) {
    const { data, error } = await supabase.from('transactions').select(SNAKE_TRANSACTIONS).eq('event_id', eventId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(toTransaction);
  }

  async initiateTransaction(data: InitiateTransactionData) {
    const commissionCFA = Math.round(data.amountCFA * 0.07);
    const organizerShareCFA = data.amountCFA - commissionCFA;

    const { data: row, error } = await supabase.from('transactions').insert({
      event_id: data.eventId,
      candidate_id: data.candidateId,
      buyer_name: data.buyerName,
      buyer_phone: data.buyerPhone,
      votes_count: data.votesCount,
      amount_cfa: data.amountCFA,
      pack_name: data.packName || null,
      payment_method: data.paymentMethod || 'Mobile Money',
      status: 'confirmé',
      commission_cfa: commissionCFA,
      organizer_share_cfa: organizerShareCFA,
    }).select(SNAKE_TRANSACTIONS).single();
    if (error) throw new Error(error.message);

    // Update candidate vote count
    const { data: candidate } = await supabase.from('candidates').select('votes_count').eq('id', data.candidateId).single();
    const currentVotes = candidate?.votes_count || 0;
    await supabase.from('candidates').update({ votes_count: currentVotes + data.votesCount }).eq('id', data.candidateId);

    return toTransaction(row);
  }

  async processVoteTransaction(
    eventId: string, candidateId: string, buyerName: string, buyerPhone: string,
    votesCount: number, amountCFA: number, packName?: string,
    paymentMethod?: Transaction['paymentMethod'],
  ) {
    return this.initiateTransaction({
      eventId, candidateId, buyerName, buyerPhone,
      votesCount, amountCFA, packName, paymentMethod,
    });
  }

  // ── Data Management ───────────────────────────────────────────────

  async exportData() {
    const [events, categories, candidates, votePacks, transactions] = await Promise.all([
      this.getEvents(),
      this.getCategories(),
      this.getCandidates(),
      this.getVotePacks(),
      this.getTransactions(),
    ]);
    return JSON.stringify({ events, categories, candidates, votePacks, transactions }, null, 2);
  }

  async importData(json: string) {
    try {
      const data = JSON.parse(json);
      if (!data.events) return false;

      // Clear existing data
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('vote_packs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Import in order (respecting FK constraints)
      for (const e of data.events) await this.createEvent(e);
      if (data.categories) for (const c of data.categories) await this.createCategory(c);
      if (data.candidates) for (const c of data.candidates) await this.createCandidate(c);
      if (data.votePacks) for (const p of data.votePacks) await this.createVotePack(p);
      // Transactions last (they reference events and candidates)
      for (const t of (data.transactions || [])) {
        await this.initiateTransaction({
          eventId: t.eventId,
          candidateId: t.candidateId,
          buyerName: t.buyerName,
          buyerPhone: t.buyerPhone,
          votesCount: t.votesCount,
          amountCFA: t.amountCFA,
          packName: t.packName,
          paymentMethod: t.paymentMethod,
        });
      }
      return true;
    } catch { return false; }
  }

  async resetDatabase() {
    // Delete all data from all tables (respecting FK: delete children first)
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('vote_packs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('candidates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
}
