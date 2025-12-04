-- Saved Designs table for storing user waveform designs
-- Supports both authenticated users (via clerk_user_id) and designs linked to orders

CREATE TABLE IF NOT EXISTS saved_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification (Clerk user ID for authenticated users)
  clerk_user_id TEXT,
  
  -- Design metadata
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  local_id TEXT, -- The client-side generated ID for syncing
  
  -- Design state (stored as JSONB for flexibility)
  design_state JSONB NOT NULL,
  
  -- Order reference (if created from an order)
  order_id TEXT,
  order_item_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_saved_designs_clerk_user_id ON saved_designs(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_local_id ON saved_designs(local_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_order_id ON saved_designs(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_designs_created_at ON saved_designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_designs_updated_at ON saved_designs(updated_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_saved_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_designs_updated_at_trigger ON saved_designs;
CREATE TRIGGER saved_designs_updated_at_trigger
BEFORE UPDATE ON saved_designs
FOR EACH ROW
EXECUTE FUNCTION update_saved_designs_updated_at();

-- Row Level Security (RLS)
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own designs (by clerk_user_id)
CREATE POLICY saved_designs_select_own ON saved_designs
  FOR SELECT
  USING (
    clerk_user_id IS NOT NULL 
    AND clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Users can insert their own designs
CREATE POLICY saved_designs_insert_own ON saved_designs
  FOR INSERT
  WITH CHECK (
    clerk_user_id IS NOT NULL 
    AND clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Users can update their own designs
CREATE POLICY saved_designs_update_own ON saved_designs
  FOR UPDATE
  USING (
    clerk_user_id IS NOT NULL 
    AND clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Users can delete their own designs
CREATE POLICY saved_designs_delete_own ON saved_designs
  FOR DELETE
  USING (
    clerk_user_id IS NOT NULL 
    AND clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Policy: Service role can do anything (for API routes with admin access)
CREATE POLICY saved_designs_service_role ON saved_designs
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Also allow access if there's no JWT (for server-side API routes using service role key)
CREATE POLICY saved_designs_server_access ON saved_designs
  FOR ALL
  USING (current_setting('request.jwt.claims', true) IS NULL OR current_setting('request.jwt.claims', true) = '');
