# HubEvent — Handoff Frontend

## Stack
- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router v7
- `motion/react` (animations)
- Supabase (`@supabase/supabase-js`) pour auth + DB
- Lucide React (icônes)

## Structure clé
```
src/
  App.tsx                    # Routes + layout principal
  types.ts                   # Tous les types (Event, Candidate, etc.)
  lib/
    backend.tsx              # Interface BackendAdapter + Provider/useBackend
    localdb-adapter.ts       # Mode démo (localStorage)
    supabase-adapter.ts      # Mode production (Supabase)
    supabase-client.ts       # Client Supabase (VITE_SUPABASE_URL/ANON_KEY)
    i18n.ts                  # Traduction FR/EN
  components/
    LandingFeatures.tsx      # Section "Pourquoi HubEvent ?"
    CouvertureSection.tsx    # Carte des pays/opérateurs
    PublicPortal.tsx         # Landing page + vote + checkout
    OrganizerDashboard.tsx   # Dashboard organisateur
    AdminDashboard.tsx       # Dashboard admin
    RoleSelector.tsx         # Mode démo (changer de rôle)
    LoginPage.tsx            # Page connexion
    RegisterPage.tsx         # Page inscription + OrganizerTypeChoice
    OrganizerTypeChoice.tsx  # Choix "autonome" vs "accompagné"
    OrganizerOnboarding.tsx  # Onboarding wizard
    BlogSection.tsx          # Section blog (nouveau)
    TrustedLogos.tsx         # Logos événements (nouveau)
    CoachingCTA.tsx          # CTA accompagnement (nouveau)
    ResultsPage.tsx          # Page résultats
    EventCountdown.tsx       # Compte à rebours
    WhatsAppButton.tsx       # Bouton WhatsApp flottant
```

## Architecture Backend
Toute la data passe par `useBackend()` (hook React). Pas d'appels Supabase directs dans les components.

```typescript
const { backend, user, loading, login, register, logout } = useBackend();
```

L'adaptateur bascule automatiquement :
- **Démo** : `LocalDBAdapter` (localStorage, sans login)
- **Connecté** : `SupabaseAdapter` (Supabase, via auth)

Pour tester sans auth, utilise RoleSelector en haut de page.

## Variables d'env (Vercel)
```
VITE_SUPABASE_URL=https://dctafjjukvhqsailwqoo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Déploiement
- Prod : `https://hubevent.vercel.app`
- Preview : auto sur chaque push (Vercel)
- `vercel.json` avec rewrites pour SPA routing

## Ce qui reste à faire (frontend)
- Photos/vidéos → Supabase Storage (remplacer data URLs)
- Espace candidat/nominé (suivi de votes)
- Blog : connecter à une vraie source de données
- Landing page : section "Comment ça marche", témoignages, "À propos"
- Améliorer l'entonnoir coaching
- Ajouter plus de pays dans CouvertureSection
- Responsive mobile : peaufiner
- SEO : balises meta dynamiques

## Démarrer
```bash
npm install
npm run dev     # → http://localhost:3000
```
