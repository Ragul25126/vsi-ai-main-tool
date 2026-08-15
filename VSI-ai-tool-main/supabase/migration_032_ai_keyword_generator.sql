-- ============================================================
-- Migration 032: Client Keyword Analyses (AI Generator & Versioning)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_keyword_analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID REFERENCES public.clients (id) ON DELETE CASCADE,
  domain            TEXT NOT NULL,
  brand_name        TEXT NOT NULL,
  industry          TEXT,
  location          TEXT NOT NULL DEFAULT 'ae',
  summary           JSONB NOT NULL DEFAULT '{}'::jsonb,
  queries           JSONB NOT NULL DEFAULT '[]'::jsonb,
  website_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version           INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.client_keyword_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_select_own"
  ON public.client_keyword_analyses FOR SELECT
  USING (true);

CREATE POLICY "analyses_insert_own"
  ON public.client_keyword_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "analyses_update_own"
  ON public.client_keyword_analyses FOR UPDATE
  USING (true);

CREATE POLICY "analyses_delete_own"
  ON public.client_keyword_analyses FOR DELETE
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analyses_domain ON public.client_keyword_analyses (domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_client_id ON public.client_keyword_analyses (client_id);
