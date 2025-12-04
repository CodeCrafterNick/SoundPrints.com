-- Add design_state column to order_items table
-- This column stores the full design customization state for recreating designs later

-- Add the column if it doesn't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS design_state JSONB;

-- Add comment explaining the column
COMMENT ON COLUMN order_items.design_state IS 'Full design customization state (waveform settings, colors, text, etc.) for recreating the design later';

-- Create index for efficient querying (if needed in future for design search)
CREATE INDEX IF NOT EXISTS idx_order_items_design_state ON order_items USING GIN (design_state);
