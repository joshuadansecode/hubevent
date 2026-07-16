import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Eye, TrendingUp, Users, Award, ShieldAlert, 
  Download, ArrowRight, CheckCircle, HelpCircle, ToggleLeft, ToggleRight, 
  ChevronRight, Calendar, MapPin, Tag, Video, DollarSign, ListFilter, XCircle, Info,
  Sliders, BarChart4, Share2, ExternalLink, Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Event, Category, Candidate, VotePack, Transaction } from '../types';
import { useBackend } from '../lib/backend';
import OrganizerOnboarding from './OrganizerOnboarding';
import GainSimulator from './GainSimulator';

interface OrganizerDashboardProps {
  events: Event[];
  categories: Category[];
  candidates: Candidate[];
  votePacks: VotePack[];
  transactions: Transaction[];
  organizerId: string; // From currentUser
  onRefresh: () => void;
}

export default function OrganizerDashboard({ 
  events, categories, candidates, votePacks, transactions, organizerId, onRefresh 
}: OrganizerDashboardProps) {
  const { backend } = useBackend();

  // Retrieve events belonging to this organizer
  // Wait, if organizer is "usr-org-2", we target "evt-2" (Slam Lomé, accompanied)
  // if organizer is "usr-org-1", we target "evt-1" (Hwendo, autonomous)
  // Let's filter events.
  const isSpecialSlamUser = organizerId === 'evt-2';
  const organizerEvents = events.filter(evt => {
    if (isSpecialSlamUser) return evt.id === 'evt-2';
    return evt.organizerId === 'org-1' || evt.id === 'evt-1';
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(
    organizerEvents.length > 0 ? organizerEvents[0].id : ''
  );

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Onboarding state
  const isAutonomous = !isSpecialSlamUser;
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (!isAutonomous) return false;
    const completed = localStorage.getItem(`hubevent_onboarding_completed_${organizerId}`);
    return completed !== 'true';
  });

  const handleOnboardingComplete = (newEventId: string) => {
    setShowOnboarding(false);
    setSelectedEventId(newEventId);
    onRefresh();
    showNotification('Assistant de configuration terminé ! Votre événement est prêt.', 'success');
  };

  // States for Category Management (Autonomous only)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');
  const [catVoteType, setCatVoteType] = useState<Category['voteType']>('both');
  const [catMaxCand, setCatMaxCand] = useState(10);
  const [catStatus, setCatStatus] = useState<Category['status']>('Actif');

  // States for Candidate Management (Autonomous only)
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [candName, setCandName] = useState('');
  const [candCategory, setCandCategory] = useState('');
  const [candPhoto, setCandPhoto] = useState('');
  const [candBio, setCandBio] = useState('');
  const [candPres, setCandPres] = useState('');
  const [candCommunity, setCandCommunity] = useState('');
  const [candProject, setCandProject] = useState('');
  const [candVideo, setCandVideo] = useState('');
  const [candPhotoPreview, setCandPhotoPreview] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCandPhotoPreview(dataUrl);
      setCandPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  const [twitterLink, setTwitterLink] = useState('');

  // States for Pack Management
  const [showPackModal, setShowPackModal] = useState(false);
  const [editingPack, setEditingPack] = useState<VotePack | null>(null);
  const [packName, setPackName] = useState('');
  const [packVotes, setPackVotes] = useState(10);
  const [packPrice, setPackPrice] = useState(900);

  // Notification states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showNotification = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  if (!selectedEvent) {
    if (showOnboarding) {
      return (
        <OrganizerOnboarding
          organizerId={organizerId}
          organizerName={isAutonomous ? 'Organisateur Autonome' : 'Organisateur'}
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      );
    }
    return (
      <div className="p-12 text-center text-slate-400 max-w-md mx-auto">
        <ShieldAlert size={48} className="mx-auto mb-4 text-amber-500 animate-pulse" />
        <h2 className="text-xl font-bold text-white">Aucun événement assigné</h2>
        <p className="mt-2 text-sm leading-relaxed">Veuillez contacter l'administrateur HubEvent pour vous assigner un événement ou démarrez notre assistant interactif pour configurer votre premier scrutin autonome.</p>
        <button
          onClick={() => setShowOnboarding(true)}
          className="mt-6 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-amber-950/20"
        >
          Lancer l'assistant de configuration
        </button>
      </div>
    );
  }

  const isAccompanied = selectedEvent.isAccompanied;

  // Filter content related to selected event
  const eventCategories = categories.filter(c => c.eventId === selectedEvent.id);
  const eventCandidates = candidates.filter(c => c.eventId === selectedEvent.id);
  const eventPacks = votePacks.filter(p => p.eventId === selectedEvent.id);
  const eventTransactions = transactions.filter(t => t.eventId === selectedEvent.id && t.status === 'Succès');

  // Stats
  const totalVotes = eventTransactions.reduce((acc, tx) => acc + tx.votesCount, 0);
  const rawRevenues = eventTransactions.reduce((acc, tx) => acc + tx.amountCFA, 0);
  const hubCommission = Math.round(rawRevenues * 0.07);
  const organizerRevenues = rawRevenues - hubCommission;
  const mockVisitors = Math.round(totalVotes * 3.4 + 120); // Dynamic mock visitors

  // Candidate ranks
  const sortedCandidates = [...eventCandidates].sort((a, b) => b.votesCount - a.votesCount);

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rang,Candidat,Categorie,Communaute,Votes Reçus,Projet\n";
    
    sortedCandidates.forEach((cand, idx) => {
      const cat = categories.find(c => c.id === cand.categoryId)?.name || 'N/A';
      const cleanName = cand.name.replace(/,/g, " ");
      const cleanProj = cand.project.replace(/,/g, " ").replace(/\n/g, " ");
      const cleanComm = cand.community.replace(/,/g, " ");
      csvContent += `${idx + 1},"${cleanName}","${cat}","${cleanComm}",${cand.votesCount},"${cleanProj}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HubEvent_Rapport_Leaderboard_${selectedEvent.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Rapport CSV téléchargé avec succès !', 'success');
  };

  // PDF Exporter (Official Report)
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let y = 15;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 15;
          // Small running page header
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Rapport HubEvent - ${selectedEvent.name}`, 15, y);
          doc.text(`Page ${doc.getNumberOfPages()}`, 195, y, { align: 'right' });
          doc.setDrawColor(220, 220, 220);
          doc.line(15, y + 2, 195, y + 2);
          y += 10;
        }
      };

      // Draw top visual amber accent bar
      doc.setFillColor(245, 158, 11);
      doc.rect(15, y, 180, 4, 'F');
      y += 10;

      // Brand Logo header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text('HubEvent', 15, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text('Digitalisation & Vote Sécurisé des Concours en Afrique', 15, y + 5);

      // Doc Type indicator
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(217, 119, 6); // Amber 700
      doc.text('RAPPORT FINANCIER & SCRUTIN OFFICIEL', 195, y, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 195, y + 5, { align: 'right' });

      y += 15;

      // Event Information Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 26, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(`ÉVÉNEMENT : ${selectedEvent.name.toUpperCase()}`, 19, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Organisateur ID : ${selectedEvent.organizerId || 'Non spécifié'}`, 19, y + 12);
      doc.text(`Statut actuel du scrutin : ${selectedEvent.status === 'Actif' ? 'OUVERT (EN COURS)' : 'CLÔTURÉ'}`, 19, y + 17);
      doc.text(`Frais de commission standard appliqués : 7.0% (Réseau HubEvent)`, 19, y + 22);

      y += 33;

      // Metrics block
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);

      const cardW = 42;
      const cardH = 20;
      const gap = 4;

      const metrics = [
        { title: 'VOTES TOTAL', val: totalVotes.toLocaleString('fr-FR'), color: [15, 23, 42] },
        { title: 'VISITEURS UNIQUES', val: mockVisitors.toLocaleString('fr-FR'), color: [100, 116, 139] },
        { title: 'COLLECTE BRUTE', val: `${rawRevenues.toLocaleString('fr-FR')} FCFA`, color: [217, 119, 6] },
        { title: 'REVENU NET ORG (93%)', val: `${organizerRevenues.toLocaleString('fr-FR')} FCFA`, color: [22, 163, 74] }
      ];

      metrics.forEach((m, idx) => {
        const cx = 15 + idx * (cardW + gap);
        doc.rect(cx, y, cardW, cardH, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(m.title, cx + 3, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(m.color[0], m.color[1], m.color[2]);
        doc.text(m.val, cx + 3, y + 14);
      });

      y += 28;

      // Section: Candidates ranking (Leaderboard)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('CLASSEMENT DU SCRUTIN (LEADERBOARD EN DIRECT)', 15, y);
      y += 4;

      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 4;

      // Table Headers
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Rang', 18, y + 5.5);
      doc.text('Nom du Candidat / de la Candidate', 35, y + 5.5);
      doc.text('Catégorie', 95, y + 5.5);
      doc.text('Communauté', 140, y + 5.5);
      doc.text('Votes obtenus', 191, y + 5.5, { align: 'right' });

      y += 8;

      sortedCandidates.forEach((cand, idx) => {
        checkPageBreak(11);

        // Alternating row background
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, 9, 'F');
        }

        doc.setFont('helvetica', idx < 3 ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);

        // Draw rank with elegant formatting
        doc.text(`#${idx + 1}`, 18, y + 5.8);
        doc.text(cand.name, 35, y + 5.8);

        const cat = categories.find(c => c.id === cand.categoryId)?.name || 'N/A';
        doc.text(cat.length > 25 ? cat.substring(0, 23) + '...' : cat, 95, y + 5.8);
        doc.text(cand.community || 'Afrique', 140, y + 5.8);

        // Count
        doc.text(cand.votesCount.toLocaleString('fr-FR'), 191, y + 5.8, { align: 'right' });

        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 9, 195, y + 9);

        y += 9;
      });

      if (sortedCandidates.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Aucun candidat enregistré.', 20, y + 6);
        y += 10;
      }

      y += 6;
      checkPageBreak(30);

      // Section: Transactions log
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('JOURNAL COMPTABLE DES TRANSACTIONS RECENTES', 15, y);
      y += 4;

      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 4;

      // Table Headers
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('ID / Acheteur', 18, y + 5.5);
      doc.text('Pack / Volume', 60, y + 5.5);
      doc.text('Candidat bénéficiaire', 95, y + 5.5);
      doc.text('Montant Brut', 145, y + 5.5, { align: 'right' });
      doc.text('Frais (7%)', 165, y + 5.5, { align: 'right' });
      doc.text('Date de transaction', 191, y + 5.5, { align: 'right' });

      y += 8;

      eventTransactions.forEach((tx, idx) => {
        checkPageBreak(11);

        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, 9, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);

        // Buyer name
        doc.text(tx.buyerName.length > 20 ? tx.buyerName.substring(0, 18) + '...' : tx.buyerName, 18, y + 5.8);
        // Pack
        doc.text(tx.packName || `${tx.votesCount} votes`, 60, y + 5.8);
        // Candidate
        doc.text(tx.candidateName.length > 22 ? tx.candidateName.substring(0, 20) + '...' : tx.candidateName, 95, y + 5.8);
        // Amount
        doc.text(`${tx.amountCFA.toLocaleString('fr-FR')} F`, 145, y + 5.8, { align: 'right' });
        // Commission
        doc.text(`${tx.commissionCFA.toLocaleString('fr-FR')} F`, 165, y + 5.8, { align: 'right' });
        // Timestamp
        const txDate = new Date(tx.timestamp).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        doc.text(txDate, 191, y + 5.8, { align: 'right' });

        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 9, 195, y + 9);

        y += 9;
      });

      if (eventTransactions.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Aucune transaction enregistrée.', 20, y + 6);
        y += 10;
      }

      // Final signature seal
      checkPageBreak(30);
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, 195, y);
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('HubEvent Africa — Système de certification numérique du scrutin', 15, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Ce relevé d\'activité comptable et de votes est certifié conforme par le protocole HubEvent Pay.', 15, y + 4.5);
      doc.text('Garantie d\'impartialité, d\'anti-fraude IP et de chiffrement des transactions MTN, Moov, Orange, Wave, SebPay & Mobile Money.', 15, y + 8.5);

      doc.save(`HubEvent_Rapport_${selectedEvent.name.replace(/\s+/g, "_")}.pdf`);
      showNotification('Rapport PDF exporté avec succès !', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de l\'exportation PDF.', 'error');
    }
  };

  // CATEGORIES CRUD (Autonomous only)
  const handleOpenCategoryCreate = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImg('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80');
    setCatVoteType('both');
    setCatMaxCand(10);
    setCatStatus('Actif');
    setShowCategoryModal(true);
  };

  const handleOpenCategoryEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatImg(cat.imageUrl);
    setCatVoteType(cat.voteType);
    setCatMaxCand(cat.maxCandidates);
    setCatStatus(cat.status);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      if (editingCategory) {
        await backend.updateCategory(editingCategory.id, {
          name: catName,
          description: catDesc,
          imageUrl: catImg || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
          voteType: catVoteType,
          maxCandidates: Number(catMaxCand),
          status: catStatus,
        });
        showNotification('Catégorie modifiée avec succès.', 'success');
      } else {
        await backend.createCategory({
          eventId: selectedEvent.id,
          name: catName,
          description: catDesc,
          imageUrl: catImg || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
          voteType: catVoteType,
          maxCandidates: Number(catMaxCand),
          status: catStatus,
        });
        showNotification('Catégorie ajoutée avec succès.', 'success');
      }
    } catch (err) {
      console.warn('Category save failed:', err);
      showNotification('Erreur lors de la sauvegarde.', 'error');
    }

    setShowCategoryModal(false);
    onRefresh();
  };

  const handleDeleteCategory = async (catId: string) => {
    if (window.confirm("Supprimer cette catégorie ? Cela n'effacera pas les candidats mais ils perdront leur catégorie.")) {
      try {
        await backend.deleteCategory(catId);
      } catch (err) {
        console.warn('Delete cat failed:', err);
      }
      onRefresh();
      showNotification('Catégorie supprimée.', 'success');
    }
  };

  // CANDIDATES CRUD (Autonomous only)
  const handleOpenCandidateCreate = () => {
    setEditingCandidate(null);
    setCandName('');
    setCandCategory(eventCategories.length > 0 ? eventCategories[0].id : '');
    setCandPhoto('');
    setCandPhotoPreview('');
    setCandBio('');
    setCandPres('');
    setCandCommunity('');
    setCandProject('');
    setCandVideo('');
    setFacebookLink('');
    setInstagramLink('');
    setTwitterLink('');
    setShowCandidateModal(true);
  };

  const handleOpenCandidateEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setCandName(cand.name);
    setCandCategory(cand.categoryId);
    setCandPhoto(cand.photoUrl);
    setCandPhotoPreview(cand.photoUrl);
    setCandBio(cand.bio);
    setCandPres(cand.presentation);
    setCandCommunity(cand.community);
    setCandProject(cand.project);
    setCandVideo(cand.videoUrl || '');
    setFacebookLink(cand.socialLinks.facebook || '');
    setInstagramLink(cand.socialLinks.instagram || '');
    setTwitterLink(cand.socialLinks.twitter || '');
    setShowCandidateModal(true);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName.trim() || !candCategory) {
      showNotification('Veuillez spécifier le nom et la catégorie.', 'error');
      return;
    }

    try {
      if (editingCandidate) {
        await backend.updateCandidate(editingCandidate.id, {
          name: candName,
          categoryId: candCategory,
          photoUrl: candPhoto || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&q=80',
          videoUrl: candVideo,
          bio: candBio,
          presentation: candPres,
          community: candCommunity || 'Afrique',
          project: candProject,
          socialLinks: {
            facebook: facebookLink || undefined,
            instagram: instagramLink || undefined,
            twitter: twitterLink || undefined,
          },
        });
        showNotification('Profil candidat mis à jour.', 'success');
      } else {
        const created = await backend.createCandidate({
          eventId: selectedEvent.id,
          categoryId: candCategory,
          name: candName,
          photoUrl: candPhoto || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=500&fit=crop&q=80',
          gallery: [],
          videoUrl: candVideo,
          bio: candBio,
          presentation: candPres,
          community: candCommunity || 'Afrique',
          project: candProject,
          socialLinks: {
            facebook: facebookLink || undefined,
            instagram: instagramLink || undefined,
            twitter: twitterLink || undefined,
          },
          votesCount: 0,
        });
        showNotification('Candidat enregistré avec succès !', 'success');
      }
    } catch (err) {
      console.warn('Candidate save failed:', err);
      showNotification('Erreur lors de la sauvegarde.', 'error');
    }

    setShowCandidateModal(false);
    onRefresh();
  };

  const handleDeleteCandidate = async (candId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir disqualifier/supprimer ce candidat ?")) {
      try {
        await backend.deleteCandidate(candId);
      } catch (err) {
        console.warn('Delete candidate failed:', err);
      }
      onRefresh();
      showNotification('Candidat supprimé.', 'success');
    }
  };

  // PACKS CRUD (Autonomous only)
  const handleOpenPackCreate = () => {
    setEditingPack(null);
    setPackName('');
    setPackVotes(10);
    setPackPrice(900);
    setShowPackModal(true);
  };

  const handleOpenPackEdit = (pack: VotePack) => {
    setEditingPack(pack);
    setPackName(pack.name);
    setPackVotes(pack.votesCount);
    setPackPrice(pack.priceCFA);
    setShowPackModal(true);
  };

  const handleSavePack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packName.trim()) return;

    const discountPercent = Math.round((1 - (packPrice / (packVotes * selectedEvent.votePriceCFA))) * 100);

    try {
      if (editingPack) {
        await backend.updateVotePack(editingPack.id, {
          name: packName,
          votesCount: Number(packVotes),
          priceCFA: Number(packPrice),
          discountPercent: discountPercent > 0 ? discountPercent : undefined,
        });
        showNotification('Pack modifié avec succès.', 'success');
      } else {
        await backend.createVotePack({
          eventId: selectedEvent.id,
          name: packName,
          votesCount: Number(packVotes),
          priceCFA: Number(packPrice),
          discountPercent: discountPercent > 0 ? discountPercent : undefined,
        });
        showNotification('Nouveau Pack de votes enregistré.', 'success');
      }
    } catch (err) {
      console.warn('Pack save failed:', err);
      showNotification('Erreur lors de la sauvegarde.', 'error');
    }

    setShowPackModal(false);
    onRefresh();
  };

  const handleDeletePack = async (packId: string) => {
    if (window.confirm("Supprimer ce pack ?")) {
      try {
        await backend.deleteVotePack(packId);
      } catch (err) {
        console.warn('Delete pack failed:', err);
      }
      onRefresh();
      showNotification('Pack supprimé.', 'success');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100 font-sans">

      {/* Onboarding Wizard Overlay */}
      {showOnboarding && (
        <OrganizerOnboarding
          organizerId={organizerId}
          organizerName={isAutonomous ? 'Organisateur Autonome' : 'Organisateur'}
          onComplete={handleOnboardingComplete}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Notifications */}
      {successMsg && (
        <div id="org-success-toast" className="fixed bottom-4 right-4 bg-green-950/90 border border-green-500 text-green-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div id="org-error-toast" className="fixed bottom-4 right-4 bg-red-950/90 border border-red-500 text-red-300 px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <XCircle className="text-red-500" size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-500">
              Niveau 2 — Espace Organisateur
            </span>
            {isAccompanied ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                Mode Accompagné (Rapports & Stats)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                Mode Autonome (Gestion Complète)
              </span>
            )}
          </div>
          
          {/* Selected Event details */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{selectedEvent.name}</h1>
          </div>

          <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
            {isAccompanied 
              ? "HubEvent gère la numérisation complète de votre concours. Vous suivez ici la collecte en temps réel et générez vos rapports financiers certifiés."
              : "Ajoutez librement vos catégories, vos candidats et concevez votre tarification de packs. Suivez les classements et le volume collecté."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Multi-event management picker */}
          {organizerEvents.length > 1 && (
            <div className="flex items-center gap-2 bg-[#1a1d29] border border-gray-800 p-2 rounded-xl">
              <span className="text-xs text-slate-400 font-mono pl-1">Événement :</span>
              <select
                id="org-event-picker"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-[#12141c] border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-bold focus:outline-none"
              >
                {organizerEvents.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isAutonomous && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b1e2a] hover:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02]"
                title="Lancer l'assistant de configuration pas-à-pas d'événement"
              >
                <HelpCircle size={14} className="text-amber-500 animate-pulse animate-duration-1000" />
                <span>Guide de configuration</span>
              </button>
            )}

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Exporter le rapport officiel certifié et les classements finaux en PDF"
            >
              <Download size={14} />
              <span>Rapport Officiel (PDF)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-slate-200 border border-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02]"
              title="Exporter les données du classement au format CSV"
            >
              <Download size={14} />
              <span>Données (.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning/Status Info for accompanied events */}
      {isAccompanied && (
        <div id="accompagnement-notice" className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="text-purple-400 mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-xs font-bold text-purple-300">HubEvent Accompagnement Premium Actif</p>
              <p className="text-xs text-slate-400 mt-0.5">La création et modification de candidats sont verrouillées. Nos équipes s'occupent de la saisie technique pour vous garantir un traitement certifié sans erreur et une transparence maximale.</p>
            </div>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer"
          >
            <Download size={13} />
            <span>Télécharger Rapport Organisateur (.csv)</span>
          </button>
        </div>
      )}

      {/* Metrics Dash */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#1a1d29] border border-gray-800 p-4 sm:p-5 rounded-xl hover:border-gray-700 transition-all">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Visiteurs Uniques (Est.)</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">{mockVisitors.toLocaleString('fr-FR')}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Estimé d'après l'activité</span>
        </div>

        <div className="bg-[#1a1d29] border border-gray-800 p-4 sm:p-5 rounded-xl hover:border-gray-700 transition-all">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Nombre de Candidats</p>
          <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1 font-mono">{eventCandidates.length}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Répartis sur {eventCategories.length} catégories</span>
        </div>

        <div className="bg-[#1a1d29] border border-gray-800 p-4 sm:p-5 rounded-xl hover:border-gray-700 transition-all">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Votes Total Collectés</p>
          <p className="text-xl sm:text-2xl font-black text-green-400 mt-1 font-mono">{totalVotes.toLocaleString('fr-FR')}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Par packs et votes simples</span>
        </div>

        <div className="bg-[#1a1d29] border border-amber-900/20 p-4 sm:p-5 rounded-xl hover:border-amber-900/30 transition-all bg-gradient-to-br from-[#1a1d29] to-amber-950/10">
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono">Revenu Net (Après 7%)</p>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">{organizerRevenues.toLocaleString('fr-FR')} FCFA</p>
          <span className="text-[10px] text-slate-500 block mt-1">Brut: {rawRevenues.toLocaleString('fr-FR')} FCFA (-7% HubEvent)</span>
        </div>

      </div>

      {/* Simulateur de gains */}
      <div className="mt-8 mb-8">
        <GainSimulator basePrice={selectedEvent?.votePriceCFA || 100} />
      </div>

      {/* Primary tabs / Columns for Autonomous control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column / center: Categories & Candidates listing */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* CATEGORIES SECTION */}
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Catégories du concours</h3>
                <p className="text-[11px] text-slate-400">Divisions de l'événement.</p>
              </div>
              {!isAccompanied && (
                <button
                  id="btn-add-cat"
                  onClick={handleOpenCategoryCreate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Ajouter</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-800/60">
              {eventCategories.map(cat => {
                const candidatesInCat = eventCandidates.filter(c => c.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-all">
                    <div className="flex items-center gap-3">
                      <img 
                        src={cat.imageUrl} 
                        alt={cat.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-gray-800 bg-[#12141c]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80';
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-md">{cat.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-slate-400 font-mono font-semibold">
                            {candidatesInCat} / {cat.maxCandidates} Candidats
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-slate-400 font-mono">
                            Vote: {cat.voteType === 'simple' ? 'Unitaire' : cat.voteType === 'pack' ? 'Packs' : 'Hybride'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isAccompanied && (
                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-edit-cat-${cat.id}`}
                          onClick={() => handleOpenCategoryEdit(cat)}
                          className="p-1 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded border border-gray-800 cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          id={`btn-delete-cat-${cat.id}`}
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded border border-gray-800 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {eventCategories.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aucune catégorie configurée pour le moment.
                </div>
              )}
            </div>
          </div>

          {/* CANDIDATES MANAGEMENT */}
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Gestion des Candidats</h3>
                <p className="text-[11px] text-slate-400">Présentez et configurez le profil des participants.</p>
              </div>
              {!isAccompanied && (
                <button
                  id="btn-add-cand"
                  onClick={handleOpenCandidateCreate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Enregistrer un candidat</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-800/60">
              {eventCandidates.map((cand, idx) => {
                const catName = eventCategories.find(c => c.id === cand.categoryId)?.name || 'N/A';
                const candLink = `${window.location.origin}/?event=${selectedEventId}&candidate=${cand.id}`;
                const totalCandVotes = eventCandidates.reduce((s, c) => s + c.votesCount, 0);
                const votePct = totalCandVotes > 0 ? Math.round((cand.votesCount / totalCandVotes) * 100) : 0;
                return (
                  <div key={cand.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-all">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500 w-5 shrink-0 text-center">
                        #{idx + 1}
                      </span>
                      <img 
                        src={cand.photoUrl} 
                        alt={cand.name} 
                        className="w-12 h-14 rounded-lg object-cover border border-gray-800 bg-[#12141c]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80';
                        }}
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                        <p className="text-xs text-slate-400">{catName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-amber-500 font-semibold font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {cand.votesCount.toLocaleString('fr-FR')} votes
                          </span>
                          <span className="text-[10px] text-green-400 font-semibold font-mono bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                            {votePct}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono bg-gray-800 px-1.5 py-0.5 rounded">
                            {cand.community || 'Afrique'}
                          </span>
                          {cand.videoUrl && (
                            <span className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Video size={8} /> Video
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(candLink);
                        }}
                        className="p-1.5 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-green-400 rounded-lg border border-gray-800 transition-all cursor-pointer"
                        title="Copier le lien de vote"
                      >
                        <Share2 size={13} />
                      </button>
                      {!isAccompanied ? (
                        <>
                          <button
                            id={`btn-edit-cand-${cand.id}`}
                            onClick={() => handleOpenCandidateEdit(cand)}
                            className="p-1.5 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded-lg border border-gray-800 transition-all cursor-pointer"
                            title="Modifier le profil"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            id={`btn-delete-cand-${cand.id}`}
                            onClick={() => handleDeleteCandidate(cand.id)}
                            className="p-1.5 bg-[#12141c] hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg border border-gray-800 transition-all cursor-pointer"
                            title="Retirer le candidat"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono bg-[#12141c] px-2 py-1 rounded border border-gray-800">Saisie certifiee</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {eventCandidates.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aucun candidat enregistré pour le moment.
                </div>
              )}
            </div>
          </div>

          {/* VOTE PACKS MANAGEMENT */}
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Tarification & Packs de Votes</h3>
                <p className="text-[11px] text-slate-400">Configurez des offres de groupe attractives (Bronze, Gold, Premium).</p>
              </div>
              {!isAccompanied && (
                <button
                  id="btn-add-pack"
                  onClick={handleOpenPackCreate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Créer un pack</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
              {eventPacks.map(pack => {
                const standardPrice = pack.votesCount * selectedEvent.votePriceCFA;
                const savings = standardPrice - pack.priceCFA;
                const discount = pack.discountPercent || Math.round((savings / standardPrice) * 100);

                return (
                  <div key={pack.id} className="bg-[#12141c] border border-gray-800 hover:border-gray-700 p-4 rounded-xl flex flex-col justify-between relative transition-all">
                    {discount > 0 && (
                      <span className="absolute -top-2 -right-1 bg-amber-600 text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full shadow">
                        -{discount}%
                      </span>
                    )}
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">{pack.name}</h4>
                      <p className="text-2xl font-black text-white mt-1.5 font-mono">{pack.votesCount} <span className="text-xs font-medium text-slate-500">votes</span></p>
                      <p className="text-base font-extrabold text-amber-500 mt-1 font-mono">{pack.priceCFA.toLocaleString('fr-FR')} FCFA</p>
                    </div>

                    <div className="border-t border-gray-800/60 mt-3 pt-3 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {savings > 0 ? `Économie: ${savings.toLocaleString('fr-FR')} F` : 'Prix normal'}
                      </span>
                      {!isAccompanied && (
                        <div className="flex items-center gap-1">
                          <button
                            id={`btn-edit-pack-${pack.id}`}
                            onClick={() => handleOpenPackEdit(pack)}
                            className="p-1 text-slate-500 hover:text-amber-500 transition-colors"
                          >
                            <Edit size={11} />
                          </button>
                          <button
                            id={`btn-delete-pack-${pack.id}`}
                            onClick={() => handleDeletePack(pack.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {eventPacks.length === 0 && (
                <div className="col-span-3 p-6 text-center text-slate-500 text-xs">
                  Aucun pack de vote personnalisé. Les votes s'effectueront uniquement au tarif unitaire de {selectedEvent.votePriceCFA} FCFA.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right column: Classement en direct & Transactions log */}
        <div className="space-y-8">
          
          {/* LEADERBOARD CARD */}
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-amber-600/10 to-transparent">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  Leaderboard / Rang en temps réel
                </h3>
                <p className="text-[10px] text-slate-400">Classement automatique des candidats de l'événement.</p>
              </div>
              {selectedEvent.hideRanking && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full" title="Le classement en temps réel est masqué pour le grand public.">
                  Privé / Caché
                </span>
              )}
            </div>

            <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto overflow-x-hidden">
              {sortedCandidates.map((cand, idx) => {
                const totalCandsCount = sortedCandidates.length;
                const percentage = totalVotes > 0 ? Math.round((cand.votesCount / totalVotes) * 100) : 0;
                
                // Rank color style
                let rankBadgeClass = "bg-slate-800 text-slate-400";
                if (idx === 0) rankBadgeClass = "bg-amber-500/20 text-amber-500 border border-amber-500/30 font-black";
                else if (idx === 1) rankBadgeClass = "bg-slate-400/20 text-slate-300 border border-slate-400/30 font-bold";
                else if (idx === 2) rankBadgeClass = "bg-amber-900/20 text-amber-600 border border-amber-900/30";

                return (
                  <motion.div 
                    key={cand.id} 
                    layout
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="flex items-center justify-between gap-3 p-2 bg-[#12141c]/50 border border-gray-800/40 rounded-lg hover:border-gray-800 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${rankBadgeClass}`}>
                        {idx + 1}
                      </span>
                      <img 
                        src={cand.photoUrl} 
                        alt={cand.name} 
                        className="w-8 h-8 rounded-full object-cover border border-gray-800 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{cand.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{cand.community}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-amber-500 font-mono">{cand.votesCount.toLocaleString('fr-FR')} votes</p>
                      <div className="w-16 bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {eventCandidates.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aucun candidat disponible pour générer un classement.
                </div>
              )}
            </div>
          </div>

          {/* EVENTS LOG SPECIFIC TO ORGANIZER */}
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white">Journal financier de l'événement</h3>
              <p className="text-[10px] text-slate-400">Suivi comptable en temps réel.</p>
            </div>

            <div className="divide-y divide-gray-800/40 max-h-[380px] overflow-y-auto">
              {eventTransactions.slice(0, 15).map(tx => (
                <div key={tx.id} className="p-3 text-xs flex flex-col gap-1 hover:bg-slate-800/20 transition-all font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">{tx.buyerName}</span>
                    <span className="text-slate-500">{new Date(tx.timestamp).toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-0.5 font-sans">
                    <span className="text-slate-300">Achat: <strong className="text-white">{tx.packName || `${tx.votesCount} votes`}</strong></span>
                    <span className="text-green-400 font-bold font-mono">+{tx.amountCFA.toLocaleString('fr-FR')} F</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Dest: {tx.candidateName}</span>
                    <span>93% Part: {(tx.amountCFA - tx.commissionCFA).toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              ))}

              {eventTransactions.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aucune transaction enregistrée.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* CATEGORY DIALOG MODAL (Autonomous only) */}
      {showCategoryModal && !isAccompanied && (
        <div id="org-cat-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#12141c] p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
              </h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Nom de la Catégorie *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="ex: Miss Culture, Danse..."
                  className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Objectif de la catégorie..."
                  className="w-full h-16 bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">URL Image d'illustration</label>
                <input
                  type="url"
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Type de votes autorisés</label>
                  <select
                    value={catVoteType}
                    onChange={(e) => setCatVoteType(e.target.value as Category['voteType'])}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="both">Hybride (Unitaire + Packs)</option>
                    <option value="simple">Unitaire seulement</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Max Candidats</label>
                  <input
                    type="number"
                    value={catMaxCand}
                    onChange={(e) => setCatMaxCand(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 bg-[#12141c] hover:bg-slate-800 border border-gray-800 text-slate-400 rounded text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE DIALOG MODAL (Autonomous only) */}
      {showCandidateModal && !isAccompanied && (
        <div id="org-cand-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            <div className="bg-[#12141c] p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingCandidate ? 'Modifier le Candidat' : 'Enregistrer un Candidat'}
              </h3>
              <button 
                onClick={() => setShowCandidateModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Nom Complet du Candidat *</label>
                  <input
                    type="text"
                    required
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    placeholder="ex: Amina SOGLO"
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Catégorie assignée *</label>
                  <select
                    required
                    value={candCategory}
                    onChange={(e) => setCandCategory(e.target.value)}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="" disabled>Sélectionner une catégorie</option>
                    {eventCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Photo du candidat</label>
                  <div className="flex items-center gap-3">
                    {candPhotoPreview && (
                      <img src={candPhotoPreview} alt="" className="w-12 h-14 rounded-lg object-cover border border-gray-800" />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#12141c] border border-dashed border-gray-700 rounded-lg text-xs text-slate-400 hover:border-amber-500/30 hover:text-amber-400 transition-all cursor-pointer">
                      <Upload size={14} />
                      <span>{candPhotoPreview ? 'Changer' : 'Uploader'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Communauté / Ville représentée</label>
                  <input
                    type="text"
                    value={candCommunity}
                    onChange={(e) => setCandCommunity(e.target.value)}
                    placeholder="ex: Communauté Fon (Abomey)"
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Biographie courte</label>
                <textarea
                  value={candBio}
                  onChange={(e) => setCandBio(e.target.value)}
                  placeholder="Âge, parcours, passions..."
                  className="w-full h-16 bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Présentation générale du candidat (Slogan / Vision)</label>
                <textarea
                  value={candPres}
                  onChange={(e) => setCandPres(e.target.value)}
                  placeholder="Pourquoi voter pour moi..."
                  className="w-full h-16 bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Projet social / d'action défendu</label>
                <textarea
                  value={candProject}
                  onChange={(e) => setCandProject(e.target.value)}
                  placeholder="Détaillez le projet à financer ou promouvoir..."
                  className="w-full h-16 bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">URL Vidéo Youtube (Intégrable / Embed)</label>
                <input
                  type="url"
                  value={candVideo}
                  onChange={(e) => setCandVideo(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2 p-3 bg-[#12141c] border border-gray-800/40 rounded-lg">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Réseaux Sociaux du candidat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Facebook URL</label>
                    <input
                      type="url"
                      value={facebookLink}
                      onChange={(e) => setFacebookLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Instagram URL</label>
                    <input
                      type="url"
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Twitter URL</label>
                    <input
                      type="url"
                      value={twitterLink}
                      onChange={(e) => setTwitterLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#1a1d29] border border-gray-800 rounded p-1 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-3 py-1.5 bg-[#12141c] hover:bg-slate-800 border border-gray-800 text-slate-400 rounded text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded text-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PACK DIALOG MODAL (Autonomous only) */}
      {showPackModal && !isAccompanied && (
        <div id="org-pack-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d29] border border-gray-800 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#12141c] p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingPack ? 'Modifier le Pack' : 'Créer un Pack de Votes'}
              </h3>
              <button 
                onClick={() => setShowPackModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePack} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Nom du Pack *</label>
                <input
                  type="text"
                  required
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="ex: Pack Bronze, Pack Gold..."
                  className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Nombre de Votes *</label>
                  <input
                    type="number"
                    min="2"
                    required
                    value={packVotes}
                    onChange={(e) => setPackVotes(Math.max(2, Number(e.target.value)))}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Prix Spécial (FCFA) *</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={packPrice}
                    onChange={(e) => setPackPrice(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-[#12141c] border border-gray-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[#12141c] border border-gray-800/60 rounded-lg text-xs text-slate-400 space-y-1">
                <p>Prix normal sans pack : <strong className="text-slate-200">{packVotes * selectedEvent.votePriceCFA} FCFA</strong></p>
                <p>Réduction réelle : <strong className="text-amber-500">
                  {Math.round((1 - (packPrice / (packVotes * selectedEvent.votePriceCFA))) * 100)}%
                </strong></p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPackModal(false)}
                  className="px-3 py-1.5 bg-[#12141c] hover:bg-slate-800 border border-gray-800 text-slate-400 rounded text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs cursor-pointer"
                >
                  Créer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
