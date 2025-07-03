/*
  # Add foreign key relationship between posts and profiles

  1. Changes
    - Add foreign key constraint on posts.author_id referencing profiles.id
    - This enables Supabase to understand the relationship for join queries

  2. Security
    - No changes to existing RLS policies
    - Maintains current security model
*/

-- Add foreign key constraint to establish relationship between posts and profiles
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;