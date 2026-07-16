import { Event, Category, Candidate, VotePack, Transaction, User } from '../types';
import { LocalDB } from './db';
import { BackendAdapter, RegisterData, InitiateTransactionData } from './backend';

const GUEST_USER: User = {
  id: 'guest',
  email: 'public@hubevent.africa',
  name: 'Public / Visiteur',
  role: 'public',
};

export class LocalDBAdapter implements BackendAdapter {
  private currentUser: User = GUEST_USER;
  private authListeners: Array<(user: User | null) => void> = [];

  // ── Auth ───────────────────────────────────────────────────────────────

  async login(email: string, _password: string) {
    const user: User = {
      id: 'local-' + Date.now(),
      email,
      name: email.split('@')[0],
      role: 'organizer',
    };
    this.currentUser = user;
    this.notify(user);
    return { user, token: 'local-demo-token' };
  }

  async register(data: RegisterData) {
    const user: User = {
      id: 'local-' + Date.now(),
      email: data.email,
      name: data.name,
      role: 'organizer',
    };
    this.currentUser = user;
    this.notify(user);
    return { user, token: 'local-demo-token' };
  }

  async logout() {
    this.currentUser = GUEST_USER;
    this.notify(null);
  }

  async getSession() {
    return { user: this.currentUser };
  }

  onAuthChange(callback: (user: User | null) => void) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== callback);
    };
  }

  async setUserRole(userId: string, role: User['role']) {
    if (this.currentUser.id === userId) {
      this.currentUser = { ...this.currentUser, role };
      this.notify(this.currentUser);
    }
  }

  private notify(user: User | null) {
    for (const listener of this.authListeners) listener(user);
  }

  setUser(user: User) {
    this.currentUser = user;
    this.notify(user);
  }

  // ── Events ─────────────────────────────────────────────────────────────

  async getEvents(params?: { country?: string; status?: string }) {
    let events = LocalDB.getEvents();
    if (params?.country) events = events.filter(e => e.country === params.country);
    if (params?.status) events = events.filter(e => e.status === params.status);
    return events;
  }

  async getEvent(id: string) {
    return LocalDB.getEvents().find(e => e.id === id) || null;
  }

  async createEvent(data: Omit<Event, 'id'>) {
    const events = LocalDB.getEvents();
    const newEvent: Event = { ...data, id: `evt-${Date.now()}` };
    LocalDB.saveEvents([...events, newEvent]);
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<Event>) {
    const events = LocalDB.getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Événement introuvable');
    events[idx] = { ...events[idx], ...data };
    LocalDB.saveEvents(events);
    return events[idx];
  }

  async deleteEvent(id: string) {
    const events = LocalDB.getEvents().filter(e => e.id !== id);
    LocalDB.saveEvents(events);
    const categories = LocalDB.getCategories().filter(c => c.eventId !== id);
    LocalDB.saveCategories(categories);
    const candidates = LocalDB.getCandidates().filter(c => c.eventId !== id);
    LocalDB.saveCandidates(candidates);
  }

  // ── Categories ─────────────────────────────────────────────────────────

  async getCategories() {
    return LocalDB.getCategories();
  }

  async getCategoriesByEvent(eventId: string) {
    return LocalDB.getCategories().filter(c => c.eventId === eventId);
  }

  async getCategory(id: string) {
    return LocalDB.getCategories().find(c => c.id === id) || null;
  }

  async createCategory(data: Omit<Category, 'id'>) {
    const categories = LocalDB.getCategories();
    const newCat: Category = { ...data, id: `cat-${Date.now()}` };
    LocalDB.saveCategories([...categories, newCat]);
    return newCat;
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const categories = LocalDB.getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Catégorie introuvable');
    categories[idx] = { ...categories[idx], ...data };
    LocalDB.saveCategories(categories);
    return categories[idx];
  }

  async deleteCategory(id: string) {
    const categories = LocalDB.getCategories().filter(c => c.id !== id);
    LocalDB.saveCategories(categories);
    const candidates = LocalDB.getCandidates().filter(c => c.categoryId !== id);
    LocalDB.saveCandidates(candidates);
  }

  // ── Candidates ─────────────────────────────────────────────────────────

  async getCandidates() {
    return LocalDB.getCandidates();
  }

  async getCandidatesByEvent(eventId: string) {
    return LocalDB.getCandidates().filter(c => c.eventId === eventId);
  }

  async getCandidatesByCategory(categoryId: string) {
    return LocalDB.getCandidates().filter(c => c.categoryId === categoryId);
  }

  async getCandidate(id: string) {
    return LocalDB.getCandidates().find(c => c.id === id) || null;
  }

  async createCandidate(data: Omit<Candidate, 'id'>) {
    const candidates = LocalDB.getCandidates();
    const newCand: Candidate = { ...data, id: `cand-${Date.now()}` };
    LocalDB.saveCandidates([...candidates, newCand]);
    return newCand;
  }

  async updateCandidate(id: string, data: Partial<Candidate>) {
    const candidates = LocalDB.getCandidates();
    const idx = candidates.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Candidat introuvable');
    candidates[idx] = { ...candidates[idx], ...data };
    LocalDB.saveCandidates(candidates);
    return candidates[idx];
  }

  async deleteCandidate(id: string) {
    const candidates = LocalDB.getCandidates().filter(c => c.id !== id);
    LocalDB.saveCandidates(candidates);
  }

  // ── Vote Packs ─────────────────────────────────────────────────────────

  async getVotePacks() {
    return LocalDB.getVotePacks();
  }

  async getVotePacksByEvent(eventId: string) {
    return LocalDB.getVotePacks().filter(p => p.eventId === eventId);
  }

  async createVotePack(data: Omit<VotePack, 'id'>) {
    const packs = LocalDB.getVotePacks();
    const newPack: VotePack = { ...data, id: `pack-${Date.now()}` };
    LocalDB.saveVotePacks([...packs, newPack]);
    return newPack;
  }

  async updateVotePack(id: string, data: Partial<VotePack>) {
    const packs = LocalDB.getVotePacks();
    const idx = packs.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Pack introuvable');
    packs[idx] = { ...packs[idx], ...data };
    LocalDB.saveVotePacks(packs);
    return packs[idx];
  }

  async deleteVotePack(id: string) {
    const packs = LocalDB.getVotePacks().filter(p => p.id !== id);
    LocalDB.saveVotePacks(packs);
  }

  // ── Transactions ───────────────────────────────────────────────────────

  async getTransactions() {
    return LocalDB.getTransactions();
  }

  async getTransactionsByEvent(eventId: string) {
    return LocalDB.getTransactions().filter(t => t.eventId === eventId);
  }

  async initiateTransaction(data: InitiateTransactionData) {
    return LocalDB.processVoteTransaction(
      data.eventId,
      data.candidateId,
      data.buyerName,
      data.buyerPhone,
      data.votesCount,
      data.amountCFA,
      data.packName,
      data.paymentMethod,
    );
  }

  async processVoteTransaction(
    eventId: string, candidateId: string, buyerName: string, buyerPhone: string,
    votesCount: number, amountCFA: number, packName?: string,
    paymentMethod?: Transaction['paymentMethod'],
  ) {
    return LocalDB.processVoteTransaction(
      eventId, candidateId, buyerName, buyerPhone,
      votesCount, amountCFA, packName, paymentMethod,
    );
  }

  // ── Data Management ────────────────────────────────────────────────────

  async exportData() {
    return LocalDB.exportDataString();
  }

  async importData(json: string) {
    return LocalDB.importDataString(json);
  }

  async resetDatabase() {
    LocalDB.resetDatabase();
    this.currentUser = GUEST_USER;
    this.notify(null);
  }
}
