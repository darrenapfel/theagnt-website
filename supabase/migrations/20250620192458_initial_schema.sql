-- theAGNT.ai Supabase Database Schema
-- Run this in your Supabase SQL Editor after creating the project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to waitlist
CREATE TRIGGER update_waitlist_updated_at 
  BEFORE UPDATE ON waitlist 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_joined_at ON waitlist(joined_at);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for waitlist table
-- Users can only see their own waitlist entries
CREATE POLICY "Users can view own waitlist entries" ON waitlist
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own waitlist entries
CREATE POLICY "Users can insert own waitlist entries" ON waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own waitlist entries
CREATE POLICY "Users can update own waitlist entries" ON waitlist
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all waitlist entries (darrenapfel@gmail.com)
CREATE POLICY "Admin can view all waitlist entries" ON waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'darrenapfel@gmail.com'
    )
  );

-- Admin can update all waitlist entries
CREATE POLICY "Admin can update all waitlist entries" ON waitlist
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'darrenapfel@gmail.com'
    )
  );

-- Admin can delete waitlist entries
CREATE POLICY "Admin can delete waitlist entries" ON waitlist
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'darrenapfel@gmail.com'
    )
  );