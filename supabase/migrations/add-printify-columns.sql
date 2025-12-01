-- Migration: Add Printify order tracking columns
-- Run this SQL in your Supabase SQL editor to add the missing columns

-- Add printify_order_id column (if it doesn't exist)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS printify_order_id VARCHAR(255);

-- Add carrier column for shipping carrier name
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);

-- Add user_id column for linking to Clerk users
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Create index on printify_order_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_printify_order_id ON orders(printify_order_id);

-- Create index on user_id for user order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
