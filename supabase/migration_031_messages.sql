-- ============================================================
-- Migration 031: Messages Table (Drafts, Inbox, Archived, Sent, Trash)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id             TEXT PRIMARY KEY,
  user_id        UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  sender         JSONB NOT NULL DEFAULT '{"name":"System Admin","email":"admin@searchintel.com"}'::jsonb,
  recipient      JSONB NOT NULL DEFAULT '{"name":"Recipient","email":"recipient@example.com"}'::jsonb,
  to_email       TEXT,
  cc             TEXT,
  bcc            TEXT,
  subject        TEXT NOT NULL DEFAULT '',
  preview        TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL DEFAULT '',
  attachments    JSONB NOT NULL DEFAULT '[]'::jsonb,
  status         TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('read', 'unread', 'draft', 'sent')),
  priority       TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  folder         TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'unread', 'sent', 'drafts', 'starred', 'archived', 'trash', 'spam')),
  is_starred     BOOLEAN NOT NULL DEFAULT false,
  labels         TEXT[] NOT NULL DEFAULT '{}',
  related_client TEXT,
  ai_summary     TEXT,
  last_saved     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE
  USING (user_id IS NULL OR user_id = auth.uid());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_messages_folder ON public.messages (folder, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_starred ON public.messages (is_starred, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages (user_id);
