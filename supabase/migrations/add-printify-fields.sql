-- Add fields needed for Printify resubmission
-- Run this in Supabase SQL Editor

-- Add to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS printify_blueprint_id TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS printify_variant_id TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS waveform_style TEXT DEFAULT 'bars';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS design_preset TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_color TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS mockup_url TEXT;

-- Add to orders table for Printify tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_submitted_at TIMESTAMPTZ;

-- Index for Printify order lookups
CREATE INDEX IF NOT EXISTS idx_orders_printify_order_id ON orders(printify_order_id);

COMMENT ON COLUMN order_items.printify_blueprint_id IS 'Printify product blueprint ID for resubmission';
COMMENT ON COLUMN order_items.printify_variant_id IS 'Printify variant ID (size/color combination)';
COMMENT ON COLUMN order_items.waveform_style IS 'Waveform visualization style (bars, lines, etc.)';
COMMENT ON COLUMN order_items.design_preset IS 'Design preset name if used';
COMMENT ON COLUMN order_items.product_color IS 'Product color (for apparel)';
COMMENT ON COLUMN order_items.mockup_url IS 'Generated mockup image URL';
COMMENT ON COLUMN orders.printify_order_id IS 'Printify order ID once submitted';
COMMENT ON COLUMN orders.printify_status IS 'Current Printify fulfillment status';
COMMENT ON COLUMN orders.printify_error IS 'Error message if Printify submission failed';
COMMENT ON COLUMN orders.printify_submitted_at IS 'When order was submitted to Printify';
