-- HubEvent Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- Enable UUID generation and pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enum types ──────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'public');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('Brouillon', 'Publié', 'Actif', 'Terminé', 'Annulé');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE vote_type AS ENUM ('simple', 'pack', 'both');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tx_status AS ENUM ('en_attente', 'confirmé', 'échoué', 'remboursé');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Users (profiles linked to auth.users) ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'public',
  organizer_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to auto-create profile on auth.signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'public')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Events ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  logo_url        TEXT,
  poster_url      TEXT,
  description     TEXT,
  country         TEXT,
  city            TEXT,
  location        TEXT,
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  vote_start_date TIMESTAMPTZ,
  vote_end_date   TIMESTAMPTZ,
  status          event_status NOT NULL DEFAULT 'Brouillon',
  is_accompanied  BOOLEAN NOT NULL DEFAULT false,
  organizer_id    TEXT,
  organizer_name  TEXT,
  hide_ranking    BOOLEAN NOT NULL DEFAULT false,
  vote_price_cfa  DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Categories ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  vote_type     vote_type NOT NULL DEFAULT 'simple',
  max_candidates INTEGER,
  status        TEXT NOT NULL DEFAULT 'Actif',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Candidates ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  photo_url     TEXT,
  gallery       JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url     TEXT,
  bio           TEXT,
  presentation  TEXT,
  community     TEXT,
  project       TEXT,
  social_links  JSONB,
  votes_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Vote Packs ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vote_packs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  votes_count     INTEGER NOT NULL,
  price_cfa       DOUBLE PRECISION NOT NULL,
  discount_percent DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Transactions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES public.events(id),
  event_name        TEXT,
  candidate_id      UUID NOT NULL REFERENCES public.candidates(id),
  candidate_name    TEXT,
  buyer_name        TEXT NOT NULL,
  buyer_phone       TEXT NOT NULL,
  amount_cfa        DOUBLE PRECISION NOT NULL,
  votes_count       INTEGER NOT NULL,
  pack_name         TEXT,
  payment_method    TEXT NOT NULL,
  status            tx_status NOT NULL DEFAULT 'en_attente',
  commission_cfa    DOUBLE PRECISION NOT NULL DEFAULT 0,
  organizer_share_cfa DOUBLE PRECISION NOT NULL DEFAULT 0,
  user_id           UUID REFERENCES public.users(id),
  otp_verified      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── OTP Codes ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.otp_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  purpose    TEXT NOT NULL DEFAULT 'vote',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  attempts   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_categories_event_id ON public.categories(event_id);
CREATE INDEX IF NOT EXISTS idx_candidates_event_id ON public.candidates(event_id);
CREATE INDEX IF NOT EXISTS idx_candidates_category_id ON public.candidates(category_id);
CREATE INDEX IF NOT EXISTS idx_vote_packs_event_id ON public.vote_packs(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON public.transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_candidate_id ON public.transactions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes(phone);

-- ── Row Level Security ──────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotent re-runs
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON public.users;
  DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;
  DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
  DROP POLICY IF EXISTS "Candidates are publicly readable" ON public.candidates;
  DROP POLICY IF EXISTS "Vote packs are publicly readable" ON public.vote_packs;
  DROP POLICY IF EXISTS "Transactions are publicly readable" ON public.transactions;
  DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
  DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
  DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;
  DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
  DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
  DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;
  DROP POLICY IF EXISTS "Authenticated users can insert candidates" ON public.candidates;
  DROP POLICY IF EXISTS "Authenticated users can update candidates" ON public.candidates;
  DROP POLICY IF EXISTS "Authenticated users can delete candidates" ON public.candidates;
  DROP POLICY IF EXISTS "Authenticated users can insert vote packs" ON public.vote_packs;
  DROP POLICY IF EXISTS "Authenticated users can update vote packs" ON public.vote_packs;
  DROP POLICY IF EXISTS "Authenticated users can delete vote packs" ON public.vote_packs;
  DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
END $$;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Events are publicly readable" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Candidates are publicly readable" ON public.candidates
  FOR SELECT USING (true);

CREATE POLICY "Vote packs are publicly readable" ON public.vote_packs
  FOR SELECT USING (true);

CREATE POLICY "Transactions are publicly readable" ON public.transactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update events" ON public.events
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete events" ON public.events
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert categories" ON public.categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update categories" ON public.categories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete categories" ON public.categories
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert candidates" ON public.candidates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update candidates" ON public.candidates
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete candidates" ON public.candidates
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert vote packs" ON public.vote_packs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update vote packs" ON public.vote_packs
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete vote packs" ON public.vote_packs
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
