-- Migration: Add profile_id column to customers table
-- This links customers to their user accounts in user-service

USE customer_db;

-- Add profile_id column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS profile_id VARCHAR(36) UNIQUE 
COMMENT 'UUID from User Service (links to user account)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON customers(profile_id);

-- Show the updated table structure
DESCRIBE customers;
