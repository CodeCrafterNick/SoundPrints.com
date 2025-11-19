-- Orders table for tracking purchases and fulfillment
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  
  -- Order status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Possible values: pending, paid, submitted, processing, shipped, delivered, canceled, failed, returned, payment_failed
  
  -- Customer information
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Order items
  items JSONB NOT NULL,
  design_urls JSONB,
  
  -- Pricing
  cost_subtotal DECIMAL(10, 2) NOT NULL,
  cost_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_total DECIMAL(10, 2) NOT NULL,
  
  -- Payment integration
  stripe_session_id VARCHAR(255),
  stripe_payment_intent VARCHAR(255),
  
  -- Fulfillment integration  
  printful_order_id INTEGER,
  tracking_number VARCHAR(255),
  tracking_url TEXT,
  
  -- Webhook data
  webhook_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(recipient_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent);
CREATE INDEX IF NOT EXISTS idx_orders_printful_order_id ON orders(printful_order_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders by email
CREATE POLICY orders_select_policy ON orders
  FOR SELECT
  USING (recipient_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Service role can do anything (for webhooks and admin)
CREATE POLICY orders_service_role_policy ON orders
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
