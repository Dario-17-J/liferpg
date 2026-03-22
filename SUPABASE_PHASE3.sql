-- Run this in Supabase SQL Editor for Phase 3

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own friends" ON friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id text NOT NULL,
  status text DEFAULT 'voting',
  title text NOT NULL,
  description text,
  icon text DEFAULT '⚡',
  xp_reward integer DEFAULT 200,
  votes text[] DEFAULT '{}',
  vote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges are public" ON challenges FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON challenges FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert challenges" ON challenges FOR INSERT WITH CHECK (true);

-- Challenge entries
CREATE TABLE IF NOT EXISTS challenge_entries (
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar text,
  joined_at timestamptz DEFAULT now(),
  completed boolean DEFAULT false,
  PRIMARY KEY (challenge_id, user_id)
);
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Entries are public" ON challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON challenge_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entry" ON challenge_entries FOR UPDATE USING (auth.uid() = user_id);

-- Add is_pro column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false;
