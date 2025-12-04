-- Download tokens table for expiring download links
-- Used for digital download products (hi-def downloads)

CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES orders(id),
  order_item_id UUID,
  design_url TEXT NOT NULL,
  hi_res_url TEXT,
  email TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_downloaded_at TIMESTAMPTZ
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_email ON download_tokens(email);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON download_tokens(expires_at);

-- Enable RLS
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone with a valid token can access their download (checked at API level)
-- Service role can insert/update tokens
CREATE POLICY "Service role can manage download tokens" ON download_tokens
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Users can view their own download tokens by email
CREATE POLICY "Users can view own download tokens" ON download_tokens
  FOR SELECT 
  USING (email = auth.jwt()->>'email');
