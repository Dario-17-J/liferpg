-- Run this in Supabase SQL Editor for Phase 2

-- Public profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text,
  avatar text DEFAULT '🧑‍💻',
  title text DEFAULT '',
  xp integer DEFAULT 0,
  gold integer DEFAULT 0,
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  level integer DEFAULT 0,
  rank_label text DEFAULT 'DORMANT I',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile data" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Achievement stories
CREATE TABLE IF NOT EXISTS stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar text,
  type text, -- 'levelup', 'streak', 'perfect', 'goal'
  title text,
  body text,
  rank_label text,
  xp integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stories are public" ON stories FOR SELECT USING (true);
CREATE POLICY "Users can post stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Story likes
CREATE TABLE IF NOT EXISTS story_likes (
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, user_id)
);

ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are public" ON story_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON story_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON story_likes FOR DELETE USING (auth.uid() = user_id);
