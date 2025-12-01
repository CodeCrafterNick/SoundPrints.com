-- Add Printify mockup columns to orders table
-- These store the generated mockup images from Printify for display in order confirmation and My Orders

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS printify_product_id TEXT,
ADD COLUMN IF NOT EXISTS printify_mockups TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN orders.printify_product_id IS 'The Printify product ID created for this order';
COMMENT ON COLUMN orders.printify_mockups IS 'Array of Printify mockup image URLs (front, close-up, context scenes)';
