# Projet HubEvent — Contexte & Architecture

## Vision
Plateforme africaine de digitalisation de concours, votes et événements. Mode SaaS self-service (commission 7% sur votes payants). Paiement SebPay (15 pays, 14 opérateurs Mobile Money).

## Stack
- **Frontend** : React 19 + Vite + Tailwind CSS 4 + motion + jsPDF + react-router-dom v7
- **State/Backend** : 3 adaptateurs interchangeables derrière une interface commune
- **Base de données** : PostgreSQL (Supabase aujourd'hui, VPS plus tard)
- **Auth** : Supabase Auth (avec fallback démo locale)

## Architecture Backend

```
src/lib/backend.tsx    ← Interface BackendAdapter + BackendProvider + useBackend()
  ├─ src/lib/localdb-adapter.ts   ← localStorage (démo, offline)
  └─ src/lib/supabase-adapter.ts  ← Supabase PostgreSQL (actuel)
      └─ src/lib/supabase-client.ts  ← SDK @supabase/supabase-js
```

**Plus tard (VPS) :** `ApiAdapter` avec la même interface → changement d'1 ligne dans `BackendProvider`.

## Structure des fichiers clés

```
src/
├── types.ts                          # Interfaces TS : Event, Category, Candidate, VotePack, Transaction, User
├── main.tsx                          # Entry point : BackendProvider > LangProvider > App
├── App.tsx                           # Routes + AppLayout (header, footer, role routing)
│
├── lib/
│   ├── backend.tsx                   # BackendAdapter (interface) + BackendProvider + useBackend()
│   ├── localdb-adapter.ts           # Implémentation LocalDB
│   ├── supabase-adapter.ts          # Implémentation Supabase (snake_case <-> camelCase)
│   ├── supabase-client.ts           # Initialisation SDK Supabase
│   ├── db.ts                        # LocalDB (seed data + CRUD localStorage)
│   └── i18n.tsx                     # FR/EN (41 keys) + LangProvider
│
├── components/
│   ├── RoleSelector.tsx              # Barre démo (switch rôles public/organisateur/admin)
│   ├── AdminDashboard.tsx            # CRUD événements + backup/restore
│   ├── OrganizerDashboard.tsx        # Dashboard organisateur : CRUD catégories/candidats/packs, stats, PDF
│   ├── OrganizerOnboarding.tsx       # Wizard création événement + catégorie + candidat + packs
│   ├── PublicPortal.tsx              # Landing page + exploration événements + vote check-out
│   ├── ResultsPage.tsx               # Résultats publics /results/:eventId
│   ├── LoginPage.tsx                 # Connexion Supabase (ou démo)
│   ├── RegisterPage.tsx              # Inscription Supabase
│   ├── GainSimulator.tsx            # Simulateur gains (sliders voteurs/prix)
│   ├── CouvertureSection.tsx        # 15 pays + drapeaux + opérateurs SebPay
│   ├── LandingFeatures.tsx          # Grille fonctionnalités landing
│   ├── EventCountdown.tsx           # Compte à rebours
│   └── WhatsAppButton.tsx           # Bouton partage WhatsApp
│
server/                               # Backend Express (obsolète, gardé pour référence VPS)
└── supabase-migration.sql            # Schéma PostgreSQL Supabase
```

## Flux de données

```
Démo (pas de session Supabase) :
  Composant → useBackend().backend.getEvents()
    → LocalDBAdapter → LocalDB.getEvents() (localStorage)
    → données seed ou saisies utilisateur

Connecté (session Supabase active) :
  Composant → useBackend().backend.getEvents()
    → SupabaseAdapter → supabase.from('events').select(...)
    → PostgreSQL Supabase

Auth :
  setDemoUser(user) → LocalDBAdapter.setUser() (démo)
  login(email, password) → SupabaseAdapter.login() → Supabase Auth
  logout() → retour au mode démo (LocalDBAdapter)
```

## Routes React Router

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | AppLayout | Landing + dashboards selon rôle |
| `/login` | LoginPage | Connexion Supabase |
| `/register` | RegisterPage | Inscription Supabase |
| `/results/:eventId` | ResultsPage | Résultats publics |
| `/*` | AppLayout | Fallback vers accueil |

## Rôles utilisateur

| Rôle | Accès |
|------|-------|
| `public` | Landing,探索 événements, vote, résultats |
| `organizer` | OrganisationDashboard + OrganizerOnboarding |
| `admin` | AdminDashboard (CRUD événements globaux, backup/restore) |

## Base Supabase

- **Projet** : `https://dctafjjukvhqsailwqoo.supabase.co`
- **Schéma** : 7 tables (users, events, categories, candidates, vote_packs, transactions, otp_codes)
- **RLS** : Lecture publique, écriture authentifiée
- **Auth** : Trigger `handle_new_user()` crée profil dans `public.users` après signup
- **Migration SQL** : `supabase-migration.sql`

## Décisions clés

- **Commission** : 7% fixe sur tous les votes payants
- **Gateway** : SebPay (14 opérateurs Mobile Money, 15 pays d'Afrique)
- **Dark theme** : par défaut
- **Photos** : upload fichier → data URL (localStorage ou Supabase)
- **Vidéos** : URL uniquement (data URL trop lourde)
- **Pas de fausses données** : pas de faux partenaires, articles, stats
- **Emojis drapeaux** : via fonction génératrice (pas de librairie)
- **i18n** : FR/EN

## À faire (prochainement)

1. Exécuter `supabase-migration.sql` dans l'éditeur SQL Supabase
2. Tester le login/register Supabase
3. Ajouter upload photos vers Supabase Storage (au lieu de data URL)
4. Plus tard : écrire `ApiAdapter` pour VPS Express
